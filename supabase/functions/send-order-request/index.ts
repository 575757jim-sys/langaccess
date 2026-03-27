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
    const { full_name, address, quantity, ref_code } = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LangAccess <hello@langaccess.org>",
        to: "hello@langaccess.org",
        subject: "Card Order Request — " + full_name,
        html:
          "<h2>New Card Order Request</h2>" +
          "<p><strong>Name:</strong> " + full_name + "</p>" +
          "<p><strong>Mailing Address:</strong><br/>" + address.replace(/\n/g, "<br/>") + "</p>" +
          "<p><strong>Quantity:</strong> " + quantity + " cards</p>" +
          "<p><strong>Ref Code:</strong> " + (ref_code || "(none)") + "</p>",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error("Resend error: " + body);
    }

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
