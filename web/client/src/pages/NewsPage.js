import React, { useState, useEffect } from 'react';
import { cleanArticlesSources, SourceDisplay } from '../services/api';
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  Box,
  Pagination,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import AdvertisingSidebar from '../components/layout/AdvertisingSidebar';

// Function to clean content from copyright watermarks
const cleanContent = (content) => {
  if (!content) return '';
  
  // Remove common copyright watermarks and source attributions
  let cleanedContent = content
    // Remove specific watermarks
    .replace(/jagbani\.com?/gi, '')
    .replace(/punjabijagran\.com?/gi, '')
    .replace(/punjabiJagran\.com?/gi, '')
    .replace(/ABP Sanjha?/gi, '')
    .replace(/abpsanjha\.com?/gi, '')
    .replace(/jagbani?/gi, '')
    .replace(/punjabi jagran?/gi, '')
    // Remove common copyright phrases
    .replace(/\(source:.*?\)/gi, '')
    .replace(/source:.*?(?=\.|$)/gi, '')
    .replace(/©.*?(?=\.|$)/gi, '')
    .replace(/copyright.*?(?=\.|$)/gi, '')
    .replace(/all rights reserved.*?(?=\.|$)/gi, '')
    // Remove URLs that might be watermarks
    .replace(/https?:\/\/\S+/g, '')
    // Remove duplicate spaces and clean up
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .trim();
    
  return cleanedContent;
};

