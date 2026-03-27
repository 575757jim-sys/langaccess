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
    const { full_name, email, mailing_address, slug, qrUrl } = await req.json();
    const firstName = full_name.split(" ")[0];

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LangAccess <hello@langaccess.org>",
        to: "LangAccessInfo@gmail.com",
        subject: "New Ambassador: " + full_name,
        html:
          "<p><strong>" + full_name + "</strong> signed up as an Ambassador.</p>" +
          "<p>Email: " + email + "</p>" +
          (mailing_address ? "<p>Ship to: " + mailing_address + "</p>" : "") +
          "<p>Slug: " + (slug || "(pending QR generation)") + "</p>" +
          "<p>Order 25-card pack via Printful then set <code>free_pack_shipped = true</code> in Supabase.</p>",
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
        to: email,
        subject: "Welcome to the Brigade, " + firstName + "!",
        html:
          "<p>You're in, " + firstName + "! Your free 25-card pack ships within 5 business days.</p>" +
          (mailing_address ? "<p>Shipping to: <strong>" + mailing_address + "</strong></p>" : "") +
          (qrUrl
            ? '<p>Your QR code:<br/><img src="' + qrUrl + '" width="160" height="160" alt="Your QR code"/></p>'
            : "") +
          (slug ? '<p>Your referral link: <a href="https://langaccess.org/r/' + slug + '">langaccess.org/r/' + slug + '</a></p>' : "") +
          (slug ? '<p><a href="https://langaccess.org/order-cards?ref=' + slug + '" style="display:inline-block;background:#22c55e;color:#fff;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;">Order My Cards</a></p>' : "") +
          "<p>Questions? Reply to this email.</p><p>— The LangAccess Team</p>",
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
