const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import your models
const News = require('./models/News');
const Opinion = require('./models/Opinion');
const Video = require('./models/Video');
const Podcast = require('./models/Podcast');
const User = require('./models/User');
const Advertiser = require('./models/Advertiser');
const Advertisement = require('./models/Advertisement');
const BookRecommendation = require('./models/BookRecommendation');
const CulturalContent = require('./models/CulturalContent');

async function exportDatabase() {
  try {
    // Connect to local MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/5wh-news');
    console.log('Connected to local MongoDB');

    // Create backup directory
    const backupDir = './database-backup';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Export collections
    const collections = [
      { model: News, name: 'news' },
      { model: Opinion, name: 'opinions' },
      { model: Video, name: 'videos' },
      { model: Podcast, name: 'podcasts' },
      { model: User, name: 'users' },
      { model: Advertiser, name: 'advertisers' },
      { model: Advertisement, name: 'advertisements' },
      { model: BookRecommendation, name: 'bookrecommendations' },
      { model: CulturalContent, name: 'culturalcontents' }
    ];

    for (const collection of collections) {
      try {
        console.log(`Exporting ${collection.name}...`);
        const data = await collection.model.find({}).lean();
        
        const filePath = path.join(backupDir, `${collection.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        console.log(`✅ Exported ${data.length} documents from ${collection.name}`);
      } catch (error) {
        console.log(`⚠️ Could not export ${collection.name}: ${error.message}`);
      }
    }

    console.log('🎉 Database export completed!');
    console.log(`Files saved in: ${path.resolve(backupDir)}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run export
exportDatabase();
