const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Resize image to 300x200 pixels
 * @param {string} inputPath - Path to the original image
 * @param {string} outputPath - Path where resized image will be saved
 * @returns {Promise<Object>} - Resized image info
 */
const resizeImage = async (inputPath, outputPath = null) => {
  try {
    // If no output path provided, replace the original
    const finalOutputPath = outputPath || inputPath;
    
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    
    // Resize image to exactly 300x200 pixels
    // Using 'cover' fit to maintain aspect ratio and fill the entire area
    // The image will be cropped if necessary to fit exactly 300x200
    const resizedBuffer = await sharp(inputPath)
      .resize(300, 200, {
        fit: 'cover', // Crop to fit exact dimensions
        position: 'center' // Center the crop
      })
      .jpeg({
        quality: 85, // Good quality compression
        progressive: true
      })
      .toBuffer();

    // Write the resized image
    await sharp(resizedBuffer).toFile(finalOutputPath);
    
    // Get final file stats
    const stats = fs.statSync(finalOutputPath);
    
    return {
      success: true,
      originalSize: {
        width: metadata.width,
        height: metadata.height,
        fileSize: fs.statSync(inputPath).size
      },
      newSize: {
        width: 300,
        height: 200,
        fileSize: stats.size
      },
      compression: {
        originalSize: fs.statSync(inputPath).size,
        compressedSize: stats.size,
        reduction: Math.round(((fs.statSync(inputPath).size - stats.size) / fs.statSync(inputPath).size) * 100)
      }
    };
    
  } catch (error) {
    console.error('Image resize error:', error);
    throw new Error(`Failed to resize image: ${error.message}`);
  }
};

/**
 * Process uploaded image - resize and optimize
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} - Processing result
 */
const processUploadedImage = async (file) => {
  try {
    const inputPath = file.path;
    
    // Create optimized filename
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.filename, path.extname(file.filename));
    const outputFilename = `${baseName}_300x200.jpg`; // Always convert to JPG
    const outputPath = path.join(path.dirname(inputPath), outputFilename);
    
    // Resize the image
    const resizeResult = await resizeImage(inputPath, outputPath);
    
    // Remove original file if we created a new one
    if (inputPath !== outputPath) {
      try {
        fs.unlinkSync(inputPath);
      } catch (unlinkError) {
        console.warn('Could not delete original file:', unlinkError.message);
      }
    }
    
    return {
      success: true,
      originalFile: file,
      processedFile: {
        filename: outputFilename,
        path: outputPath,
        url: `/uploads/images/${outputFilename}`,
        mimetype: 'image/jpeg',
        size: resizeResult.newSize.fileSize
      },
      processingInfo: resizeResult
    };
    
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
};

/**
 * Create thumbnail with text overlay (optional feature)
 * @param {string} imagePath - Path to the image
 * @param {string} title - Text to overlay (optional)
 * @param {string} outputPath - Output path for thumbnail
 */
const createThumbnailWithText = async (imagePath, title = '', outputPath) => {
  try {
    let imageProcessor = sharp(imagePath)
      .resize(300, 200, {
        fit: 'cover',
        position: 'center'
      });

    // Add text overlay if title is provided
    if (title && title.trim()) {
      // Create a semi-transparent overlay for text readability
      const textOverlay = await sharp({
        create: {
          width: 300,
          height: 60,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0.6 }
        }
      })
      .png()
      .toBuffer();

      // Add the overlay and text
      imageProcessor = imageProcessor
        .composite([
          {
            input: textOverlay,
            top: 140, // Position near bottom
            left: 0,
            blend: 'over'
          }
        ]);
    }

    const result = await imageProcessor
      .jpeg({ quality: 85 })
      .toFile(outputPath);
    
    return {
      success: true,
      thumbnailPath: outputPath,
      dimensions: { width: 300, height: 200 },
      hasTextOverlay: !!title
    };
    
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    throw error;
  }
};

module.exports = {
  resizeImage,
  processUploadedImage,
  createThumbnailWithText
};
