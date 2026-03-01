import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_LANG_CODE_MAP: Record<string, string> = {
  spanish:    "es-US",
  tagalog:    "fil-PH",
  vietnamese: "vi-VN",
  mandarin:   "cmn-Hans-CN",
  cantonese:  "yue-Hant-HK",
  korean:     "ko-KR",
  arabic:     "ar-XA",
  english:    "en-US",
};

const AZURE_LANG_CODE_MAP: Record<string, string> = {
  farsi: "fa-IR",
  dari:  "prs-AF",
  hmong: "hmn",
};

const AZURE_LANGS = new Set(Object.keys(AZURE_LANG_CODE_MAP));

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
const AZURE_TRANSLATOR_KEY = Deno.env.get("AZURE_TRANSLATOR_KEY") ?? "";
const AZURE_TRANSLATOR_REGION = Deno.env.get("AZURE_TRANSLATOR_REGION") ?? "";

async function transcribeWithAzure(audioBase64: string, mimeType: string, language: string): Promise<string> {
  const localeCode = AZURE_LANG_CODE_MAP[language];

  if (!AZURE_TRANSLATOR_KEY || !AZURE_TRANSLATOR_REGION) {
    throw new Error("Azure credentials not configured");
  }

  const tokenEndpoint = `https://${AZURE_TRANSLATOR_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  const tokenRes = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    throw new Error(`Azure token fetch failed: ${tokenRes.status} ${detail}`);
  }

  const accessToken = await tokenRes.text();

  const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));

  const mime = mimeType.toLowerCase();
  let contentType = "audio/webm;codecs=opus";
  if (mime.includes("ogg")) contentType = "audio/ogg;codecs=opus";
  else if (mime.includes("mp4") || mime.includes("m4a")) contentType = "audio/mp4";
  else if (mime.includes("mp3") || mime.includes("mpeg")) contentType = "audio/mpeg";
  else if (mime.includes("wav")) contentType = "audio/wav";

  const sttEndpoint = `https://${AZURE_TRANSLATOR_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${localeCode}&format=detailed`;

  const sttRes = await fetch(sttEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": contentType,
      "Accept": "application/json",
    },
    body: audioBytes,
  });

  if (!sttRes.ok) {
    const errBody = await sttRes.text();
    throw new Error(`Azure STT failed: ${sttRes.status} ${errBody}`);
  }

  const sttData = await sttRes.json();
  const transcript = sttData?.DisplayText ?? sttData?.NBest?.[0]?.Display ?? "";
  return transcript.trim();
}

async function transcribeWithGoogle(audioBase64: string, mimeType: string, language: string): Promise<string> {
  const langCode = GOOGLE_LANG_CODE_MAP[language] ?? "en-US";
  const encoding = getEncoding(mimeType ?? "");

  const sttConfig: Record<string, unknown> = {
    encoding,
    languageCode: langCode,
    enableAutomaticPunctuation: true,
    model: "latest_long",
  };

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
    throw new Error(`Google STT failed: ${sttRes.status} ${errBody}`);
  }

  const sttData = await sttRes.json();
  const transcript = (sttData.results ?? [])
    .map((r: { alternatives: { transcript: string }[] }) => r.alternatives?.[0]?.transcript ?? "")
    .join(" ")
    .trim();

  return transcript;
}

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

    const lang = language.toLowerCase();
    let transcript = "";

    if (AZURE_LANGS.has(lang)) {
      transcript = await transcribeWithAzure(audioBase64, mimeType ?? "", lang);
    } else {
      transcript = await transcribeWithGoogle(audioBase64, mimeType ?? "", lang);
    }

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
