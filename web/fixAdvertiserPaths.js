const mongoose = require('mongoose');
const Advertiser = require('./models/Advertiser');

async function fixPaths() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/5whAdmin');
    console.log('Connected to MongoDB');
    
    // Find all advertisers with incorrect paths
    const advertisers = await Advertiser.find({ 
      'logo.url': { $regex: '/uploads/images/' } 
    });
    
    console.log('Found', advertisers.length, 'advertisers with incorrect paths');
    
    for (let ad of advertisers) {
      if (ad.logo && ad.logo.url) {
        const oldUrl = ad.logo.url;
        ad.logo.url = ad.logo.url.replace('/uploads/images/', '/uploads/');
        await ad.save();
        console.log('Updated:', oldUrl, '->', ad.logo.url);
      }
    }
    
    console.log('All paths fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPaths();
