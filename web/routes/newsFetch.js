const express = require('express');
const router = express.Router();
const { adminAuth, editorAuth } = require('../middleware/auth');
const { 
  manualRSSFetch, 
  manualNewsFetch, 
  manualWebScraping,
  enableAutoSync,
  disableAutoSync,
  getSchedulerStatus,
  webScrapingService 
} = require('../services/rssService');

// Manual RSS fetch endpoint
router.post('/fetch-rss', async (req, res) => {
  try {
    console.log('Manual RSS fetch triggered via API');
    const result = await manualRSSFetch();
    
    res.json({
      success: result.success,
      message: result.success ? 
        `Successfully fetched ${result.totalArticles} articles via RSS` :
        'RSS fetch failed',
      data: result
    });
  } catch (error) {
    console.error('RSS fetch API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during RSS fetch',
      error: error.message
    });
  }
});

// Manual web scraping endpoint
router.post('/fetch-scraping', async (req, res) => {
  try {
    console.log('Manual web scraping triggered via API');
    const result = await manualWebScraping();
    
    res.json({
      success: true,
      message: `Successfully scraped ${result.saved} new articles`,
      data: result
    });
  } catch (error) {
    console.error('Web scraping API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during web scraping',
      error: error.message
    });
  }
});

// Combined news fetch endpoint (RSS + Web Scraping)
router.post('/fetch-all', async (req, res) => {
  try {
    console.log('Manual combined news fetch triggered via API');
    const result = await manualNewsFetch();
    
    res.json({
      success: true,
      message: `Successfully fetched ${result.total} new articles`,
      data: result
    });
  } catch (error) {
    console.error('Combined news fetch API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during news fetch',
      error: error.message
    });
  }
});

// Scrape specific website endpoint
router.post('/scrape-site', async (req, res) => {
  try {
    const { site } = req.body;
    
    if (!site || site !== 'abp-sanjha') {
      return res.status(400).json({
        success: false,
        message: 'Invalid site parameter. Currently supported: abp-sanjha'
      });
    }
    
    console.log(`Manual scraping triggered for ${site}`);
    const articles = await webScrapingService.scrapeABPSanjha();
    const result = await webScrapingService.saveArticles(articles);
    
    res.json({
      success: true,
      message: `Successfully scraped ${result.saved} articles from ${site}`,
      data: {
        scraped: articles.length,
        saved: result.saved,
        duplicates: result.duplicates
      }
    });
  } catch (error) {
    console.error('Site scraping API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during site scraping',
      error: error.message
    });
  }
});

// Get news fetch status
router.get('/status', async (req, res) => {
  try {
    const News = require('../models/News');
    
    // Get article counts by source
    const stats = await News.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          latest: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get recent articles
    const recentArticles = await News.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title source createdAt category');
    
    res.json({
      success: true,
      data: {
        stats,
        recentArticles,
        totalArticles: await News.countDocuments()
      }
    });
  } catch (error) {
    console.error('Status API error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching status',
      error: error.message
    });
  }
});

// Enable auto-sync
router.post('/enable-auto-sync', editorAuth, async (req, res) => {
  try {
    enableAutoSync();
    const status = getSchedulerStatus();
    
    res.json({
      success: true,
      message: 'Auto-sync enabled successfully',
      data: status
    });
  } catch (error) {
    console.error('Enable auto-sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enabling auto-sync',
      error: error.message
    });
  }
});

// Disable auto-sync
router.post('/disable-auto-sync', editorAuth, async (req, res) => {
  try {
    disableAutoSync();
    const status = getSchedulerStatus();
    
    res.json({
      success: true,
      message: 'Auto-sync disabled successfully',
      data: status
    });
  } catch (error) {
    console.error('Disable auto-sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Error disabling auto-sync',
      error: error.message
    });
  }
});

// Get scheduler status
router.get('/scheduler-status', editorAuth, async (req, res) => {
  try {
    const status = getSchedulerStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Scheduler status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting scheduler status',
      error: error.message
    });
  }
});

module.exports = router;
