const Video = require('../models/Video');
const { recordAudit } = require('../middleware/audit');

// Get all videos with pagination and filtering
const getAllVideos = async (req, res) => {
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
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }
    
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    
    if (req.query.live === 'true') {
      filter.live = true;
    }
    
    const videos = await Video.find(filter)
      .populate('author', 'firstName lastName username avatar')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Video.countDocuments(filter);
    
    res.json({
      videos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalVideos: total
    });
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single video by slug
const getVideoBySlug = async (req, res) => {
  try {
    const video = await Video.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('author', 'firstName lastName username avatar bio');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Increment views
    video.views += 1;
    await video.save();
    
    res.json(video);
  } catch (error) {
    console.error('Get video by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single video by ID for admin
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('author', 'firstName lastName username avatar bio');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    console.error('Get video by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new video
const createVideo = async (req, res) => {
  try {
    console.log('📹 Video creation request received');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const {
      title,
      description,
      videoUrl,
      videoType,
      duration,
      durationSeconds,
      quality,
      category,
      tags,
      status,
      featured,
      live,
      transcript,
      seo
    } = req.body;

    console.log('Extracted title:', title);
    console.log('Extracted description:', description);
    
    // Parse tags properly - handle both JSON array and comma-separated string
    let parsedTags = [];
    if (tags) {
      try {
        // Try to parse as JSON first (from frontend)
        parsedTags = JSON.parse(tags);
      } catch (e) {
        // If JSON parse fails, treat as comma-separated string
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }

    const videoData = {
      title,
      description,
      videoUrl,
      videoType: videoType || 'upload',
      duration,
      durationSeconds: parseInt(durationSeconds) || 0,
      quality: quality || '1080p',
      category,
      tags: parsedTags,
      author: req.user._id,
      status: status || 'draft',
      featured: featured === 'true',
      live: live === 'true',
      transcript,
      seo: seo ? (typeof seo === 'string' ? JSON.parse(seo) : seo) : {}
    };
    
    // Handle file uploads
    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        videoData.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
        videoData.videoType = 'upload';
      }
      
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        videoData.thumbnail = {
          url: `/uploads/thumbnails/${req.files.thumbnail[0].filename}`,
          alt: req.body.thumbnailAlt || ''
        };
      }
    }

    // Ensure videoUrl is present
    if (!videoData.videoUrl) {
      return res.status(400).json({ message: 'Video URL or video file is required' });
    }

    // Ensure duration is properly formatted
    if (!videoData.duration) {
      videoData.duration = '0:00';
    }

    // Ensure durationSeconds is a valid number
    if (isNaN(videoData.durationSeconds)) {
      videoData.durationSeconds = 0;
    }
    
    if (videoData.status === 'published') {
      videoData.publishedAt = new Date();
    }
    
    if (req.body.scheduledAt && videoData.status === 'scheduled') {
      videoData.scheduledAt = new Date(req.body.scheduledAt);
    }
    const video = new Video(videoData);
    await video.save();
    recordAudit({
      req,
      action: video.status === 'scheduled' ? 'schedule_video' : 'create_video',
      entityType: 'Video',
      entityId: video._id.toString(),
      summary: `${video.status === 'scheduled' ? 'Scheduled' : 'Created'} video '${video.title}'`,
      diff: { after: video.toObject() }
    });
    
    const populatedVideo = await Video.findById(video._id)
      .populate('author', 'firstName lastName username avatar');
    
    res.status(201).json({
      message: 'Video created successfully',
      video: populatedVideo
    });
  } catch (error) {
    console.error('Create video error:', error);
    console.error('Request body:', req.body);
    console.error('Request files:', req.files);
    res.status(500).json({ message: 'Server error during video creation', error: error.message });
  }
};

// Update video
const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check authorization - admin and editor can update all content
    if (req.user.role !== 'admin' && req.user.role !== 'editor' && video.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }
    
    const updateData = {};
    const {
      title,
      description,
      videoUrl,
      videoType,
      duration,
      durationSeconds,
      quality,
      category,
      tags,
      status,
      featured,
      live,
      transcript,
      seo
    } = req.body;
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (videoUrl) updateData.videoUrl = videoUrl;
    if (videoType) updateData.videoType = videoType;
    if (duration) updateData.duration = duration;
    if (durationSeconds) updateData.durationSeconds = parseInt(durationSeconds);
    if (quality) updateData.quality = quality;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (status) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured === 'true';
    if (live !== undefined) updateData.live = live === 'true';
    if (transcript) updateData.transcript = transcript;
    if (seo) updateData.seo = JSON.parse(seo);
    
    // Handle file uploads
    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        updateData.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
        updateData.videoType = 'upload';
      }
      
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        updateData.thumbnail = {
          url: `/uploads/thumbnails/${req.files.thumbnail[0].filename}`,
          alt: req.body.thumbnailAlt || ''
        };
      }
    }
    
    if (updateData.status === 'published' && video.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    
    if (req.body.scheduledAt && (updateData.status === 'scheduled' || video.status === 'scheduled')) {
      updateData.scheduledAt = new Date(req.body.scheduledAt);
    }
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName username avatar');

    recordAudit({
      req,
      action: updateData.status === 'scheduled' ? 'reschedule_video' : 'update_video',
      entityType: 'Video',
      entityId: updatedVideo._id.toString(),
      summary: `Updated video '${updatedVideo.title}'`,
      diff: { before: video.toObject(), after: updatedVideo.toObject() }
    });
    
    res.json({
      message: 'Video updated successfully',
      video: updatedVideo
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Server error during video update' });
  }
};

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check authorization - admin and editor can delete all content
    if (req.user.role !== 'admin' && req.user.role !== 'editor' && video.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }
    
    await Video.findByIdAndDelete(req.params.id);
    recordAudit({
      req,
      action: 'delete_video',
      entityType: 'Video',
      entityId: video._id.toString(),
      summary: `Deleted video '${video.title}'`,
      diff: { before: video.toObject() }
    });
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error during video deletion' });
  }
};

// Get videos for admin
const getAdminVideos = async (req, res) => {
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
    
    const videos = await Video.find(filter)
      .populate('author', 'firstName lastName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Video.countDocuments(filter);
    
    res.json({
      videos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalVideos: total
    });
  } catch (error) {
    console.error('Get admin videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllVideos,
  getVideoBySlug,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getAdminVideos
};