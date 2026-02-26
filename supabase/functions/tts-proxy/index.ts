import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_LANG_MAP: Record<string, string> = {
  spanish: "es",
  tagalog: "fil",
  vietnamese: "vi",
  mandarin: "zh-CN",
  cantonese: "zh-yue",
};

const SOT_LANG_MAP: Record<string, string> = {
  spanish: "es",
  tagalog: "fil-PH",
  vietnamese: "vi",
  mandarin: "zh-CN",
  cantonese: "yue-HK",
};

async function fetchFromGoogleTranslateTTS(text: string, langCode: string): Promise<ArrayBuffer | null> {
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${langCode}&client=tw-ob&ttsspeed=0.85`;
  try {
    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
        "Accept": "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
        "Cache-Control": "no-cache",
      },
    });
    if (!response.ok) return null;
    const buf = await response.arrayBuffer();
    if (buf.byteLength < 100) return null;
    return buf;
  } catch {
    return null;
  }
}

async function fetchFromSoundOfText(text: string, langCode: string): Promise<ArrayBuffer | null> {
  try {
    const createRes = await fetch("https://api.soundoftext.com/sounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engine: "Google", data: { text, voice: langCode } }),
    });
    if (!createRes.ok) return null;
    const createData = await createRes.json();
    const soundId: string = createData?.id;
    if (!soundId) return null;

    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 600));
      const statusRes = await fetch(`https://api.soundoftext.com/sounds/${soundId}`);
      if (!statusRes.ok) continue;
      const statusData = await statusRes.json();
      if (statusData?.status === "Done" && statusData?.location) {
        const audioRes = await fetch(statusData.location);
        if (!audioRes.ok) return null;
        const buf = await audioRes.arrayBuffer();
        if (buf.byteLength < 100) return null;
        return buf;
      }
      if (statusData?.status === "Error") return null;
    }
    return null;
  } catch {
    return null;
  }
}

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

    const googleLang = GOOGLE_LANG_MAP[language];
    const sotLang = SOT_LANG_MAP[language];

    if (!googleLang || !sotLang) {
      return new Response(JSON.stringify({ error: "Unsupported language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let audioBuffer: ArrayBuffer | null = null;

    audioBuffer = await fetchFromGoogleTranslateTTS(text, googleLang);

    if (!audioBuffer) {
      audioBuffer = await fetchFromSoundOfText(text, sotLang);
    }

    if (!audioBuffer) {
      return new Response(JSON.stringify({ error: "All TTS sources failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(audioBuffer, {
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
