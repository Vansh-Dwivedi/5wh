const express = require('express');
const router = express.Router();
const { auth, editorAuth } = require('../middleware/auth');
const { uploadPodcast, handleUploadError } = require('../middleware/upload');
const {
  getAllPodcasts,
  getPodcastBySlug,
  createPodcast,
  updatePodcast,
  deletePodcast,
  getAdminPodcasts,
  getPodcastById
} = require('../controllers/podcastController');

// @route   GET /api/podcasts
// @desc    Get all published podcasts
// @access  Public
router.get('/', getAllPodcasts);

// @route   GET /api/podcasts/admin
// @desc    Get all podcasts for admin
// @access  Private (Admin/Editor)
router.get('/admin', editorAuth, getAdminPodcasts);

// @route   POST /api/podcasts
// @desc    Create new podcast
// @access  Private (Admin/Editor)
router.post('/', editorAuth, uploadPodcast, handleUploadError, createPodcast);

// @route   GET /api/podcasts/admin/:id
// @desc    Get single podcast (any status) for admin/editor
// @access  Private (Admin/Editor)
router.get('/admin/:id', editorAuth, getPodcastById);

// @route   PUT /api/podcasts/:id
// @desc    Update podcast
// @access  Private (Admin/Editor/Author)
router.put('/:id', auth, uploadPodcast, handleUploadError, updatePodcast);

// @route   DELETE /api/podcasts/:id
// @desc    Delete podcast
// @access  Private (Admin/Author)
router.delete('/:id', auth, deletePodcast);

// @route   GET /api/podcasts/:slug
// @desc    Get single podcast by slug
// @access  Public
router.get('/:slug', getPodcastBySlug);

module.exports = router;