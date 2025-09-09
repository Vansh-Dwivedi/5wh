import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Box,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import axios from 'axios';

const LifeCulturePage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  // Life & Culture state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const articlesPerPage = 12;

  // Opinion state
  const [opinions, setOpinions] = useState([]);
  const [featuredOpinions, setFeaturedOpinions] = useState([]);
  const [opinionLoading, setOpinionLoading] = useState(false);
  const [opinionError, setOpinionError] = useState('');
  const [opinionPagination, setOpinionPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    if (tabValue === 0) {
      fetchLifeCultureContent();
    } else if (tabValue === 1) {
      fetchOpinions();
      fetchFeaturedOpinions();
    }
  }, [page, tabValue, opinionPagination.current]);

  const fetchLifeCultureContent = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch from news API and filter by category
      // You can later create a dedicated life-culture endpoint
      const response = await axios.get(`/api/news?page=${page}&limit=${articlesPerPage}&category=life-culture`);
      setArticles(response.data.news || response.data.articles || []);
      setTotalPages(Math.ceil((response.data.total || 0) / articlesPerPage));
      setError(null);
    } catch (err) {
      console.error('Error fetching life and culture content:', err);
      setError('Failed to load content. Please try again later.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpinions = async () => {
    try {
      setOpinionLoading(true);
      const response = await fetch(`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com/api/opinions?page=${opinionPagination.current}&limit=9`);
      const data = await response.json();
      
      if (data.success) {
        setOpinions(data.data);
        setOpinionPagination(data.pagination);
      } else {
        setOpinionError('Failed to load opinions');
      }
    } catch (error) {
      console.error('Error fetching opinions:', error);
      setOpinionError('Failed to load opinions');
    } finally {
      setOpinionLoading(false);
    }
  };

  const fetchFeaturedOpinions = async () => {
    try {
      const response = await fetch('https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com/api/opinions/featured');
      const data = await response.json();
      
      if (data.success) {
        setFeaturedOpinions(data.data);
      }
    } catch (error) {
      console.error('Error fetching featured opinions:', error);
    }
  };

  const handlePageChange = (event, newPage) => {
    if (tabValue === 0) {
      setPage(newPage);
    } else {
      setOpinionPagination(prev => ({ ...prev, current: newPage }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset pagination when switching tabs
    if (newValue === 0) {
      setPage(1);
    } else {
      setOpinionPagination(prev => ({ ...prev, current: 1 }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Sample data for demonstration if API doesn't return data
  const sampleArticles = [
    {
      _id: '1',
      title: 'Exploring Punjab\'s Rich Cultural Heritage',
      summary: 'A deep dive into the traditional arts, crafts, and cultural practices that define Punjab\'s identity.',
      image: '/api/placeholder/400/250',
      slug: 'punjab-cultural-heritage',
      category: 'Culture',
      publishedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'Modern Living in Traditional Homes',
      summary: 'How contemporary families are adapting ancestral homes for modern lifestyle needs.',
      image: '/api/placeholder/400/250',
      slug: 'modern-traditional-homes',
      category: 'Lifestyle',
      publishedAt: new Date().toISOString(),
    },
    {
      _id: '3',
      title: 'Festival Celebrations: Then and Now',
      summary: 'Comparing traditional festival celebrations with modern adaptations in urban settings.',
      image: '/api/placeholder/400/250',
      slug: 'festival-celebrations',
      category: 'Culture',
      publishedAt: new Date().toISOString(),
    }
  ];

  const displayArticles = articles.length > 0 ? articles : sampleArticles;
  const featuredOpinion = featuredOpinions[0];

  const renderLifeCultureContent = () => (
    <>
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Content Grid */}
      {!loading && !error && (
        <>
          <Grid container spacing={3}>
            {displayArticles.map((article, index) => (
              <Grid item xs={12} sm={6} md={4} key={article._id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <CardActionArea
                      component={RouterLink}
                      to={`/life-culture/${article.slug}`}
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={article.image || '/api/placeholder/400/250'}
                        alt={article.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Box sx={{ mb: 1 }}>
                          <Chip 
                            label={article.category || 'Life & Culture'} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#c41e3a', 
                              color: 'white',
                              fontSize: '0.75rem'
                            }} 
                          />
                        </Box>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          gutterBottom
                          sx={{ 
                            fontWeight: 600,
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                          }}
                        >
                          {article.summary || article.description}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ mt: 1, display: 'block' }}
                        >
                          {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {/* No Content Message */}
          {displayArticles.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No content available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check back soon for new life and culture stories.
              </Typography>
            </Box>
          )}
        </>
      )}
    </>
  );

  const renderOpinionContent = () => (
    <>
      {/* Featured Opinion */}
      {featuredOpinion && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <Box sx={{ mb: 8, width: '100%', maxWidth: 'lg' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 4,
                color: '#2c2c2c',
                fontSize: { xs: '1.75rem', md: '2rem' },
              }}
            >
              Featured Opinion
            </Typography>
            <Card 
              sx={{ 
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)',
                }
              }}
              onClick={() => navigate(`/opinion/${featuredOpinion.slug}`)}
            >
              <Grid container>
                <Grid item xs={12} md={8}>
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={featuredOpinion.category}
                        sx={{
                          backgroundColor: '#c41e3a',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 2,
                        color: '#2c2c2c',
                        lineHeight: 1.2,
                        fontSize: { xs: '1.5rem', md: '2rem' },
                      }}
                    >
                      {featuredOpinion.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 3,
                        color: '#666666',
                        lineHeight: 1.6,
                        flexGrow: 1,
                      }}
                    >
                      {featuredOpinion.excerpt}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                        by {featuredOpinion.author}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(featuredOpinion.publishedAt || featuredOpinion.createdAt)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {featuredOpinion.readTime}
                      </Typography>
                    </Box>
                  </CardContent>
                </Grid>
                {featuredOpinion.featuredImage && (
                  <Grid item xs={12} md={4}>
                    <CardMedia
                      component="img"
                      height="100%"
                      image={`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com${featuredOpinion.featuredImage}`}
                      alt={featuredOpinion.title}
                      sx={{ 
                        minHeight: { xs: 200, md: 300 },
                        objectFit: 'cover',
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </Card>
          </Box>
        </motion.div>
      )}

      {/* Opinion Articles Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
      >
        <Box sx={{ mb: 6, width: '100%', maxWidth: 'lg' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              mb: 4,
              color: '#2c2c2c',
              fontSize: { xs: '1.75rem', md: '2rem' },
            }}
          >
            Latest Opinions
          </Typography>
          
          {opinionLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress color="primary" />
            </Box>
          )}

          {opinionError && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {opinionError}
            </Alert>
          )}

          {!opinionLoading && !opinionError && (
            <>
              {opinions.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                  No opinion articles available at the moment.
                </Typography>
              ) : (
                <Grid container spacing={4}>
                  {opinions.map((article, index) => (
                    <Grid item xs={12} md={6} lg={4} key={article._id}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card 
                          sx={{ 
                            height: '100%',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease-in-out',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                              transform: 'translateY(-2px)',
                            }
                          }}
                          onClick={() => navigate(`/opinion/${article.slug}`)}
                        >
                          {article.featuredImage && (
                            <CardMedia
                              component="img"
                              height="200"
                              image={`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com${article.featuredImage}`}
                              alt={article.title}
                              sx={{ objectFit: 'cover' }}
                            />
                          )}
                          <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: article.featuredImage ? 'calc(100% - 200px)' : '100%' }}>
                            <Box sx={{ mb: 2 }}>
                              <Chip
                                label={article.category}
                                size="small"
                                sx={{
                                  backgroundColor: '#f5f5f5',
                                  color: '#666666',
                                  fontWeight: 'bold',
                                }}
                              />
                            </Box>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600, 
                                mb: 2,
                                color: '#2c2c2c',
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                                overflow: 'hidden',
                              }}
                            >
                              {article.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mb: 2,
                                color: '#666666',
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 3,
                                overflow: 'hidden',
                                flexGrow: 1,
                              }}
                            >
                              {article.excerpt}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                                by {article.author}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(article.publishedAt || article.createdAt)}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Pagination */}
              {opinionPagination.pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, width: '100%' }}>
                  <Pagination
                    count={opinionPagination.pages}
                    page={opinionPagination.current}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
      >
        <Box sx={{ 
          textAlign: 'center',
          backgroundColor: '#f8f8f8',
          py: 6,
          px: 4,
          borderRadius: '12px',
          width: '100%',
          maxWidth: 'md',
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: '#2c2c2c',
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Share Your Voice
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Have something to say? We welcome diverse perspectives and thoughtful commentary.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/contact')}
            sx={{
              backgroundColor: '#c41e3a',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              '&:hover': {
                backgroundColor: '#8b0000',
              },
            }}
          >
            Submit Your Opinion
          </Button>
        </Box>
      </motion.div>
    </>
  );

  return (
    <>
      <Helmet>
        <title>Life & Culture - 5WH Media</title>
        <meta name="description" content="Explore lifestyle, culture, traditions, and modern living stories from 5WH Media. Discover how heritage meets contemporary life." />
        <meta name="keywords" content="life, culture, lifestyle, traditions, heritage, Punjab culture, modern living" />
        <link rel="canonical" href="https://5whmedia.com/life-culture" />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: '#c41e3a',
              mb: 2 
            }}
          >
            Life & Culture
          </Typography>
          <Divider 
            sx={{ 
              width: '100px', 
              height: '4px', 
              backgroundColor: '#c41e3a', 
              mx: 'auto', 
              mb: 3 
            }} 
          />
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: '600px', mx: 'auto' }}
          >
            Discover stories that celebrate tradition, explore modern living, and bridge the gap between heritage and contemporary life.
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Content Grid */}
        {!loading && !error && (
          <>
            <Grid container spacing={3}>
              {displayArticles.map((article, index) => (
                <Grid item xs={12} sm={6} md={4} key={article._id || index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardActionArea 
                        component={RouterLink} 
                        to={`/life-culture/${article.slug}`}
                        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={article.image || '/api/placeholder/400/250'}
                          alt={article.title}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Box sx={{ mb: 1 }}>
                            <Chip 
                              label={article.category || 'Life & Culture'} 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#c41e3a', 
                                color: 'white',
                                fontSize: '0.75rem'
                              }} 
                            />
                          </Box>
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            gutterBottom
                            sx={{ 
                              fontWeight: 600,
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {article.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4,
                            }}
                          >
                            {article.summary || article.description}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ mt: 1, display: 'block' }}
                          >
                            {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            {/* No Content Message */}
            {displayArticles.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No content available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check back soon for new life and culture stories.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default LifeCulturePage;