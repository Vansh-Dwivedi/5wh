import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const OpinionPage = () => {
  const navigate = useNavigate();
  const [opinions, setOpinions] = useState([]);
  const [featuredOpinions, setFeaturedOpinions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchOpinions();
    fetchFeaturedOpinions();
  }, [pagination.current]);

  const fetchOpinions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com/api/opinions?page=${pagination.current}&limit=9`);
      const data = await response.json();
      
      if (data.success) {
        setOpinions(data.data);
        setPagination(data.pagination);
      } else {
        setError('Failed to load opinions');
      }
    } catch (error) {
      console.error('Error fetching opinions:', error);
      setError('Failed to load opinions');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, current: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const featuredArticle = featuredOpinions[0];

  return (
    <>
      <Helmet>
        <title>5WH Opinion - Editorial & Analysis</title>
        <meta name="description" content="Read thoughtful analysis, editorial opinions, and commentary on current affairs, politics, culture, and society from the 5WH Media editorial team." />
      </Helmet>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        minHeight: '100vh',
        width: '100%'
      }}>
        <Container maxWidth="lg" sx={{ 
          py: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          width: '100%'
        }}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <Box sx={{ textAlign: 'center', mb: 8, width: '100%' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                color: '#2c2c2c',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              5WH Opinion
            </Typography>
            <Box sx={{ 
              height: '4px', 
              backgroundColor: '#c41e3a', 
              width: '100px', 
              mx: 'auto', 
              mb: 4 
            }} />
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                maxWidth: '800px', 
                mx: 'auto',
                lineHeight: 1.6,
                fontFamily: '"Georgia", "Times New Roman", serif',
              }}
            >
              Thoughtful analysis, editorial commentary, and diverse perspectives on the issues that shape our world
            </Typography>
          </Box>
        </motion.div>

        {error && (
          <Alert severity="error" sx={{ mb: 4, width: '100%', maxWidth: 'lg' }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, width: '100%' }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Featured Article */}
            {featuredArticle && (
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
                      transition: 'all 0.3s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        transform: 'translateY(-4px)',
                      }
                    }}
                    onClick={() => navigate(`/opinion/${featuredArticle.slug}`)}
                  >
                    <Grid container>
                      <Grid item xs={12} md={8}>
                        <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              label={featuredArticle.category}
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
                              lineHeight: 1.3,
                            }}
                          >
                            {featuredArticle.title}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 3,
                              lineHeight: 1.6,
                              color: '#555555',
                              fontFamily: '"Georgia", "Times New Roman", serif',
                            }}
                          >
                            {featuredArticle.excerpt}
                          </Typography>
                          <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              By {featuredArticle.author}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {featuredArticle.readTime}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Grid>
                      {featuredArticle.featuredImage && (
                        <Grid item xs={12} md={4}>
                          <CardMedia
                            component="img"
                            height="100%"
                            image={`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com${featuredArticle.featuredImage}`}
                            alt={featuredArticle.title}
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
                          transition={{ duration: 0.6, delay: 0.1 * index }}
                        >
                          <Card 
                            sx={{ 
                              height: '100%',
                              border: '1px solid #e0e0e0',
                              transition: 'all 0.3s ease-in-out',
                              cursor: 'pointer',
                              '&:hover': {
                                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                transform: 'translateY(-4px)',
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
                                  lineHeight: 1.5,
                                  color: '#555555',
                                  display: '-webkit-box',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 3,
                                  overflow: 'hidden',
                                  flexGrow: 1,
                                }}
                              >
                                {article.excerpt}
                              </Typography>
                              <Box sx={{ mt: 'auto', pt: 2 }}>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    By {article.author}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(article.publishedAt || article.createdAt)}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                  {article.readTime} • {article.views} views
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
                {pagination.pages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, width: '100%' }}>
                    <Pagination
                      count={pagination.pages}
                      page={pagination.current}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </Box>
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
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                width: '100%',
                maxWidth: 'lg'
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3,
                    color: '#2c2c2c',
                  }}
                >
                  Share Your Perspective
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    mb: 4,
                    maxWidth: 600,
                    mx: 'auto',
                    lineHeight: 1.6,
                  }}
                >
                  Have an opinion or perspective you'd like to share? We welcome thoughtful commentary and guest contributions 
                  from our community members and experts in various fields.
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/contact"
                  size="large"
                  sx={{
                    backgroundColor: '#c41e3a',
                    color: 'white',
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
          </Box>
        )}
        </Container>
      </Box>
    </>
  );
};

export default OpinionPage;
