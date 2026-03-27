import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    let refCode = url.searchParams.get("ref_code");
    let ambassadorId = url.searchParams.get("ambassador_id");

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (!refCode && body.ref_code) refCode = body.ref_code;
        if (!ambassadorId && body.ambassador_id) ambassadorId = body.ambassador_id;
      } catch (_) {}
    }

    console.log("[lookup-ambassador] incoming ref_code:", refCode, "| ambassador_id:", ambassadorId, "| method:", req.method, "| url:", req.url);

    if (!refCode && !ambassadorId) {
      return new Response(
        JSON.stringify({ data: null, found: false, reason: "no ref_code or ambassador_id provided" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    console.log("[lookup-ambassador] SUPABASE_URL present:", !!supabaseUrl, "| SERVICE_ROLE_KEY present:", !!serviceRoleKey);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let query = supabase
      .from("ambassadors")
      .select("id, full_name, email, street_address, city_state, zip_code, slug, ref_code");

    if (refCode) {
      query = query.eq("ref_code", refCode.toUpperCase());
    } else {
      query = query.eq("id", ambassadorId!);
    }

    const { data, error } = await query.maybeSingle();

    console.log(
      "[lookup-ambassador] result — data:", JSON.stringify(data),
      "| error:", JSON.stringify(error)
    );

    if (error) {
      return new Response(
        JSON.stringify({ data: null, found: false, error: error.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ data, found: data !== null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.log("[lookup-ambassador] caught exception:", message);
    return new Response(
      JSON.stringify({ data: null, found: false, error: message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
