const mongoose = require('mongoose');
const { fetchAllRSSFeeds } = require('../services/rssService');
require('dotenv').config();

const testRSSFetch = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/5wh-news');
    console.log('Connected to MongoDB');

    console.log('Starting RSS feed fetch...');
    const result = await fetchAllRSSFeeds();
    
    if (result.success) {
      console.log(`✅ Successfully fetched ${result.totalArticles} new articles`);
    } else {
      console.log(`❌ Failed to fetch RSS feeds: ${result.error}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testRSSFetch();
