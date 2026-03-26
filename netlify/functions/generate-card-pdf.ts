import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import https from "https";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

const WIDTH = 1050;
const HEIGHT = 600;

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function buildFrontSVG(qrSlug: string, fullName: string, cityState: string): string {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://langaccess.org/r/${encodeURIComponent(qrSlug)}`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0b0d0c"/>
  <rect x="0" y="0" width="15" height="${HEIGHT}" fill="#2dff72"/>

  <!-- Headline -->
  <text x="55" y="90" font-family="Arial, sans-serif" font-weight="bold" font-size="32" fill="white">One Card. One Lifeline.</text>

  <!-- Subheadline -->
  <text x="55" y="130" font-family="Arial, sans-serif" font-size="22" fill="#9ca3af">Scan to find help near you</text>

  <!-- Icons row -->
  <text x="55" y="185" font-family="Arial, sans-serif" font-size="20" fill="white">&#127822;  &#128716;  &#127973;</text>

  <!-- QR white box -->
  <rect x="760" y="50" width="230" height="230" rx="8" fill="white"/>

  <!-- QR image placeholder — replaced at runtime -->
  <image id="qr" href="${qrUrl}" x="765" y="55" width="220" height="220" preserveAspectRatio="xMidYMid meet"/>

  <!-- Below QR -->
  <text x="875" y="305" font-family="Arial, sans-serif" font-size="18" fill="#2dff72" text-anchor="middle">langaccess.org</text>
  <text x="875" y="328" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">Español disponible al escanear</text>

  <!-- Bottom right name + city -->
  <text x="${WIDTH - 40}" y="${HEIGHT - 30}" font-family="Arial, sans-serif" font-size="16" fill="#2dff72" text-anchor="end">${escapeXml(fullName)}  •  ${escapeXml(cityState)}</text>
</svg>`.trim();
}

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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

  let body: { qr_slug: string; full_name: string; city_state: string };
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { qr_slug, full_name, city_state } = body;

  if (!qr_slug || !full_name || !city_state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: qr_slug, full_name, city_state" }),
    };
  }

  try {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://langaccess.org/r/${encodeURIComponent(qr_slug)}`;
    let qrBase64 = "";

    try {
      const qrBuffer = await fetchBuffer(qrImageUrl);
      qrBase64 = `data:image/png;base64,${qrBuffer.toString("base64")}`;
    } catch (e) {
      console.warn("Could not fetch QR image, using placeholder URL", e);
      qrBase64 = qrImageUrl;
    }

    const frontSvgWithQr = buildFrontSVG(qr_slug, full_name, city_state).replace(
      `href="${qrImageUrl}"`,
      `href="${qrBase64}"`
    );

    const [frontPng, backPng] = await Promise.all([
      svgToPng(frontSvgWithQr),
      svgToPng(buildBackSVG()),
    ]);

    const timestamp = Date.now();
    const safeSlug = qr_slug.replace(/[^a-zA-Z0-9-_]/g, "_");

    const [frontFileUrl, backFileUrl] = await Promise.all([
      uploadToStorage(frontPng, `${safeSlug}-${timestamp}-front.png`),
      uploadToStorage(backPng, `${safeSlug}-${timestamp}-back.png`),
    ]);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, frontFileUrl, backFileUrl }),
    };
  } catch (err) {
    console.error("generate-card-pdf error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate card images", details: String(err) }),
    };
  }
};
