import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VOICE_MAP: Record<string, { languageCode: string; name: string }> = {
  spanish:   { languageCode: "es-US", name: "es-US-Wavenet-C" },
  tagalog:   { languageCode: "fil-PH", name: "fil-PH-Wavenet-A" },
  vietnamese:{ languageCode: "vi-VN", name: "vi-VN-Wavenet-A" },
  mandarin:  { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-A" },
  cantonese: { languageCode: "yue-HK", name: "yue-HK-Standard-B" },
};

const GOOGLE_TTS_API_KEY = Deno.env.get("GOOGLE_TTS_API_KEY") ?? "AIzaSyCVelfCMpunEN1H2nAgR9Iktx8xpQ9PvnE";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const text = url.searchParams.get("text");
    const language = url.searchParams.get("language")?.toLowerCase();

    if (!text || !language) {
      return new Response(JSON.stringify({ error: "Missing text or language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const voice = VOICE_MAP[language];
    if (!voice) {
      return new Response(JSON.stringify({ error: "Unsupported language" }), {
        status: 400,
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
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
