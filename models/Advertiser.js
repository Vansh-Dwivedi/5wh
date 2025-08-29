const mongoose = require('mongoose');

const advertiserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    url: String,
    alt: String,
    filename: String
  },
  link: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // If link is provided, it should be a valid URL
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Link must be a valid URL starting with http:// or https://'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Contact email must be valid'
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  clickCount: {
    type: Number,
    default: 0
  },
  impressionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
advertiserSchema.index({ isActive: 1, displayOrder: 1 });
advertiserSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if advertiser is currently active
advertiserSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  const isWithinDateRange = (!this.startDate || this.startDate <= now) && 
                           (!this.endDate || this.endDate >= now);
  return this.isActive && isWithinDateRange;
});

// Method to increment click count
advertiserSchema.methods.incrementClick = function() {
  this.clickCount += 1;
  return this.save();
};

// Method to increment impression count
advertiserSchema.methods.incrementImpression = function() {
  this.impressionCount += 1;
  return this.save();
};

// Static method to get active advertisers
advertiserSchema.statics.getActiveAdvertisers = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: { $lte: now } }
    ],
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: now } }
    ]
  }).sort({ displayOrder: 1, name: 1 });
};

module.exports = mongoose.model('Advertiser', advertiserSchema);
