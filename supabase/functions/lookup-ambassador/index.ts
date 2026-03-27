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
    const refCode = url.searchParams.get("ref_code");
    const ambassadorId = url.searchParams.get("ambassador_id");

    if (!refCode && !ambassadorId) {
      return new Response(JSON.stringify({ error: "ref_code or ambassador_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
      "[lookup-ambassador] ref_code:", refCode,
      "| ambassador_id:", ambassadorId,
      "| data:", JSON.stringify(data),
      "| error:", JSON.stringify(error)
    );

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data }), {
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
