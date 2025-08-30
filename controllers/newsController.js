const News = require('../models/News');

// Utility to filter out RSS feed source names
const filterSourceName = (source) => {
  if (!source) return '';
  
  // List of RSS feed sources to filter out
  const rssSourcesFilter = [
    'Google News',
    'Jagbani',
    'BBC News',
    'CNN',
    'Reuters',
    'AP News',
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
    'Navbharat Times'
  ];
  
  // Check if the source should be filtered
  const shouldFilter = rssSourcesFilter.some(filterSource => 
    source.toLowerCase().includes(filterSource.toLowerCase()) ||
    filterSource.toLowerCase().includes(source.toLowerCase())
  );
  
  // Return empty string if should be filtered, otherwise return original source
  return shouldFilter ? '' : source;
};

// Function to clean article data by filtering source
const cleanArticleSource = (article) => {
  if (!article) return article;
  
  const cleanedArticle = article.toObject ? article.toObject() : article;
  
  // Clean title to remove source names
  let cleanTitle = cleanedArticle.title || '';
  const titleSourcePatterns = [
    /[-–—]\s*(Google News|Jagbani|BBC News|CNN|Reuters|AP News|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune)\s*$/gi,
    /\s+(Google News|Jagbani|BBC News|CNN|Reuters|AP News|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune)\s*$/gi,
    /\b(Google News|Jagbani|BBC News|CNN|Reuters|AP News|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune)\s*$/gi
  ];
  
  titleSourcePatterns.forEach(pattern => {
    cleanTitle = cleanTitle.replace(pattern, '').trim();
  });
  
  // Clean content to remove source attributions
  let cleanContent = cleanedArticle.content || '';
  const contentSourcePatterns = [
    /\s*[-–—]\s*(Google News|Jagbani|BBC News|CNN|Reuters|AP News|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune)\s*$/gi,
    /\s*(Google News|Jagbani|BBC News|CNN|Reuters|AP News|Times of India|Hindustan Times|Indian Express|NDTV|Zee News|Aaj Tak|ABP News|News18|India Today|The Hindu|Economic Times|Business Standard|Mint|Dainik Bhaskar|Dainik Jagran|Navbharat Times|Punjab Kesari|Ajit|Rozana Spokesman|Dainik Tribune)\s*$/gi,
    /\(source:.*?\)/gi,
    /source:.*?(?=\.|$)/gi
  ];
  
  contentSourcePatterns.forEach(pattern => {
    cleanContent = cleanContent.replace(pattern, '').trim();
  });
  
  return {
    ...cleanedArticle,
    title: cleanTitle,
    content: cleanContent,
    source: filterSourceName(cleanedArticle.source)
  };
};

// Function to clean array of articles
const cleanArticlesSources = (articles) => {
  if (!Array.isArray(articles)) return articles;
  
  return articles.map(cleanArticleSource);
};

const { processUploadedImage } = require('../utils/imageProcessor');

// Get all news with pagination and filtering
const getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { status: 'published' };
    
    // Add category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Add search filter
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }
    
    // Add featured filter
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    
    // Add breaking filter
    if (req.query.breaking === 'true') {
      filter.breaking = true;
    }
    
    const news = await News.find(filter)
      .populate('author', 'firstName lastName username avatar')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await News.countDocuments(filter);
    
    res.json({
      news,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNews: total
    });
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all available categories
const getCategories = async (req, res) => {
  try {
    const categories = await News.distinct('category');
    res.json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Error fetching categories', error: err.message });
  }
};

