const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getStats } = require('../controllers/newsletterController');
const { adminAuth } = require('../middleware/auth');

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', subscribe);

// @route   POST /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post('/unsubscribe', unsubscribe);

// @route   GET /api/newsletter/stats
// @desc    Get newsletter statistics
// @access  Private (Admin only)
router.get('/stats', adminAuth, getStats);

module.exports = router;
