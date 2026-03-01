import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const AZURE_TRANSLATOR_KEY = Deno.env.get("AZURE_TRANSLATOR_KEY") ?? "";
const AZURE_TRANSLATOR_REGION = Deno.env.get("AZURE_TRANSLATOR_REGION") ?? "";
const AZURE_TRANSLATOR_ENDPOINT = Deno.env.get("AZURE_TRANSLATOR_ENDPOINT") ?? "https://api.cognitive.microsofttranslator.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!AZURE_TRANSLATOR_KEY || !AZURE_TRANSLATOR_REGION) {
      return new Response(JSON.stringify({ error: "AZURE_TRANSLATOR_KEY or AZURE_TRANSLATOR_REGION not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, to } = await req.json();

    if (!text || !to) {
      return new Response(JSON.stringify({ error: "Missing text or to parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&from=en&to=${encodeURIComponent(to)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
        "Ocp-Apim-Subscription-Region": AZURE_TRANSLATOR_REGION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ Text: text }]),
    });

    if (!response.ok) {
      const detail = await response.text();
      return new Response(JSON.stringify({ error: `Azure Translator failed: ${response.status}`, detail }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const translation = data?.[0]?.translations?.[0]?.text ?? "";

    return new Response(JSON.stringify({ translation }), {
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
