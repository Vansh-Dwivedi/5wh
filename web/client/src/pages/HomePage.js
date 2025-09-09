import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
} from '@mui/material';
import { ExpandMore, ExpandLess, PlayArrow, Headphones } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
// Using aggregated endpoint instead of multiple parallel queries
import { homeAPI } from '../services/api';
import CombinedDashboard from '../components/CombinedDashboard';
import NewsSlider from '../components/NewsSlider';

const HomePage = () => {
  const [showAllPodcasts, setShowAllPodcasts] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const scrollContainerRef = useRef(null);

  // Auto-scroll function for last card hover
  const handleCardHover = (index, totalItems) => {
    if (scrollContainerRef.current && index >= totalItems - 2) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.scrollWidth - container.clientWidth;
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCardLeave = () => {
    // Optional: scroll back to show more cards when hover ends
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // If we're at the end, scroll back slightly to show more cards
      if (currentScroll >= maxScroll - 50) {
        container.scrollTo({
          left: Math.max(0, maxScroll - 200),
          behavior: 'smooth'
        });
      }
    }
  };

  const { data: homeData, isLoading, isError } = useQuery({
    queryKey: ['home-content'],
    queryFn: () => homeAPI.get().then(r => r.data)
  });

  const sliderNews = homeData?.topHeadlines || [];
  const latestPodcasts = homeData?.latestPodcasts || [];
  const latestVideos = homeData?.latestVideos || [];

  return (
    <>
      <Helmet>
        <title>5WH Media - News, Podcasts & Videos</title>
        <meta name="description" content="Your trusted source for news, analysis, and multimedia content. Politics, culture, and global affairs coverage." />
        <meta name="keywords" content="news, politics, podcasts, videos, analysis, 5WH Media" />
      </Helmet>

      {/* Hero Section - News Slider */}
      {isLoading && (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="h5">Loading content...</Typography>
        </Box>
      )}
      {isError && (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="h6" color="error">Failed to load homepage content</Typography>
        </Box>
      )}
      {!isLoading && !isError && (
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#2c2c2c',
          color: 'white',
          borderBottom: '4px solid #c41e3a',
          minHeight: { xs: '450px', md: '550px' }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <NewsSlider news={sliderNews} />
        </motion.div>
  </Box> )}

      {/* Combined Dashboard Section */}
      <CombinedDashboard />

      {/* Main Content with Sidebar Layout */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content Area */}
          <Grid item xs={12} lg={9}>
            {/* Latest News section removed */}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={3}>
            <Box sx={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 3 }}>

            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Latest Content Gallery Section */}
      <Box sx={{ backgroundColor: '#f8f8f8', py: 8 }}>
        <Container maxWidth="xl">
          {/* Section Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: '#2c2c2c',
                mb: 2,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Latest Content Gallery
            </Typography>
            <Box sx={{
              height: '3px',
              backgroundColor: '#c41e3a',
              width: '80px',
              mx: 'auto',
              mb: 3
            }} />
            <Typography
              variant="body1"
              sx={{
                color: '#666666',
                maxWidth: '600px',
                mx: 'auto',
                fontSize: '1rem',
                lineHeight: 1.6,
              }}
            >
              Explore our comprehensive collection of podcasts and videos
            </Typography>
          </Box>

          {/* Podcasts Gallery */}
          <Box sx={{ mb: 8 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Headphones sx={{ fontSize: 40, color: '#c41e3a' }} />
                  <Typography 
                    variant="h3" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#2c2c2c',
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    Podcast Gallery
                  </Typography>
                  <Chip 
                    label={`${latestPodcasts.length} Episodes`}
                    sx={{ 
                      backgroundColor: '#c41e3a', 
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                {latestPodcasts.length > 4 && (
                  <Button
                    onClick={() => setShowAllPodcasts(!showAllPodcasts)}
                    variant="outlined"
                    sx={{
                      borderColor: '#c41e3a',
                      color: '#c41e3a',
                      '&:hover': {
                        backgroundColor: '#c41e3a',
                        color: 'white',
                      }
                    }}
                    startIcon={showAllPodcasts ? <ExpandLess /> : <ExpandMore />}
                  >
                    {showAllPodcasts ? 'Show Less' : 'View All'}
                  </Button>
                )}
              </Box>

              <Grid container spacing={3}>
                {(showAllPodcasts ? latestPodcasts : latestPodcasts.slice(0, 4)).map((podcast, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={podcast._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onMouseEnter={() => handleCardHover(index, latestPodcasts.length)}
                      onMouseLeave={handleCardLeave}
                    >
                      <Card
                        component={RouterLink}
                        to={`/audio/${podcast.slug}`}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="180"
                          image={podcast.featuredImage?.url || 'https://via.placeholder.com/300x200?text=Podcast'}
                          alt={podcast.title}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Podcast';
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: 'bold',
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              minHeight: '3em',
                              fontSize: '0.95rem',
                              lineHeight: 1.3
                            }}
                          >
                            {podcast.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              mb: 2,
                              minHeight: '2.5em'
                            }}
                          >
                            {podcast.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                            <Chip 
                              label={podcast.category}
                              size="small"
                              sx={{ 
                                backgroundColor: '#f5f5f5',
                                fontSize: '0.7rem'
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {podcast.duration || '25 min'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {!isLoading && latestPodcasts.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Headphones sx={{ fontSize: 64, color: '#c41e3a', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No podcasts available yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stay tuned for exciting audio content!
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Videos Gallery */}
          <Box>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PlayArrow sx={{ fontSize: 40, color: '#c41e3a' }} />
                  <Typography 
                    variant="h3" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#2c2c2c',
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    Video Gallery
                  </Typography>
                  <Chip 
                    label={`${latestVideos.length} Videos`}
                    sx={{ 
                      backgroundColor: '#c41e3a', 
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                {latestVideos.length > 4 && (
                  <Button
                    onClick={() => setShowAllVideos(!showAllVideos)}
                    variant="outlined"
                    sx={{
                      borderColor: '#c41e3a',
                      color: '#c41e3a',
                      '&:hover': {
                        backgroundColor: '#c41e3a',
                        color: 'white',
                      }
                    }}
                    startIcon={showAllVideos ? <ExpandLess /> : <ExpandMore />}
                  >
                    {showAllVideos ? 'Show Less' : 'View All'}
                  </Button>
                )}
              </Box>

              <Grid container spacing={3}>
                {(showAllVideos ? latestVideos : latestVideos.slice(0, 4)).map((video, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onMouseEnter={() => handleCardHover(index, latestVideos.length)}
                      onMouseLeave={handleCardLeave}
                    >
                      <Card
                        component={RouterLink}
                        to={`/videos/${video.slug}`}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="180"
                            image={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                            alt={video.title}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=Video';
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              borderRadius: '50%',
                              width: 48,
                              height: 48,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: '#c41e3a',
                                transform: 'translate(-50%, -50%) scale(1.1)',
                              }
                            }}
                          >
                            <PlayArrow sx={{ color: 'white', fontSize: 24 }} />
                          </Box>
                        </Box>
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: 'bold',
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              minHeight: '3em',
                              fontSize: '0.95rem',
                              lineHeight: 1.3
                            }}
                          >
                            {video.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              mb: 2,
                              minHeight: '2.5em'
                            }}
                          >
                            {video.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                            <Chip 
                              label={video.category}
                              size="small"
                              sx={{ 
                                backgroundColor: '#f5f5f5',
                                fontSize: '0.7rem'
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {video.duration || '10 min'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {!isLoading && latestVideos.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <PlayArrow sx={{ fontSize: 64, color: '#c41e3a', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No videos available yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stay tuned for exciting video content!
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Santokh Singh Dhir Section */}
      <Box sx={{ 
        bgcolor: '#f8f9fa', 
        py: { xs: 8, md: 12 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, #c41e3a 50%, transparent 100%)',
        }
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: '2.2rem', md: '2.8rem' },
                  color: '#1a1a1a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Santokh Singh Dhir Ji
              </Typography>
              <Box sx={{ 
                height: 4, 
                backgroundColor: '#c41e3a', 
                width: 120, 
                mx: 'auto',
                borderRadius: '2px',
                boxShadow: '0 2px 4px rgba(196, 30, 58, 0.3)'
              }} />
            </Box>
          </motion.div>

          <Grid container spacing={6} alignItems="stretch" sx={{ mb: 8 }}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                style={{ height: '100%' }}
              >
                <Card sx={{ 
                  border: '1px solid #e9ecef', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                  borderRadius: 3, 
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  }
                }}>
                  <CardMedia
                    component="img"
                    src="https://5whmedia.com/wp-content/uploads/2025/08/Santokh-Ji.webp"
                    alt="Santokh Singh Dhir"
                    sx={{ 
                      width: '100%', 
                      height: { xs: 280, md: 320 }, 
                      objectFit: 'cover',
                      filter: 'brightness(0.95) contrast(1.05)',
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                    pointerEvents: 'none'
                  }} />
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{ height: '100%' }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3, 
                  height: '100%', 
                  justifyContent: 'center',
                  px: { xs: 2, md: 3 },
                  py: 4
                }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1.1rem', md: '1.15rem' }, 
                      lineHeight: 1.7, 
                      color: '#2d3748', 
                      fontFamily: '"Inter", "Segoe UI", sans-serif',
                      fontWeight: 400,
                      textAlign: 'justify'
                    }}
                  >
                    <Box component="strong" sx={{ color: '#c41e3a', fontSize: '1.1em' }}>Santokh Singh Dhir</Box> (1920–2010) was a renowned Punjabi writer and poet known for his deep insight into social issues and his
                    contribution to modern Punjabi literature. Born in Dadheri village in Punjab, he started his life as a tailor and briefly worked as a
                    journalist before dedicating himself fully to writing.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1.1rem', md: '1.15rem' }, 
                      lineHeight: 1.7, 
                      color: '#2d3748', 
                      fontFamily: '"Inter", "Segoe UI", sans-serif',
                      fontWeight: 400,
                      textAlign: 'justify'
                    }}
                  >
                    His works often explored themes of social justice, class struggle, and the everyday lives of common people. Notable among his story
                    collections is <Box component="em" sx={{ color: '#c41e3a', fontStyle: 'italic', fontWeight: 500 }}>Pakhi</Box> (1991), which earned him the prestigious Sahitya Akademi Award in 1996.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1.1rem', md: '1.15rem' }, 
                      lineHeight: 1.7, 
                      color: '#2d3748', 
                      fontFamily: '"Inter", "Segoe UI", sans-serif',
                      fontWeight: 400,
                      textAlign: 'justify'
                    }}
                  >
                    Dhir's literary style combined realism with poetic sensitivity, making his stories both impactful and thought‑provoking. He is remembered
                    not only as a prolific writer but also as a progressive thinker whose writings gave voice to the marginalized.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>

          {/* Colors of Dhir's Pen — Poems as cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 3, 
                  fontSize: { xs: '2rem', md: '2.4rem' }, 
                  color: '#1a1a1a',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2
                }}
              >
                The Colors of Dhir Sahib's Pen
              </Typography>
              <Box sx={{ 
                height: 3, 
                backgroundColor: '#c41e3a', 
                width: 100, 
                mx: 'auto',
                borderRadius: '1.5px',
                boxShadow: '0 1px 3px rgba(196, 30, 58, 0.3)'
              }} />
              <Typography 
                variant="body1" 
                sx={{ 
                  mt: 2, 
                  color: '#6b7280', 
                  fontSize: '1.1rem',
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                Explore the literary masterpieces that shaped modern Punjabi literature
              </Typography>
            </Box>
          </motion.div>
          
          <Grid container spacing={4} justifyContent="center">
            {[
              { t: 'Saver Hon Tak', s: 'saver-hon-tak' },
              { t: 'Bhet Wali Gal', s: 'bhet-wali-gal' },
              { t: 'Koi Ik Sawar', s: 'koi-ik-sawar' },
              { t: 'Mamla', s: 'mamla' },
              { t: 'Jugni', s: 'jugni' },
              { t: 'Ik Veerangana', s: 'ik-veerangana' },
              { t: 'Sanjhi Kandh', s: 'sanjhi-kandh' },
              { t: 'Mera Ujria Guandhi', s: 'mera-ujria-guandhi' },
              { t: 'Aapna Desh', s: 'aapna-desh' },
              { t: 'Kalyug', s: 'kalyug' },
              { t: 'Tai Nihali', s: 'tai-nihali' },
              { t: 'Mirgi', s: 'mirgi' },
            ].map((p, idx) => (
              <Grid key={idx} item xs={12} sm={6} md={4} lg={3}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.05 * idx }}
                >
                  <Card 
                    sx={{ 
                      border: '1px solid #e9ecef', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
                      borderRadius: 3, 
                      height: '100%', 
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 12px 40px rgba(196, 30, 58, 0.12)',
                        borderColor: '#c41e3a',
                        '& .story-title': {
                          color: '#c41e3a',
                        }
                      }
                    }}
                    onClick={() => window.open(`https://5whmedia.com/santokh-singh-dhir/${p.s}`, '_blank')}
                  >
                    <CardContent sx={{ p: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px' }}>
                      <Typography 
                        variant="subtitle1" 
                        className="story-title"
                        sx={{ 
                          fontWeight: 600, 
                          color: '#1a1a1a',
                          fontSize: '1.1rem',
                          lineHeight: 1.3,
                          transition: 'color 0.3s ease',
                          fontFamily: '"Inter", "Segoe UI", sans-serif'
                        }}
                      >
                        {p.t}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
