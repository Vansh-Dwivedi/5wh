const mongoose = require('mongoose');

const VALID_TABS = ['lifestyle', 'opinion', 'culture', 'health', 'history'];

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  slug: { type: String, unique: true, index: true },
  tab: { type: String, enum: VALID_TABS, required: true },
  excerpt: { type: String, trim: true, maxlength: 400 },
  content: { type: String, required: true },
  featuredImage: { type: String },
  status: { type: String, enum: ['draft','scheduled','published','archived'], default: 'draft', index: true },
  scheduledAt: { type: Date, index: true },
  publishedAt: { type: Date, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String, trim: true, lowercase: true }],
  featured: { type: Boolean, default: false, index: true },
  views: { type: Number, default: 0 }
},{ timestamps: true });

blogPostSchema.pre('validate', async function(next){
  if (this.title && (!this.slug || this.isModified('title'))){
    let base = this.title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
    let slug = base; let i = 0;
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) { i++; slug = `${base}-${i}`; }
    this.slug = slug;
  }
  next();
});

blogPostSchema.pre('save', function(next){
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt){
    this.publishedAt = new Date();
  }
  next();
});

blogPostSchema.statics.publicFind = function(filter = {}) {
  return this.find({ status: 'published', ...filter }).sort({ publishedAt: -1, createdAt: -1 });
};

module.exports = mongoose.model('BlogPost', blogPostSchema);
module.exports.VALID_TABS = VALID_TABS;