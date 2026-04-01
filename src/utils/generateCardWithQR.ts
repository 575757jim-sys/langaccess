import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';

export async function generateCardWithQR(batchId: string): Promise<string> {
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'langaccess_master_noqr_v1_fixed.png');
  const outputDir = path.join(process.cwd(), 'public', 'output');
  const outputFileName = `card_${batchId}.png`;
  const outputPath = path.join(outputDir, outputFileName);

  const qrUrl = `https://langaccess.org/help?batch=${batchId}`;

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at: ${templatePath}`);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const qrBuffer = await QRCode.toBuffer(qrUrl, {
    errorCorrectionLevel: 'H',
    width: 260,
    height: 260,
    margin: 0,
    type: 'png'
  });

  const qrImage = await sharp(qrBuffer)
    .resize(260, 260)
    .png()
    .toBuffer();

  await sharp(templatePath)
    .composite([
      {
        input: qrImage,
        left: 820,
        top: 300
      }
    ])
    .png()
    .toFile(outputPath);

  console.log(`Saved to: ${outputPath}`);

  return `/output/${outputFileName}`;
}
