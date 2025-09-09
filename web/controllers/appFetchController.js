const News = require('../models/News');
const Podcast = require('../models/Podcast');
const Video = require('../models/Video');
const RadioConfig = require('../models/RadioConfig');

// Controller for /app/fetch endpoints
// Each function handles DB errors, pagination, filtering, and returns consistent JSON

exports.getNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Increased default from 5 to 50
    const category = req.query.category;
    const search = req.query.search;
    
    // Build query
    let query = { status: 'published' };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [news, total] = await Promise.all([
      News.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title excerpt featuredImage category publishedAt createdAt')
        .lean(),
      News.countDocuments(query)
    ]);
    
    // Format response for mobile app
    const formattedNews = news.map(article => ({
      id: article._id,
      title: article.title,
      subtitle: article.excerpt,
      imageUrl: article.featuredImage?.url || '',
      content: article.excerpt, // For preview
      date: article.publishedAt || article.createdAt,
      category: article.category
    }));
    
    const hasMore = skip + limit < total;
    
    // Prevent caching to ensure fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    res.status(200).json({
      data: formattedNews,
      pagination: { 
        page, 
        limit, 
        total, 
        hasMore,
        totalPages: Math.ceil(total / limit)
      },
      success: true
    });
    
  } catch (error) {
    console.error('Error fetching news for app:', error);
    res.status(500).json({
      error: 'Failed to fetch news',
      code: 500,
      success: false
    });
  }
};

exports.getLiveStreams = async (req, res) => {
  try {
    // Get live videos from the Video model
    const liveVideos = await Video.find({
      status: 'published',
      live: true
    })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(10)
    .select('title description videoUrl thumbnail publishedAt createdAt category')
    .lean();
    
    let formattedStreams = [];

    if (liveVideos.length > 0) {
      // Format database videos for mobile app with complete stream data
      formattedStreams = liveVideos.map(video => {
        let youtubeId = '';
        let streamUrl = video.videoUrl || '';
        
        if (video.videoUrl) {
          const match = video.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
          youtubeId = match ? match[1] : '';
          
          // If it's a YouTube video, provide both embed and watch URLs
          if (youtubeId) {
            streamUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
          }
        }
        
        return {
          id: video._id,
          title: video.title,
          description: video.description || '',
          streamUrl: streamUrl,
          youtubeId: youtubeId,
          imageUrl: video.thumbnail?.url || '',
          thumbnailUrl: video.thumbnail?.url || '', // Alternative naming
          isLive: true,
          startTime: video.publishedAt || video.createdAt,
          category: video.category || 'Live Stream',
          viewerCount: Math.floor(Math.random() * 1000) + 100 // Mock viewer count
        };
      });
    } else {
      // Fallback to mock data if no live videos in database (same as web app)
      formattedStreams = [
        {
          id: 1,
          title: 'Live News Stream - Special Coverage',
          description: 'Live coverage of breaking news and special events from Punjab.',
          streamUrl: 'https://www.youtube.com/watch?v=PDazSUCBhvs',
          youtubeId: 'PDazSUCBhvs',
          imageUrl: 'https://img.youtube.com/vi/PDazSUCBhvs/maxresdefault.jpg',
          thumbnailUrl: 'https://img.youtube.com/vi/PDazSUCBhvs/maxresdefault.jpg',
          isLive: true,
          startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 mins ago
          category: 'Breaking News',
          viewerCount: 2156
        },
        {
          id: 2,
          title: 'Breaking News: Punjab Assembly Session Live',
          description: 'Live coverage of the Punjab Assembly session with real-time updates and analysis.',
          streamUrl: 'https://www.youtube.com/watch?v=Y_OIU_05eAk',
          youtubeId: 'Y_OIU_05eAk',
          imageUrl: 'https://img.youtube.com/vi/Y_OIU_05eAk/maxresdefault.jpg',
          thumbnailUrl: 'https://img.youtube.com/vi/Y_OIU_05eAk/maxresdefault.jpg',
          isLive: true,
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
          category: 'News',
          viewerCount: 1245
        },
        {
          id: 3,
          title: 'Weekly Discussion: Current Affairs Analysis',
          description: 'Join our panel for an in-depth discussion on current political and social issues affecting Punjab.',
          streamUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
          youtubeId: 'jNQXAC9IVRw',
          imageUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
          thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
          isLive: true,
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // Started 1 hour ago
          category: 'Discussion',
          viewerCount: 856
        }
      ];
    }

    // Prevent caching to ensure fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

    res.status(200).json({
      data: formattedStreams,
      count: formattedStreams.length,
      success: true
    });
    
  } catch (error) {
    console.error('Error fetching live streams:', error);
    res.status(500).json({
      error: 'Failed to fetch live streams',
      code: 500,
      success: false
    });
  }
};

