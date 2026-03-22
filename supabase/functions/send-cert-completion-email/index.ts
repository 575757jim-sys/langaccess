import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TRACK_LABELS: Record<string, string> = {
  healthcare: "Healthcare",
  education: "Education",
  construction: "Construction",
  "social-services": "Social Services",
  "mental-health": "Mental Health",
};

function buildPurchaseHtml(trackTitle: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#111827;border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.08);">
      <p style="color:#22c55e;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px;">LangAccess</p>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;line-height:1.3;">
        You're enrolled in the ${trackTitle} Track
      </h1>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px;">
        Your payment was confirmed. You now have full access to all 5 modules. Complete all 5 at 80% or higher to earn your certificate.
      </p>
      <a href="https://langaccess.org" style="display:inline-block;background:#22c55e;color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">
        Start Learning
      </a>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0;">
      <p style="color:#475569;font-size:12px;line-height:1.6;margin:0;">
        Questions? Reply to this email or contact <a href="mailto:hello@langaccess.org" style="color:#22c55e;">hello@langaccess.org</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildCertificateHtml(userName: string, trackTitle: string, certId: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#111827;border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.08);">
      <p style="color:#22c55e;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px;">LangAccess Certificate</p>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;line-height:1.3;">
        Congratulations, ${userName}!
      </h1>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">
        You've completed the <strong style="color:#ffffff;">${trackTitle}</strong> track and earned your LangAccess Professional Spanish Communication Certificate.
      </p>
      <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:16px 20px;margin:0 0 28px;">
        <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Certificate ID</p>
        <p style="color:#22c55e;font-size:16px;font-weight:700;letter-spacing:0.05em;margin:0;">${certId}</p>
      </div>
      <a href="https://langaccess.org" style="display:inline-block;background:#22c55e;color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:12px;">
        Download Your Certificate
      </a>
      <p style="color:#475569;font-size:12px;margin:8px 0 0;">
        Verify your certificate at <a href="https://langaccess.org/verify" style="color:#22c55e;">langaccess.org/verify</a>
      </p>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0;">
      <p style="color:#475569;font-size:12px;line-height:1.6;margin:0;">
        Questions? Reply to this email or contact <a href="mailto:hello@langaccess.org" style="color:#22c55e;">hello@langaccess.org</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, trackId, type, userName, certId } = await req.json();

    if (!email || !trackId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trackTitle = TRACK_LABELS[trackId] || trackId;
    let subject: string;
    let html: string;

    if (type === "certificate" && userName && certId) {
      subject = `Your LangAccess ${trackTitle} Certificate — ${certId}`;
      html = buildCertificateHtml(userName, trackTitle, certId);
    } else {
      subject = `You're enrolled: LangAccess ${trackTitle} Track`;
      html = buildPurchaseHtml(trackTitle);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LangAccess <noreply@langaccess.org>",
        reply_to: "hello@langaccess.org",
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
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
