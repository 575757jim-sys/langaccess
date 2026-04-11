import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
  MagickGeometry,
  CompositeOperator,
  Point,
  MagickImage,
  MagickColor,
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

const CANVAS_WIDTH = 1125;
const CANVAS_HEIGHT = 675;
const QR_X = 804;
const QR_Y = 293;
const QR_W = 259;
const QR_H = 259;

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildCardSvg(fullName: string, cityState: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}">
  <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="#0b0d0c"/>
  <rect x="0" y="0" width="18" height="${CANVAS_HEIGHT}" fill="#2dff72"/>
  <text x="60" y="105" font-family="Arial, sans-serif" font-weight="bold" font-size="38" fill="white">One Card. One Lifeline.</text>
  <text x="60" y="155" font-family="Arial, sans-serif" font-size="26" fill="#9ca3af">Scan to find help near you</text>
  <text x="60" y="220" font-family="Arial, sans-serif" font-size="24" fill="white">Food  Housing  Health</text>
  <rect x="${QR_X}" y="${QR_Y}" width="${QR_W}" height="${QR_H}" rx="10" fill="white"/>
  <text x="933" y="580" font-family="Arial, sans-serif" font-size="21" fill="#2dff72" text-anchor="middle">langaccess.org</text>
  <text x="933" y="610" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle">Espanol disponible al escanear</text>
  <text x="${CANVAS_WIDTH - 50}" y="${CANVAS_HEIGHT - 35}" font-family="Arial, sans-serif" font-size="19" fill="#2dff72" text-anchor="end">${escapeXml(fullName)}  |  ${escapeXml(cityState)}</text>
