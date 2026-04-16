import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const { trackId, price, sessionId, origin } = body as {
      trackId: string;
      price?: number;
      sessionId?: string;
      origin?: string;
    };

    if (!trackId) {
      return new Response(JSON.stringify({ error: "trackId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const VALID_TRACK_IDS = [
      'healthcare', 'education', 'construction', 'social-services',
      'mental-health', 'property-management', 'warehouse', 'hospitality',
      'agriculture', 'community-outreach'
    ];

    if (!VALID_TRACK_IDS.includes(trackId)) {
      console.error("[create-cert-checkout] INVALID trackId received:", trackId, "— rejecting checkout");
      return new Response(JSON.stringify({ error: `Invalid trackId: "${trackId}". Must be a valid certificate track.` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Creating checkout for track:", trackId);

    const unitAmount = Math.round((price ?? 39) * 100);
    const baseUrl = "https://langaccess.org";

    const successUrl = `${baseUrl}/success?track=${trackId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/certificates?track=${trackId}&canceled=1`;

    console.log("[create-cert-checkout] trackId:", trackId);
    console.log("[create-cert-checkout] success_url:", successUrl);
    console.log("[create-cert-checkout] cancel_url:", cancelUrl);
    console.log("[create-cert-checkout] sessionId (app session):", sessionId || "(none)");

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][unit_amount]", String(unitAmount));
    params.append("line_items[0][price_data][product_data][name]", `LangAccess Certificate — ${trackId} Track`);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);
    params.append("client_reference_id", trackId);
    if (sessionId) {
      params.append("metadata[session_id]", sessionId);
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!stripeRes.ok) {
      const errText = await stripeRes.text();
      console.error("[create-cert-checkout] Stripe error:", errText);
      return new Response(JSON.stringify({ error: "Stripe checkout creation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripeRes.json();
    console.log("[create-cert-checkout] Stripe session created:", session.id);
    console.log("[create-cert-checkout] Stripe checkout URL:", session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[create-cert-checkout] Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
