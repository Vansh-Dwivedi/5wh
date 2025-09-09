const Parser = require('rss-parser');

// Utility to filter out RSS feed source names
// To add more sources to filter, simply add them to the rssSourcesFilter array below
const filterSourceName = (source) => {
  if (!source) return '';
  
  // List of RSS feed sources to filter out
  // Add any new RSS feed provider names here that you want to hide from the UI
  const rssSourcesFilter = [
    'Google News',
    'Jagbani',
    'BBC News',
    'CNN',
    'Reuters',
    'AP News',
    'ABP Punjabi',
    'Times of India',
    'Hindustan Times',
    'Indian Express',
    'NDTV',
    'Zee News',
    'Aaj Tak',
    'ABP News',
    'News18',
    'India Today',
    'The Hindu',
    'Economic Times',
    'Business Standard',
    'Mint',
    'Dainik Bhaskar',
    'Dainik Jagran',
    'Navbharat Times',
    'SGPC',
    'PTC News',
    'PTC',
    'ABP Sanjha',
    'abpsanjha',
    'punjabijagran',
    'punjabiJagran',
    'Punjab Kesari',
    'Ajit',
    'Rozana Spokesman',
    'Dainik Tribune'
  ];
  
  // Check if the source should be filtered
  const shouldFilter = rssSourcesFilter.some(filterSource => 
    source.toLowerCase().includes(filterSource.toLowerCase()) ||
    filterSource.toLowerCase().includes(source.toLowerCase())
  );
  
  // Return empty string if should be filtered, otherwise return original source
  return shouldFilter ? '' : source;
};
const axios = require('axios');
const cheerio = require('cheerio');
const News = require('../models/News');
const cron = require('node-cron');
const webScrapingService = require('./webScrapingService');
const { scrapeFullArticleContent } = require('./webScrapingService');

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure']
  }
});

// Global scheduler control
let schedulerState = {
  isAutoSyncEnabled: true,
  scheduledTasks: []
};

// RSS Feed URLs - Only Google News RSS (Fair Use)
const RSS_FEEDS = [
  {
    name: 'Google News - Punjabi (India)',
    url: 'https://news.google.com/rss?hl=pa&gl=IN&ceid=IN:pa',
    category: 'punjabi-news'
  },
  {
    name: 'Google News - Punjabi (Canada)',
    url: 'https://news.google.com/rss?hl=pa&gl=CA&ceid=CA:pa',
    category: 'punjabi-canada'
  },
  {
    name: 'Google News - Punjab India',
    url: 'https://news.google.com/rss/search?q=Punjab+India+Punjabi&hl=pa&gl=IN&ceid=IN:pa',
    category: 'punjab-india'
  },
  {
    name: 'Google News - Sikh Community',
    url: 'https://news.google.com/rss/search?q=Sikh+Gurdwara+Punjab&hl=en&gl=IN&ceid=IN:en',
    category: 'sikh-community'
  }
];

// Function to get placeholder image for articles (returns null to trigger red gradient placeholder)
function getGoogleNewsLogo() {
  return null; // This will trigger the red gradient placeholder in the frontend
}

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Map RSS category to valid news category
function mapToValidCategory(rssCategory) {
  const categoryMap = {
    'punjabi-news': 'general',
    'punjabi-canada': 'world',
    'punjab-india': 'local',
    'sikh-community': 'general',
    'punjabi-culture': 'lifestyle',
    'punjabi-politics': 'politics',
    'punjabi-sports': 'sports'
  };
  return categoryMap[rssCategory] || 'general';
}

