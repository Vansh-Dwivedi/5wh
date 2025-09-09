const express = require('express');
const router = express.Router();
const Opinion = require('../models/Opinion');
const { recordAudit } = require('../middleware/audit');
const { auth, adminAuth, editorAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/')
  },
  filename: function (req, file, cb) {
    cb(null, 'opinion-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/opinions - Get all opinions (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured, status = 'published' } = req.query;
    
    const query = { status };
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';
    
    const opinions = await Opinion.find(query)
      .populate('createdBy', 'name email')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Opinion.countDocuments(query);
    
    res.json({
      success: true,
      data: opinions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching opinions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching opinions'
    });
  }
});

// GET /api/opinions/admin - Get all opinions for admin
router.get('/admin', editorAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }
    
    const opinions = await Opinion.find(query)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Opinion.countDocuments(query);
    
    res.json({
      success: true,
      data: opinions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching opinions for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching opinions'
    });
  }
});

// GET /api/opinions/featured - Get featured opinions
router.get('/featured', async (req, res) => {
  try {
    const opinions = await Opinion.getFeatured();
    res.json({
      success: true,
      data: opinions
    });
  } catch (error) {
    console.error('Error fetching featured opinions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured opinions'
    });
  }
});

// POST /api/opinions - Create new opinion (Admin and Editor)
router.post('/', editorAuth, upload.single('featuredImage'), async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      category,
      tags,
      featured,
      status,
      readTime,
      metaTitle,
      metaDescription,
      metaKeywords
    } = req.body;
    
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (error) {
        parsedTags = [];
      }
    }
    
    const opinionData = {
      title,
      excerpt,
      content,
      author: author || 'Editorial Team',
      category,
      tags: parsedTags,
      featured: featured === 'true',
      status: status || 'draft',
      readTime: readTime || '5 min read',
      metaTitle,
      metaDescription,
      metaKeywords: metaKeywords ? metaKeywords.split(',').map(keyword => keyword.trim()) : [],
      createdBy: req.user.id
    };
    
    if (req.file) {
      opinionData.featuredImage = `/uploads/images/${req.file.filename}`;
    }
    
    if (req.body.scheduledAt && opinionData.status === 'scheduled') {
      opinionData.scheduledAt = new Date(req.body.scheduledAt);
    }
    const opinion = new Opinion(opinionData);
    await opinion.save();
    recordAudit({
      req,
      action: opinion.status === 'scheduled' ? 'schedule_opinion' : 'create_opinion',
      entityType: 'Opinion',
      entityId: opinion._id.toString(),
      summary: `${opinion.status === 'scheduled' ? 'Scheduled' : 'Created'} opinion '${opinion.title}'`,
      diff: { after: opinion.toObject() }
    });
    
    const populatedOpinion = await Opinion.findById(opinion._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      data: populatedOpinion,
      message: 'Opinion created successfully'
    });
  } catch (error) {
    console.error('Error creating opinion:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating opinion',
      error: error.message
    });
  }
});

// GET /api/opinions/admin/:id - Get single opinion by ID (any status)
router.get('/admin/:id', editorAuth, async (req, res) => {
  try {
    const opinion = await Opinion.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');
    if (!opinion) {
      return res.status(404).json({ success:false, message:'Opinion not found' });
    }
    res.json({ success:true, data: opinion });
  } catch (error) {
    console.error('Error fetching opinion by id:', error);
    res.status(500).json({ success:false, message:'Error fetching opinion' });
  }
});

// PUT /api/opinions/:id - Update opinion (Admin and Editor)
router.put('/:id', editorAuth, upload.single('featuredImage'), async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      category,
      tags,
      featured,
      status,
      readTime,
      metaTitle,
      metaDescription,
      metaKeywords
    } = req.body;
    
    const opinion = await Opinion.findById(req.params.id);
    if (!opinion) {
      return res.status(404).json({
        success: false,
        message: 'Opinion not found'
      });
    }
    
    let parsedTags = opinion.tags;
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (error) {
        parsedTags = opinion.tags;
      }
    }

    // Update fields
    opinion.title = title || opinion.title;
    opinion.excerpt = excerpt || opinion.excerpt;
    opinion.content = content || opinion.content;
    opinion.author = author || opinion.author;
    opinion.category = category || opinion.category;
    opinion.tags = parsedTags;
    opinion.featured = featured !== undefined ? featured === 'true' : opinion.featured;
    opinion.status = status || opinion.status;
    opinion.readTime = readTime || opinion.readTime;
    opinion.metaTitle = metaTitle || opinion.metaTitle;
    opinion.metaDescription = metaDescription || opinion.metaDescription;
    opinion.metaKeywords = metaKeywords ? metaKeywords.split(',').map(keyword => keyword.trim()) : opinion.metaKeywords;
    opinion.lastModifiedBy = req.user.id;    if (req.file) {
      opinion.featuredImage = `/uploads/images/${req.file.filename}`;
    }
    
    if (req.body.scheduledAt && (opinion.status === 'scheduled' || req.body.status === 'scheduled')) {
      opinion.scheduledAt = new Date(req.body.scheduledAt);
    }
    const before = opinion.toObject();
    await opinion.save();
    recordAudit({
      req,
      action: opinion.status === 'scheduled' ? 'reschedule_opinion' : 'update_opinion',
      entityType: 'Opinion',
      entityId: opinion._id.toString(),
      summary: `Updated opinion '${opinion.title}'`,
      diff: { before, after: opinion.toObject() }
    });
    
    const populatedOpinion = await Opinion.findById(opinion._id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');
    
    res.json({
      success: true,
      data: populatedOpinion,
      message: 'Opinion updated successfully'
    });
  } catch (error) {
    console.error('Error updating opinion:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating opinion',
      error: error.message
    });
  }
});

