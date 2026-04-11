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

interface DiagnosticState {
  step: string;
  templateFetchStatus: number | null;
  templateFetchOk: boolean | null;
  templateBytes: number | null;
  templateWidth: number | null;
  templateHeight: number | null;
  qrFetchStatus: number | null;
  qrFetchOk: boolean | null;
  qrBytes: number | null;
  qrWidth: number | null;
  qrHeight: number | null;
  bufferCreated: boolean;
  bufferSize: number | null;
  uploadAttempted: boolean;
  uploadError: string | null;
  error: string | null;
  stack: string | null;
}

function diagResponse(diag: DiagnosticState, status: number): Response {
  return new Response(
    JSON.stringify({ debug: true, ...diag }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function fetchImageBytes(url: string): Promise<{ bytes: Uint8Array | null; status: number | null; ok: boolean | null }> {
  try {
    const res = await fetch(url, { headers: { Accept: "image/*" } });
    if (!res.ok) {
      return { bytes: null, status: res.status, ok: false };
    }
    return { bytes: new Uint8Array(await res.arrayBuffer()), status: res.status, ok: true };
  } catch (err) {
    return { bytes: null, status: null, ok: false };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const diag: DiagnosticState = {
    step: "init",
    templateFetchStatus: null,
    templateFetchOk: null,
    templateBytes: null,
    templateWidth: null,
    templateHeight: null,
    qrFetchStatus: null,
    qrFetchOk: null,
    qrBytes: null,
    qrWidth: null,
    qrHeight: null,
    bufferCreated: false,
    bufferSize: null,
    uploadAttempted: false,
    uploadError: null,
    error: null,
    stack: null,
  };

  try {
    diag.step = "parse_body";
    let body: { slug: string; ambassador_id?: string };
    try {
      body = await req.json();
    } catch (parseErr) {
      diag.error = "Invalid JSON body";
      diag.stack = parseErr instanceof Error ? parseErr.stack ?? null : String(parseErr);
      return diagResponse(diag, 400);
    }

    const { slug, ambassador_id } = body;
    if (!slug && !ambassador_id) {
      diag.error = "Missing required field: slug or ambassador_id";
      return diagResponse(diag, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ambassadorCode = (ambassador_id || slug) as string;
    const qrDestinationUrl = `https://langaccess.org/join?code=${encodeURIComponent(ambassadorCode)}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&data=${encodeURIComponent(qrDestinationUrl)}&bgcolor=ffffff&color=000000&margin=2`;

    diag.step = "fetch_template";
    console.log("[compose] Fetching template from:", TEMPLATE_URL);
    const templateFetch = await fetchImageBytes(TEMPLATE_URL);
    diag.templateFetchStatus = templateFetch.status;
    diag.templateFetchOk = templateFetch.ok;
    diag.templateBytes = templateFetch.bytes?.length ?? null;

    if (!templateFetch.bytes) {
      diag.error = `Template fetch failed — HTTP ${templateFetch.status ?? "network error"}`;
      return diagResponse(diag, 502);
    }
    console.log("[compose] Template fetched, size:", templateFetch.bytes.length);

    diag.step = "fetch_qr";
    console.log("[compose] Fetching QR code from:", qrImageUrl);
    const qrFetch = await fetchImageBytes(qrImageUrl);
    diag.qrFetchStatus = qrFetch.status;
    diag.qrFetchOk = qrFetch.ok;
    diag.qrBytes = qrFetch.bytes?.length ?? null;

    if (!qrFetch.bytes) {
      diag.error = `QR fetch failed — HTTP ${qrFetch.status ?? "network error"}`;
      return diagResponse(diag, 502);
    }
    console.log("[compose] QR fetched, size:", qrFetch.bytes.length);

    diag.step = "compose";
    let outputPngBuffer: Uint8Array;
    try {
      outputPngBuffer = ImageMagick.read(templateFetch.bytes, (templateImg) => {
        diag.templateWidth = templateImg.width;
        diag.templateHeight = templateImg.height;
        console.log(`[compose] template width=${templateImg.width}, height=${templateImg.height}`);

        ImageMagick.read(qrFetch.bytes!, (qrImg) => {
          diag.qrWidth = qrImg.width;
          diag.qrHeight = qrImg.height;
          const geom = new MagickGeometry(QR_W, QR_H);
          geom.ignoreAspectRatio = true;
          qrImg.resize(geom);
          console.log(`[compose] qr resized to ${QR_W}x${QR_H}, placing at x=${QR_X}, y=${QR_Y}`);
          templateImg.composite(qrImg, CompositeOperator.Over, new Point(QR_X, QR_Y));
        });

        console.log(`[compose] final image ${templateImg.width}x${templateImg.height}`);
        return templateImg.write(MagickFormat.Png, (data) => data);
      });
    } catch (magickErr) {
      diag.error = `ImageMagick composition failed: ${magickErr instanceof Error ? magickErr.message : String(magickErr)}`;
      diag.stack = magickErr instanceof Error ? magickErr.stack ?? null : null;
      return diagResponse(diag, 500);
    }

    diag.bufferCreated = true;
    diag.bufferSize = outputPngBuffer.length;
    console.log("[compose] Composition success, PNG size:", outputPngBuffer.length);

    diag.step = "upload";
    const fileName = `card-${ambassadorCode}-${Date.now()}.png`;
    const storagePath = `cards/${fileName}`;
    diag.uploadAttempted = true;

    console.log("[compose] Uploading to Supabase Storage:", storagePath);
    const { error: uploadErr } = await supabase.storage
      .from("composed-cards")
      .upload(storagePath, outputPngBuffer, { contentType: "image/png", upsert: true });

    if (uploadErr) {
      diag.uploadError = uploadErr.message;
      diag.error = `Storage upload failed: ${uploadErr.message}`;
      return diagResponse(diag, 500);
    }

    diag.step = "success";
    const { data: publicUrlData } = supabase.storage.from("composed-cards").getPublicUrl(storagePath);
    const finalPrintAssetUrl = publicUrlData.publicUrl;
    console.log("[compose] finalPrintAssetUrl:", finalPrintAssetUrl);

    return new Response(
      JSON.stringify({ success: true, finalPrintAssetUrl, composedDataUrl: finalPrintAssetUrl, qrImageUrl, qrDestinationUrl, ambassadorCode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    diag.error = `Unhandled error: ${err instanceof Error ? err.message : String(err)}`;
    diag.stack = err instanceof Error ? err.stack ?? null : null;
    console.error("[compose] Unhandled error:", err);
    return diagResponse(diag, 500);
  }
});
