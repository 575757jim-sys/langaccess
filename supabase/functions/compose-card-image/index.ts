import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Jimp from "npm:jimp@1.6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TEMPLATE_URL =
  "https://langaccess.org/templates/langaccess_master_noqr_v1..png";

const FALLBACK_TEMPLATE_URL =
  "https://tllfqsthkxgsadxtutpm.supabase.co/storage/v1/object/public/card-templates/langaccess_master_noqr_v1.png";

async function fetchImageBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "image/*" } });
    if (!res.ok) {
      console.error(`[compose] Fetch failed for ${url}: ${res.status}`);
      return null;
    }
    return await res.arrayBuffer();
  } catch (err) {
    console.error(`[compose] Fetch error for ${url}:`, err);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let body: { slug: string; full_name?: string; city_state?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { slug } = body;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Missing required field: slug" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const qrTarget = `https://langaccess.org/r/${encodeURIComponent(slug)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&data=${encodeURIComponent(qrTarget)}&bgcolor=ffffff&color=000000&margin=2`;

    console.log("[compose] Fetching template...");
    let templateBuf = await fetchImageBuffer(TEMPLATE_URL);
    if (!templateBuf) {
      console.log("[compose] Primary template failed, trying fallback...");
      templateBuf = await fetchImageBuffer(FALLBACK_TEMPLATE_URL);
    }

    if (!templateBuf) {
      console.error("[compose] FAILED: template not found at either URL");
      return new Response(
        JSON.stringify({
          error: "Could not load card template.",
          step: "template_not_found",
          urls_tried: [TEMPLATE_URL, FALLBACK_TEMPLATE_URL],
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[compose] Template fetched, size:", templateBuf.byteLength);

    console.log("[compose] Fetching QR code...");
    const qrBuf = await fetchImageBuffer(qrUrl);
    if (!qrBuf) {
      console.error("[compose] FAILED: QR image not found");
      return new Response(
        JSON.stringify({
          error: "Could not load QR code image.",
          step: "qr_not_found",
          qr_url: qrUrl,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[compose] QR fetched, size:", qrBuf.byteLength);

    console.log("[compose] Compositing images with Jimp...");
    let composedBase64: string;
    try {
      const templateImg = await Jimp.fromBuffer(new Uint8Array(templateBuf).buffer as ArrayBuffer);
      const qrImg = await Jimp.fromBuffer(new Uint8Array(qrBuf).buffer as ArrayBuffer);

      const cardW = templateImg.width;
      const cardH = templateImg.height;

      const qrSize = Math.round(cardH * 0.40);
      qrImg.resize({ w: qrSize, h: qrSize });

      const qrX = cardW - qrSize - Math.round(cardW * 0.03);
      const qrY = Math.round(cardH * 0.12);

      templateImg.composite(qrImg, qrX, qrY);

      const outputBuf = await templateImg.getBuffer("image/png");
      const bytes = new Uint8Array(outputBuf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      composedBase64 = "data:image/png;base64," + btoa(binary);
    } catch (jimpErr) {
      console.error("[compose] FAILED: Jimp composition error:", jimpErr);
      return new Response(
        JSON.stringify({
          error: "Card image composition failed.",
          step: "composition_failed",
          detail: String(jimpErr),
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[compose] Success! Composed image length:", composedBase64.length);

    return new Response(
      JSON.stringify({
        success: true,
        composedDataUrl: composedBase64,
        qrUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[compose] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error in compose-card-image.", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
