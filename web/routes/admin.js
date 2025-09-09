const express = require('express');
const router = express.Router();
const { adminAuth, editorAuth } = require('../middleware/auth');
const { recordAudit } = require('../middleware/audit');
const User = require('../models/User');
const News = require('../models/News');
const Podcast = require('../models/Podcast');
const Video = require('../models/Video');
const Opinion = require('../models/Opinion');
const WebScrapingService = require('../services/webScrapingService');
const AuditLog = require('../models/AuditLog');

// RSS Feed URLs for admin management
const RSS_FEEDS = [
  {
    name: 'Google News - Punjabi (India)',
    url: 'https://news.google.com/rss?hl=pa&gl=IN&ceid=IN:pa',
    category: 'punjabi-news'
  },
  {
    name: 'Google News - Punjabi (Canada)',
    url: 'https://news.google.com/rss?hl=pa&gl=CA&ceid=CA:pa',
    category: 'punjabi-canada'
  },
  {
    name: 'Google News - Punjab India',
    url: 'https://news.google.com/rss/search?q=Punjab+India+Punjabi&hl=pa&gl=IN&ceid=IN:pa',
    category: 'punjab-india'
  },
  {
    name: 'Google News - Sikh Community',
    url: 'https://news.google.com/rss/search?q=Sikh+Gurdwara+Punjab&hl=en&gl=IN&ceid=IN:en',
    category: 'sikh-community'
  }
];

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin and Editor)
router.get('/dashboard', editorAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalNews,
      totalPodcasts,
      totalVideos,
      totalOpinions,
      publishedNews,
      publishedPodcasts,
      publishedVideos,
      publishedOpinions,
  scheduledNews,
  scheduledPodcasts,
  scheduledVideos,
  scheduledOpinions,
      recentUsers,
      recentNews
    ] = await Promise.all([
      User.countDocuments(),
      News.countDocuments(),
      Podcast.countDocuments(),
      Video.countDocuments(),
      Opinion.countDocuments(),
      News.countDocuments({ status: 'published' }),
      Podcast.countDocuments({ status: 'published' }),
      Video.countDocuments({ status: 'published' }),
      Opinion.countDocuments({ status: 'published' }),
  News.countDocuments({ status: 'scheduled' }),
  Podcast.countDocuments({ status: 'scheduled' }),
  Video.countDocuments({ status: 'scheduled' }),
  Opinion.countDocuments({ status: 'scheduled' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      News.find().sort({ createdAt: -1 }).limit(5).populate('author', 'firstName lastName')
    ]);

    res.json({
      stats: {
        totalUsers,
        totalNews,
        totalPodcasts,
        totalVideos,
        totalOpinions,
        publishedNews,
        publishedPodcasts,
        publishedVideos,
  publishedOpinions,
  scheduledNews,
  scheduledPodcasts,
  scheduledVideos,
  scheduledOpinions
      },
      recentUsers,
      recentNews
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/admin/scheduled-upcoming
// @desc  Get next scheduled items across content types (limit per type)
// @access Private (Admin/Editor)
router.get('/scheduled-upcoming', editorAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    const now = new Date();
    const [news, podcasts, videos, opinions] = await Promise.all([
      News.find({ status: 'scheduled', scheduledAt: { $gte: now } })
        .select('_id title scheduledAt status')
        .sort({ scheduledAt: 1 })
        .limit(limit),
      Podcast.find({ status: 'scheduled', scheduledAt: { $gte: now } })
        .select('_id title scheduledAt status')
        .sort({ scheduledAt: 1 })
        .limit(limit),
      Video.find({ status: 'scheduled', scheduledAt: { $gte: now } })
        .select('_id title scheduledAt status')
        .sort({ scheduledAt: 1 })
        .limit(limit),
      Opinion.find({ status: 'scheduled', scheduledAt: { $gte: now } })
        .select('_id title scheduledAt status')
        .sort({ scheduledAt: 1 })
        .limit(limit)
    ]);
    res.json({ news, podcasts, videos, opinions });
  } catch (e) {
    console.error('Scheduled upcoming error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/admin/audit-logs
// @desc  List audit logs (paginated)
// @access Private (Admin + Editor read)
router.get('/audit-logs', editorAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.actor) filter.actorEmail = req.query.actor;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.entityType) filter.entityType = req.query.entityType;
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await AuditLog.countDocuments(filter);
    res.json({
      logs,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (e) {
    console.error('Audit logs error:', e);
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

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, role, isActive } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, email, and password are required' 
      });
    }

    if (!['admin', 'editor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username: username || email }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      username: username || `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      email,
      password,
      role: role || 'editor',
      isActive: isActive !== undefined ? isActive : true
    });

    await user.save();
    // Audit
    recordAudit({
      req,
      action: 'create_user',
      entityType: 'User',
      entityId: user._id.toString(),
      summary: `Created user ${user.email} with role ${user.role}`
    });

    // Remove password from response
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `User with this ${field} already exists` 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'editor'].includes(role)) {
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
    if (user) {
      recordAudit({
        req,
        action: 'update_user_role',
        entityType: 'User',
        entityId: user._id.toString(),
        summary: `Changed role to ${user.role}`
      });
    }
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
    if (user) {
      recordAudit({
        req,
        action: 'update_user_status',
        entityType: 'User',
        entityId: user._id.toString(),
        summary: `Set isActive=${user.isActive}`
      });
    }
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
    if (user) {
      recordAudit({
        req,
        action: 'update_user',
        entityType: 'User',
        entityId: user._id.toString(),
        summary: `Updated user ${user.email}`
      });
    }
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
router.get('/rss/feeds', editorAuth, async (req, res) => {
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
router.post('/news/fetch', editorAuth, async (req, res) => {
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
router.get('/rss/articles', editorAuth, async (req, res) => {
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