const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  audioUrl: {
    type: String,
    required: true
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
  host: {
    type: String,
    required: true
  },
  guests: [{
    name: String,
    bio: String,
    avatar: String
  }],
  category: {
    type: String,
    required: true,
    enum: ['news', 'politics', 'interviews', 'analysis', 'opinion', 'history', 'culture', 'other']
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
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date,
    index: true
  },
  publishedAt: {
    type: Date
  },
  featured: {
    type: Boolean,
    default: false
  },
  plays: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  downloads: {
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
  showNotes: {
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
podcastSchema.pre('save', function(next) {
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
podcastSchema.index({ slug: 1 });
podcastSchema.index({ category: 1 });
podcastSchema.index({ status: 1 });
podcastSchema.index({ publishedAt: -1 });
podcastSchema.index({ featured: 1 });
podcastSchema.index({ plays: -1 });

module.exports = mongoose.model('Podcast', podcastSchema);