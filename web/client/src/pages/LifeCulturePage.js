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
import {
  MenuBook,
  Event,
  Article,
  Star,
  LocationOn,
  CalendarToday,
  Person,
  Category,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

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

  // Dynamic content state
  const [bookRecommendations, setBookRecommendations] = useState([]);
  const [culturalEvents, setCulturalEvents] = useState([]);
  const [latestStories, setLatestStories] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [featuredEventsLoading, setFeaturedEventsLoading] = useState(true);
  const [booksError, setBooksError] = useState(null);
  const [eventsError, setEventsError] = useState(null);
  const [storiesError, setStoriesError] = useState(null);
  const [featuredEventsError, setFeaturedEventsError] = useState(null);

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
      fetchBookRecommendations();
      fetchCulturalEvents();
      fetchLatestStories();
      fetchFeaturedEvents();
    } else if (tabValue === 1) {
      fetchOpinions();
      fetchFeaturedOpinions();
    }
  }, [page, tabValue, opinionPagination.current]);

  const fetchLifeCultureContent = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from localStorage (admin controlled)
      const storedContent = localStorage.getItem('adminLifeCultureContent');
      if (storedContent) {
        const content = JSON.parse(storedContent);
        setArticles(content);
        setTotalPages(Math.ceil(content.length / 12));
      } else {
        setArticles([]);
        setTotalPages(1);
      }
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
      const response = await fetch(`http://localhost:5000/api/opinions?page=${opinionPagination.current}&limit=9`);
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
      const response = await fetch('http://localhost:5000/api/opinions/featured');
      const data = await response.json();
      
      if (data.success) {
        setFeaturedOpinions(data.data);
      }
    } catch (error) {
      console.error('Error fetching featured opinions:', error);
    }
  };

  const fetchBookRecommendations = () => {
    try {
      setBooksLoading(true);
      setBooksError(null);
      const storedBooks = localStorage.getItem('adminBookRecommendations');
      if (storedBooks) {
        setBookRecommendations(JSON.parse(storedBooks));
      } else {
        setBookRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching book recommendations:', error);
      setBooksError('Failed to load book recommendations');
      setBookRecommendations([]);
    } finally {
      setBooksLoading(false);
    }
  };

  const fetchCulturalEvents = () => {
    try {
      setEventsLoading(true);
      setEventsError(null);
      const storedEvents = localStorage.getItem('adminCulturalEvents');
      if (storedEvents) {
        setCulturalEvents(JSON.parse(storedEvents));
      } else {
        setCulturalEvents([]);
      }
    } catch (error) {
      console.error('Error fetching cultural events:', error);
      setEventsError('Failed to load cultural events');
      setCulturalEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchLatestStories = () => {
    try {
      setStoriesLoading(true);
      setStoriesError(null);
      const storedStories = localStorage.getItem('adminLatestStories');
      if (storedStories) {
        setLatestStories(JSON.parse(storedStories));
      } else {
        setLatestStories([]);
      }
    } catch (error) {
      console.error('Error fetching latest stories:', error);
      setStoriesError('Failed to load latest stories');
      setLatestStories([]);
    } finally {
      setStoriesLoading(false);
    }
  };

  const fetchFeaturedEvents = () => {
    try {
      setFeaturedEventsLoading(true);
      setFeaturedEventsError(null);
      const storedFeaturedEvents = localStorage.getItem('adminFeaturedEvents');
      if (storedFeaturedEvents) {
        setFeaturedEvents(JSON.parse(storedFeaturedEvents));
      } else {
        setFeaturedEvents([]);
      }
    } catch (error) {
      console.error('Error fetching featured events:', error);
      setFeaturedEventsError('Failed to load featured events');
      setFeaturedEvents([]);
    } finally {
      setFeaturedEventsLoading(false);
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

  // Only show real articles - no fake data fallbacks
  const displayArticles = articles;
  const displayStories = latestStories;
  const featuredOpinion = featuredOpinions[0];

  const renderLifeCultureContent = () => (
    <>
      {/* Book Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <MenuBook sx={{ fontSize: '2.5rem', color: '#c41e3a', mr: 2 }} />
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#2c2c2c',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Book Recommendations of the Day
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4, fontSize: '1.1rem' }}
          >
            Curated reading selections that celebrate our heritage and modern perspectives
          </Typography>
          
          {/* Loading and Error States */}
          {booksLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          )}
          
          {booksError && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {booksError}
            </Alert>
          )}
          
          {/* Books Grid */}
          {!booksLoading && !booksError && (
            <Grid container spacing={4}>
              {bookRecommendations.map((book) => (
                <Grid item xs={12} md={4} key={book.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                      }
                    }}
                    onClick={() => window.open(book.amazonLink, '_blank')}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip 
                          label={book.category} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#f0f8ff', 
                            color: '#1976d2',
                            fontWeight: 'bold'
                          }} 
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {book.source}
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                        {book.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Person sx={{ fontSize: '1rem', color: '#666', mr: 0.5 }} />
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 500 }}>
                          {book.author}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                        {book.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Published {book.publishedYear}
                        </Typography>
                        {book.rating && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Star sx={{ fontSize: '1rem', color: '#ff9800', mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                              {book.rating}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pt: 2,
                        borderTop: '1px solid #e0e0e0'
                      }}>
                        {book.price && (
                          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                            {book.price}
                          </Typography>
                        )}
                        <Button 
                          variant="contained" 
                          size="small"
                          sx={{ 
                            backgroundColor: '#ff9800',
                            '&:hover': { backgroundColor: '#f57c00' }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(book.amazonLink, '_blank');
                          }}
                        >
                          View on Amazon
                        </Button>
                      </Box>
                      
                      {book.isbn && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          ISBN: {book.isbn}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* No Books Message */}
          {!booksLoading && !booksError && bookRecommendations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MenuBook sx={{ fontSize: '4rem', color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No book recommendations available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check back soon for new book recommendations and reviews.
              </Typography>
            </Box>
          )}
        </Box>
      </motion.div>

      {/* Featured Cultural Events */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Event sx={{ fontSize: '2.5rem', color: '#c41e3a', mr: 2 }} />
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#2c2c2c',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Featured Cultural Events
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4, fontSize: '1.1rem' }}
          >
            Upcoming celebrations, exhibitions, and workshops to enrich your cultural experience
          </Typography>
          
          {/* Loading and Error States */}
          {featuredEventsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          )}
          
          {featuredEventsError && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {featuredEventsError}
            </Alert>
          )}
          
          {/* Events Grid */}
          {!featuredEventsLoading && !featuredEventsError && featuredEvents.length > 0 && (
            <Grid container spacing={3}>
              {featuredEvents.map((event) => (
                <Grid item xs={12} md={4} key={event.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      border: '1px solid #e9ecef',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(196, 30, 58, 0.1)',
                        borderColor: '#c41e3a',
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={event.image}
                      alt={event.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Category sx={{ fontSize: '1rem', color: '#c41e3a', mr: 0.5 }} />
                        <Chip 
                          label={event.type} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#c41e3a', 
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2c2c2c' }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                        {event.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ fontSize: '0.875rem', color: '#c41e3a', mr: 0.5 }} />
                          <Typography variant="caption" sx={{ color: '#c41e3a', fontWeight: 'bold' }}>
                            {event.date}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {event.location}
                          </Typography>
                        </Box>
                        {event.ticketPrice && (
                          <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold', mt: 0.5 }}>
                            {event.ticketPrice}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* No Events Message */}
          {!featuredEventsLoading && !featuredEventsError && featuredEvents.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Event sx={{ fontSize: '4rem', color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No featured events available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check back soon for upcoming featured cultural events and celebrations.
              </Typography>
            </Box>
          )}
        </Box>
      </motion.div>

      {/* Lifestyle Articles Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Article sx={{ fontSize: '2.5rem', color: '#c41e3a', mr: 2 }} />
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#2c2c2c',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Latest Stories
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4, fontSize: '1.1rem' }}
          >
            Stories that bridge tradition and modernity in our daily lives
          </Typography>

          {/* Loading State */}
          {storiesLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress color="primary" />
            </Box>
          )}

          {/* Error State */}
          {storiesError && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {storiesError}
            </Alert>
          )}

          {/* Content Grid */}
          {!storiesLoading && !storiesError && (
            <>
              <Grid container spacing={3}>
                {displayStories.map((story, index) => (
                  <Grid item xs={12} sm={6} md={4} key={story.id}>
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
                          sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                          onClick={() => navigate(`/life-culture/${story.slug || story.id}`)}
                        >
                          {story.image && (
                            <CardMedia
                              component="img"
                              height="200"
                              image={story.image}
                              alt={story.title}
                              sx={{ objectFit: 'cover' }}
                            />
                          )}
                          <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Category sx={{ fontSize: '1rem', color: '#c41e3a', mr: 0.5 }} />
                              <Chip 
                                label={story.category || 'Story'} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: '#c41e3a', 
                                  color: 'white',
                                  fontWeight: 'bold'
                                }} 
                              />
                            </Box>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600, 
                                mb: 2, 
                                color: '#2c2c2c',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {story.title}
                            </Typography>
                            {story.author && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Person sx={{ fontSize: '1rem', color: '#c41e3a', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  By {story.author}
                                </Typography>
                              </Box>
                            )}
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.5 
                              }}
                            >
                              {story.excerpt}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {/* No Stories Message */}
              {displayStories.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Article sx={{ fontSize: '4rem', color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No stories available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Check back soon for new lifestyle stories and articles.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </motion.div>
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
                      image={`http://localhost:5000${featuredOpinion.featuredImage}`}
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
                              image={`http://localhost:5000${article.featuredImage}`}
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
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                color: '#2c2c2c',
                mb: 2,
                fontSize: { xs: '2rem', md: '2.6rem' },
                textAlign: 'center'
              }}
            >
              Life & Culture
            </Typography>
            <Box 
              sx={{ 
                height: 3, 
                backgroundColor: '#c41e3a', 
                width: 80, 
                mx: 'auto', 
                mb: 4,
                borderRadius: '1.5px'
              }} 
            />
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto', 
                mb: 5,
                fontWeight: 400,
                lineHeight: 1.6,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                textAlign: 'center'
              }}
            >
              Discover stories that celebrate tradition, explore modern living, and bridge the gap between heritage and contemporary life.
            </Typography>
          </motion.div>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              centered
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  minWidth: 120,
                },
                '& .Mui-selected': {
                  color: '#c41e3a !important',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#c41e3a',
                  height: 3,
                },
              }}
            >
              <Tab label="Lifestyle & Culture" />
              <Tab label="5WH Opinion" />
            </Tabs>
          </Box>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && renderLifeCultureContent()}
        {tabValue === 1 && renderOpinionContent()}
      </Container>
    </>
  );
};

export default LifeCulturePage;
