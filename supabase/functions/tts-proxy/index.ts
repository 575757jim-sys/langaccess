import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const VERSION = "tts-proxy-FA04";

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
  farsi: { locale: "fa-IR", name: "fa-IR-DilaraNeural" },
};

const AZURE_LANGS = new Set(["farsi"]);

const UNSUPPORTED_LANGS = new Set(["hmong", "dari"]);

const GOOGLE_TTS_API_KEY = Deno.env.get("GOOGLE_TTS_API_KEY") ?? "";
const AZURE_TTS_KEY      = (Deno.env.get("AZURE_SPEECH_KEY") ?? "").replace(/^Value:\s*/i, "").trim();
const AZURE_TTS_REGION   = (Deno.env.get("AZURE_SPEECH_REGION") ?? "").replace(/^Value:\s*/i, "").trim();

const normalizeLang = (v?: string | null): string => {
  const s = (v ?? "").toLowerCase().trim();
  if (s === "farsi" || s === "persian" || s === "fa-ir" || s === "fa_ir") return "farsi";
  if (s === "dari" || s === "fa-af" || s === "fa_af" || s === "prs" || s === "prs-af") return "dari";
  if (s === "hmong" || s === "mww" || s === "mww-cn") return "hmong";
  return s;
};

async function synthesizeWithAzure(text: string, language: string): Promise<Response> {
  const voice = AZURE_VOICE_MAP[language];
  if (!voice) {
    return new Response(JSON.stringify({ error: `No Azure voice for: ${language}`, version: VERSION, provider: "azure" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) {
    return new Response(JSON.stringify({ error: "Azure credentials not configured", version: VERSION, provider: "azure" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const tokenEndpoint = `https://${AZURE_TTS_REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;
  const tokenRes = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    return new Response(JSON.stringify({ error: `Azure token failed: ${tokenRes.status}`, detail, version: VERSION, provider: "azure" }), {
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
    return new Response(JSON.stringify({ error: `Azure TTS failed: ${ttsRes.status}`, detail: errBody, version: VERSION, provider: "azure" }), {
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
      "X-Provider": "azure",
      "X-Version": VERSION,
    },
  });
}

async function synthesizeWithGoogle(text: string, language: string): Promise<Response> {
  const voice = GOOGLE_VOICE_MAP[language];
  if (!voice) {
    return new Response(JSON.stringify({ error: `Unsupported language: ${language}. Supported: ${Object.keys(GOOGLE_VOICE_MAP).join(", ")}`, version: VERSION, provider: "google" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!GOOGLE_TTS_API_KEY) {
    return new Response(JSON.stringify({ error: "GOOGLE_TTS_API_KEY not configured", version: VERSION, provider: "google" }), {
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
    return new Response(JSON.stringify({ error: `Google TTS failed: ${ttsRes.status}`, detail: errBody, version: VERSION, provider: "google" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { audioContent } = await ttsRes.json();
  if (!audioContent) {
    return new Response(JSON.stringify({ error: "No audio content returned", version: VERSION, provider: "google" }), {
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
      "X-Provider": "google",
      "X-Version": VERSION,
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const qText = url.searchParams.get("text") ?? "";
  const qLang = url.searchParams.get("lang") ?? url.searchParams.get("language") ?? "";

  const qDiag = url.searchParams.get("diag") ?? "";

  if (req.method === "GET" && !qText && !qLang) {
    if (qDiag === "voices") {
      const voicesRes = await fetch(
        `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
        { headers: { "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY } }
      );
      const voices = await voicesRes.json();
      const filtered = (voices as Array<{ Locale: string; ShortName: string }>)
        .filter(v => ["mww","prs","fa-"].some(p => v.Locale.startsWith(p)))
        .map(v => ({ locale: v.Locale, name: v.ShortName }));
      return new Response(JSON.stringify({ status: voicesRes.status, filtered, version: VERSION }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({
      ok: true,
      version: VERSION,
      azure_speech_key_set: !!AZURE_TTS_KEY,
      azure_speech_region: AZURE_TTS_REGION || "(not set)",
      google_key_set: !!GOOGLE_TTS_API_KEY,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let text = qText;
    let rawLang = qLang;

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({} as { text?: string; lang?: string; language?: string }));
      const bText = body?.text ?? "";
      const bLang = body?.lang ?? body?.language ?? "";
      text = (bText || qText).toString();
      rawLang = (bLang || qLang).toString();
    }

    const lang = normalizeLang(rawLang);

    if (!text || !lang) {
      return new Response(JSON.stringify({ error: "Missing text or language", version: VERSION }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (UNSUPPORTED_LANGS.has(lang)) {
      return new Response(JSON.stringify({ error: "AUDIO_UNAVAILABLE", message: "Audio not yet available for this language", version: VERSION }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (AZURE_LANGS.has(lang)) {
      return await synthesizeWithAzure(text, lang);
    }

    return await synthesizeWithGoogle(text, lang);
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err), version: VERSION }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