// DELETE /api/opinions/:id - Delete opinion (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const opinion = await Opinion.findById(req.params.id);
    if (!opinion) {
      return res.status(404).json({
        success: false,
        message: 'Opinion not found'
      });
    }
    
    await Opinion.findByIdAndDelete(req.params.id);
    recordAudit({
      req,
      action: 'delete_opinion',
      entityType: 'Opinion',
      entityId: opinion._id.toString(),
      summary: `Deleted opinion '${opinion.title}'`,
      diff: { before: opinion.toObject() }
    });
    res.json({
      success: true,
      message: 'Opinion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting opinion:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting opinion'
    });
  }
});

// PUT /api/opinions/:id/toggle-featured - Toggle featured status (Admin and Editor)
router.put('/:id/toggle-featured', editorAuth, async (req, res) => {
  try {
    const opinion = await Opinion.findById(req.params.id);
    if (!opinion) {
      return res.status(404).json({
        success: false,
        message: 'Opinion not found'
      });
    }
    
    const before = opinion.toObject();
    opinion.featured = !opinion.featured;
    opinion.lastModifiedBy = req.user.id;
    await opinion.save();
    recordAudit({
      req,
      action: 'toggle_featured_opinion',
      entityType: 'Opinion',
      entityId: opinion._id.toString(),
      summary: `Opinion '${opinion.title}' featured=${opinion.featured}`,
      diff: { before, after: opinion.toObject() }
    });
    
    res.json({
      success: true,
      data: opinion,
      message: `Opinion ${opinion.featured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating opinion'
    });
  }
});

// PUT /api/opinions/:id/status - Update opinion status (Admin and Editor)
router.put('/:id/status', editorAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const opinion = await Opinion.findById(req.params.id);
    if (!opinion) {
      return res.status(404).json({
        success: false,
        message: 'Opinion not found'
      });
    }
    
  const before = opinion.toObject();
  opinion.status = status;
    opinion.lastModifiedBy = req.user.id;
    
    if (status === 'published' && !opinion.publishedAt) {
      opinion.publishedAt = new Date();
    }
    
    await opinion.save();
    recordAudit({
      req,
      action: status === 'scheduled' ? 'schedule_opinion' : 'update_opinion_status',
      entityType: 'Opinion',
      entityId: opinion._id.toString(),
      summary: `Opinion '${opinion.title}' status=${opinion.status}`,
      diff: { before, after: opinion.toObject() }
    });
    
    res.json({
      success: true,
      data: opinion,
      message: `Opinion ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating opinion status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating opinion status'
    });
  }
});

// GET /api/opinions/stats/dashboard - Get opinion statistics for admin dashboard
router.get('/stats/dashboard', adminAuth, async (req, res) => {
  try {
    const total = await Opinion.countDocuments();
    const published = await Opinion.countDocuments({ status: 'published' });
    const draft = await Opinion.countDocuments({ status: 'draft' });
    const featured = await Opinion.countDocuments({ featured: true, status: 'published' });
    
    const recentOpinions = await Opinion.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        stats: {
          total,
          published,
          draft,
          featured
        },
        recent: recentOpinions
      }
    });
  } catch (error) {
    console.error('Error fetching opinion statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// GET /api/opinions/:slug - Get opinion by slug (must be last to avoid conflicts)
router.get('/:slug', async (req, res) => {
  try {
    const opinion = await Opinion.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('createdBy', 'name email');
    
    if (!opinion) {
      return res.status(404).json({
        success: false,
        message: 'Opinion not found'
      });
    }
    
    // Increment views
    await opinion.incrementViews();
    
    res.json({
      success: true,
      data: opinion
    });
  } catch (error) {
    console.error('Error fetching opinion:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching opinion'
    });
  }
});

module.exports = router;
