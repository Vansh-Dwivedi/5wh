const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const News = require('../models/News');
const Podcast = require('../models/Podcast');
const Video = require('../models/Video');
const WebScrapingService = require('../services/webScrapingService');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalNews,
      totalPodcasts,
      totalVideos,
      publishedNews,
      publishedPodcasts,
      publishedVideos,
      recentUsers,
      recentNews
    ] = await Promise.all([
      User.countDocuments(),
      News.countDocuments(),
      Podcast.countDocuments(),
      Video.countDocuments(),
      News.countDocuments({ status: 'published' }),
      Podcast.countDocuments({ status: 'published' }),
      Video.countDocuments({ status: 'published' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      News.find().sort({ createdAt: -1 }).limit(5).populate('author', 'firstName lastName')
    ]);

    res.json({
      stats: {
        totalUsers,
        totalNews,
        totalPodcasts,
        totalVideos,
        publishedNews,
        publishedPodcasts,
        publishedVideos
      },
      recentUsers,
      recentNews
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'editor', 'author'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user active status
// @access  Private (Admin only)
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details
// @access  Private (Admin only)
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, role, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// RSS Feed Management
// GET /api/admin/rss/feeds - Get available RSS feeds
router.get('/rss/feeds', adminAuth, async (req, res) => {
  try {
    res.json({
      feeds: RSS_FEEDS,
      message: 'Available RSS feeds'
    });
  } catch (error) {
    console.error('Get RSS feeds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/rss/fetch - Manually trigger RSS feed fetch
router.post('/news/fetch', adminAuth, async (req, res) => {
  try {
    const result = await WebScrapingService.scrapeAllSources();
    
    if (result && result.saved >= 0) {
      res.json({
        message: 'News fetched successfully',
        totalArticles: result.saved,
        duplicates: result.duplicates
      });
    } else {
      res.status(500).json({
        message: 'Failed to fetch news articles',
        details: 'Web scraping returned no results'
      });
    }
  } catch (error) {
    console.error('Manual RSS fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/rss/articles - Get RSS articles with pagination
router.get('/rss/articles', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const articles = await News.find({ 
      source: { $regex: /RSS Feed|Google News/i } 
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('title slug category status publishedAt source originalUrl featuredImage');

    const total = await News.countDocuments({ 
      source: { $regex: /RSS Feed|Google News/i } 
    });

    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get RSS articles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;