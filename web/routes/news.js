const express = require('express');
const router = express.Router();
const { auth, editorAuth, adminAuth } = require('../middleware/auth');
const { uploadNews, handleUploadError } = require('../middleware/upload');
const {
  getAllNews,
  getCategories,
  getNewsBySlug,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getAdminNews
} = require('../controllers/newsController');

// @route   GET /api/news
// @desc    Get all published news with pagination and filtering
// @access  Public
router.get('/', getAllNews);

// @route   GET /api/news/categories
// @desc    Get all available categories
// @access  Public
router.get('/categories', getCategories);

// @route   GET /api/news/admin
// @desc    Get all news for admin (all statuses)
// @access  Private (Admin/Editor)
router.get('/admin', editorAuth, getAdminNews);

// @route   GET /api/news/admin/:id
// @desc    Get single news by ID for admin
// @access  Private (Admin/Editor)
router.get('/admin/:id', editorAuth, getNewsById);

// @route   POST /api/news
// @desc    Create new news (JSON)
// @access  Private (Admin/Editor)
router.post('/', editorAuth, createNews);

// @route   POST /api/news/upload
// @desc    Create new news with file uploads
// @access  Private (Admin/Editor)
router.post('/upload', editorAuth, uploadNews, handleUploadError, createNews);

// @route   PUT /api/news/:id
// @desc    Update news
// @access  Private (Admin/Editor/Author)
router.put('/:id', auth, uploadNews, handleUploadError, updateNews);

// @route   DELETE /api/news/:id
// @desc    Delete news
// @access  Private (Admin/Author)
router.delete('/:id', auth, deleteNews);

// @route   GET /api/news/:slug
// @desc    Get single news by slug
// @access  Public
router.get('/:slug', getNewsBySlug);

module.exports = router;