import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const buildTTSUrls = (text: string, lang: string): string[] => {
  const q = encodeURIComponent(text);
  const tl = encodeURIComponent(lang);
  return [
    `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&q=${q}&tl=${tl}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${q}&tl=${tl}`,
  ];
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const text = url.searchParams.get("q");
    const lang = url.searchParams.get("tl");

    if (!text || !lang) {
      return new Response(JSON.stringify({ error: "Missing q or tl param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ttsUrls = buildTTSUrls(text, lang);

    for (let i = 0; i < ttsUrls.length; i++) {
      try {
        const response = await fetch(ttsUrls[i], {
          headers: {
            "User-Agent": USER_AGENTS[i % USER_AGENTS.length],
            "Referer": "https://translate.google.com/",
            "Accept": "audio/mpeg, audio/mp3, audio/*, */*",
            "Accept-Language": "en-US,en;q=0.9",
          },
          redirect: "follow",
        });

        if (!response.ok) continue;

        const contentType = response.headers.get("content-type") || "";
        const isAudio = contentType.includes("audio") || contentType.includes("mpeg") || contentType.includes("mp3");
        if (!isAudio) continue;

        const audioBuffer = await response.arrayBuffer();
        if (audioBuffer.byteLength < 500) continue;

        return new Response(audioBuffer, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600",
            "Content-Length": String(audioBuffer.byteLength),
          },
        });
      } catch {
        continue;
      }
    }

    return new Response(JSON.stringify({ error: "All TTS endpoints failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
