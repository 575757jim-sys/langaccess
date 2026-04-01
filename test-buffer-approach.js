import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';

async function generateWithBufferApproach(batchId) {
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'langaccess_master_noqr_v1_fixed.png');
  const outputDir = path.join(process.cwd(), 'public', 'output');
  const outputFileName = `card_${batchId}.png`;
  const outputPath = path.join(outputDir, outputFileName);

  const qrUrl = `https://langaccess.org/help?batch=${batchId}`;

  console.log('1. Reading template file into buffer...');
  const templateBuffer = fs.readFileSync(templatePath);
  console.log('   ✓ Template buffer size:', templateBuffer.length);

  console.log('2. Generating QR code...');
  const qrBuffer = await QRCode.toBuffer(qrUrl, {
    errorCorrectionLevel: 'H',
    width: 260,
    height: 260,
    margin: 0,
    type: 'png'
  });
  console.log('   ✓ QR code generated');

  console.log('3. Processing QR image...');
  const qrImage = await sharp(qrBuffer)
    .resize(260, 260)
    .png()
    .toBuffer();
  console.log('   ✓ QR image processed');

  console.log('4. Creating output directory...');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('5. Compositing (from buffer)...');
  await sharp(templateBuffer)
    .composite([
      {
        input: qrImage,
        left: 820,
        top: 300
      }
    ])
    .png()
    .toFile(outputPath);

  console.log('   ✓ Saved to:', outputPath);
  console.log('6. Checking file exists:', fs.existsSync(outputPath));

  return `/output/${outputFileName}`;
}

async function test() {
  try {
    const result = await generateWithBufferApproach('oakland-test-1');
    console.log('\n✓ SUCCESS! URL:', result);
  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    process.exit(1);
  }
}

test();
