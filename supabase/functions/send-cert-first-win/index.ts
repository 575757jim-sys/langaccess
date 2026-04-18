import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Spotlight = {
  english: string;
  spanish: string;
  why: string;
};

const SPOTLIGHTS: Record<string, Spotlight> = {
  "healthcare": {
    english: "Where does it hurt?",
    spanish: "¿Dónde le duele?",
    why: "The single most useful intake question in a Spanish-speaking triage room.",
  },
  "education": {
    english: "How can I help at home?",
    spanish: "¿Cómo puedo ayudar en casa?",
    why: "Parents almost always want to help — this unlocks the whole parent-teacher conversation.",
  },
  "construction": {
    english: "Is this area safe?",
    spanish: "¿Esta área es segura?",
    why: "One phrase that prevents most common jobsite injuries.",
  },
  "social-services": {
    english: "You are safe here.",
    spanish: "Aquí está seguro.",
    why: "The most important thing a client in crisis needs to hear first.",
  },
  "mental-health": {
    english: "How are you feeling today?",
    spanish: "¿Cómo se siente hoy?",
    why: "A warm open-ended opener that signals you're listening.",
  },
  "property-management": {
    english: "When can we schedule the repair?",
    spanish: "¿Cuándo podemos programar la reparación?",
    why: "Turns a complaint into a concrete plan tenants appreciate.",
  },
  "warehouse": {
    english: "Please lift with your legs.",
    spanish: "Por favor, levante con las piernas.",
    why: "The single most common safety coaching moment on a warehouse floor.",
  },
  "hospitality": {
    english: "How was everything tonight?",
    spanish: "¿Cómo estuvo todo esta noche?",
    why: "Guests who are asked in their own language come back — and tip better.",
  },
  "agriculture": {
    english: "Take a water break.",
    spanish: "Tome un descanso para tomar agua.",
    why: "Heat illness prevention in five words.",
  },
  "community-outreach": {
    english: "What matters most to you?",
    spanish: "¿Qué es lo más importante para usted?",
    why: "The question that turns outreach into trust.",
  },
};

function buildHtml(userName: string, trackTitle: string, trackId: string): string {
  const safeName = userName || "there";
  const s = SPOTLIGHTS[trackId] || {
    english: "Thank you for your help.",
    spanish: "Gracias por su ayuda.",
    why: "A universally warm phrase that works across every context.",
  };
  const title = trackTitle || "your track";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#111827;border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.08);">
      <p style="color:#22c55e;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px;">LangAccess · Your First Win</p>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;line-height:1.3;">
        One phrase that matters most this week, ${safeName}
      </h1>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        You enrolled in <strong style="color:#ffffff;">${title}</strong> a week ago. If you remember nothing else from your first seven days — remember this one:
      </p>

      <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:12px;padding:24px 20px;margin:0 0 24px;text-align:center;">
        <p style="color:#22c55e;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 10px;">Phrase of the Week</p>
        <p style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 6px;line-height:1.3;">${s.spanish}</p>
        <p style="color:#cbd5e1;font-size:14px;font-style:italic;margin:0 0 12px;">"${s.english}"</p>
        <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0;">${s.why}</p>
      </div>

      <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Try it once today. Out loud. In front of a mirror, on your drive home, with a coworker. Practice is the whole game.
      </p>

      <a href="https://langaccess.org/certificates" style="display:inline-block;background:#22c55e;color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:16px;">
        Continue Your Course
      </a>

      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px 20px;margin:16px 0 0;">
        <p style="color:#ffffff;font-size:13px;font-weight:700;margin:0 0 6px;">Don't forget your flashcards</p>
        <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0;">
          Printable fold-and-cut flashcards for every phrase in your track are one click away from your dashboard. Print a set on cardstock and keep them in your pocket this week.
        </p>
      </div>

      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0;">
      <p style="color:#475569;font-size:12px;line-height:1.6;margin:0;">
        You're receiving this because you enrolled in a LangAccess certificate track. Questions? Reply to this email or contact <a href="mailto:hello@langaccess.org" style="color:#22c55e;">hello@langaccess.org</a>.
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
      .from("certificate_first_wins")
      .select("id, email, user_name, track_id, track_title, scheduled_at")
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
            .from("certificate_first_wins")
            .update({ bounced_at: new Date().toISOString() })
            .eq("id", row.id);
          suppressed += 1;
          continue;
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
            subject: `Your ${row.track_title || "LangAccess"} phrase of the week`,
            html: buildHtml(row.user_name, row.track_title, row.track_id),
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
          .from("certificate_first_wins")
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
      JSON.stringify({ processed: rows.length, sent, suppressed, errors }),
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