// Fetch RSS feed
async function fetchRSSFeed(feedConfig) {
  try {
    console.log(`📰 Fetching RSS feed: ${feedConfig.name}`);
    
    const feed = await parser.parseURL(feedConfig.url);
    console.log(`✅ RSS feed fetched: ${feed.items.length} items found`);
    
    const articles = [];
    
    for (const item of feed.items) {
      try {
        // Skip items without proper title or link
        if (!item.title || !item.link) {
          continue;
        }
        
        // Clean title - remove source names and attributions
        let title = item.title;
        
        // List of source patterns to remove from titles
        const sourcePatterns = [
          /[-–—]\s*(Google News|Jagbani|BBC News|CNN|Reuters|AP News|ABP Punjabi|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune|SGPC|PTC News|PTC|ABP Sanjha|abpsanjha|punjabijagran|punjabiJagran)\s*$/gi,
          /\s+(Google News|Jagbani|BBC News|CNN|Reuters|AP News|ABP Punjabi|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune|SGPC|PTC News|PTC|ABP Sanjha|abpsanjha|punjabijagran|punjabiJagran)\s*$/gi,
          /\b(Google News|Jagbani|BBC News|CNN|Reuters|AP News|ABP Punjabi|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune|SGPC|PTC News|PTC|ABP Sanjha|abpsanjha|punjabijagran|punjabiJagran)\s*$/gi,
          /[-–—]\s*[^-–—]*$/g // Fallback: remove anything after dash at end
        ];
        
        // Apply all patterns to clean the title
        sourcePatterns.forEach(pattern => {
          title = title.replace(pattern, '').trim();
        });
        
        if (title.length < 10) continue; // Skip very short titles
        
        // Generate unique slug
        const baseSlug = generateSlug(title);
        let slug = baseSlug;
        let counter = 1;
        while (await News.findOne({ slug })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        // Check if article already exists
        const existingArticle = await News.findOne({
          $or: [
            { title: title },
            { 'seo.originalUrl': item.link }
          ]
        });
        
        if (existingArticle) {
          console.log(`⏭️  Article already exists: ${title.substring(0, 50)}...`);
          continue;
        }
        
        // Create article content from description and clean it
        let content = item.contentSnippet || item.content || item.summary || title;
        
        // Clean content to remove source attributions
        const contentSourcePatterns = [
          /\s*[-–—]\s*(Google News|Jagbani|BBC News|CNN|Reuters|AP News|ABP Punjabi|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune|SGPC|PTC News|PTC|ABP Sanjha|abpsanjha|punjabijagran|punjabiJagran)\s*$/gi,
          /\s*(Google News|Jagbani|BBC News|CNN|Reuters|AP News|ABP Punjabi|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune|SGPC|PTC News|PTC|ABP Sanjha|abpsanjha|punjabijagran|punjabiJagran)\s*$/gi,
          /\(source:.*?\)/gi,
          /source:.*?(?=\.|$)/gi
        ];
        
        contentSourcePatterns.forEach(pattern => {
          content = content.replace(pattern, '').trim();
        });
        
        // If content is too short (likely just a snippet), try to enhance it
        if (content.length < 200 && item.link) {
          // Try to scrape full content from the original article URL
          console.log(`📰 Attempting to fetch full content for: ${title.substring(0, 50)}...`);
          
          try {
            const scrapedContent = await scrapeFullArticleContent(item.link);
            if (scrapedContent && scrapedContent.length > content.length) {
              console.log(`✅ Enhanced content from ${content.length} to ${scrapedContent.length} characters`);
              content = scrapedContent;
            } else {
              // If scraping fails, create enhanced content with available info
              const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              }) : 'Recently';
              
              const enhancedContent = `
                <div class="news-content">
                  <div class="news-summary">
                    <p><strong>${content}</strong></p>
                  </div>
                  
                  <div class="news-details">
                    <p>ਇਹ ਖਬਰ ${pubDate} ਨੂੰ ਪ੍ਰਕਾਸ਼ਿਤ ਹੋਈ ਸੀ। ਇਸ ਘਟਨਾ ਬਾਰੇ ਹੋਰ ਵੇਰਵੇ ਮੂਲ ਸਰੋਤ ਤੋਂ ਪ੍ਰਾਪਤ ਕੀਤੇ ਜਾ ਸਕਦੇ ਹਨ।</p>
                    <p>This news was published on ${pubDate}. For more comprehensive details about this development, readers are encouraged to visit the original source.</p>
                  </div>
                  
                  <div class="news-disclaimer">
                    <p><strong>ਨੋਟ:</strong> ਇਹ ਖਬਰ RSS ਫੀਡ ਰਾਹੀਂ ਪ੍ਰਾਪਤ ਕੀਤੀ ਗਈ ਹੈ। ਸੰਪੂਰਨ ਜਾਣਕਾਰੀ ਲਈ ਮੂਲ ਸਰੋਤ ਦੇਖੋ।</p>
                    <p><em><strong>Note:</strong> This news has been obtained through RSS feed. Please refer to the original source for complete information.</em></p>
                  </div>
                </div>
              `.trim();
              content = enhancedContent;
            }
          } catch (error) {
            console.error(`❌ Failed to scrape content for ${title}: ${error.message}`);
            // Fallback to enhanced version with disclaimer
            const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            }) : 'Recently';
            
            const enhancedContent = `
              <div class="news-content">
                <div class="news-summary">
                  <p><strong>${content}</strong></p>
                </div>
                
                <div class="news-details">
                  <p>ਇਹ ਖਬਰ ${pubDate} ਨੂੰ ਪ੍ਰਕਾਸ਼ਿਤ ਹੋਈ ਸੀ। ਇਸ ਘਟਨਾ ਬਾਰੇ ਹੋਰ ਵੇਰਵੇ ਮੂਲ ਸਰੋਤ ਤੋਂ ਪ੍ਰਾਪਤ ਕੀਤੇ ਜਾ ਸਕਦੇ ਹਨ।</p>
                  <p>This news was published on ${pubDate}. For more comprehensive details about this development, readers are encouraged to visit the original source.</p>
                </div>
                
                <div class="news-disclaimer">
                  <p><strong>ਨੋਟ:</strong> ਇਹ ਖਬਰ RSS ਫੀਡ ਰਾਹੀਂ ਪ੍ਰਾਪਤ ਕੀਤੀ ਗਈ ਹੈ। ਸੰਪੂਰਨ ਜਾਣਕਾਰੀ ਲਈ ਮੂਲ ਸਰੋਤ ਦੇਖੋ।</p>
                  <p><em><strong>Note:</strong> This news has been obtained through RSS feed. Please refer to the original source for complete information.</em></p>
                </div>
              </div>
            `.trim();
            content = enhancedContent;
          }
        }
        
        const excerpt = (item.contentSnippet || item.summary || content).length > 200 
          ? (item.contentSnippet || item.summary || content).substring(0, 197) + '...' 
          : (item.contentSnippet || item.summary || content);
        
        // Use red gradient placeholder instead of Google News logo
        const featuredImage = getGoogleNewsLogo();
        
        // Create article object
        const article = {
          title: title,
          slug: slug,
          headline: title,
          content: content,
          excerpt: excerpt,
          featuredImage: featuredImage,
          category: mapToValidCategory(feedConfig.category),
          rssAuthor: 'Google News', // Use rssAuthor field instead of author
          status: 'published',
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: filterSourceName(feed.title) || 'Unknown Source',
          tags: [feedConfig.category, 'rss', 'google-news'],
          language: 'punjabi',
          seo: {
            metaTitle: title,
            metaDescription: excerpt,
            keywords: [feedConfig.category, 'punjabi', 'news', 'google'],
            originalUrl: item.link
          }
        };
        
        articles.push(article);
        
      } catch (error) {
        console.error(`Error processing RSS item: ${error.message}`);
      }
    }
    
    console.log(`📝 Processed ${articles.length} new articles from ${feedConfig.name}`);
    return articles;
    
  } catch (error) {
    console.error(`❌ Error fetching RSS feed ${feedConfig.name}: ${error.message}`);
    return [];
  }
}

