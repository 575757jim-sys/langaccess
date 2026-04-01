import sharp from 'sharp';

async function testSharp() {
  try {
    console.log('Testing sharp with a simple generated image...');

    // Create a simple test image
    const testImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 }
      }
    })
    .png()
    .toBuffer();

    console.log('Successfully created test image');

    // Try to read the template
    console.log('Attempting to read template...');
    const metadata = await sharp('/tmp/cc-agent/65206495/project/public/templates/langaccess_master_noqr_v1_fixed.png').metadata();
    console.log('Template metadata:', metadata);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSharp();
