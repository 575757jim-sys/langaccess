import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
  MagickGeometry,
  CompositeOperator,
  ColorSpace,
  Point,
} from "npm:@imagemagick/magick-wasm@0.0.30";
import { createClient } from "npm:@supabase/supabase-js@2";

const wasmBytes = await Deno.readFile(
  new URL("magick.wasm", import.meta.resolve("npm:@imagemagick/magick-wasm@0.0.30"))
);
await initializeImageMagick(wasmBytes);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Template canvas: 1125×675 — QR white box absolute pixel coordinates
const TEMPLATE_W = 1125;
const TEMPLATE_H = 675;
const QR_X = 804;
const QR_Y = 293;
const QR_W = 259;
const QR_H = 259;

const TEMPLATE_URLS = [
  "https://tllfqsthkxgsadxtutpm.supabase.co/storage/v1/object/public/composed-cards/templates/langaccess_master_noqr_v1.png",
  "https://langaccess.org/templates/langaccess_master_noqr_v1..png",
];

async function fetchImageBytes(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "image/*" } });
    if (!res.ok) {
      console.error(`[compose] Fetch failed for ${url}: ${res.status}`);
      return null;
    }
    return new Uint8Array(await res.arrayBuffer());
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
    let body: { slug: string; ambassador_id?: string };
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

    const ambassadorCode = (ambassador_id || slug) as string;
    const qrDestinationUrl = `https://langaccess.org/join?code=${encodeURIComponent(ambassadorCode)}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&data=${encodeURIComponent(qrDestinationUrl)}&bgcolor=ffffff&color=000000&margin=2`;

    console.log("[compose] ambassadorCode:", ambassadorCode);
    console.log("[compose] qrDestinationUrl:", qrDestinationUrl);

    console.log("[compose] Fetching template...");
    let templateBytes: Uint8Array | null = null;
    for (const url of TEMPLATE_URLS) {
      templateBytes = await fetchImageBytes(url);
      if (templateBytes) {
        console.log("[compose] Template fetched from:", url, "size:", templateBytes.length);
        break;
      }
    }

    if (!templateBytes) {
      return new Response(
        JSON.stringify({ error: "Could not load card template.", step: "template_not_found", urls_tried: TEMPLATE_URLS }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[compose] Fetching QR code...");
    const qrBytes = await fetchImageBytes(qrImageUrl);
    if (!qrBytes) {
      return new Response(
        JSON.stringify({ error: "Could not load QR code image.", step: "qr_not_found", qr_url: qrImageUrl }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[compose] QR fetched, size:", qrBytes.length);

    console.log("[compose] Compositing images with ImageMagick...");
    let outputPngBuffer: Uint8Array;
    try {
      outputPngBuffer = ImageMagick.read(templateBytes, (templateImg) => {
        const cardW = templateImg.width;
        const cardH = templateImg.height;

        console.log(`[compose] Card dimensions: ${cardW}x${cardH} (expected ${TEMPLATE_W}x${TEMPLATE_H})`);
        console.log(`[compose] QR placement: x=${QR_X}, y=${QR_Y}, w=${QR_W}, h=${QR_H}`);

        ImageMagick.read(qrBytes, (qrImg) => {
          qrImg.colorSpace = templateImg.colorSpace;
          const geom = new MagickGeometry(QR_W, QR_H);
          geom.ignoreAspectRatio = true;
          qrImg.resize(geom);
          console.log(`[compose] QR resized to: ${qrImg.width}x${qrImg.height}`);
          templateImg.composite(qrImg, CompositeOperator.Over, new Point(QR_X, QR_Y));
        });

        console.log(`[compose] Final image dimensions: ${templateImg.width}x${templateImg.height}`);
        return templateImg.write(MagickFormat.Png, (data) => data);
      });
    } catch (magickErr) {
      console.error("[compose] FAILED: ImageMagick composition error:", magickErr);
      return new Response(
        JSON.stringify({ error: "Card image composition failed.", step: "composition_failed", detail: String(magickErr) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[compose] Composition success, PNG size:", outputPngBuffer.length);

    const fileName = `card-${ambassadorCode}-${Date.now()}.png`;
    const storagePath = `cards/${fileName}`;

    console.log("[compose] Uploading to Supabase Storage:", storagePath);
    const { error: uploadError } = await supabase.storage
      .from("composed-cards")
      .upload(storagePath, outputPngBuffer, { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("[compose] Storage upload failed:", uploadError);
      return new Response(
        JSON.stringify({ error: "Storage upload failed.", step: "upload_failed", detail: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: publicUrlData } = supabase.storage.from("composed-cards").getPublicUrl(storagePath);
    const finalPrintAssetUrl = publicUrlData.publicUrl;
    console.log("[compose] finalPrintAssetUrl:", finalPrintAssetUrl);

    return new Response(
      JSON.stringify({ success: true, finalPrintAssetUrl, composedDataUrl: finalPrintAssetUrl, qrImageUrl, qrDestinationUrl, ambassadorCode }),
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
