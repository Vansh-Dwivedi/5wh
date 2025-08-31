const axios = require('axios');
const cheerio = require('cheerio');
const News = require('../models/News');

// Function to scrape full article content from URL
async function scrapeFullArticleContent(url) {
  try {
    console.log(`🌐 Attempting to scrape content from: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ad, .social-share, .related-articles').remove();
    
    // Try different selectors for article content
    const contentSelectors = [
      'article p',
      '.article-content p',
      '.content p',
      '.story-content p',
      '.post-content p',
      '.entry-content p',
      '.article-body p',
      'main p',
      '.news-content p',
      'p'
    ];
    
    let fullContent = '';
    
    for (const selector of contentSelectors) {
      const paragraphs = $(selector);
      if (paragraphs.length > 2) { // Must have at least 3 paragraphs
        const content = paragraphs.map((i, el) => $(el).text().trim()).get()
          .filter(text => text.length > 50) // Filter out short paragraphs
          .slice(0, 10) // Take first 10 meaningful paragraphs
          .join('\n\n');
        
        if (content.length > 300) {
          fullContent = content;
          break;
        }
      }
    }
    
    if (fullContent) {
      console.log(`✅ Successfully scraped ${fullContent.length} characters of content`);
      return fullContent;
    } else {
      console.log(`⚠️  Could not extract meaningful content from ${url}`);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error.message);
    return null;
  }
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

// Fetch latest news from web scraping
async function fetchLatestNews() {
  try {
    console.log('🌐 Starting web scraping for latest news...');
    
    // For now, return empty array as web scraping is complex and needs specific site configurations
    // This prevents the error and allows RSS to work properly
    const articles = [];
    
    console.log(`✅ Web scraping completed: ${articles.length} articles found`);
    return articles;
    
  } catch (error) {
    console.error('❌ Web scraping error:', error.message);
    return [];
  }
}

// Save articles to database
async function saveArticles(articles) {
  let savedCount = 0;
  
  for (const articleData of articles) {
    try {
      // Check if article already exists
      const existingArticle = await News.findOne({
        $or: [
          { title: articleData.title },
          { slug: articleData.slug }
        ]
      });
      
      if (existingArticle) {
        console.log(`⏭️  Article already exists: ${articleData.title.substring(0, 50)}...`);
        continue;
      }
      
      const article = new News(articleData);
      await article.save();
      savedCount++;
      console.log(`✅ Saved article: ${articleData.title.substring(0, 50)}...`);
      
    } catch (error) {
      console.error(`❌ Error saving article: ${error.message}`);
    }
  }
  
  return savedCount;
}

module.exports = {
  fetchLatestNews,
  saveArticles,
  generateSlug,
  scrapeFullArticleContent
};