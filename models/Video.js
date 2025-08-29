const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: false, // Auto-generated from title in pre-save hook
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoType: {
    type: String,
    enum: ['upload', 'youtube', 'vimeo', 'facebook'],
    default: 'upload'
  },
  thumbnail: {
    url: String,
    alt: String
  },
  duration: {
    type: String, // Format: "HH:MM:SS"
    required: true
  },
  durationSeconds: {
    type: Number,
    required: true
  },
  quality: {
    type: String,
    enum: ['720p', '1080p', '4K'],
    default: '1080p'
  },
  category: {
    type: String,
    required: true,
    enum: ['news', 'interviews', 'live', 'documentaries', 'analysis', 'breaking', 'entertainment', 'sports']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  featured: {
    type: Boolean,
    default: false
  },
  live: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  transcript: {
    type: String
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Create slug from title
videoSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Indexes for better performance
videoSchema.index({ slug: 1 });
videoSchema.index({ category: 1 });
videoSchema.index({ status: 1 });
videoSchema.index({ publishedAt: -1 });
videoSchema.index({ featured: 1 });
videoSchema.index({ live: 1 });
videoSchema.index({ views: -1 });

module.exports = mongoose.model('Video', videoSchema);