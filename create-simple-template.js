import sharp from 'sharp';
import fs from 'fs';
import QRCode from 'qrcode';

async function createSimpleTemplate() {
  console.log('Creating a simple test template...');

  // Create a simple colored card template
  const width = 2656;
  const height = 1600;

  const templatePath = '/tmp/cc-agent/65206495/project/public/templates/test_template.png';
  const outputPath = '/tmp/cc-agent/65206495/project/public/output/card_oakland-test-1.png';

  // Create a simple template
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 45, g: 85, b: 140, alpha: 1 }
    }
  })
  .png()
  .toFile(templatePath);

  console.log('✓ Test template created');

  // Now generate QR and composite
  const qrUrl = 'https://langaccess.org/help?batch=oakland-test-1';

  console.log('Generating QR code...');
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

  console.log('Compositing QR onto template...');

  if (!fs.existsSync('/tmp/cc-agent/65206495/project/public/output')) {
    fs.mkdirSync('/tmp/cc-agent/65206495/project/public/output', { recursive: true });
  }

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

  console.log('✓ Card with QR saved to:', outputPath);
  console.log('✓ File exists:', fs.existsSync(outputPath));
  console.log('✓ Public URL: /output/card_oakland-test-1.png');
}

createSimpleTemplate().catch(console.error);
