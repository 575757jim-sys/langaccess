import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TTS_URLS = (text: string, lang: string) => [
  `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`,
  `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`,
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

    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    ];

    const ttsUrls = TTS_URLS(text, lang);

    for (let i = 0; i < ttsUrls.length; i++) {
      try {
        const response = await fetch(ttsUrls[i], {
          headers: {
            "User-Agent": userAgents[i % userAgents.length],
            "Referer": "https://translate.google.com/",
            "Accept": "audio/mpeg, audio/*, */*",
            "Accept-Language": "en-US,en;q=0.9",
          },
        });

        if (!response.ok) continue;

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("audio") && !contentType.includes("mpeg")) continue;

        const audioBuffer = await response.arrayBuffer();
        if (audioBuffer.byteLength < 1000) continue;

        return new Response(audioBuffer, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400",
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
