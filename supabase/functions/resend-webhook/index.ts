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
    const emailId = payload?.data?.email_id as string | undefined;

    if (!type || !emailId) {
      return new Response(JSON.stringify({ ok: true, ignored: "missing_fields" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type !== "email.opened") {
      return new Response(JSON.stringify({ ok: true, ignored: type }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nowIso = new Date().toISOString();

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
        first_win_updates: fw?.length || 0,
        day3_updates: d3?.length || 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
