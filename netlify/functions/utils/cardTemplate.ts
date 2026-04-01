import sharp from 'sharp';

const CANVAS_WIDTH = 1125;
const CANVAS_HEIGHT = 675;

export function buildMasterCardTemplateSVG(fullName: string, cityState: string): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}">
  <!-- Background -->
  <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="#0b0d0c"/>

  <!-- Left accent stripe -->
  <rect x="0" y="0" width="18" height="${CANVAS_HEIGHT}" fill="#2dff72"/>

  <!-- Main headline -->
  <text x="60" y="105" font-family="Arial, sans-serif" font-weight="bold" font-size="38" fill="white">One Card. One Lifeline.</text>

  <!-- Subheadline -->
  <text x="60" y="155" font-family="Arial, sans-serif" font-size="26" fill="#9ca3af">Scan to find help near you</text>

  <!-- Icons row -->
  <text x="60" y="220" font-family="Arial, sans-serif" font-size="24" fill="white">🥫  🏠  🏥</text>

  <!-- QR white box placeholder (QR will be overlaid at exact position) -->
  <rect x="804" y="293" width="259" height="259" rx="10" fill="white"/>

  <!-- Below QR -->
  <text x="933" y="580" font-family="Arial, sans-serif" font-size="21" fill="#2dff72" text-anchor="middle">langaccess.org</text>
  <text x="933" y="610" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle">Español disponible al escanear</text>

  <!-- Bottom right: name + city -->
  <text x="${CANVAS_WIDTH - 50}" y="${CANVAS_HEIGHT - 35}" font-family="Arial, sans-serif" font-size="19" fill="#2dff72" text-anchor="end">${escapeXml(fullName)}  •  ${escapeXml(cityState)}</text>
</svg>`.trim();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateMasterTemplate(fullName: string, cityState: string): Promise<Buffer> {
  const svgString = buildMasterCardTemplateSVG(fullName, cityState);

  return sharp(Buffer.from(svgString))
    .png()
    .toBuffer();
}

export const TEMPLATE_CONSTANTS = {
  CANVAS_WIDTH,
  CANVAS_HEIGHT
};
