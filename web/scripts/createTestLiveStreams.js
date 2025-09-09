const mongoose = require('mongoose');
const Video = require('../models/Video');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/5wh-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createTestLiveStreams() {
  try {
    // Find an admin user or create a dummy one
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      });
    }

    // Create test live streams
    const testStreams = [
      {
        title: '🔴 LIVE: Breaking News Coverage',
        description: 'Live coverage of breaking news events with real-time updates and analysis.',
        videoUrl: 'https://www.youtube.com/watch?v=Y_OIU_05eAk',
        videoType: 'youtube',
        thumbnail: {
          url: 'https://img.youtube.com/vi/Y_OIU_05eAk/maxresdefault.jpg',
          alt: 'Breaking News Live Stream'
        },
        duration: 'LIVE',
        durationSeconds: 0,
        category: 'live',
        tags: ['breaking', 'news', 'live'],
        author: adminUser._id,
        status: 'published',
        publishedAt: new Date(),
        live: true,
        views: Math.floor(Math.random() * 1000) + 100
      },
      {
        title: '🔴 LIVE: Punjab Assembly Session',
        description: 'Live coverage of the Punjab Assembly session with expert commentary.',
        videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        videoType: 'youtube',
        thumbnail: {
          url: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
          alt: 'Punjab Assembly Live'
        },
        duration: 'LIVE',
        durationSeconds: 0,
        category: 'live',
        tags: ['assembly', 'punjab', 'live', 'politics'],
        author: adminUser._id,
        status: 'published',
        publishedAt: new Date(),
        live: true,
        views: Math.floor(Math.random() * 1000) + 100
      },
      {
        title: '🔴 LIVE: Weekly Discussion Show',
        description: 'Join our panel for weekly discussion on current affairs and trending topics.',
        videoUrl: 'https://www.youtube.com/watch?v=PDazSUCBhvs',
        videoType: 'youtube',
        thumbnail: {
          url: 'https://img.youtube.com/vi/PDazSUCBhvs/maxresdefault.jpg',
          alt: 'Weekly Discussion Live'
        },
        duration: 'LIVE',
        durationSeconds: 0,
        category: 'live',
        tags: ['discussion', 'current affairs', 'live'],
        author: adminUser._id,
        status: 'published',
        publishedAt: new Date(),
        live: true,
        views: Math.floor(Math.random() * 1000) + 100
      }
    ];

    // Insert test streams
    const createdStreams = await Video.insertMany(testStreams);
    console.log(`✅ Created ${createdStreams.length} test live streams:`);
    createdStreams.forEach(stream => {
      console.log(`   - ${stream.title}`);
    });

    console.log('\n🎯 Test the API at: http://192.168.29.147:5000/app/fetch/liveStreams');
    console.log('📱 Your mobile app should now show these live streams!');

  } catch (error) {
    console.error('❌ Error creating test live streams:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestLiveStreams();
