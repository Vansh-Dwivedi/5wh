const mongoose = require('mongoose');

const radioConfigSchema = new mongoose.Schema({
  streamUrl: {
    type: String,
    required: true,
    default: 'https://5whmedia.com/radio/stream'
  },
  title: {
    type: String,
    required: true,
    default: '5WH Radio'
  },
  currentShow: {
    type: String,
    default: 'Live Programming'
  },
  currentArtist: {
    type: String,
    default: '5WH Media'
  },
  isLive: {
    type: Boolean,
    default: true
  },
  listenersCount: {
    type: Number,
    default: 0
  },
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String, // Format: "HH:MM"
    endTime: String,   // Format: "HH:MM"
    showName: String,
    host: String
  }]
}, {
  timestamps: true
});

// Ensure only one radio config document exists
radioConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('RadioConfig', radioConfigSchema);