</svg>`;
}

async function fetchImageBytes(url: string): Promise<{ bytes: Uint8Array | null; status: number | null; ok: boolean }> {
  try {
    const res = await fetch(url, { headers: { Accept: "image/*" } });
    if (!res.ok) return { bytes: null, status: res.status, ok: false };
    return { bytes: new Uint8Array(await res.arrayBuffer()), status: res.status, ok: true };
  } catch {
    return { bytes: null, status: null, ok: false };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  let step = "init";

  try {
    step = "parse_body";
    let body: { slug?: string; ambassador_id?: string; full_name?: string; city_state?: string };
    try {
      body = await req.json();
    } catch (parseErr) {
      return jsonResponse({ success: false, step, error: parseErr instanceof Error ? parseErr.message : String(parseErr) });
    }

    const { slug, ambassador_id, full_name = "Community Member", city_state = "" } = body;
    if (!slug && !ambassador_id) {
      return jsonResponse({ success: false, step, error: "Missing required field: slug or ambassador_id" });
    }

    step = "setup";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ambassadorCode = (ambassador_id || slug) as string;
    const qrDestinationUrl = `https://langaccess.org/join?code=${encodeURIComponent(ambassadorCode)}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&data=${encodeURIComponent(qrDestinationUrl)}&bgcolor=ffffff&color=000000&margin=2`;

    step = "render_svg_template";
    console.log("[generate-card] Building SVG card for:", full_name, city_state);
    const svgString = buildCardSvg(full_name, city_state);
    const svgBytes = new TextEncoder().encode(svgString);

    step = "render_template_png";
    let templatePngBytes: Uint8Array;
    try {
      templatePngBytes = ImageMagick.read(svgBytes, (img) => {
        console.log(`[generate-card] SVG rendered ${img.width}x${img.height}`);
        return img.write(MagickFormat.Png, (data) => new Uint8Array(data));
      });
    } catch (svgErr) {
      console.error("[generate-card] SVG render failed:", svgErr);
      return jsonResponse({
        success: false,
        step,
        error: svgErr instanceof Error ? svgErr.message : String(svgErr),
        composeStep: "svg_render_failed",
      });
    }

    if (!templatePngBytes || templatePngBytes.length === 0) {
      return jsonResponse({ success: false, step, error: "SVG render produced empty buffer", composeStep: "svg_render_empty" });
    }
    console.log("[generate-card] Template PNG size:", templatePngBytes.length);

    step = "fetch_qr";
    console.log("[generate-card] Fetching QR:", qrImageUrl);
    const qrFetch = await fetchImageBytes(qrImageUrl);
    console.log("[generate-card] QR fetch — ok:", qrFetch.ok, "status:", qrFetch.status, "bytes:", qrFetch.bytes?.length ?? 0);

    if (!qrFetch.bytes) {
      return jsonResponse({
        success: false,
        step,
        error: `QR fetch failed — HTTP ${qrFetch.status ?? "network error"}`,
        composeStep: "qr_fetch_failed",
      });
    }

    step = "compose";
    console.log("[generate-card] Compositing QR onto template");

    let outputPngBuffer: Uint8Array;
    try {
      const qrResizedBytes = ImageMagick.read(qrFetch.bytes, (qrImg) => {
        const geom = new MagickGeometry(QR_W, QR_H);
        geom.ignoreAspectRatio = true;
        qrImg.resize(geom);
        console.log(`[generate-card] QR resized to ${qrImg.width}x${qrImg.height}`);
        return qrImg.write(MagickFormat.Png, (data) => new Uint8Array(data));
      });

      if (!qrResizedBytes || qrResizedBytes.length === 0) {
        throw new Error("QR resize produced empty buffer");
      }
      console.log("[generate-card] QR resized buffer size:", qrResizedBytes.length);

      outputPngBuffer = ImageMagick.read(templatePngBytes, (templateImg) => {
        console.log(`[generate-card] Template image: ${templateImg.width}x${templateImg.height}`);

        const qrImage = MagickImage.create();
        qrImage.read(qrResizedBytes);
        console.log(`[generate-card] QR image: ${qrImage.width}x${qrImage.height}, placing at (${QR_X}, ${QR_Y})`);

        templateImg.composite(qrImage, CompositeOperator.Over, new Point(QR_X, QR_Y));
        qrImage.dispose();

        console.log(`[generate-card] Composited — final: ${templateImg.width}x${templateImg.height}`);
        return templateImg.write(MagickFormat.Png, (data) => new Uint8Array(data));
      });
    } catch (magickErr) {
      console.error("[generate-card] Composition failed:", magickErr);
      return jsonResponse({
        success: false,
        step,
        error: magickErr instanceof Error ? magickErr.message : String(magickErr),
        stack: magickErr instanceof Error ? magickErr.stack ?? null : null,
        composeStep: "compose_failed",
      });
    }

    if (!outputPngBuffer || outputPngBuffer.length === 0) {
      console.error("[generate-card] Composition produced empty buffer");
      return jsonResponse({
        success: false,
        step,
        error: "Composition produced empty image buffer",
        composeStep: "compose_missing_output",
      });
    }

    console.log("[generate-card] Composed PNG size:", outputPngBuffer.length);

    step = "upload";
    const fileName = `card-${ambassadorCode}-${Date.now()}.png`;
    const storagePath = `cards/${fileName}`;
    console.log("[generate-card] Uploading to composed-cards:", storagePath);

    const { error: uploadErr } = await supabase.storage
      .from("composed-cards")
      .upload(storagePath, outputPngBuffer, { contentType: "image/png", upsert: true });

    if (uploadErr) {
      console.error("[generate-card] Upload failed:", uploadErr.message);
      return jsonResponse({
        success: false,
        step,
        error: `Storage upload failed: ${uploadErr.message}`,
        composeStep: "upload_failed",
      });
    }

    step = "get_public_url";
    const { data: publicUrlData } = supabase.storage.from("composed-cards").getPublicUrl(storagePath);
    const finalPrintAssetUrl = publicUrlData?.publicUrl ?? null;

    if (!finalPrintAssetUrl) {
      console.error("[generate-card] getPublicUrl returned null");
      return jsonResponse({
        success: false,
        step,
        error: "composed image was not created",
        composeStep: "compose_missing_output",
      });
    }

    console.log("[generate-card] Success — finalPrintAssetUrl:", finalPrintAssetUrl);

    return jsonResponse({
      success: true,
      step: "success",
      finalPrintAssetUrl,
      composedDataUrl: finalPrintAssetUrl,
      qrImageUrl,
      qrDestinationUrl,
      ambassadorCode,
    });

  } catch (err) {
    console.error("[generate-card] Unhandled error at step", step, ":", err);
    return jsonResponse({
      success: false,
      step: "top-level-catch",
      error: err instanceof Error ? err.message : "unknown",
      stack: err instanceof Error ? err.stack ?? null : null,
      composeStep: "compose_missing_output",
    });
  }
});