const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);

  // Fetch available categories from backend
  const fetchCategories = async () => {
    try {
      const response = await api.get('/news/categories');
      console.log('Available categories from backend:', response.data.categories);
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback to hardcoded categories if backend fails
      setCategories([
        'punjabi-news', 'punjabi-canada', 'punjab-india',
        'sikh-community', 'punjabi-culture', 'punjabi-politics', 'punjabi-sports'
      ]);
    }
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'punjabi-news': 'Punjabi News',
      'punjabi-canada': 'Punjabi Canada',
      'punjab-india': 'Punjab India',
      'sikh-community': 'Sikh Community',
      'punjabi-culture': 'Punjabi Culture',
      'punjabi-politics': 'Punjab Politics',
      'punjabi-sports': 'Punjab Sports'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Get category-specific fallback image
  const getCategoryFallbackImage = (category, index = 0) => {
    const fallbackImages = {
      'punjabi-news': [
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1609178397585-b61d2500b58e?w=800&h=400&fit=crop'
      ],
      'punjabi-canada': [
        'https://images.unsplash.com/photo-1503614472-8c93d56cd893?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519832979-6fa011b87667?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&h=400&fit=crop'
      ],
      'punjab-india': [
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1518001589401-1743b61d1def?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=400&fit=crop'
      ],
      'punjab-canada': [
        'https://images.unsplash.com/photo-1503614472-8c93d56cd893?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519832979-6fa011b87667?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800&h=400&fit=crop'
      ],
      'sikh-community': [
        'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&h=400&fit=crop'
      ],
      'punjabi-culture': [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800&h=400&fit=crop'
      ],
      'punjabi-politics': [
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop'
      ],
      'punjabi-sports': [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop'
      ]
    };
    
    const categoryImages = fallbackImages[category] || fallbackImages['punjabi-news'];
    return categoryImages[index % categoryImages.length];
  };

  const fetchNews = async (page = 1, search = '', category = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...(search && { search }),
        ...(category && { category })
      };
      
      const response = await api.get('/news', { params });
      setNews(response.data.news);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (err) {
      setError('Failed to fetch news articles');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchNews(currentPage, searchTerm, selectedCategory);
  }, [currentPage, selectedCategory, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNews(1, searchTerm, selectedCategory);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && news.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading latest news...
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>News - 5WH Media</title>
        <meta name="description" content="Latest news and updates from 5WH Media" />
      </Helmet>
      
      {/* Fixed Left Sidebar */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '200px',
          zIndex: 1000,
          display: { xs: 'none', xl: 'block' },
        }}
      >
        <AdvertisingSidebar placement="left" />
      </Box>

      {/* Fixed Right Sidebar */}
      <Box
        sx={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '200px',
          zIndex: 1000,
          display: { xs: 'none', xl: 'block' },
        }}
      >
        <AdvertisingSidebar placement="right" />
      </Box>
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 6,
          mx: 'auto',
          textAlign: 'center'
        }}
      >
        <Grid container spacing={4} justifyContent="center">
          {/* Main Content Area */}
          <Grid item xs={12}>
            {/* Header - Newspaper style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3rem' },
                fontWeight: 700,
                color: '#2c2c2c',
                mb: 2,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Latest News
            </Typography>
            <Box sx={{ 
              height: '3px', 
              backgroundColor: '#c41e3a', 
              width: '80px', 
              mx: 'auto', 
              mb: 3 
            }} />
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontSize: '1rem',
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Stay informed with comprehensive coverage of current affairs and breaking news
            </Typography>
          </Box>
        </motion.div>

        {/* Search and Filter Section - Classic Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div style={{
            marginBottom: '32px',
            padding: '24px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Search Input */}
              <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                <form onSubmit={handleSearch}>
                  <TextField
                    fullWidth
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#666666' }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #ccc'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #999'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #c41e3a'
                        }
                      }
                    }}
                  />
                </form>
              </div>

              {/* Category Filter */}
              <div style={{ flex: '1 1 200px', maxWidth: '250px' }}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #ccc'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #999'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #c41e3a'
                      }
                    }
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {getCategoryDisplayName(category)}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* Search Button */}
              <div style={{ flex: '0 0 auto' }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={{
                    backgroundColor: '#c41e3a',
                    color: 'white',
                    borderRadius: '4px',
                    padding: '8px 20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textTransform: 'none',
                    border: '1px solid #c41e3a',
                    '&:hover': {
                      backgroundColor: '#a01729',
                      borderColor: '#a01729'
                    }
                  }}
                >
                  Search
                </Button>
              </div>

              {/* Results Count */}
              <div style={{ flex: '0 0 auto' }}>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa',
                  color: '#495057',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: '1px solid #dee2e6'
                }}>
                  {news.length} articles found
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* News Cards - Sleek CSS Grid Layout */}
        {news.length === 0 && !loading ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 0',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: '12px',
            margin: '32px 0'
          }}>
            <Typography variant="h5" gutterBottom>
              No news articles found
            </Typography>
            <Typography color="text.secondary">
              Try adjusting your search terms or category filter
            </Typography>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            padding: '16px 0'
          }}>
            {news.map((article, index) => (
              <div
                key={article._id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.2s ease',
                  cursor: 'pointer',
                  height: 'fit-content'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onClick={() => navigate(`/news/${article.slug}`)}
              >
                {/* Featured Image */}
                <div style={{
                  position: 'relative',
                  height: '180px',
                  overflow: 'hidden'
                }}>
                  {article.featuredImage && article.featuredImage.url ? (
                    <img
                      src={
                        article.featuredImage.url.startsWith('http') 
                          ? article.featuredImage.url 
                          : `http://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000${article.featuredImage.url}`
                      }
                      alt={article.featuredImage?.alt || article.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)';
                        e.target.parentElement.style.display = 'flex';
                        e.target.parentElement.style.alignItems = 'center';
                        e.target.parentElement.style.justifyContent = 'center';
                        e.target.parentElement.innerHTML = '<div style="color: white; text-align: center; font-size: 3rem; opacity: 0.9;">📰</div>';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '3rem',
                        opacity: 0.9
                      }}>
                        📰
                      </div>
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: '#c41e3a',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {article.category}
                  </div>
                </div>
                {/* Content */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    lineHeight: '1.4',
                    color: '#333',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {cleanContent(article.title)}
                  </h3>
                  
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    color: '#666',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {cleanContent(article.excerpt)}
                  </p>
                  
                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid #eee'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#888',
                      fontWeight: '500'
                    }}>
                      {formatDate(article.publishedAt)}
                    </span>
                    <span style={{
                      color: '#c41e3a',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Read More →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {loading && news.length > 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <CircularProgress />
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default NewsPage;
