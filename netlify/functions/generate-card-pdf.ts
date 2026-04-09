import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { generateBatchCode, generateBatchQRUrl, validateBatchData } from "./utils/batchGenerator";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildFrontSvgDataUrl(
  fullName: string,
  cityState: string,
  qrUrl: string
): string {
  const W = 1125;
  const H = 675;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0b0d0c"/>
  <rect x="0" y="0" width="18" height="${H}" fill="#2dff72"/>
  <text x="60" y="105" font-family="Arial,sans-serif" font-weight="bold" font-size="38" fill="white">One Card. One Lifeline.</text>
  <text x="60" y="155" font-family="Arial,sans-serif" font-size="26" fill="#9ca3af">Scan to find help near you</text>
  <text x="60" y="220" font-family="Arial,sans-serif" font-size="28" fill="white">Food  |  Shelter  |  Medical</text>
  <rect x="804" y="60" width="261" height="261" rx="10" fill="white"/>
  <image href="${qrUrl}" x="814" y="70" width="241" height="241"/>
  <text x="934" y="352" font-family="Arial,sans-serif" font-size="21" fill="#2dff72" text-anchor="middle">langaccess.org</text>
  <text x="934" y="378" font-family="Arial,sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle">Espanol disponible al escanear</text>
  <text x="${W - 50}" y="${H - 35}" font-family="Arial,sans-serif" font-size="19" fill="#2dff72" text-anchor="end">${escapeXml(fullName)}  •  ${escapeXml(cityState)}</text>
</svg>`;
  const encoded = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}

function buildBackSvgDataUrl(): string {
  const W = 1050;
  const H = 600;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0a2214"/>
  <text x="${W / 2}" y="60" font-family="Arial,sans-serif" font-weight="bold" font-size="28" fill="white" text-anchor="middle">Find help near you for:</text>
  <text x="${W / 2}" y="102" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle">Food  |  Shelter  |  Medical  |  Mental Health</text>
  <text x="${W / 2}" y="142" font-family="Arial,sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">Includes overdose support (Naloxone/Narcan)</text>
  <rect x="60" y="165" width="${W - 120}" height="240" rx="10" fill="#3b0a0a"/>
  <text x="${W / 2}" y="210" font-family="Arial,sans-serif" font-weight="bold" font-size="26" fill="white" text-anchor="middle">Call or Text 988</text>
  <text x="${W / 2}" y="242" font-family="Arial,sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">Mental health crisis</text>
  <text x="${W / 2}" y="278" font-family="Arial,sans-serif" font-size="22" fill="white" text-anchor="middle">Llame o envie texto al 988</text>
  <text x="${W / 2}" y="308" font-family="Arial,sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">Apoyo en crisis</text>
  <line x1="120" y1="322" x2="${W - 120}" y2="322" stroke="#555" stroke-width="1"/>
  <text x="270" y="360" font-family="Arial,sans-serif" font-weight="bold" font-size="22" fill="white" text-anchor="middle">Call 211</text>
  <text x="270" y="385" font-family="Arial,sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">Local services / Servicios locales</text>
  <text x="780" y="360" font-family="Arial,sans-serif" font-weight="bold" font-size="22" fill="white" text-anchor="middle">Call 911</text>
  <text x="${W / 2}" y="${H - 24}" font-family="Arial,sans-serif" font-size="20" fill="#2dff72" text-anchor="middle">LangAccess.org</text>
</svg>`;
  const encoded = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body: { order_id: string; full_name: string; city_state: string; slug?: string };
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { order_id, full_name, city_state, slug } = body;

  if (!order_id || !full_name || !city_state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: order_id, full_name, city_state" }),
    };
  }

  const cityParts = city_state.split(",");
  const city = cityParts[0]?.trim() || "";
  const statePart = cityParts[1]?.trim() || "";
  const formattedCityState = statePart ? `${city}, ${statePart}` : city;

  try {
    const batchCode = generateBatchCode(city);
    const qrUrl = slug
      ? generateBatchQRUrl(batchCode).replace(batchCode, encodeURIComponent(`langaccess.org/r/${slug}`))
      : generateBatchQRUrl(batchCode);

    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&ecc=H&data=${encodeURIComponent(
      slug ? `https://langaccess.org/r/${slug}` : qrUrl
    )}`;

    const frontFileUrl = buildFrontSvgDataUrl(full_name, formattedCityState, qrApiUrl);
    const backFileUrl = buildBackSvgDataUrl();

    const batchData = {
      batch_code: batchCode,
      qr_url: qrApiUrl,
      qr_image_path: qrApiUrl,
      card_asset_path: qrApiUrl,
    };

    const batchValidation = validateBatchData(batchData);
    if (!batchValidation.valid) {
      console.warn("Batch validation warnings:", batchValidation.errors);
    }

    const { error: updateError } = await supabase
      .from("card_orders")
      .update(batchData)
      .eq("id", order_id);

    if (updateError) {
      console.warn("Could not update card_orders (order may not exist yet):", updateError.message);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        frontFileUrl,
        backFileUrl,
        batch_code: batchCode,
        qr_url: qrApiUrl,
      }),
    };
  } catch (err) {
    console.error("generate-card-pdf error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate card assets", details: String(err) }),
    };
  }
};
