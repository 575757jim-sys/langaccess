import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PDF_URL = "https://langaccess.org/LangAccess_Strategic_Framework_v3.pdf";

const buildHtml = (email: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:linear-gradient(135deg,#1e293b,#334155);padding:32px 32px 28px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8;">LangAccess</p>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Your Language Access Toolkit</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 8px;">
            <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">Thank you for requesting the LangAccess Language Access Toolkit.</p>
            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1e293b;">This resource includes:</p>
            <ul style="margin:0 0 24px;padding-left:20px;color:#475569;font-size:14px;line-height:1.8;">
              <li>Language Access Strategic Implementation Framework (v3.0)</li>
              <li>Compliance protocols for Title VI and California LEP requirements</li>
              <li>Sector-specific guidance for Healthcare, Education, Construction, and Community programs</li>
              <li>Audit-ready checklist and staff training confirmation form</li>
              <li>10-question staff certification quiz</li>
            </ul>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="${PDF_URL}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:10px;">Download Toolkit (PDF)</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;text-align:center;">If the button doesn't work, copy this link into your browser:<br><a href="${PDF_URL}" style="color:#2563eb;">${PDF_URL}</a></p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 28px;border-top:1px solid #f1f5f9;">
            <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
              LangAccess helps frontline teams communicate quickly while maintaining access to qualified interpreters when required.<br><br>
              — The LangAccess Team<br>
              <a href="https://langaccess.org" style="color:#2563eb;text-decoration:none;">langaccess.org</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const buildText = () =>
  `Thank you for requesting the LangAccess Language Access Toolkit.

This resource includes:
- Language Access Strategic Implementation Framework (v3.0)
- Compliance protocols for Title VI and California LEP requirements
- Sector-specific guidance for Healthcare, Education, Construction, and Community programs
- Audit-ready checklist and staff training confirmation form
- 10-question staff certification quiz

You can download the toolkit directly here:
${PDF_URL}

LangAccess helps frontline teams communicate quickly while maintaining access to qualified interpreters when required.

— The LangAccess Team
langaccess.org`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("send-toolkit-email: RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "email service not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = {
      from: "LangAccess <noreply@langaccess.org>",
      to: [email],
      subject: "Your LangAccess Language Access Toolkit",
      html: buildHtml(email),
      text: buildText(),
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("send-toolkit-email: Resend API call FAILED", res.status, body);
      return new Response(JSON.stringify({ error: "send failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resBody = await res.json();
    console.log("send-toolkit-email: Resend API call SUCCEEDED", JSON.stringify(resBody));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-toolkit-email: unexpected error", err);
    return new Response(JSON.stringify({ error: "internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
