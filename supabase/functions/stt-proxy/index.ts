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

function getEncoding(mimeType: string): string {
  const m = mimeType.toLowerCase();
  if (m.includes("webm") || m.includes("opus")) return "WEBM_OPUS";
  if (m.includes("ogg")) return "OGG_OPUS";
  if (m.includes("mp4") || m.includes("aac") || m.includes("m4a")) return "MP4_AAC";
  if (m.includes("mp3") || m.includes("mpeg")) return "MP3";
  if (m.includes("wav") || m.includes("linear16") || m.includes("pcm")) return "LINEAR16";
  return "WEBM_OPUS";
}

const GOOGLE_TTS_API_KEY = Deno.env.get("GOOGLE_TTS_API_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { audioBase64, mimeType, language } = body;

    if (!audioBase64 || !language) {
      return new Response(JSON.stringify({ error: "Missing audioBase64 or language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langCode = LANG_CODE_MAP[language.toLowerCase()] ?? "en-US";
    const encoding = getEncoding(mimeType ?? "");

    const sttConfig: Record<string, unknown> = {
      encoding,
      languageCode: langCode,
      enableAutomaticPunctuation: true,
      model: "latest_long",
    };

    if (encoding === "LINEAR16") {
      sttConfig.sampleRateHertz = body.sampleRate ?? 16000;
      sttConfig.audioChannelCount = 1;
    }

    const sttRes = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_TTS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: sttConfig,
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
    const transcript = (sttData.results ?? [])
      .map((r: { alternatives: { transcript: string }[] }) => r.alternatives?.[0]?.transcript ?? "")
      .join(" ")
      .trim();

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