exports.getRadio = async (req, res) => {
  try {
    // Get radio configuration from database with fallback
    let radioConfig;
    try {
      radioConfig = await RadioConfig.getConfig();
    } catch (dbError) {
      console.log('Radio config DB error, using fallback:', dbError.message);
      // Fallback response if database fails
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });
      return res.status(200).json({
        data: {
          streamUrl: 'https://5whmedia.com/radio/stream',
          title: '5WH Radio',
          artist: 'Live Programming',
          isLive: true,
          currentShow: 'Live Programming'
        },
        success: true
      });
    }
    
    // Prevent caching to ensure fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    res.status(200).json({
      data: {
        streamUrl: radioConfig.streamUrl,
        title: radioConfig.title,
        artist: radioConfig.currentArtist,
        isLive: radioConfig.isLive,
        currentShow: radioConfig.currentShow
      },
      success: true
    });
    
  } catch (error) {
    console.error('Error fetching radio config:', error);
    // Always provide fallback for radio
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    res.status(200).json({
      data: {
        streamUrl: 'https://5whmedia.com/radio/stream',
        title: '5WH Radio',
        artist: 'Live Programming',
        isLive: true,
        currentShow: 'Live Programming'
      },
      success: true
    });
  }
};

exports.getPodcasts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    // Build query
    const query = { status: 'published' };
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [podcasts, total] = await Promise.all([
      Podcast.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title description duration audioUrl thumbnail category publishedAt createdAt')
        .lean(),
      Podcast.countDocuments(query)
    ]);
    
    // Format for mobile app
    const formattedPodcasts = podcasts.map(podcast => {
      // Extract YouTube ID if audioUrl is a YouTube link
      let youtubeId = '';
      if (podcast.audioUrl) {
        const match = podcast.audioUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        youtubeId = match ? match[1] : '';
      }
      
      return {
        id: podcast._id,
        title: podcast.title,
        description: podcast.description,
        duration: podcast.durationSeconds || 1800, // fallback duration
        imageUrl: podcast.thumbnail?.url || '',
        youtubeId,
        category: podcast.category
      };
    });
    
    const hasMore = skip + limit < total;
    
    // Prevent caching to ensure fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    res.status(200).json({
      data: formattedPodcasts,
      pagination: { 
        page, 
        limit, 
        total, 
        hasMore,
        totalPages: Math.ceil(total / limit)
      },
      success: true
    });
    
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({
      error: 'Failed to fetch podcasts',
      code: 500,
      success: false
    });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    // Build query - exclude live videos (they're in liveStreams endpoint)
    const query = { 
      status: 'published',
      live: { $ne: true }
    };
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title description duration videoUrl thumbnail category publishedAt createdAt')
        .lean(),
      Video.countDocuments(query)
    ]);
    
    // Format for mobile app
    const formattedVideos = videos.map(video => {
      // Extract YouTube ID
      let youtubeId = '';
      if (video.videoUrl) {
        const match = video.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        youtubeId = match ? match[1] : '';
      }
      
      return {
        id: video._id,
        title: video.title,
        description: video.description,
        duration: video.durationSeconds || 1200, // fallback duration
        imageUrl: video.thumbnail?.url || '',
        youtubeId,
        category: video.category
      };
    });
    
    const hasMore = skip + limit < total;
    
    // Prevent caching to ensure fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    res.status(200).json({
      data: formattedVideos,
      pagination: { 
        page, 
        limit, 
        total, 
        hasMore,
        totalPages: Math.ceil(total / limit)
      },
      success: true
    });
    
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      error: 'Failed to fetch videos',
      code: 500,
      success: false
    });
  }
};