// Save articles to database
async function saveArticles(articles) {
  let savedCount = 0;
  
  for (const articleData of articles) {
    try {
      const article = new News(articleData);
      await article.save();
      savedCount++;
      console.log(`💾 Saved: ${articleData.title.substring(0, 50)}...`);
    } catch (error) {
      console.error(`Error saving article: ${error.message}`);
    }
  }
  
  return savedCount;
}

// Fetch all RSS feeds
async function fetchAllRSSFeeds() {
  try {
    console.log('🚀 Starting RSS feed fetch process...');
    
    let totalArticles = [];
    
    for (const feedConfig of RSS_FEEDS) {
      const articles = await fetchRSSFeed(feedConfig);
      totalArticles = totalArticles.concat(articles);
      
      // Add delay between feeds to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`📊 Total articles to save: ${totalArticles.length}`);
    
    if (totalArticles.length > 0) {
      const savedCount = await saveArticles(totalArticles);
      console.log(`✅ RSS fetch completed: ${savedCount} articles saved`);
      return { 
        success: true, 
        message: `Successfully fetched ${savedCount} new articles`,
        totalArticles: savedCount 
      };
    } else {
      console.log('ℹ️  No new articles found');
      return { 
        success: true, 
        message: 'No new articles found',
        totalArticles: 0 
      };
    }
    
  } catch (error) {
    console.error('❌ RSS fetch failed:', error.message);
    return { 
      success: false, 
      message: `RSS fetch failed: ${error.message}`,
      totalArticles: 0 
    };
  }
}

// Fetch all news (RSS + Web Scraping)
async function fetchAllNews() {
  try {
    console.log('🌟 Starting combined news fetch (RSS + Web Scraping)...');
    
    // Fetch RSS feeds
    const rssResult = await fetchAllRSSFeeds();
    
    // Try web scraping (will be disabled due to copyright)
    const scrapingResult = await webScrapingService.fetchLatestNews();
    
    const totalArticles = rssResult.totalArticles + (scrapingResult.saved || 0);
    
    return {
      success: true,
      message: `Combined fetch completed: ${totalArticles} total articles`,
      data: {
        rss: { articles: rssResult.totalArticles },
        scraping: { articles: scrapingResult.saved || 0 },
        total: totalArticles
      }
    };
    
  } catch (error) {
    console.error('❌ Combined news fetch failed:', error.message);
    return {
      success: false,
      message: `Combined fetch failed: ${error.message}`,
      data: { rss: { articles: 0 }, scraping: { articles: 0 }, total: 0 }
    };
  }
}

// Start automatic news scheduler
function startNewsScheduler() {
  console.log('⏰ Starting automatic news scheduler...');
  
  if (!schedulerState.isAutoSyncEnabled) {
    console.log('❌ Auto-sync is disabled. Scheduler not started.');
    return;
  }
  
  // Fetch news every 2 hours
  const newsTask = cron.schedule('0 */2 * * *', async () => {
    if (schedulerState.isAutoSyncEnabled) {
      console.log('🔄 Running scheduled news fetch...');
      schedulerState.lastRun = new Date();
      await fetchAllNews();
    }
  }, { scheduled: false });
  
  // RSS-only fetch every 30 minutes
  const rssTask = cron.schedule('*/30 * * * *', async () => {
    if (schedulerState.isAutoSyncEnabled) {
      console.log('🔄 Running scheduled RSS fetch...');
      schedulerState.lastRun = new Date();
      await fetchAllRSSFeeds();
    }
  }, { scheduled: false });
  
  // Store tasks for later control
  schedulerState.scheduledTasks = [newsTask, rssTask];
  
  // Start the tasks
  newsTask.start();
  rssTask.start();
  
  console.log('✅ News scheduler started successfully');
}

// Stop automatic news scheduler
function stopNewsScheduler() {
  console.log('⏹️ Stopping automatic news scheduler...');
  
  schedulerState.scheduledTasks.forEach(task => {
    if (task) {
      task.stop();
    }
  });
  
  schedulerState.scheduledTasks = [];
  console.log('✅ News scheduler stopped successfully');
}

// Enable auto-sync
function enableAutoSync() {
  schedulerState.isAutoSyncEnabled = true;
  console.log('✅ Auto-sync enabled');
  startNewsScheduler();
}

// Disable auto-sync
function disableAutoSync() {
  schedulerState.isAutoSyncEnabled = false;
  console.log('❌ Auto-sync disabled');
  stopNewsScheduler();
}

// Get scheduler status
function getSchedulerStatus() {
  return {
    enabled: schedulerState.isAutoSyncEnabled,
    status: schedulerState.isAutoSyncEnabled ? 'running' : 'stopped',
    lastRun: schedulerState.lastRun || null,
    nextRun: schedulerState.isAutoSyncEnabled ? getNextRunTime() : null,
    activeTasks: schedulerState.scheduledTasks.length,
    lastStatusCheck: new Date()
  };
}

// Helper function to calculate next run time (6 hours from now)
function getNextRunTime() {
  const nextRun = new Date();
  nextRun.setHours(nextRun.getHours() + 6);
  return nextRun;
}

// Start RSS-only scheduler
function startRSSScheduler() {
  console.log('⏰ Starting RSS scheduler...');
  
  // Fetch RSS every hour
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Running scheduled RSS fetch...');
    await fetchAllRSSFeeds();
  });
  
  console.log('✅ RSS scheduler started successfully');
}

// Manual fetch functions
async function manualRSSFetch() {
  return await fetchAllRSSFeeds();
}

async function manualNewsFetch() {
  return await fetchAllNews();
}

async function manualWebScraping() {
  return await webScrapingService.fetchLatestNews();
}

module.exports = {
  fetchAllRSSFeeds,
  fetchAllNews,
  manualRSSFetch,
  manualNewsFetch,
  manualWebScraping,
  startNewsScheduler,
  stopNewsScheduler,
  enableAutoSync,
  disableAutoSync,
  getSchedulerStatus,
  startRSSScheduler,
  getGoogleNewsLogo
};
