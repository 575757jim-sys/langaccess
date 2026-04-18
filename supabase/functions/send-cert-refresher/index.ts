import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function buildRefresherHtml(userName: string, trackTitle: string, certId: string): string {
  const safeName = userName || "there";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#111827;border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.08);">
      <p style="color:#22c55e;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px;">LangAccess · 30-Day Refresher</p>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;line-height:1.3;">
        Ready for a quick refresh, ${safeName}?
      </h1>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">
        It's been about 30 days since you earned your <strong style="color:#ffffff;">${trackTitle}</strong> certificate. Spaced repetition is the single biggest predictor of whether a language sticks — so here's your booster.
      </p>
      <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Take 5 minutes to replay any module, re-download your pocket phrase reference, or retake the quizzes for free. Your certificate is lifetime — and every future update to this track is included at no cost.
      </p>
      <a href="https://langaccess.org/certificates" style="display:inline-block;background:#22c55e;color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:12px;">
        Run My 5-Minute Refresher
      </a>
      <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:16px 20px;margin:24px 0 0;">
        <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Your Certificate</p>
        <p style="color:#22c55e;font-size:15px;font-weight:700;letter-spacing:0.05em;margin:0 0 6px;">${certId}</p>
        <p style="color:#94a3b8;font-size:12px;margin:0;">Verify anytime at <a href="https://langaccess.org/verify" style="color:#22c55e;">langaccess.org/verify</a></p>
      </div>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0;">
      <p style="color:#475569;font-size:12px;line-height:1.6;margin:0;">
        You're receiving this because you earned a LangAccess certificate. Questions? Reply to this email or contact <a href="mailto:hello@langaccess.org" style="color:#22c55e;">hello@langaccess.org</a>.
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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const nowIso = new Date().toISOString();
    const { data: due, error: selectErr } = await supabase
      .from("certificate_refreshers")
      .select("id, cert_id, email, user_name, track_title, scheduled_at")
      .is("sent_at", null)
      .lte("scheduled_at", nowIso)
      .limit(100);

    if (selectErr) {
      return new Response(JSON.stringify({ error: selectErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = due || [];
    let sent = 0;
    const errors: Array<{ cert_id: string; error: string }> = [];

    for (const row of rows) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "LangAccess <noreply@langaccess.org>",
            reply_to: "hello@langaccess.org",
            to: [row.email],
            subject: `Your 30-day ${row.track_title} refresher — 5 minutes`,
            html: buildRefresherHtml(row.user_name, row.track_title, row.cert_id),
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          errors.push({ cert_id: row.cert_id, error: text });
          continue;
        }

        await supabase
          .from("certificate_refreshers")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", row.id);
        sent += 1;
      } catch (err) {
        errors.push({ cert_id: row.cert_id, error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({ processed: rows.length, sent, errors }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
