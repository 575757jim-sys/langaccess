import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
  MagickGeometry,
  CompositeOperator,
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

const TEMPLATE_URL = "https://waxbnkwybpeqdydxtgsy.supabase.co/storage/v1/object/public/templates/langaccess_master.png";
const QR_X = 1465;
const QR_Y = 585;
const QR_W = 260;
const QR_H = 260;

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
  let templateUrl = TEMPLATE_URL;
  let qrUrl = "";
  let templateFetchOk = false;
  let qrFetchOk = false;

  try {
    step = "parse_body";
    let body: { slug?: string; ambassador_id?: string; full_name?: string; city_state?: string };
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error("[generate-card] parse_body failed:", parseErr);
      return jsonResponse({
        success: false,
        step,
        error: parseErr instanceof Error ? parseErr.message : String(parseErr),
        stack: parseErr instanceof Error ? parseErr.stack ?? null : null,
        templateUrl,
        qrUrl,
        templateFetchOk,
        qrFetchOk,
      });
    }

    const { slug, ambassador_id } = body;
    if (!slug && !ambassador_id) {
      console.error("[generate-card] Missing slug or ambassador_id");
      return jsonResponse({
        success: false,
        step,
        error: "Missing required field: slug or ambassador_id",
        stack: null,
        templateUrl,
        qrUrl,
        templateFetchOk,
        qrFetchOk,
      });
    }

    step = "setup";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ambassadorCode = (ambassador_id || slug) as string;
    const qrDestinationUrl = `https://langaccess.org/join?code=${encodeURIComponent(ambassadorCode)}`;
    qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&data=${encodeURIComponent(qrDestinationUrl)}&bgcolor=ffffff&color=000000&margin=2`;

    step = "fetch_template";
    console.log("[generate-card] fetch_template — URL:", templateUrl);
    const templateFetch = await fetchImageBytes(templateUrl);
    templateFetchOk = templateFetch.ok;
    console.log("[generate-card] fetch_template done — ok:", templateFetch.ok, "status:", templateFetch.status, "bytes:", templateFetch.bytes?.length ?? 0);

    if (!templateFetch.bytes) {
      return jsonResponse({
        success: false,
        step,
        error: `Template fetch failed — HTTP ${templateFetch.status ?? "network error"}`,
        stack: null,
        templateUrl,
        qrUrl,
        templateFetchOk,
        qrFetchOk,
      });
    }

    step = "fetch_qr";
    console.log("[generate-card] fetch_qr — URL:", qrUrl);
    const qrFetch = await fetchImageBytes(qrUrl);
    qrFetchOk = qrFetch.ok;
    console.log("[generate-card] fetch_qr done — ok:", qrFetch.ok, "status:", qrFetch.status, "bytes:", qrFetch.bytes?.length ?? 0);

    if (!qrFetch.bytes) {
      return jsonResponse({
        success: false,
        step,
        error: `QR fetch failed — HTTP ${qrFetch.status ?? "network error"}`,
        stack: null,
        templateUrl,
        qrUrl,
        templateFetchOk,
        qrFetchOk,
      });
    }

    step = "compose";
    console.log("[generate-card] compose — starting ImageMagick composition");
    let outputPngBuffer: Uint8Array;
    try {
      outputPngBuffer = ImageMagick.read(templateFetch.bytes, (templateImg) => {
        console.log(`[generate-card] compose — template ${templateImg.width}x${templateImg.height}`);
        ImageMagick.read(qrFetch.bytes!, (qrImg) => {
          const geom = new MagickGeometry(QR_W, QR_H);
          geom.ignoreAspectRatio = true;
          qrImg.resize(geom);
          console.log(`[generate-card] compose — QR resized to ${QR_W}x${QR_H}, placing at (${QR_X}, ${QR_Y})`);
          templateImg.composite(qrImg, CompositeOperator.Over, new Point(QR_X, QR_Y));
        });
        console.log(`[generate-card] compose — final image ${templateImg.width}x${templateImg.height}`);
        return templateImg.write(MagickFormat.Png, (data) => data);
      });
    } catch (magickErr) {
      console.error("[generate-card] compose failed:", magickErr);
      return jsonResponse({
        success: false,
        step,
        error: magickErr instanceof Error ? magickErr.message : String(magickErr),
        stack: magickErr instanceof Error ? magickErr.stack ?? null : null,
        templateUrl,
        qrUrl,
        templateFetchOk,
        qrFetchOk,
      });
    }

    console.log("[generate-card] compose — success, PNG size:", outputPngBuffer.length);

    step = "upload";
    const fileName = `card-${ambassadorCode}-${Date.now()}.png`;
    const storagePath = `cards/${fileName}`;
    console.log("[generate-card] upload — path:", storagePath);

    const { error: uploadErr } = await supabase.storage
      .from("composed-cards")
      .upload(storagePath, outputPngBuffer, { contentType: "image/png", upsert: true });

    if (uploadErr) {
      console.error("[generate-card] upload failed:", uploadErr.message);
      return jsonResponse({
        success: false,
        step,
        error: `Storage upload failed: ${uploadErr.message}`,
        stack: null,
        templateUrl,
        qrUrl,
        templateFetchOk,
        qrFetchOk,
      });
    }

    step = "success";
    const { data: publicUrlData } = supabase.storage.from("composed-cards").getPublicUrl(storagePath);
    const finalPrintAssetUrl = publicUrlData.publicUrl;
    console.log("[generate-card] success — finalPrintAssetUrl:", finalPrintAssetUrl);

    return jsonResponse({
      success: true,
      step,
      finalPrintAssetUrl,
      composedDataUrl: finalPrintAssetUrl,
      qrImageUrl: qrUrl,
      qrDestinationUrl,
      ambassadorCode,
      templateUrl,
      templateFetchOk,
      qrFetchOk,
    });

  } catch (err) {
    console.error("[generate-card] unhandled error at step", step, ":", err);
    return jsonResponse({
      success: false,
      step: "top-level-catch",
      error: err instanceof Error ? err.message : "unknown",
      stack: err instanceof Error ? err.stack ?? null : null,
      templateUrl,
      qrUrl,
      templateFetchOk,
      qrFetchOk,
    });
  }
});
