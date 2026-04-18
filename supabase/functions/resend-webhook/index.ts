import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, svix-id, svix-signature, svix-timestamp",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const payload = await req.json();
    const type = payload?.type as string | undefined;
    const data = payload?.data || {};
    const emailId = data?.email_id as string | undefined;

    if (!type) {
      return new Response(JSON.stringify({ ok: true, ignored: "missing_type" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nowIso = new Date().toISOString();

    if (type === "email.opened" && emailId) {
      const { data: fw } = await supabase
        .from("certificate_first_wins")
        .update({ opened_at: nowIso })
        .eq("resend_email_id", emailId)
        .is("opened_at", null)
        .select("id");

      const { data: d3 } = await supabase
        .from("certificate_day3_nudges")
        .update({ opened_at: nowIso })
        .eq("resend_email_id", emailId)
        .is("opened_at", null)
        .select("id");

      return new Response(
        JSON.stringify({
          ok: true,
          event: "opened",
          first_win_updates: fw?.length || 0,
          day3_updates: d3?.length || 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (type === "email.bounced" || type === "email.complained") {
      const bounceType =
        (data?.bounce?.type as string | undefined) ||
        (type === "email.complained" ? "complaint" : "hard");

      let recipients: string[] = [];
      const to = data?.to;
      if (Array.isArray(to)) {
        recipients = to.filter((x) => typeof x === "string");
      } else if (typeof to === "string") {
        recipients = [to];
      }

      if (recipients.length === 0 && emailId) {
        const [{ data: fwRow }, { data: d3Row }] = await Promise.all([
          supabase
            .from("certificate_first_wins")
            .select("email")
            .eq("resend_email_id", emailId)
            .maybeSingle(),
          supabase
            .from("certificate_day3_nudges")
            .select("email")
            .eq("resend_email_id", emailId)
            .maybeSingle(),
        ]);
        if (fwRow?.email) recipients.push(fwRow.email);
        if (d3Row?.email) recipients.push(d3Row.email);
      }

      const normalized = Array.from(
        new Set(recipients.map((r) => r.trim().toLowerCase()).filter(Boolean)),
      );

      if (normalized.length > 0) {
        await supabase.from("email_suppressions").upsert(
          normalized.map((email) => ({
            email,
            reason: type === "email.complained" ? "complaint" : "bounce",
            resend_email_id: emailId || null,
            bounce_type: bounceType,
          })),
          { onConflict: "email" },
        );
      }

      let fwUpdated = 0;
      let d3Updated = 0;
      if (emailId) {
        const { data: fw } = await supabase
          .from("certificate_first_wins")
          .update({ bounced_at: nowIso })
          .eq("resend_email_id", emailId)
          .is("bounced_at", null)
          .select("id");
        fwUpdated = fw?.length || 0;

        const { data: d3 } = await supabase
          .from("certificate_day3_nudges")
          .update({ bounced_at: nowIso })
          .eq("resend_email_id", emailId)
          .is("bounced_at", null)
          .select("id");
        d3Updated = d3?.length || 0;
      }

      return new Response(
        JSON.stringify({
          ok: true,
          event: type,
          suppressed: normalized.length,
          first_win_updates: fwUpdated,
          day3_updates: d3Updated,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: true, ignored: type }), {
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
