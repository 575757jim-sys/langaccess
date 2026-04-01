import sharp from 'sharp';

async function cleanTemplate() {
  const inputPath = '/tmp/cc-agent/65206495/project/public/templates/langaccess_master_noqr_v1_fixed.png';
  const outputPath = '/tmp/cc-agent/65206495/project/public/templates/langaccess_master_clean.png';

  try {
    console.log('Reading template and converting to raw buffer...');

    // Read as raw pixels, then re-encode as clean PNG
    const image = sharp(inputPath);
    const { width, height } = await image.metadata();

    console.log(`Template size: ${width}x${height}`);

    // Get raw pixel data
    const rawBuffer = await image.ensureAlpha().raw().toBuffer();
    console.log(`Raw buffer size: ${rawBuffer.length} bytes`);

    // Create new PNG from raw pixels
    await sharp(rawBuffer, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
    .png()
    .toFile(outputPath);

    console.log('✓ Clean template saved to:', outputPath);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

cleanTemplate();
