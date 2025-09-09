const mongoose = require('mongoose');
const News = require('../models/News');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/5wh-news');
    console.log('✅ MongoDB connected for cleanup');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to clean content from channel names and sources
const cleanContentFromChannelNames = (content) => {
  if (!content) return content;
  
  return content
    // Remove specific channel names and sources
    .replace(/SGPC/gi, '')
    .replace(/PTC News/gi, '')
    .replace(/PTC/gi, '')
    .replace(/Google News/gi, '')
    .replace(/jagbani\.com?/gi, '')
    .replace(/punjabijagran\.com?/gi, '')
    .replace(/punjabiJagran\.com?/gi, '')
    .replace(/ABP Sanjha?/gi, '')
    .replace(/abpsanjha\.com?/gi, '')
    .replace(/jagbani/gi, '')
    .replace(/ABP Punjabi/gi, '')
    .replace(/punjabi jagran/gi, '')
    // Remove source patterns from titles and content
    .replace(/[-–—]\s*(Google News|Jagbani|BBC News|CNN|Reuters|AP News|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune|SGPC|PTC News|PTC|ABP Sanjha|abpsanjha|punjabijagran|punjabiJagran)\s*$/gi, '')
    .replace(/\s+(Google News|Jagbani|BBC News|CNN|Reuters|AP News|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune|SGPC|PTC News|PTC|ABP Sanjha|abpsanjha|punjabijagran|punjabiJagran)\s*$/gi, '')
    .replace(/\b(Google News|Jagbani|BBC News|CNN|Reuters|AP News|ABP Punjabi|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune|SGPC|PTC News|PTC|ABP Sanjha|abpsanjha|punjabijagran|punjabiJagran)\s*$/gi, '')
    // Remove common source phrases
    .replace(/\(source:.*?\)/gi, '')
    .replace(/source:.*?(?=\.|$)/gi, '')
    .replace(/©.*?(?=\.|$)/gi, '')
    .replace(/copyright.*?(?=\.|$)/gi, '')
    .replace(/all rights reserved.*?(?=\.|$)/gi, '')
    // Remove URLs that might be watermarks
    .replace(/https?:\/\/\S+/g, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .trim();
};

// Main cleanup function
const cleanupExistingNews = async () => {
  try {
    console.log('🧹 Starting cleanup of existing news articles...');
    
    // Find all news articles
    const articles = await News.find({});
    console.log(`📰 Found ${articles.length} articles to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const article of articles) {
      let needsUpdate = false;
      const updates = {};
      
      // Clean title
      const cleanedTitle = cleanContentFromChannelNames(article.title);
      if (cleanedTitle !== article.title && cleanedTitle.length >= 10) {
        updates.title = cleanedTitle;
        needsUpdate = true;
      }
      
      // Clean content
      const cleanedContent = cleanContentFromChannelNames(article.content);
      if (cleanedContent !== article.content) {
        updates.content = cleanedContent;
        needsUpdate = true;
      }
      
      // Clean excerpt if it exists
      if (article.excerpt) {
        const cleanedExcerpt = cleanContentFromChannelNames(article.excerpt);
        if (cleanedExcerpt !== article.excerpt) {
          updates.excerpt = cleanedExcerpt;
          needsUpdate = true;
        }
      }
      
      // Update the article if changes were made
      if (needsUpdate) {
        try {
          await News.findByIdAndUpdate(article._id, updates);
          updatedCount++;
          console.log(`✅ Updated: ${article.title.substring(0, 50)}...`);
        } catch (error) {
          console.error(`❌ Error updating article ${article._id}:`, error.message);
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`✅ Articles updated: ${updatedCount}`);
    console.log(`⏭️ Articles skipped (no changes needed): ${skippedCount}`);
    console.log(`📰 Total articles processed: ${articles.length}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await cleanupExistingNews();
  
  console.log('🏁 Cleanup completed. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', async (error) => {
  console.error('❌ Unhandled rejection:', error);
  await mongoose.connection.close();
  process.exit(1);
});

// Run the cleanup
main();
