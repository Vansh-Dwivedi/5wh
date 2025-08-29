const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
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
  headline: {
    type: String,
    required: false, // Make optional for RSS feeds
    trim: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 500
  },
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String,
    duration: String
  }],
  category: {
    type: String,
    required: true,
    enum: [
      'breaking', 'politics', 'sports', 'entertainment', 'technology', 
      'health', 'opinion', 'world', 'local', 'business', 'lifestyle', 
      'science', 'general',
      // Punjabi/Sikh specific categories
      'punjabi-news', 'punjabi-canada', 'punjab-india', 'punjab-canada',
      'sikh-community', 'punjabi-culture', 'punjabi-politics', 'punjabi-sports'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional for RSS feeds
  },
  rssAuthor: {
    type: String,
    trim: true // For RSS feed articles
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
  breaking: {
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
  shares: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number, // in minutes
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    focusKeyword: String,
    canonicalUrl: String,
    socialTitle: String,
    socialDescription: String,
    socialImage: String
  },
  // RSS specific fields
  source: {
    type: String,
    trim: true
  },
  originalUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create slug from title
newsSchema.pre('save', function(next) {
  // Always generate slug if title exists and slug is empty
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Calculate read time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  
  next();
});

// Indexes for better performance
newsSchema.index({ slug: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ featured: 1 });
newsSchema.index({ breaking: 1 });
newsSchema.index({ views: -1 });

module.exports = mongoose.model('News', newsSchema);