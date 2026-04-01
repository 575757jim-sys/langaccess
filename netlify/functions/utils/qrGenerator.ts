import sharp from 'sharp';
import https from 'https';

const CANVAS_WIDTH = 1125;
const CANVAS_HEIGHT = 675;
const QR_X = 804;
const QR_Y = 293;
const QR_SIZE = 259;

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

export async function generateQRImage(url: string): Promise<Buffer> {
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&ecc=H&data=${encodeURIComponent(url)}`;

  const qrBuffer = await fetchBuffer(qrApiUrl);

  const resizedQR = await sharp(qrBuffer)
    .resize(QR_SIZE, QR_SIZE, {
      fit: 'cover',
      kernel: sharp.kernel.lanczos3
    })
    .png()
    .toBuffer();

  return resizedQR;
}

export async function overlayQROnTemplate(
  templateBuffer: Buffer,
  qrBuffer: Buffer
): Promise<Buffer> {
  const metadata = await sharp(templateBuffer).metadata();

  if (metadata.width !== CANVAS_WIDTH || metadata.height !== CANVAS_HEIGHT) {
    throw new Error(`Template must be ${CANVAS_WIDTH}x${CANVAS_HEIGHT}, got ${metadata.width}x${metadata.height}`);
  }

  const qrMetadata = await sharp(qrBuffer).metadata();
  if (qrMetadata.width !== QR_SIZE || qrMetadata.height !== QR_SIZE) {
    throw new Error(`QR must be ${QR_SIZE}x${QR_SIZE}, got ${qrMetadata.width}x${qrMetadata.height}`);
  }

  const finalImage = await sharp(templateBuffer)
    .composite([
      {
        input: qrBuffer,
        top: QR_Y,
        left: QR_X,
      }
    ])
    .png()
    .toBuffer();

  return finalImage;
}

export function validateFinalAsset(buffer: Buffer): Promise<{ valid: boolean; errors: string[] }> {
  return sharp(buffer)
    .metadata()
    .then((metadata) => {
      const errors: string[] = [];

      if (metadata.width !== CANVAS_WIDTH) {
        errors.push(`Width must be ${CANVAS_WIDTH}, got ${metadata.width}`);
      }

      if (metadata.height !== CANVAS_HEIGHT) {
        errors.push(`Height must be ${CANVAS_HEIGHT}, got ${metadata.height}`);
      }

      return {
        valid: errors.length === 0,
        errors
      };
    });
}

export const QR_CONSTANTS = {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  QR_X,
  QR_Y,
  QR_SIZE
};
