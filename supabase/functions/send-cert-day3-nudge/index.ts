import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function buildHtml(userName: string, trackTitle: string): string {
  const safeName = userName || "there";
  const title = trackTitle || "your track";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#111827;border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.08);">
      <p style="color:#f59e0b;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px;">LangAccess · Quick Check-In</p>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;line-height:1.3;">
        Ready for module 1, ${safeName}?
      </h1>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">
        You enrolled in <strong style="color:#ffffff;">${title}</strong> three days ago. Module 1 is designed to take about 10 minutes — the perfect coffee break. Learners who finish module 1 in their first week are <strong style="color:#ffffff;">4x more likely</strong> to complete the whole track.
      </p>
      <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Pick up where you left off — your progress is saved automatically, and every module ends with practice phrases you can use on your very next shift.
      </p>
      <a href="https://langaccess.org/certificates" style="display:inline-block;background:#f59e0b;color:#0a0f1e;font-size:14px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:12px;">
        Start Module 1 — 10 min
      </a>
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:16px 20px;margin:24px 0 0;">
        <p style="color:#f59e0b;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;font-weight:700;">Tip</p>
        <p style="color:#cbd5e1;font-size:13px;line-height:1.6;margin:0;">
          Print your pocket flashcards first. Even one phrase in your pocket makes the first real-world use feel effortless.
        </p>
      </div>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0;">
      <p style="color:#475569;font-size:12px;line-height:1.6;margin:0;">
        You're receiving this because you enrolled in a LangAccess certificate track. Questions? Reply to this email or contact <a href="mailto:hello@langaccess.org" style="color:#f59e0b;">hello@langaccess.org</a>.
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
      .from("certificate_day3_nudges")
      .select("id, session_id, email, user_name, track_id, track_title, scheduled_at")
      .is("sent_at", null)
      .is("skipped_at", null)
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
    let skipped = 0;
    let suppressed = 0;
    const errors: Array<{ id: string; error: string }> = [];

    const candidateEmails = Array.from(
      new Set(rows.map((r) => (r.email || "").trim().toLowerCase()).filter(Boolean)),
    );
    const suppressedSet = new Set<string>();
    if (candidateEmails.length > 0) {
      const { data: suppressions } = await supabase
        .from("email_suppressions")
        .select("email")
        .in("email", candidateEmails);
      for (const s of suppressions || []) {
        if (s.email) suppressedSet.add(s.email);
      }
    }

    for (const row of rows) {
      try {
        const normalized = (row.email || "").trim().toLowerCase();
        if (suppressedSet.has(normalized)) {
          await supabase
            .from("certificate_day3_nudges")
            .update({ bounced_at: new Date().toISOString() })
            .eq("id", row.id);
          suppressed += 1;
          continue;
        }

        if (row.session_id) {
          const { data: progress } = await supabase
            .from("certificate_progress")
            .select("passed")
            .eq("session_id", row.session_id)
            .eq("track_id", row.track_id)
            .eq("module_id", 1)
            .eq("passed", true)
            .limit(1);

          if (progress && progress.length > 0) {
            await supabase
              .from("certificate_day3_nudges")
              .update({ skipped_at: new Date().toISOString() })
              .eq("id", row.id);
            skipped += 1;
            continue;
          }
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
            to: [row.email],
            subject: `Ready for module 1 of ${row.track_title || "your track"}?`,
            html: buildHtml(row.user_name, row.track_title),
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          errors.push({ id: row.id, error: text });
          continue;
        }

        const body = await res.json().catch(() => ({} as { id?: string }));
        const resendId = (body as { id?: string }).id || null;

        await supabase
          .from("certificate_day3_nudges")
          .update({
            sent_at: new Date().toISOString(),
            resend_email_id: resendId,
          })
          .eq("id", row.id);
        sent += 1;
      } catch (err) {
        errors.push({ id: row.id, error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({ processed: rows.length, sent, skipped, suppressed, errors }),
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
