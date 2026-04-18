import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function createGelatoOrder(meta: Record<string, string>, supabase: ReturnType<typeof createClient>) {
  const gelatoApiKey = Deno.env.get("GELATO_API_KEY");
  if (!gelatoApiKey) {
    console.error("[Webhook] GELATO_API_KEY not configured");
    return;
  }

  const {
    ambassador_id,
    ambassadorCode,
    full_name,
    email,
    quantity,
    street_address,
    city,
    state,
    zip,
    final_print_asset_url,
    front_file_url,
    order_id,
    currency,
    gelatoBaseCost,
    markup,
    finalTotal,
  } = meta;

  console.log("[Webhook] ambassadorCode:", ambassadorCode || ambassador_id || "");
  console.log("[Webhook] quantity:", quantity);
  console.log("[Webhook] gelatoBaseCost:", gelatoBaseCost);
  console.log("[Webhook] markup:", markup);
  console.log("[Webhook] finalTotal:", finalTotal);
  console.log("[Webhook] final_print_asset_url:", final_print_asset_url || "(none)");

  const STATIC_FRONT = "https://langaccess.org/card-front.pdf";

  const resolvedPrintUrl =
    (final_print_asset_url && final_print_asset_url.startsWith("https://")) ? final_print_asset_url :
    (front_file_url && front_file_url.startsWith("https://")) ? front_file_url :
    STATIC_FRONT;

  const nameParts = (full_name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const qty = parseInt(quantity || "1");

  const gelatoOrderPayload = {
    orderType: "order",
    orderReferenceId: `paid-${order_id || crypto.randomUUID()}`,
    customerReferenceId: ambassador_id || "",
    currency: currency || "USD",
    items: [
      {
        itemReferenceId: "item-1",
        productUid: Deno.env.get("GELATO_PRODUCT_UID") || "cards_pf_bx_pt_300-gsm-uncoated_cl_4-4_hor",
        files: [
          { type: "default", url: resolvedPrintUrl },
        ],
        quantity: qty,
      },
    ],
    shippingAddress: {
      firstName,
      lastName,
      addressLine1: street_address || "",
      city: city || "",
      stateCode: state || "",
      postCode: zip || "",
      countryIsoCode: "US",
      email: email || "",
      phone: "0000000000",
    },
  };

  console.log("[Webhook] gelatoOrderCreating — order_id:", order_id);
  console.log("[Webhook] gelatoOrderPayload:", JSON.stringify(gelatoOrderPayload));
  const orderPayload = gelatoOrderPayload;

  const gelatoRes = await fetch("https://order.gelatoapis.com/v4/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": gelatoApiKey,
    },
    body: JSON.stringify(orderPayload),
  });

  if (!gelatoRes.ok) {
    const errText = await gelatoRes.text();
    console.error("[Webhook] Gelato order creation failed:", errText);
    if (order_id) {
      await supabase.from("card_orders").update({
        status: "gelato_failed",
        gelato_error: errText,
      }).eq("id", order_id);
    }
    return;
  }

  const gelatoData = await gelatoRes.json();
  const gelatoOrderId = gelatoData.id || gelatoData.orderId || null;
  console.log("[Webhook] gelatoOrderCreated:", gelatoOrderId);
  console.log("[Webhook] Gelato order created successfully:", gelatoOrderId);

  if (order_id) {
    await supabase.from("card_orders").update({
      gelato_order_id: gelatoOrderId,
      status: "gelato_submitted",
    }).eq("id", order_id);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeWebhookSecret || !stripeSecretKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    console.log("[Webhook] request received — body bytes:", body.length, "has_signature:", !!sig);

    let preParsedType = "(unparsed)";
    try {
      preParsedType = JSON.parse(body)?.type || "(no type)";
    } catch { /* ignore */ }
    console.log("[Webhook] pre-verify event.type:", preParsedType);

    if (!sig) {
      console.error("[Webhook] REJECT — missing stripe-signature header");
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const parts = sig.split(",");
    let timestamp = "";
    let v1 = "";

    for (const part of parts) {
      const [k, v] = part.split("=");
      if (k === "t") timestamp = v;
      if (k === "v1") v1 = v;
    }

    const payload = `${timestamp}.${body}`;
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(stripeWebhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const hex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (hex !== v1) {
      console.error(
        "[Webhook] SIGNATURE VERIFICATION FAILED — expected_prefix:",
        hex.slice(0, 8),
        "received_prefix:",
        (v1 || "").slice(0, 8),
        "timestamp:",
        timestamp,
        "event.type:",
        preParsedType
      );
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[Webhook] signature verified OK — event.type:", preParsedType);

    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const meta: Record<string, string> = session.metadata || {};

      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
      const isTestMode = stripeKey.startsWith("sk_test_");

      console.log("[Webhook] stripePaymentSuccess — session:", session.id);
      console.log("[Webhook] sandboxMode:", isTestMode);
      console.log("[Webhook] event.type:", event.type);
      console.log("[Webhook] meta.order_type:", meta.order_type || "(none)");

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      if (meta.order_type === "card_order") {
        console.log("[Webhook] card_order payment confirmed — order_id:", meta.order_id);
        console.log("[Webhook] Stripe checkout started and completed — now creating Gelato order");

        if (meta.order_id) {
          await supabase.from("card_orders").update({
            status: "paid",
            stripe_session_id: session.id,
          }).eq("id", meta.order_id);
        }

        EdgeRuntime.waitUntil(createGelatoOrder(meta, supabase));
      } else {
        const trackId = session.client_reference_id as string;
        const customerEmail = session.customer_details?.email as string | undefined;
        const sessionId = meta.session_id;

        console.log("[Webhook] cert purchase path — trackId:", trackId || "(missing)", "sessionId:", sessionId || "(missing)", "stripe_session:", session.id);

        if (trackId) {
          const effectiveSessionId = sessionId || session.id;
          if (!sessionId) {
            console.warn(
              "[Webhook] cert branch — metadata.session_id missing; falling back to stripe session.id for session_id column"
            );
          }
          console.log(
            "[Webhook] inserting certificate_purchases row — session_id:",
            effectiveSessionId,
            "track_id:",
            trackId,
            "stripe_session_id:",
            session.id
          );
          const { error: upsertError } = await supabase.from("certificate_purchases").upsert({
            session_id: effectiveSessionId,
            track_id: trackId,
            stripe_session_id: session.id,
            purchased_at: new Date().toISOString(),
          }, { onConflict: "stripe_session_id" });
          if (upsertError) {
            console.error("[Webhook] certificate_purchases upsert FAILED:", JSON.stringify(upsertError));
          } else {
            console.log("[Webhook] certificate_purchases upsert SUCCESS — row written for track:", trackId);
          }

          if (customerEmail) {
            const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
            await fetch(`${supabaseUrl}/functions/v1/send-cert-completion-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              },
              body: JSON.stringify({
                email: customerEmail,
                trackId,
                type: "purchase",
              }),
            });
          }
        } else {
          console.error(
            "[Webhook] cert branch SKIPPED — client_reference_id (trackId) missing on completed checkout session:",
            session.id
          );
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
