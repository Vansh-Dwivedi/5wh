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

// Create template structures for empty collections
function createTemplateStructure(collectionName) {
  const sampleDate = new Date().toISOString();
  
  const templates = {
    advertisers: [{
      "_id": "TEMPLATE_SAMPLE_DELETE_AFTER_USE",
      "name": "Sample Advertiser Name",
      "logo": {
        "url": "/uploads/logo-sample.jpg",
        "alt": "Sample Advertiser Logo",
        "filename": "logo-sample.jpg"
      },
      "link": "https://example.com",
      "adType": "sidebar",
      "placement": "right",
      "size": { "width": "300px", "height": "250px" },
      "isActive": true,
      "priority": 1,
      "createdAt": sampleDate,
      "updatedAt": sampleDate,
      "__v": 0
    }],
    
    culturalcontents: [{
      "_id": "TEMPLATE_SAMPLE_DELETE_AFTER_USE",
      "title": "Sample Cultural Article Title",
      "slug": "sample-cultural-article-title",
      "summary": "A brief summary of the cultural content article describing traditions, arts, lifestyle, etc.",
      "content": "Full article content goes here with detailed information about cultural topics, traditions, arts, lifestyle, festivals, heritage, modern-living, cuisine, etc. This field contains the main body of the article.",
      "image": "/uploads/images/cultural-sample.jpg",
      "images": [
        {
          "url": "/uploads/images/cultural-sample-1.jpg",
          "caption": "Sample image caption describing the cultural content",
          "alt": "Sample alt text for accessibility"
        }
      ],
      "category": "culture",
      "tags": ["culture", "lifestyle", "traditions", "arts"],
      "author": "SAMPLE_AUTHOR_ID",
      "status": "published",
      "featured": false,
      "views": 0,
      "likes": 0,
      "shares": 0,
      "publishedAt": sampleDate,
      "createdAt": sampleDate,
      "updatedAt": sampleDate,
      "__v": 0
    }],
    
    opinions: [{
      "_id": "TEMPLATE_SAMPLE_DELETE_AFTER_USE",
      "title": "Sample Opinion Article Title",
      "slug": "sample-opinion-article-title",
      "excerpt": "A compelling excerpt that summarizes the main opinion or argument presented in this editorial piece.",
      "content": "Full opinion article content with detailed analysis, arguments, and editorial commentary on current events, politics, society, economy, media, technology, education or other topics. This is where the main editorial content goes.",
      "author": "Editorial Team",
      "category": "Editorial",
      "tags": ["politics", "analysis", "editorial", "commentary"],
      "featured": false,
      "status": "published",
      "scheduledAt": null,
      "publishedAt": sampleDate,
      "views": 0,
      "likes": 0,
      "shares": 0,
      "comments": [],
      "image": "/uploads/images/opinion-sample.jpg",
      "readTime": 5,
      "createdAt": sampleDate,
      "updatedAt": sampleDate,
      "__v": 0
    }],
    
    podcasts: [{
      "_id": "TEMPLATE_SAMPLE_DELETE_AFTER_USE",
      "title": "Sample Podcast Episode Title",
      "slug": "sample-podcast-episode-title",
      "description": "A detailed description of the podcast episode content, topics discussed, guests featured, and what listeners can expect to learn or enjoy from this episode.",
      "audioUrl": "/uploads/audio/sample-podcast.mp3",
      "thumbnail": {
        "url": "/uploads/thumbnails/podcast-sample.jpg",
        "alt": "Sample Podcast Episode Thumbnail"
      },
      "duration": "01:25:30",
      "durationSeconds": 5130,
      "host": "Sample Host Name",
      "guests": [
        {
          "name": "Sample Guest Name",
          "bio": "Brief biography of the guest speaker or interviewee",
          "avatar": "/uploads/avatars/guest-sample.jpg"
        }
      ],
      "category": "news",
      "tags": ["news", "interview", "analysis", "discussion"],
      "featured": false,
      "status": "published",
      "publishedAt": sampleDate,
      "playCount": 0,
      "likes": 0,
      "downloads": 0,
      "transcript": "Sample transcript text if available for accessibility and SEO",
      "createdAt": sampleDate,
      "updatedAt": sampleDate,
      "__v": 0
    }],
    
    videos: [{
      "_id": "TEMPLATE_SAMPLE_DELETE_AFTER_USE",
      "title": "Sample Video Title",
      "slug": "sample-video-title",
      "description": "A comprehensive description of the video content, explaining what viewers will see and learn from this video. Include key topics, interviews, or breaking news covered.",
      "videoUrl": "/uploads/videos/sample-video.mp4",
      "videoType": "upload",
      "thumbnail": {
        "url": "/uploads/thumbnails/video-sample.jpg",
        "alt": "Sample Video Thumbnail"
      },
      "duration": "00:15:45",
      "durationSeconds": 945,
      "quality": "1080p",
      "category": "news",
      "tags": ["news", "breaking", "video", "live"],
      "featured": false,
      "status": "published",
      "publishedAt": sampleDate,
      "viewCount": 0,
      "likes": 0,
      "shares": 0,
      "comments": [],
      "isLive": false,
      "liveStreamId": null,
      "createdAt": sampleDate,
      "updatedAt": sampleDate,
      "__v": 0
    }],
    
    advertisements: [{
      "_id": "TEMPLATE_SAMPLE_DELETE_AFTER_USE",
      "title": "Sample Advertisement Title",
      "advertiser": "SAMPLE_ADVERTISER_ID",
      "content": "Advertisement content or description",
      "link": "https://example.com",
      "image": "/uploads/ads/sample-ad.jpg",
      "adType": "banner",
      "placement": "sidebar",
      "isActive": true,
      "impressions": 0,
      "clicks": 0,
      "startDate": sampleDate,
      "endDate": null,
      "createdAt": sampleDate,
      "updatedAt": sampleDate,
      "__v": 0
    }],
    
    bookrecommendations: [{
      "_id": "TEMPLATE_SAMPLE_DELETE_AFTER_USE",
      "title": "Sample Book Title",
      "author": "Sample Book Author",
      "isbn": "978-0000000000",
      "description": "A compelling description of the book and why it's being recommended to readers.",
      "coverImage": "/uploads/books/sample-book-cover.jpg",
      "genre": "Fiction",
      "rating": 4.5,
      "reviewText": "A detailed review explaining why this book is recommended and what readers can expect.",
      "recommendedBy": "Editorial Team",
      "purchaseLinks": {
        "amazon": "https://amazon.com/sample-book",
        "goodreads": "https://goodreads.com/sample-book"
      },
      "featured": false,
      "createdAt": sampleDate,
      "updatedAt": sampleDate,
      "__v": 0
    }]
  };
  
  return templates[collectionName] || [];
}

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
        
        let dataToExport;
        if (data.length === 0) {
          dataToExport = createTemplateStructure(collection.name);
          console.log(`📝 ${collection.name}: Created template structure (collection was empty)`);
        } else {
          dataToExport = data;
          console.log(`✅ ${collection.name}: ${data.length} documents exported`);
        }
        
        const filePath = path.join(backupDir, `${collection.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(dataToExport, null, 2));
        
      } catch (error) {
        console.log(`⚠️ Could not export ${collection.name}: ${error.message}`);
        // Create empty array as fallback
        const filePath = path.join(backupDir, `${collection.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    }

    console.log('\n🎉 Database export completed!');
    console.log(`Files saved in: ${path.resolve(backupDir)}`);
    console.log('\n📋 Summary:');
    console.log('- Files with actual data will be imported as-is');
    console.log('- Files with template data (marked TEMPLATE_SAMPLE_DELETE_AFTER_USE) are for reference only');
    console.log('- Remove template entries before importing to production');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run export
exportDatabase();
