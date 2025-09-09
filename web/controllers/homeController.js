const News = require('../models/News');
const Podcast = require('../models/Podcast');
const Video = require('../models/Video');
const Opinion = require('../models/Opinion');

// Aggregated homepage content endpoint
// Returns curated slices to reduce client waterfall requests.
async function getHomeContent(req, res) {
  try {
    const [topHeadlines, featuredNews, latestNews, trendingNews, latestPodcasts, latestVideos, featuredOpinions] = await Promise.all([
      News.find({ status: 'published' })
        .sort({ breaking: -1, publishedAt: -1 })
        .limit(10)
        .select('title slug excerpt featuredImage publishedAt category source breaking views')
        .lean(),
      News.find({ status: 'published', featured: true })
        .sort({ publishedAt: -1 })
        .limit(5)
        .select('title slug excerpt featuredImage publishedAt category source views')
        .lean(),
      News.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(12)
        .select('title slug excerpt featuredImage publishedAt category source views')
        .lean(),
      News.find({ status: 'published' })
        .sort({ views: -1 })
        .limit(5)
        .select('title slug excerpt featuredImage publishedAt category source views')
        .lean(),
      Podcast.find({ status: 'published' })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(6)
        .select('title slug description thumbnail duration category publishedAt plays featured')
        .lean(),
      Video.find({ status: 'published' })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(6)
        .select('title slug description thumbnail duration category publishedAt views featured videoUrl videoType')
        .lean(),
      Opinion.find({ status: 'published', featured: true })
        .sort({ publishedAt: -1 })
        .limit(5)
        .select('title slug excerpt featuredImage publishedAt category views')
        .lean()
    ]);

    res.json({
      topHeadlines,
      featuredNews,
      latestNews,
      trendingNews,
      latestPodcasts,
      latestVideos,
      featuredOpinions,
      generatedAt: Date.now()
    });
  } catch (err) {
    console.error('Home content aggregation error:', err);
    res.status(500).json({ message: 'Failed to load homepage content' });
  }
}

module.exports = { getHomeContent };
