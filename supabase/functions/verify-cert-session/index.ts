import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { stripe_session_id, app_session } = body as {
      stripe_session_id?: string;
      app_session?: string;
    };

    if (!stripe_session_id) {
      return new Response(JSON.stringify({ error: "stripe_session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[verify-cert-session] retrieving stripe session:", stripe_session_id, "app_session:", app_session || "(none)");

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(stripe_session_id)}`,
      {
        headers: { Authorization: `Bearer ${stripeSecretKey}` },
      }
    );

    if (!stripeRes.ok) {
      const errText = await stripeRes.text();
      console.error("[verify-cert-session] Stripe retrieve failed:", errText);
      return new Response(JSON.stringify({ verified: false, error: "stripe_retrieve_failed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripeRes.json();
    const paymentStatus = session.payment_status;
    const trackId = session.client_reference_id as string | null;
    const metaSessionId = session.metadata?.session_id as string | undefined;
    const fallbackAppSession = (app_session || "").trim() || null;
    const effectiveSessionId = metaSessionId || fallbackAppSession;

    console.log(
      "[verify-cert-session] payment_status:",
      paymentStatus,
      "trackId:",
      trackId || "(missing)",
      "metadata.session_id:",
      metaSessionId || "(missing)",
      "app_session fallback:",
      fallbackAppSession || "(missing)",
      "effective:",
      effectiveSessionId || "(none)"
    );

    if (paymentStatus !== "paid") {
      return new Response(JSON.stringify({ verified: false, reason: "not_paid", payment_status: paymentStatus }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!trackId) {
      return new Response(JSON.stringify({ verified: false, reason: "missing_track" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!effectiveSessionId) {
      return new Response(JSON.stringify({ verified: false, reason: "missing_session_id" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: upsertError } = await supabase.from("certificate_purchases").upsert({
      session_id: effectiveSessionId,
      track_id: trackId,
      stripe_session_id: session.id,
      purchased_at: new Date().toISOString(),
    }, { onConflict: "stripe_session_id" });

    if (upsertError) {
      console.error("[verify-cert-session] upsert FAILED:", JSON.stringify(upsertError));
      return new Response(JSON.stringify({ verified: false, reason: "upsert_failed", error: upsertError.message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[verify-cert-session] upsert SUCCESS — track:", trackId, "session_id:", effectiveSessionId);

    return new Response(
      JSON.stringify({ verified: true, track_id: trackId, session_id: effectiveSessionId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[verify-cert-session] unexpected error:", err);
    return new Response(JSON.stringify({ verified: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
