const mongoose = require('mongoose');

const opinionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    default: 'Editorial Team'
  },
  category: {
    type: String,
    required: true,
    enum: ['Editorial', 'Analysis', 'Commentary', 'Politics', 'Society', 'Culture', 'Economy', 'Media & Technology', 'Education']
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
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
  readTime: {
    type: String,
    default: '5 min read'
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
  featuredImage: {
    type: String
  },
  metaTitle: {
    type: String
  },
  metaDescription: {
    type: String
  },
  metaKeywords: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better search performance
opinionSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
opinionSchema.index({ slug: 1 });
opinionSchema.index({ status: 1, publishedAt: -1 });
opinionSchema.index({ category: 1 });
opinionSchema.index({ featured: 1 });

// Pre-save middleware to generate slug
opinionSchema.pre('validate', async function(next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
    
    let slug = baseSlug;
    let counter = 0;
    
    // Check for existing slugs and make unique
    while (true) {
      const existingOpinion = await this.constructor.findOne({ 
        slug: slug, 
        _id: { $ne: this._id } 
      });
      
      if (!existingOpinion) {
        break;
      }
      
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    
    this.slug = slug;
  }
  next();
});

opinionSchema.pre('save', function(next) {
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Virtual for URL
opinionSchema.virtual('url').get(function() {
  return `/opinion/${this.slug}`;
});

// Virtual for formatted date
opinionSchema.virtual('formattedDate').get(function() {
  return this.publishedAt ? this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;
});

// Method to increment views
opinionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get published opinions
opinionSchema.statics.getPublished = function() {
  return this.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .populate('createdBy', 'name email');
};

// Static method to get featured opinions
opinionSchema.statics.getFeatured = function() {
  return this.find({ status: 'published', featured: true })
    .sort({ publishedAt: -1 })
    .limit(5)
    .populate('createdBy', 'name email');
};

module.exports = mongoose.model('Opinion', opinionSchema);
