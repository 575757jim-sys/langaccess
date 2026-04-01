import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { generateBatchCode, generateBatchQRUrl, validateBatchData } from "./utils/batchGenerator";
import { generateQRImage, overlayQROnTemplate, validateFinalAsset } from "./utils/qrGenerator";
import { generateMasterTemplate } from "./utils/cardTemplate";
import sharp from "sharp";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

const WIDTH = 1050;
const HEIGHT = 600;

function buildBackSVG(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0a2214"/>

  <!-- Top heading -->
  <text x="${WIDTH / 2}" y="60" font-family="Arial, sans-serif" font-weight="bold" font-size="28" fill="white" text-anchor="middle">Find help near you for:</text>
  <text x="${WIDTH / 2}" y="102" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">Food • Shelter • Medical • Mental Health</text>

  <!-- Naloxone line -->
  <text x="${WIDTH / 2}" y="142" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">Includes overdose support (Naloxone/Narcan)</text>

  <!-- Crisis block background -->
  <rect x="60" y="165" width="${WIDTH - 120}" height="240" rx="10" fill="#3b0a0a"/>

  <!-- 988 block -->
  <text x="${WIDTH / 2}" y="210" font-family="Arial, sans-serif" font-weight="bold" font-size="26" fill="white" text-anchor="middle">Call or Text 988</text>
  <text x="${WIDTH / 2}" y="242" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">Mental health crisis</text>
  <text x="${WIDTH / 2}" y="278" font-family="Arial, sans-serif" font-size="22" fill="white" text-anchor="middle">Llame o envíe texto al 988</text>
  <text x="${WIDTH / 2}" y="308" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">Apoyo en crisis</text>

  <!-- Divider -->
  <line x1="120" y1="322" x2="${WIDTH - 120}" y2="322" stroke="#555" stroke-width="1"/>

  <!-- 211 -->
  <text x="270" y="360" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="white" text-anchor="middle">Call 211</text>
  <text x="270" y="385" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">Local services / Servicios locales</text>

  <!-- 911 -->
  <text x="780" y="360" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="white" text-anchor="middle">Call 911</text>

  <!-- Footer -->
  <text x="${WIDTH / 2}" y="${HEIGHT - 24}" font-family="Arial, sans-serif" font-size="20" fill="#2dff72" text-anchor="middle">LangAccess.org</text>
</svg>`.trim();
}

async function svgToPng(svgString: string): Promise<Buffer> {
  return sharp(Buffer.from(svgString))
    .png()
    .toBuffer();
}

async function uploadToStorage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const { error } = await supabase.storage
    .from("card-assets")
    .upload(filename, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from("card-assets")
    .getPublicUrl(filename);

  return data.publicUrl;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body: { order_id: string; full_name: string; city_state: string };
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { order_id, full_name, city_state } = body;

  if (!order_id || !full_name || !city_state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: order_id, full_name, city_state" }),
    };
  }

  try {
    const { data: existingOrder, error: fetchError } = await supabase
      .from("card_orders")
      .select("batch_code, qr_url, qr_image_path, card_asset_path")
      .eq("id", order_id)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed to fetch order: ${fetchError.message}`);
    }

    if (existingOrder?.batch_code && existingOrder?.card_asset_path) {
      console.log("Reusing existing batch assets for retry");
      const backPng = await svgToPng(buildBackSVG());
      const timestamp = Date.now();
      const backFileUrl = await uploadToStorage(backPng, `${order_id}-${timestamp}-back.png`);

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          frontFileUrl: existingOrder.card_asset_path,
          backFileUrl,
          batch_code: existingOrder.batch_code
        }),
      };
    }

    const city = city_state.split(',')[0].trim();
    const batchCode = generateBatchCode(city);
    const qrUrl = generateBatchQRUrl(batchCode);

    console.log(`Generated batch: ${batchCode}, QR URL: ${qrUrl}`);

    const qrBuffer = await generateQRImage(qrUrl);

    const templateBuffer = await generateMasterTemplate(full_name, city_state);

    const finalCardBuffer = await overlayQROnTemplate(templateBuffer, qrBuffer);

    const validation = await validateFinalAsset(finalCardBuffer);
    if (!validation.valid) {
      throw new Error(`Asset validation failed: ${validation.errors.join(', ')}`);
    }

    const timestamp = Date.now();
    const qrFilename = `qr/${order_id}-${timestamp}.png`;
    const frontFilename = `cards/${order_id}-${timestamp}-front.png`;
    const backFilename = `cards/${order_id}-${timestamp}-back.png`;

    await uploadToStorage(qrBuffer, qrFilename);
    const frontFileUrl = await uploadToStorage(finalCardBuffer, frontFilename);

    const backPng = await svgToPng(buildBackSVG());
    const backFileUrl = await uploadToStorage(backPng, backFilename);

    const batchData = {
      batch_code: batchCode,
      qr_url: qrUrl,
      qr_image_path: qrFilename,
      card_asset_path: frontFileUrl
    };

    const batchValidation = validateBatchData(batchData);
    if (!batchValidation.valid) {
      throw new Error(`Batch validation failed: ${batchValidation.errors.join(', ')}`);
    }

    const { error: updateError } = await supabase
      .from("card_orders")
      .update(batchData)
      .eq("id", order_id);

    if (updateError) {
      console.error("Failed to update order with batch data:", updateError);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        frontFileUrl,
        backFileUrl,
        batch_code: batchCode,
        qr_url: qrUrl
      }),
    };
  } catch (err) {
    console.error("generate-card-pdf error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate card images", details: String(err) }),
    };
  }
};
