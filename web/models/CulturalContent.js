const mongoose = require('mongoose');

const culturalContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    url: String,
    caption: String,
    alt: String
  }],
  category: {
    type: String,
    enum: ['lifestyle', 'culture', 'traditions', 'arts', 'cuisine', 'festivals', 'heritage', 'modern-living'],
    default: 'culture'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
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
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  },
  scheduledFor: {
    type: Date
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: 60
    },
    metaDescription: {
      type: String,
      maxlength: 160
    },
    keywords: [{
      type: String,
      trim: true
    }],
    canonicalUrl: String
  },
  socialMedia: {
    facebook: {
      title: String,
      description: String,
      image: String
    },
    twitter: {
      title: String,
      description: String,
      image: String
    }
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  relatedContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CulturalContent'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
culturalContentSchema.index({ slug: 1 });
culturalContentSchema.index({ status: 1, publishedAt: -1 });
culturalContentSchema.index({ category: 1, status: 1 });
culturalContentSchema.index({ tags: 1 });
culturalContentSchema.index({ featured: 1, status: 1 });
culturalContentSchema.index({ author: 1 });

// Virtual for URL
culturalContentSchema.virtual('url').get(function() {
  return `/life-culture/${this.slug}`;
});

// Method to calculate reading time
culturalContentSchema.methods.calculateReadingTime = function() {
  const wordsPerMinute = 200;
  const words = this.content.split(' ').length;
  this.readingTime = Math.ceil(words / wordsPerMinute);
  return this.readingTime;
};

// Pre-save middleware
culturalContentSchema.pre('save', function(next) {
  // Calculate reading time
  this.calculateReadingTime();
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Generate slug from title if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  next();
});

// Static methods
culturalContentSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published',
    $or: [
      { publishedAt: { $lte: new Date() } },
      { publishedAt: { $exists: false } }
    ]
  }).sort({ publishedAt: -1, createdAt: -1 });
};

culturalContentSchema.statics.findByCategory = function(category) {
  return this.findPublished().where({ category });
};

culturalContentSchema.statics.findFeatured = function() {
  return this.findPublished().where({ featured: true }).limit(5);
};

module.exports = mongoose.model('CulturalContent', culturalContentSchema);