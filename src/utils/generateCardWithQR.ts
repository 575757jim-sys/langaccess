import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';

export async function generateCardWithQR(batchId: string): Promise<string> {
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'langaccess_master_noqr_v1..png');
  const outputDir = path.join(process.cwd(), 'public', 'output');
  const outputFileName = `card_${batchId}.png`;
  const outputPath = path.join(outputDir, outputFileName);

  const qrData = `https://langaccess.org/help?batch=${batchId}`;

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at: ${templatePath}`);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🔍 DEBUG: Starting QR generation...');
  console.log('QR DATA:', qrData);

  // Generate QR code buffer
  const qrBuffer = await QRCode.toBuffer(qrData, {
    errorCorrectionLevel: 'H',
    width: 150,
    height: 150,
    margin: 0,
    type: 'png'
  });

  console.log(`✅ QR buffer generated: ${qrBuffer.length} bytes`);

  // Resize QR code
  const qrImage = await sharp(qrBuffer)
    .resize(150, 150)
    .png()
    .toBuffer();

  const qrMetadata = await sharp(qrImage).metadata();
  console.log(`✅ QR image resized: ${qrMetadata.width}x${qrMetadata.height} pixels`);

  // Get template dimensions
  const templateMetadata = await sharp(templatePath).metadata();
  console.log(`📐 Template dimensions: ${templateMetadata.width}x${templateMetadata.height}`);

  // Calculate bottom-right position (20px from edges)
  const qrLeft = templateMetadata.width! - 150 - 20;
  const qrTop = templateMetadata.height! - 150 - 20;

  console.log(`📍 Composite coordinates: left=${qrLeft}, top=${qrTop}, width=150, height=150`);

  // Composite QR onto template
  console.log('🎨 Calling sharp().composite()...');
  await sharp(templatePath)
    .composite([
      {
        input: qrImage,
        left: qrLeft,
        top: qrTop
      }
    ])
    .png()
    .toFile(outputPath);

  console.log(`✅ QR code composited successfully!`);
  console.log(`💾 Saved to: ${outputPath}`);

  return `/output/${outputFileName}`;
}
