const express = require('express');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const { processUploadedImage } = require('../utils/imageProcessor');

const router = express.Router();

// Single file upload
router.post('/single', auth, uploadSingle('file'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      file: {
        url: fileUrl,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Multiple files upload
router.post('/multiple', auth, uploadMultiple('files', 10), handleUploadError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      filename: file.filename
    }));
    
    res.json({
      message: 'Files uploaded successfully',
      files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Image upload with automatic resizing to 300x200
router.post('/image', auth, uploadSingle('image'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Check if file is an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }

    // Process and resize the image to 300x200
    const processingResult = await processUploadedImage(req.file);
    
    if (!processingResult.success) {
      return res.status(500).json({ error: 'Failed to process image' });
    }

    res.json({
      message: 'Image uploaded and resized successfully',
      image: {
        url: processingResult.processedFile.url,
        name: req.file.originalname,
        size: processingResult.processedFile.size,
        type: processingResult.processedFile.mimetype,
        filename: processingResult.processedFile.filename,
        dimensions: {
          width: 300,
          height: 200
        },
        processing: {
          originalSize: processingResult.processingInfo.originalSize,
          newSize: processingResult.processingInfo.newSize,
          compression: processingResult.processingInfo.compression
        }
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload and process image' });
  }
});

// Video upload with specific handling
router.post('/video', auth, uploadSingle('video'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video uploaded' });
    }

    // Check if file is a video
    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({ error: 'File must be a video' });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
    res.json({
      message: 'Video uploaded successfully',
      video: {
        url: videoUrl,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

module.exports = router;
