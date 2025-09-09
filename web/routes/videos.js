const express = require('express');
const router = express.Router();
const { auth, editorAuth } = require('../middleware/auth');
const { uploadVideo, handleUploadError } = require('../middleware/upload');
const {
  getAllVideos,
  getVideoBySlug,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getAdminVideos
} = require('../controllers/videoController');

// @route   GET /api/videos
// @desc    Get all published videos
// @access  Public
router.get('/', getAllVideos);

// @route   GET /api/videos/admin
// @desc    Get all videos for admin
// @access  Private (Admin/Editor)
router.get('/admin', editorAuth, getAdminVideos);

// @route   GET /api/videos/admin/:id
// @desc    Get single video by ID for admin
// @access  Private (Admin/Editor)
router.get('/admin/:id', editorAuth, getVideoById);

// @route   POST /api/videos
// @desc    Create new video
// @access  Private (Admin/Editor)
router.post('/', editorAuth, uploadVideo, handleUploadError, createVideo);

// @route   PUT /api/videos/:id
// @desc    Update video
// @access  Private (Admin/Editor/Author)
router.put('/:id', auth, uploadVideo, handleUploadError, updateVideo);

// @route   DELETE /api/videos/:id
// @desc    Delete video
// @access  Private (Admin/Author)
router.delete('/:id', auth, deleteVideo);

// @route   GET /api/videos/:slug
// @desc    Get single video by slug
// @access  Public
router.get('/:slug', getVideoBySlug);

module.exports = router;