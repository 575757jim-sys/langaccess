import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_VOICE_MAP: Record<string, { languageCode: string; name: string }> = {
  spanish:          { languageCode: "es-US",  name: "es-US-Neural2-A" },
  tagalog:          { languageCode: "fil-PH", name: "fil-PH-Wavenet-A" },
  vietnamese:       { languageCode: "vi-VN",  name: "vi-VN-Neural2-A" },
  mandarin:         { languageCode: "cmn-CN", name: "cmn-CN-Neural2-A" },
  cantonese:        { languageCode: "yue-HK", name: "yue-HK-Standard-A" },
  korean:           { languageCode: "ko-KR",  name: "ko-KR-Neural2-A" },
  arabic:           { languageCode: "ar-XA",  name: "ar-XA-Neural2-D" },
  "zh-traditional": { languageCode: "cmn-TW", name: "cmn-TW-Wavenet-A" },
  "zh-simplified":  { languageCode: "cmn-CN", name: "cmn-CN-Neural2-A" },
};

const AZURE_VOICE_MAP: Record<string, { locale: string; name: string }> = {
  hmong: { locale: "mww-CN", name: "mww-CN-XiaoMin-Apollo" },
  farsi: { locale: "fa-IR",  name: "fa-IR-DilaraNeural" },
  dari:  { locale: "prs-AF", name: "prs-AF-GulNawazNeural" },
};

const AZURE_LANGS = new Set(["hmong", "farsi", "dari"]);

const GOOGLE_TTS_API_KEY = Deno.env.get("GOOGLE_TTS_API_KEY") ?? "";
const AZURE_TTS_KEY = Deno.env.get("AZURE_TRANSLATOR_KEY") ?? "";
const AZURE_TTS_REGION = Deno.env.get("AZURE_TRANSLATOR_REGION") ?? "";

async function synthesizeWithAzure(text: string, language: string): Promise<Response> {
  const voice = AZURE_VOICE_MAP[language];
  if (!voice) {
    return new Response(JSON.stringify({ error: `No Azure voice for: ${language}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) {
    return new Response(JSON.stringify({ error: "Azure credentials not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const tokenEndpoint = `https://${AZURE_TTS_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  const tokenRes = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    return new Response(JSON.stringify({ error: `Azure token failed: ${tokenRes.status}`, detail }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const accessToken = await tokenRes.text();
  const ttsEndpoint = `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const ssml = `<speak version='1.0' xml:lang='${voice.locale}'><voice xml:lang='${voice.locale}' name='${voice.name}'><prosody rate='-10%'>${escaped}</prosody></voice></speak>`;

  const ttsRes = await fetch(ttsEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "LangAccess",
    },
    body: ssml,
  });

  if (!ttsRes.ok) {
    const errBody = await ttsRes.text();
    return new Response(JSON.stringify({ error: `Azure TTS failed: ${ttsRes.status}`, detail: errBody }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const audioBuffer = await ttsRes.arrayBuffer();
  return new Response(audioBuffer, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=604800",
    },
  });
}

async function synthesizeWithGoogle(text: string, language: string): Promise<Response> {
  const voice = GOOGLE_VOICE_MAP[language];
  if (!voice) {
    return new Response(JSON.stringify({ error: `No Google voice for: ${language}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!GOOGLE_TTS_API_KEY) {
    return new Response(JSON.stringify({ error: "GOOGLE_TTS_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ttsRes = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: voice.languageCode, name: voice.name },
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.9, pitch: 0 },
      }),
    }
  );

  if (!ttsRes.ok) {
    const errBody = await ttsRes.text();
    return new Response(JSON.stringify({ error: `Google TTS failed: ${ttsRes.status}`, detail: errBody }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { audioContent } = await ttsRes.json();
  if (!audioContent) {
    return new Response(JSON.stringify({ error: "No audio content returned" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const binaryStr = atob(audioContent);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  return new Response(bytes.buffer, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=604800",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const text = url.searchParams.get("text");
    const rawLang = url.searchParams.get("language");

    if (!text || !rawLang) {
      return new Response(JSON.stringify({ error: "Missing text or language parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const language = rawLang.trim().toLowerCase();

    if (AZURE_LANGS.has(language)) {
      return await synthesizeWithAzure(text, language);
    }

    return await synthesizeWithGoogle(text, language);
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
