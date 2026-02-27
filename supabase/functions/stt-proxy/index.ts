import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LANG_CODE_MAP: Record<string, string> = {
  spanish:    "es-US",
  tagalog:    "fil-PH",
  vietnamese: "vi-VN",
  mandarin:   "cmn-Hans-CN",
  cantonese:  "yue-Hant-HK",
  hmong:      "hmn-Latn-TH",
  korean:     "ko-KR",
  arabic:     "ar-XA",
  english:    "en-US",
};

const GOOGLE_TTS_API_KEY = Deno.env.get("GOOGLE_TTS_API_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { audioBase64, language, sampleRate } = await req.json();

    if (!audioBase64 || !language) {
      return new Response(JSON.stringify({ error: "Missing audioBase64 or language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langCode = LANG_CODE_MAP[language.toLowerCase()] ?? "en-US";
    const rate = typeof sampleRate === "number" ? sampleRate : 16000;

    const sttRes = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_TTS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding: "LINEAR16",
            sampleRateHertz: rate,
            audioChannelCount: 1,
            languageCode: langCode,
            enableAutomaticPunctuation: true,
            model: "latest_long",
          },
          audio: { content: audioBase64 },
        }),
      }
    );

    if (!sttRes.ok) {
      const errBody = await sttRes.text();
      return new Response(JSON.stringify({ error: `Google STT failed: ${sttRes.status}`, detail: errBody }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sttData = await sttRes.json();
    const transcript = sttData.results
      ?.map((r: { alternatives: { transcript: string }[] }) => r.alternatives?.[0]?.transcript ?? "")
      .join(" ")
      .trim() ?? "";

    return new Response(JSON.stringify({ transcript }), {
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