// Get single news by slug
const getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('author', 'firstName lastName username avatar bio');
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Increment views
    news.views += 1;
    await news.save();
    
    // Apply source filtering before sending to frontend
    const filteredNews = cleanArticleSource(news);
    
    res.json(filteredNews);
  } catch (error) {
    console.error('Get news by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new news (Admin/Editor only)
const createNews = async (req, res) => {
  try {
    console.log('Create news request body:', req.body); // Debug log
    
    const {
      title,
      headline,
      content,
      excerpt,
      category,
      tags,
      status,
      featured,
      breaking,
      featuredImage,
      seo,
      publishedAt
    } = req.body;

    // Validate required fields
    if (!title || !content || !excerpt || !category) {
      return res.status(400).json({ 
        message: 'Title, content, excerpt, and category are required' 
      });
    }
    
    const newsData = {
      title,
      headline: headline || title,
      content,
      excerpt,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      author: req.user._id,
      status: status || 'draft',
      featured: Boolean(featured),
      breaking: Boolean(breaking),
      featuredImage: featuredImage || {},
      seo: seo || {},
      publishedAt: status === 'published' && publishedAt ? new Date(publishedAt) : (status === 'published' ? new Date() : undefined)
    };

    console.log('Processed news data:', newsData); // Debug log
    
    // Handle file uploads (if any)
    if (req.files) {
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        try {
          // Process and resize the featured image
          const processingResult = await processUploadedImage(req.files.featuredImage[0]);
          if (processingResult.success) {
            newsData.featuredImage = {
              url: processingResult.processedFile.url,
              alt: req.body.featuredImageAlt || '',
              caption: req.body.featuredImageCaption || ''
            };
          } else {
            // Fallback to original if processing fails
            newsData.featuredImage = {
              url: `/uploads/images/${req.files.featuredImage[0].filename}`,
              alt: req.body.featuredImageAlt || '',
              caption: req.body.featuredImageCaption || ''
            };
          }
        } catch (error) {
          console.error('Featured image processing error:', error);
          // Fallback to original
          newsData.featuredImage = {
            url: `/uploads/images/${req.files.featuredImage[0].filename}`,
            alt: req.body.featuredImageAlt || '',
            caption: req.body.featuredImageCaption || ''
          };
        }
      }
      
      if (req.files.images) {
        newsData.images = [];
        for (let i = 0; i < req.files.images.length; i++) {
          const file = req.files.images[i];
          try {
            // Process each additional image
            const processingResult = await processUploadedImage(file);
            if (processingResult.success) {
              newsData.images.push({
                url: processingResult.processedFile.url,
                alt: req.body[`imageAlt${i}`] || '',
                caption: req.body[`imageCaption${i}`] || ''
              });
            } else {
              // Fallback to original
              newsData.images.push({
                url: `/uploads/images/${file.filename}`,
                alt: req.body[`imageAlt${i}`] || '',
                caption: req.body[`imageCaption${i}`] || ''
              });
            }
          } catch (error) {
            console.error('Additional image processing error:', error);
            // Fallback to original
            newsData.images.push({
              url: `/uploads/images/${file.filename}`,
              alt: req.body[`imageAlt${i}`] || '',
              caption: req.body[`imageCaption${i}`] || ''
            });
          }
        }
      }
      
      if (req.files.videos) {
        newsData.videos = req.files.videos.map((file, index) => ({
          url: `/uploads/videos/${file.filename}`,
          title: req.body[`videoTitle${index}`] || '',
          thumbnail: req.body[`videoThumbnail${index}`] || '',
          duration: req.body[`videoDuration${index}`] || ''
        }));
      }
    }
    
    // Set published date if publishing
    if (newsData.status === 'published') {
      newsData.publishedAt = new Date();
    }
    
    const news = new News(newsData);
    await news.save();
    
    const populatedNews = await News.findById(news._id)
      .populate('author', 'firstName lastName username avatar');
    
    res.status(201).json({
      message: 'News created successfully',
      news: populatedNews
    });
  } catch (error) {
    console.error('Create news error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Send more detailed error information
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during news creation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update news
const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && news.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this news' });
    }
    
    const {
      title,
      headline,
      content,
      excerpt,
      category,
      tags,
      status,
      featured,
      breaking,
      seo,
      featuredImage
    } = req.body;
    
    const updateData = {};
    
    if (title) updateData.title = title;
    if (headline) updateData.headline = headline;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (category) updateData.category = category;
    if (tags) {
      // Handle both string and array formats for tags
      if (Array.isArray(tags)) {
        updateData.tags = tags;
      } else if (typeof tags === 'string') {
        updateData.tags = tags.split(',').map(tag => tag.trim());
      }
    }
    if (status) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured === 'true' || featured === true;
    if (breaking !== undefined) updateData.breaking = breaking === 'true' || breaking === true;
    if (seo) {
      // Handle both string and object formats for seo
      if (typeof seo === 'string') {
        updateData.seo = JSON.parse(seo);
      } else if (typeof seo === 'object') {
        updateData.seo = seo;
      }
    }
    
    // Handle featuredImage (from JSON or form data)
    if (featuredImage && featuredImage.url) {
      updateData.featuredImage = featuredImage;
    }
    
    // Handle file uploads
    if (req.files) {
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        try {
          // Process and resize the featured image
          const processingResult = await processUploadedImage(req.files.featuredImage[0]);
          if (processingResult.success) {
            updateData.featuredImage = {
              url: processingResult.processedFile.url,
              alt: req.body.featuredImageAlt || '',
              caption: req.body.featuredImageCaption || ''
            };
          } else {
            // Fallback to original if processing fails
            updateData.featuredImage = {
              url: `/uploads/images/${req.files.featuredImage[0].filename}`,
              alt: req.body.featuredImageAlt || '',
              caption: req.body.featuredImageCaption || ''
            };
          }
        } catch (error) {
          console.error('Featured image processing error:', error);
          // Fallback to original
          updateData.featuredImage = {
            url: `/uploads/images/${req.files.featuredImage[0].filename}`,
            alt: req.body.featuredImageAlt || '',
            caption: req.body.featuredImageCaption || ''
          };
        }
      }
      
      if (req.files.images) {
        updateData.images = [];
        for (let i = 0; i < req.files.images.length; i++) {
          const file = req.files.images[i];
          try {
            // Process each additional image
            const processingResult = await processUploadedImage(file);
            if (processingResult.success) {
              updateData.images.push({
                url: processingResult.processedFile.url,
                alt: req.body[`imageAlt${i}`] || '',
                caption: req.body[`imageCaption${i}`] || ''
              });
            } else {
              // Fallback to original
              updateData.images.push({
                url: `/uploads/images/${file.filename}`,
                alt: req.body[`imageAlt${i}`] || '',
                caption: req.body[`imageCaption${i}`] || ''
              });
            }
          } catch (error) {
            console.error('Additional image processing error:', error);
            // Fallback to original
            updateData.images.push({
              url: `/uploads/images/${file.filename}`,
              alt: req.body[`imageAlt${i}`] || '',
              caption: req.body[`imageCaption${i}`] || ''
            });
          }
        }
      }
    }
    
    // Set published date if changing to published
    if (updateData.status === 'published' && news.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    
    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName username avatar');
    
    res.json({
      message: 'News updated successfully',
      news: updatedNews
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ message: 'Server error during news update' });
  }
};

// Delete news
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && news.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this news' });
    }
    
    await News.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ message: 'Server error during news deletion' });
  }
};

// Get news for admin (all statuses)
const getAdminNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.author) {
      filter.author = req.query.author;
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    const news = await News.find(filter)
      .populate('author', 'firstName lastName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await News.countDocuments(filter);
    
    res.json({
      news,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNews: total
    });
  } catch (error) {
    console.error('Get admin news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single news by ID for admin
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'firstName lastName username avatar');
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    res.json(news);
  } catch (error) {
    console.error('Get news by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid news ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllNews,
  getCategories,
  getNewsBySlug,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getAdminNews
};