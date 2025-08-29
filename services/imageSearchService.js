const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { processUploadedImage, resizeImage } = require('../utils/imageProcessor');

class ImageSearchService {
  constructor() {
    this.searchEngines = [
      {
        name: 'DuckDuckGo',
        searchUrl: 'https://duckduckgo.com/',
        // We'll implement a simple image search using DuckDuckGo
      }
    ];
    
    this.requestConfig = {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      }
    };
  }

  /**
   * Search for images related to the title
   * @param {string} title - The news title to search for
   * @returns {Promise<Object|null>} - Image info or null if not found
   */
  async searchAndDownloadImage(title) {
    try {
      console.log(`🔍 Searching for image: ${title.substring(0, 50)}...`);
      
      // Clean the title for better search results
      const searchQuery = this.cleanSearchQuery(title);
      
      // Use Unsplash API for free high-quality images
      const imageUrl = await this.searchUnsplash(searchQuery);
      
      if (imageUrl) {
        return await this.downloadAndProcessImage(imageUrl, title);
      }
      
      // Fallback to placeholder service
      return await this.getPlaceholderImage(title);
      
    } catch (error) {
      console.error('Image search error:', error.message);
      return await this.getPlaceholderImage(title);
    }
  }

  /**
   * Clean the search query to get better results
   * @param {string} title - Original title
   * @returns {string} - Cleaned search query
   */
  cleanSearchQuery(title) {
    // Remove special characters, keep only English letters and common words
    let query = title
      .replace(/[^\w\s]/g, ' ') // Remove special chars
      .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
      .trim();
    
    // Extract key English words (common news-related terms)
    const newsKeywords = ['news', 'breaking', 'update', 'report', 'punjab', 'india', 'canada', 'sikh', 'politics', 'sports', 'culture', 'flood', 'weather', 'government', 'police', 'court', 'election', 'business', 'health', 'education'];
    
    const words = query.toLowerCase().split(' ');
    const relevantWords = words.filter(word => 
      word.length > 2 && 
      (newsKeywords.includes(word) || /^[a-zA-Z]+$/.test(word))
    );
    
    return relevantWords.slice(0, 3).join(' ') || 'punjab news';
  }

  /**
   * Search Unsplash for relevant images
   * @param {string} query - Search query
   * @returns {Promise<string|null>} - Image URL or null
   */
  async searchUnsplash(query) {
    try {
      // Using Unsplash Source API (no API key required for basic usage)
      // Categories: news, politics, people, city, nature
      const categories = ['news', 'people', 'city'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Unsplash Source provides random images
      const unsplashUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)},${category}`;
      
      // Test if the URL is accessible
      const response = await axios.head(unsplashUrl, {
        ...this.requestConfig,
        timeout: 10000
      });
      
      if (response.status === 200) {
        return unsplashUrl;
      }
      
      return null;
    } catch (error) {
      console.log('Unsplash search failed, trying alternative...');
      return null;
    }
  }

  /**
   * Get a placeholder image with text
   * @param {string} title - Title for placeholder
   * @returns {Promise<Object>} - Placeholder image info
   */
  async getPlaceholderImage(title) {
    try {
      // Create a simple colored placeholder using Sharp
      const width = 300;
      const height = 200;
      
      // Shorten title for placeholder
      const shortTitle = title.substring(0, 30).replace(/[^a-zA-Z0-9\s]/g, ' ');
      
      // Create safe filename
      const safeTitle = title
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30) || 'news_placeholder';
      
      const timestamp = Date.now();
      const filename = `placeholder_${safeTitle}_${timestamp}_300x200.jpg`;
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'images');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const imagePath = path.join(uploadsDir, filename);
      
      // Create a solid color image with Sharp
      const sharp = require('sharp');
      
      // Create SVG with text
      const svgImage = `
        <svg width="${width}" height="${height}">
          <rect width="100%" height="100%" fill="#4A90E2"/>
          <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">5WH News</text>
          <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="white">${shortTitle}</text>
        </svg>
      `;
      
      await sharp(Buffer.from(svgImage))
        .jpeg({ quality: 85 })
        .toFile(imagePath);
      
      console.log(`✅ Placeholder created: ${filename}`);
      
      return {
        url: `/uploads/images/${filename}`,
        alt: title || 'News Image',
        caption: '5WH News',
        source: '5WH News'
      };
      
    } catch (error) {
      console.error('Placeholder image creation failed:', error.message);
      return null;
    }
  }

  /**
   * Download and process an image
   * @param {string} imageUrl - URL of the image to download
   * @param {string} title - Title for naming the file
   * @param {boolean} isPlaceholder - Whether this is a placeholder image
   * @returns {Promise<Object|null>} - Processed image info or null
   */
  async downloadAndProcessImage(imageUrl, title, isPlaceholder = false) {
    try {
      // Create safe filename
      const safeTitle = title
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50) || 'news_image';
      
      const timestamp = Date.now();
      const prefix = isPlaceholder ? 'placeholder' : 'searched';
      const originalFilename = `${prefix}_${safeTitle}_${timestamp}`;
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'images');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Download the image
      console.log(`📥 Downloading image from: ${imageUrl}`);
      const response = await axios.get(imageUrl, {
        ...this.requestConfig,
        responseType: 'stream',
        timeout: 20000
      });

      // Determine file extension
      let extension = '.jpg';
      const contentType = response.headers['content-type'];
      if (contentType) {
        if (contentType.includes('png')) extension = '.png';
        else if (contentType.includes('webp')) extension = '.webp';
        else if (contentType.includes('gif')) extension = '.gif';
      }

      const tempPath = path.join(uploadsDir, `${originalFilename}_temp${extension}`);
      const finalPath = path.join(uploadsDir, `${originalFilename}_300x200.jpg`);
      
      // Save temporary file
      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Process and resize the image to 300x200
      await resizeImage(tempPath, finalPath);
      
      // Clean up temporary file
      try {
        fs.unlinkSync(tempPath);
      } catch (err) {
        console.warn('Could not delete temp file:', err.message);
      }

      // Return the processed image info
      const finalFilename = path.basename(finalPath);
      console.log(`✅ Image processed successfully: ${finalFilename}`);
      
      return {
        url: `/uploads/images/${finalFilename}`,
        alt: title || 'News Image',
        caption: '5WH News', // Always use 5WH News as caption
        source: '5WH News'
      };

    } catch (error) {
      console.error('Error downloading/processing image:', error.message);
      return null;
    }
  }

  /**
   * Search for multiple images and return the best one
   * @param {string} title - News title
   * @param {number} maxRetries - Maximum number of search attempts
   * @returns {Promise<Object|null>} - Best image found or null
   */
  async findBestImage(title, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      const image = await this.searchAndDownloadImage(title);
      if (image) {
        return image;
      }
      
      // Wait a bit before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return null;
  }
}

module.exports = new ImageSearchService();
