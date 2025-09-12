const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Create a test image with specified dimensions and text
async function createTestImage(width, height, text, outputPath) {
  try {
    // Create a colorful gradient background
    const background = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 135, g: 206, b: 235, alpha: 1 } // Sky blue
      }
    })
    .png()
    .toBuffer();

    // Add text overlay if provided
    if (text) {
      // For now, just save the background (text overlay can be complex without additional libraries)
      await sharp(background).toFile(outputPath);
    } else {
      await sharp(background).toFile(outputPath);
    }

    return {
      success: true,
      path: outputPath,
      dimensions: { width, height }
    };
  } catch (error) {
    console.error('Error creating test image:', error);
    throw error;
  }
}

// Create sample test images
async function createTestImages() {
  const testDir = path.join(__dirname, '..', 'test-images');
  
  // Ensure test directory exists
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create different sized test images
  const testImages = [
    { width: 800, height: 600, name: 'large-landscape.png', text: '800x600' },
    { width: 400, height: 600, name: 'portrait.png', text: '400x600' },
    { width: 1200, height: 300, name: 'wide-banner.png', text: '1200x300' },
    { width: 150, height: 150, name: 'small-square.png', text: '150x150' },
    { width: 2000, height: 1500, name: 'huge-image.png', text: '2000x1500' }
  ];

  console.log('Creating test images...');
  
  for (const img of testImages) {
    const outputPath = path.join(testDir, img.name);
    try {
      await createTestImage(img.width, img.height, img.text, outputPath);
      console.log(`✅ Created: ${img.name} (${img.width}x${img.height})`);
    } catch (error) {
      console.error(`❌ Failed to create ${img.name}:`, error.message);
    }
  }
  
  console.log('\n📁 Test images created in:', testDir);
  console.log('\n🧪 You can now use these images to test the upload and resize functionality:');
  console.log('   1. Open http://5whmedia.com/image-upload-test.html');
  console.log('   2. Upload any of the test images');
  console.log('   3. Verify they are resized to exactly 300x200 pixels');
}

// Run if called directly
if (require.main === module) {
  createTestImages().catch(console.error);
}

module.exports = {
  createTestImage,
  createTestImages
};
