import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Jimp from "npm:jimp@1.6.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// QR box position as fractions of card dimensions, derived from the master SVG template
// SVG canvas: 1125×675 — white QR box: x=804, y=293, w=259, h=259
const QR_X_RATIO = 804 / 1125;   // ~0.7147
const QR_Y_RATIO = 293 / 675;    // ~0.4341
const QR_W_RATIO = 259 / 1125;   // ~0.2302
const QR_H_RATIO = 259 / 675;    // ~0.3837

const TEMPLATE_URLS = [
  "https://tllfqsthkxgsadxtutpm.supabase.co/storage/v1/object/public/composed-cards/templates/langaccess_master_noqr_v1.png",
  "https://langaccess.org/templates/langaccess_master_noqr_v1..png",
];

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

async function ensureTemplateInStorage(
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const { data } = await supabase.storage
    .from("composed-cards")
    .list("templates");

  const exists = data?.some((f) => f.name === "langaccess_master_noqr_v1.png");
  if (exists) return;

  console.log("[compose] Template not in storage — uploading from langaccess.org...");
  const buf = await fetchImageBuffer("https://langaccess.org/templates/langaccess_master_noqr_v1..png");
  if (!buf) {
    console.warn("[compose] Could not fetch template for storage upload");
    return;
  }
  const { error } = await supabase.storage
    .from("composed-cards")
    .upload("templates/langaccess_master_noqr_v1.png", new Uint8Array(buf), {
      contentType: "image/png",
      upsert: false,
    });
  if (error) {
    console.warn("[compose] Template upload to storage failed:", error.message);
  } else {
    console.log("[compose] Template uploaded to storage successfully");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let body: { slug: string; ambassador_id?: string; full_name?: string; city_state?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { slug, ambassador_id } = body;
    if (!slug && !ambassador_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: slug or ambassador_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await ensureTemplateInStorage(supabase);

    const ambassadorCode = (ambassador_id || slug) as string;
    const qrDestinationUrl = `https://langaccess.org/join?code=${encodeURIComponent(ambassadorCode)}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&data=${encodeURIComponent(qrDestinationUrl)}&bgcolor=ffffff&color=000000&margin=2`;

    console.log("[compose] ambassadorCode:", ambassadorCode);
    console.log("[compose] qrDestinationUrl:", qrDestinationUrl);
    console.log("[compose] qrImageUrl:", qrImageUrl);

    console.log("[compose] Fetching template...");
    let templateBuf: ArrayBuffer | null = null;
    for (const url of TEMPLATE_URLS) {
      templateBuf = await fetchImageBuffer(url);
      if (templateBuf) {
        console.log("[compose] Template fetched from:", url, "size:", templateBuf.byteLength);
        break;
      }
    }

    if (!templateBuf) {
      console.error("[compose] FAILED: template not found at any URL");
      return new Response(
        JSON.stringify({
          error: "Could not load card template.",
          step: "template_not_found",
          urls_tried: TEMPLATE_URLS,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[compose] Fetching QR code...");
    const qrBuf = await fetchImageBuffer(qrImageUrl);
    if (!qrBuf) {
      console.error("[compose] FAILED: QR image not found");
      return new Response(
        JSON.stringify({
          error: "Could not load QR code image.",
          step: "qr_not_found",
          qr_url: qrImageUrl,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[compose] QR fetched, size:", qrBuf.byteLength);

    console.log("[compose] Compositing images with Jimp...");
    let outputPngBuffer: Uint8Array;
    try {
      const templateImg = await Jimp.fromBuffer(new Uint8Array(templateBuf).buffer as ArrayBuffer);
      const qrImg = await Jimp.fromBuffer(new Uint8Array(qrBuf).buffer as ArrayBuffer);

      const cardW = templateImg.width;
      const cardH = templateImg.height;

      const qrW = Math.round(cardW * QR_W_RATIO);
      const qrH = Math.round(cardH * QR_H_RATIO);
      const qrX = Math.round(cardW * QR_X_RATIO);
      const qrY = Math.round(cardH * QR_Y_RATIO);

      console.log(`[compose] Card size: ${cardW}x${cardH}`);
      console.log(`[compose] QR size: ${qrW}x${qrH}, position: (${qrX}, ${qrY})`);

      qrImg.resize({ w: qrW, h: qrH });
      templateImg.composite(qrImg, qrX, qrY);

      const outputBuf = await templateImg.getBuffer("image/png");
      outputPngBuffer = new Uint8Array(outputBuf);
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

    console.log("[compose] Composition success, PNG size:", outputPngBuffer.length);

    const fileName = `card-${ambassadorCode}-${Date.now()}.png`;
    const storagePath = `cards/${fileName}`;

    console.log("[compose] Uploading to Supabase Storage:", storagePath);

    const { error: uploadError } = await supabase.storage
      .from("composed-cards")
      .upload(storagePath, outputPngBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("[compose] Storage upload failed:", uploadError);
      return new Response(
        JSON.stringify({
          error: "Storage upload failed.",
          step: "upload_failed",
          detail: uploadError.message,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("composed-cards")
      .getPublicUrl(storagePath);

    const finalPrintAssetUrl = publicUrlData.publicUrl;

    console.log("[compose] finalPrintAssetUrl:", finalPrintAssetUrl);

    return new Response(
      JSON.stringify({
        success: true,
        finalPrintAssetUrl,
        composedDataUrl: finalPrintAssetUrl,
        qrImageUrl,
        qrDestinationUrl,
        ambassadorCode,
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
