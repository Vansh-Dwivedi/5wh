const Podcast = require('../models/Podcast');

// Get all podcasts with pagination and filtering
const getAllPodcasts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { status: 'published' };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { host: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }
    
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    
    const podcasts = await Podcast.find(filter)
      .populate('author', 'firstName lastName username avatar')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Podcast.countDocuments(filter);
    
    res.json({
      podcasts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPodcasts: total
    });
  } catch (error) {
    console.error('Get all podcasts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single podcast by slug
const getPodcastBySlug = async (req, res) => {
  try {
    const podcast = await Podcast.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('author', 'firstName lastName username avatar bio');
    
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    
    // Increment plays
    podcast.plays += 1;
    await podcast.save();
    
    res.json(podcast);
  } catch (error) {
    console.error('Get podcast by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new podcast
const createPodcast = async (req, res) => {
  try {
    console.log('Creating podcast with data:', {
      body: req.body,
      files: req.files,
      user: req.user?.username
    });
    
    const {
      title,
      description,
      duration,
      durationSeconds,
      host,
      guests,
      category,
      tags,
      status,
      featured,
      transcript,
      showNotes,
      seo,
      slug
    } = req.body;
    
    // Validate required fields
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!description?.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    if (!duration?.trim()) {
      return res.status(400).json({ message: 'Duration is required' });
    }
    
    if (!host?.trim()) {
      return res.status(400).json({ message: 'Host is required' });
    }
    
    // Generate slug if not provided
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };
    
    // Convert duration to seconds
    const convertDurationToSeconds = (duration) => {
      if (!duration) return 0;
      const parts = duration.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      } else if (parts.length === 3) {
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      }
      return 0;
    };
    
    let podcastSlug = slug || generateSlug(title);
    
    // Ensure unique slug
    let counter = 1;
    while (await Podcast.findOne({ slug: podcastSlug })) {
      podcastSlug = `${generateSlug(title)}-${counter}`;
      counter++;
    }
    
    const podcastData = {
      title,
      slug: podcastSlug,
      description,
      duration,
      durationSeconds: durationSeconds ? parseInt(durationSeconds) : convertDurationToSeconds(duration),
      host,
      guests: guests ? JSON.parse(guests) : [],
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: req.user._id,
      status: status || 'draft',
      featured: featured === 'true',
      transcript,
      showNotes,
      seo: seo ? JSON.parse(seo) : {}
    };
    
    // Handle file uploads
    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        podcastData.audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
      }
      
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        podcastData.thumbnail = {
          url: `/uploads/thumbnails/${req.files.thumbnail[0].filename}`,
          alt: req.body.thumbnailAlt || ''
        };
      }
    }
    
    // Validate required audio file
    if (!podcastData.audioUrl) {
      return res.status(400).json({ 
        message: 'Audio file is required for podcast creation' 
      });
    }
    
    if (podcastData.status === 'published') {
      podcastData.publishedAt = new Date();
    }
    
    console.log('Final podcast data before save:', podcastData);
    
    const podcast = new Podcast(podcastData);
    await podcast.save();
    
    const populatedPodcast = await Podcast.findById(podcast._id)
      .populate('author', 'firstName lastName username avatar');
    
    res.status(201).json({
      message: 'Podcast created successfully',
      podcast: populatedPodcast
    });
  } catch (error) {
    console.error('Create podcast error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Send specific error messages for common issues
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors,
        details: error.errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate key error - podcast with this slug already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during podcast creation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update podcast
const updatePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    
    if (req.user.role !== 'admin' && podcast.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this podcast' });
    }
    
    const updateData = {};
    const {
      title,
      description,
      duration,
      durationSeconds,
      host,
      guests,
      category,
      tags,
      status,
      featured,
      transcript,
      showNotes,
      seo
    } = req.body;
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (duration) updateData.duration = duration;
    if (durationSeconds) updateData.durationSeconds = parseInt(durationSeconds);
    if (host) updateData.host = host;
    if (guests) updateData.guests = JSON.parse(guests);
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (status) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured === 'true';
    if (transcript) updateData.transcript = transcript;
    if (showNotes) updateData.showNotes = showNotes;
    if (seo) updateData.seo = JSON.parse(seo);
    
    // Handle file uploads
    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        updateData.audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
      }
      
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        updateData.thumbnail = {
          url: `/uploads/thumbnails/${req.files.thumbnail[0].filename}`,
          alt: req.body.thumbnailAlt || ''
        };
      }
    }
    
    if (updateData.status === 'published' && podcast.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    
    const updatedPodcast = await Podcast.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName username avatar');
    
    res.json({
      message: 'Podcast updated successfully',
      podcast: updatedPodcast
    });
  } catch (error) {
    console.error('Update podcast error:', error);
    res.status(500).json({ message: 'Server error during podcast update' });
  }
};

// Delete podcast
const deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    
    if (req.user.role !== 'admin' && podcast.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this podcast' });
    }
    
    await Podcast.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    console.error('Delete podcast error:', error);
    res.status(500).json({ message: 'Server error during podcast deletion' });
  }
};

// Get podcasts for admin
const getAdminPodcasts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.author) {
      filter.author = req.query.author;
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    const podcasts = await Podcast.find(filter)
      .populate('author', 'firstName lastName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Podcast.countDocuments(filter);
    
    res.json({
      podcasts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPodcasts: total
    });
  } catch (error) {
    console.error('Get admin podcasts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllPodcasts,
  getPodcastBySlug,
  createPodcast,
  updatePodcast,
  deletePodcast,
  getAdminPodcasts
};