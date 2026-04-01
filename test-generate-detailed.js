import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';

async function generateCardWithQRDetailed(batchId) {
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'langaccess_master_noqr_v1_fixed.png');
  const outputDir = path.join(process.cwd(), 'public', 'output');
  const outputFileName = `card_${batchId}.png`;
  const outputPath = path.join(outputDir, outputFileName);

  const qrUrl = `https://langaccess.org/help?batch=${batchId}`;

  console.log('1. Checking template path:', templatePath);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at: ${templatePath}`);
  }
  console.log('   ✓ Template exists');

  console.log('2. Checking/creating output directory:', outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log('   ✓ Output directory ready');

  console.log('3. Generating QR code for:', qrUrl);
  const qrBuffer = await QRCode.toBuffer(qrUrl, {
    errorCorrectionLevel: 'H',
    width: 260,
    height: 260,
    margin: 0,
    type: 'png'
  });
  console.log('   ✓ QR code generated, buffer size:', qrBuffer.length);

  console.log('4. Processing QR image with sharp...');
  const qrImage = await sharp(qrBuffer)
    .resize(260, 260)
    .png()
    .toBuffer();
  console.log('   ✓ QR image processed, buffer size:', qrImage.length);

  console.log('5. Reading template metadata...');
  const metadata = await sharp(templatePath).metadata();
  console.log('   ✓ Template metadata:', metadata);

  console.log('6. Compositing QR onto template...');
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
  console.log('   ✓ Composite complete');

  console.log('7. Saved to:', outputPath);
  console.log('8. File exists?', fs.existsSync(outputPath));

  return `/output/${outputFileName}`;
}

async function test() {
  try {
    console.log('Running generateCardWithQR with batchId: "oakland-test-1"...\n');
    const result = await generateCardWithQRDetailed('oakland-test-1');
    console.log('\n✓ SUCCESS! Returned URL:', result);
  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

test();
