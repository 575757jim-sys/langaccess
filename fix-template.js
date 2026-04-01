import sharp from 'sharp';
import fs from 'fs';

async function fixTemplate() {
  const inputPath = '/tmp/cc-agent/65206495/project/public/templates/langaccess_master_noqr_v1.png';
  const outputPath = '/tmp/cc-agent/65206495/project/public/templates/langaccess_master_noqr_v1_fixed.png';

  try {
    console.log('Reading and fixing template...');
    await sharp(inputPath)
      .png()
      .toFile(outputPath);
    console.log('Fixed template saved to:', outputPath);

    // Replace original with fixed version
    fs.renameSync(outputPath, inputPath);
    console.log('Original template replaced with fixed version');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixTemplate();
