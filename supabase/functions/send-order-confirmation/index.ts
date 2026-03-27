import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
    const { full_name, email, quantity, gelato_order_id, shipping_address } = await req.json();
    const firstName = (full_name as string).split(" ")[0];

    const orderIdLine = gelato_order_id
      ? `<p style="color:#6b7280;font-size:13px;">Order ID: ${gelato_order_id}</p>`
      : "";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LangAccess <hello@langaccess.org>",
        to: email,
        subject: `Your ${quantity}-card order is confirmed, ${firstName}!`,
        html:
          `<p>Hi ${firstName},</p>` +
          `<p>Your order of <strong>${quantity} LangAccess ambassador cards</strong> has been placed and is heading to the printer.</p>` +
          `<p><strong>Shipping to:</strong> ${shipping_address}</p>` +
          orderIdLine +
          `<p>Allow <strong>5–7 business days</strong> for delivery. We'll email you when your cards ship.</p>` +
          `<p>Every card you hand out is tracked back to your unique QR code — you'll be able to see the impact you're making.</p>` +
          `<p>Thank you for being part of the Brigade.</p>` +
          `<p>— The LangAccess Team</p>`,
      }),
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LangAccess <hello@langaccess.org>",
        to: "LangAccessInfo@gmail.com",
        subject: `Card Order: ${full_name} — ${quantity} cards`,
        html:
          `<h2>New Card Order</h2>` +
          `<p><strong>Ambassador:</strong> ${full_name} (${email})</p>` +
          `<p><strong>Quantity:</strong> ${quantity} cards</p>` +
          `<p><strong>Ship to:</strong> ${shipping_address}</p>` +
          (gelato_order_id ? `<p><strong>Gelato Order ID:</strong> ${gelato_order_id}</p>` : ""),
      }),
    });

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
