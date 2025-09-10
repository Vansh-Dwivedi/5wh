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
const CulturalContent = require('./models/CulturalContent');

async function importDatabase() {
  try {
    // Connect to MongoDB (will use the URI from your environment)
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/5wh-news';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    const backupDir = './database-backup';
    
    if (!fs.existsSync(backupDir)) {
      console.error('❌ Backup directory not found!');
      return;
    }

    // Import collections
    const collections = [
      { model: News, file: 'news.json', name: 'news' },
      { model: Opinion, file: 'opinions.json', name: 'opinions' },
      { model: Video, file: 'videos.json', name: 'videos' },
      { model: Podcast, file: 'podcasts.json', name: 'podcasts' },
      { model: User, file: 'users.json', name: 'users' },
      { model: Advertiser, file: 'advertisers.json', name: 'advertisers' },
      { model: CulturalContent, file: 'culturalcontents.json', name: 'culturalcontents' }
    ];

    for (const collection of collections) {
      try {
        const filePath = path.join(backupDir, collection.file);
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️ File not found: ${collection.file}`);
          continue;
        }

        console.log(`Importing ${collection.name}...`);
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (data.length === 0) {
          console.log(`📝 No data to import for ${collection.name}`);
          continue;
        }

        // Clear existing data (optional - remove if you want to merge)
        // await collection.model.deleteMany({});
        
        // Import data
        const result = await collection.model.insertMany(data, { 
          ordered: false, // Continue on duplicate key errors
          rawResult: true 
        });
        
        console.log(`✅ Imported ${result.insertedCount || data.length} documents to ${collection.name}`);
        
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Some duplicate entries skipped for ${collection.name}`);
        } else {
          console.log(`❌ Error importing ${collection.name}: ${error.message}`);
        }
      }
    }

    console.log('🎉 Database import completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Run import
importDatabase();
