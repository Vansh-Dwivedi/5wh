const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const { auth, adminAuth, editorAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Simple disk storage for featured images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
    cb(null, 'blog-' + unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Public: list by tab
router.get('/', async (req,res) => {
  try {
    const { tab = 'lifestyle', page = 1, limit = 12 } = req.query;
    const query = { status: 'published', tab };
    const skip = (parseInt(page)-1)*parseInt(limit);
    const [items, total] = await Promise.all([
      BlogPost.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      BlogPost.countDocuments(query)
    ]);
    res.json({ success:true, data: items, pagination:{ page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total/limit) } });
  } catch(err){
    res.status(500).json({ success:false, message: err.message });
  }
});

// Public: single
router.get('/:slug', async (req,res)=>{
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' });
    if (!post) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data: post });
  } catch(err){
    res.status(500).json({ success:false, message: err.message });
  }
});

// Admin/editor: create
router.post('/', auth, editorAuth, upload.single('featuredImage'), async (req,res)=>{
  try {
    const body = req.body;
    const post = new BlogPost({
      title: body.title,
      tab: body.tab,
      excerpt: body.excerpt,
      content: body.content,
      status: body.status || 'draft',
      scheduledAt: body.scheduledAt || null,
      featured: body.featured === 'true' || body.featured === true,
      tags: body.tags ? JSON.parse(body.tags) : [],
      createdBy: req.user._id,
    });
    if (req.file) post.featuredImage = `/uploads/${req.file.filename}`;
    await post.save();
    res.status(201).json({ success:true, data: post });
  } catch(err){
    res.status(400).json({ success:false, message: err.message });
  }
});

// Admin/editor: update
router.put('/:id', auth, editorAuth, upload.single('featuredImage'), async (req,res)=>{
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success:false, message:'Not found' });
    const body = req.body;
    ['title','tab','excerpt','content','status','scheduledAt','featured'].forEach(f=>{
      if (body[f] !== undefined) post[f] = body[f];
    });
    if (body.tags) post.tags = JSON.parse(body.tags);
    if (req.file) post.featuredImage = `/uploads/${req.file.filename}`;
    post.lastModifiedBy = req.user._id;
    await post.save();
    res.json({ success:true, data: post });
  } catch(err){
    res.status(400).json({ success:false, message: err.message });
  }
});

// Admin/editor: delete
router.delete('/:id', auth, editorAuth, async (req,res)=>{
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, message:'Deleted' });
  } catch(err){
    res.status(500).json({ success:false, message: err.message });
  }
});

// Admin/editor: list all (manage)
router.get('/admin/all', auth, editorAuth, async (req,res)=>{
  try {
    const { tab, status } = req.query;
    const filter = {};
    if (tab) filter.tab = tab;
    if (status) filter.status = status;
    const posts = await BlogPost.find(filter).sort({ createdAt: -1 });
    res.json({ success:true, data: posts });
  } catch(err){
    res.status(500).json({ success:false, message: err.message });
  }
});

module.exports = router;