import React, { useState, useEffect, useRef } from 'react';
import { cleanArticlesSources, SourceDisplay } from '../services/api';
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
import { newsAPI, podcastsAPI, videosAPI } from '../services/api';
import CombinedDashboard from '../components/CombinedDashboard';
import AdvertisingSidebar from '../components/layout/AdvertisingSidebar';
import NewsSlider from '../components/NewsSlider';
import Advertisement from '../components/Advertisement';
import { advertisementConfig, handleAdClick } from '../config/advertisements';

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

  // Fetch latest news for hero section
  const { data: latestNews = [] } = useQuery({
    queryKey: ['latest-news'],
    queryFn: () => newsAPI.getAll({ limit: 1, sort: '-publishedAt' }),
    select: (data) => data.data.news || [],
  });

  // Fetch news for slider (10 latest news)
  const { data: sliderNews = [] } = useQuery({
    queryKey: ['slider-news'],
    queryFn: () => newsAPI.getAll({ limit: 10, sort: '-publishedAt' }),
    select: (data) => data.data.news || [],
  });

  // Fetch featured content
  const { data: featuredNews = [] } = useQuery({
    queryKey: ['featured-news'],
    queryFn: () => newsAPI.getAll({ featured: true, limit: 8 }),
    select: (data) => data.data.news || [],
  });

  // Fetch latest 10 news as fallback for featured section
  const { data: fallbackNews = [] } = useQuery({
    queryKey: ['fallback-news'],
    queryFn: () => newsAPI.getAll({ limit: 10, sort: '-publishedAt' }),
    select: (data) => data.data.news || [],
    enabled: featuredNews.length === 0, // Only fetch if no featured news
  });

  const { data: latestPodcasts = [] } = useQuery({
    queryKey: ['latest-podcasts'],
    queryFn: () => podcastsAPI.getAll({ limit: 6 }),
    select: (data) => data.data.podcasts || [],
  });

  const { data: latestVideos = [] } = useQuery({
    queryKey: ['latest-videos'],
    queryFn: () => videosAPI.getAll({ limit: 6 }),
    select: (data) => data.data.videos || [],
  });

  return (
    <>
      <Helmet>
        <title>5WH Media - News, Podcasts & Videos</title>
        <meta name="description" content="Your trusted source for news, analysis, and multimedia content. Politics, culture, and global affairs coverage." />
        <meta name="keywords" content="news, politics, podcasts, videos, analysis, 5WH Media" />
      </Helmet>

      {/* Hero Section - News Slider */}
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
      </Box>

      {/* Combined Dashboard Section */}
      <CombinedDashboard />

      {/* Main Content with Sidebar Layout */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content Area */}
          <Grid item xs={12} lg={9}>
            {/* Featured News Section - Newspaper style */}
            <Box sx={{ py: 4 }}>
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
                  {featuredNews.length > 0 ? 'Featured News' : 'Latest News'}
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
                  {featuredNews.length > 0 
                    ? 'Stay informed with our most important and trending news stories'
                    : 'Stay up-to-date with our most recent news and developments'
                  }
                </Typography>
              </Box>

        {/* Horizontal scrollable grid */}
        <Box 
          ref={scrollContainerRef}
          sx={{ 
            display: 'flex', 
            gap: 2, 
            overflowX: 'auto', 
            pb: 2,
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c41e3a',
              borderRadius: 4,
            }
          }}
        >
          {(featuredNews.length > 0 ? featuredNews : fallbackNews).map((article, index) => (
            <motion.div
              key={article._id || index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              onMouseEnter={() => handleCardHover(index, (featuredNews.length > 0 ? featuredNews : fallbackNews).length)}
              onMouseLeave={handleCardLeave}
            >
              <Card
                component={RouterLink}
                to={`/news/${article.slug}`}
                sx={{
                  width: '280px', // Small width initially
                  height: '420px', // Tall height
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0, // Prevent shrinking in flex container
                  '&:hover': {
                    width: '420px', // Expand width on hover
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    zIndex: 10,
                    '& .card-content': {
                      opacity: 1,
                      transform: 'translateX(0)',
                    },
                    '& .card-overlay': {
                      opacity: 0.8,
                    },
                    '& .card-title': {
                      WebkitLineClamp: 4,
                    },
                    '& .card-excerpt': {
                      WebkitLineClamp: 4,
                      opacity: 1,
                    }
                  },
                }}
              >
                {/* Background Image */}
                <Box sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 1
                }}>
                  {article.featuredImage?.url ? (
                    <CardMedia
                      component="img"
                      image={article.featuredImage.url.startsWith('http') ? article.featuredImage.url : `http://localhost:5000${article.featuredImage.url}`}
                      alt={article.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)';
                        e.target.parentElement.style.display = 'flex';
                        e.target.parentElement.style.alignItems = 'center';
                        e.target.parentElement.style.justifyContent = 'center';
                        e.target.parentElement.innerHTML = '<div style="color: white; text-align: center; font-size: 4rem; opacity: 0.9;">📰</div>';
                      }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: '100%', 
                        background: 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      {/* News Icon */}
                      <Box sx={{ 
                        fontSize: '4rem', 
                        color: 'white', 
                        opacity: 0.9,
                        mb: 1,
                        zIndex: 2,
                        position: 'relative'
                      }}>
                        📰
                      </Box>
                      
                      {/* Placeholder Text */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'white', 
                          opacity: 0.8,
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          letterSpacing: '2px',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          zIndex: 2,
                          position: 'relative'
                        }}
                      >
                        News Article
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Dark Overlay */}
                <Box 
                  className="card-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, rgba(44,44,44,0.9) 0%, rgba(196,30,58,0.8) 100%)',
                    zIndex: 2,
                    opacity: 0.6,
                    transition: 'opacity 0.4s ease',
                  }}
                />

                {/* Category Badge */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  left: 16, 
                  zIndex: 4 
                }}>
                  <Chip
                    label={featuredNews.length > 0 ? article.category : "LATEST"}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      height: '24px',
                      textTransform: 'uppercase',
                      backgroundColor: featuredNews.length > 0 ? '#c41e3a' : '#2c2c2c',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  />
                </Box>

                {/* Content */}
                <CardContent 
                  className="card-content"
                  sx={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    p: 3,
                    zIndex: 3,
                    color: 'white',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    transform: 'translateX(-10px)',
                    opacity: 0.9,
                    transition: 'all 0.4s ease',
                  }}
                >
                  {/* Date */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      color: '#ffffff',
                      opacity: 0.8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Typography>

                  {/* Title */}
                  <Typography
                    className="card-title"
                    variant="h6"
                    sx={{
                      mb: 1,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      lineHeight: 1.3,
                      color: 'white',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '2.6em', // Fixed height to prevent glitching
                      maxHeight: '2.6em',
                      transition: 'all 0.4s ease',
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                    }}
                  >
                    {cleanContent(article.title)}
                  </Typography>

                  {/* Excerpt - Hidden initially, shown on hover */}
                  <Typography
                    className="card-excerpt"
                    variant="body2"
                    sx={{
                      lineHeight: 1.4,
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.9)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      opacity: 0,
                      minHeight: '4.2em', // Fixed height to prevent layout shift
                      maxHeight: '4.2em',
                      transition: 'all 0.4s ease',
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                    }}
                  >
                    {cleanContent(article.excerpt || article.content?.substring(0, 150) + '...' || 'Read this article to learn more about this news story and its implications.')}
                  </Typography>

                  {/* Read More Button - Appears on hover */}
                  <Box sx={{ 
                    mt: 2,
                    opacity: 0,
                    transform: 'translateY(10px)',
                    transition: 'all 0.4s ease',
                    '.card-content:hover &': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    }
                  }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        px: 2,
                        '&:hover': {
                          borderColor: '#c41e3a',
                          backgroundColor: '#c41e3a',
                          color: 'white',
                        }
                      }}
                    >
                      Read More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={3}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <AdvertisingSidebar />
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
                    endIcon={showAllPodcasts ? <ExpandLess /> : <ExpandMore />}
                    sx={{
                      borderColor: '#c41e3a',
                      color: '#c41e3a',
                      '&:hover': {
                        borderColor: '#a01729',
                        backgroundColor: 'rgba(196, 30, 58, 0.1)'
                      }
                    }}
                  >
                    {showAllPodcasts ? 'Show Less' : 'View All'}
                  </Button>
                )}
              </Box>
            
            {latestPodcasts.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                <Typography sx={{ fontSize: '4rem', mb: 2 }}>🎧</Typography>
                <Typography variant="h5" gutterBottom>
                  No Podcasts Available
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  We're working on creating amazing podcast content for you. Check back soon!
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {latestPodcasts.slice(0, 8).map((podcast, index) => (
                  <Grid item xs={12} sm={6} lg={4} xl={3} key={podcast._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease-in-out',
                          cursor: 'pointer',
                          borderRadius: 3,
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                            '& .podcast-overlay': {
                              opacity: 1
                            }
                          }
                        }}
                        component={RouterLink}
                        to={`/audio/${podcast.slug}`}
                        style={{ textDecoration: 'none' }}
                      >
                        {/* Podcast Thumbnail */}
                        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                          {podcast.thumbnail?.url ? (
                            <CardMedia
                              component="img"
                              height="220"
                              image={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${podcast.thumbnail.url}`}
                              alt={podcast.thumbnail?.alt || podcast.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.style.background = 'linear-gradient(135deg, #ff6b35 0%, #c41e3a 50%, #8b0000 100%)';
                                e.target.parentElement.style.display = 'flex';
                                e.target.parentElement.style.alignItems = 'center';
                                e.target.parentElement.style.justifyContent = 'center';
                                e.target.parentElement.style.height = '220px';
                                e.target.parentElement.innerHTML = '<div style="color: white; text-align: center; font-size: 4rem; opacity: 0.9;">🎙️</div>';
                              }}
                              sx={{ 
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                            />
                          ) : (
                            <CardMedia
                              component="div"
                              sx={{
                                height: 220,
                                background: 'linear-gradient(135deg, #ff6b35 0%, #c41e3a 50%, #8b0000 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                              }}
                            >
                              {/* Podcast Icon */}
                              <Box sx={{ 
                                fontSize: '4rem', 
                                color: 'white', 
                                opacity: 0.9,
                                textAlign: 'center'
                              }}>
                                🎙️
                              </Box>
                            </CardMedia>
                          )}
                          
                          {/* Audio Badge */}
                          <Chip
                            label="AUDIO"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              backgroundColor: '#c41e3a',
                              color: 'white',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}
                          />

                          {/* Play Button Overlay */}
                          <Box
                            className="podcast-overlay"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.3s ease'
                            }}
                          >
                            <Box
                              sx={{
                                backgroundColor: 'rgba(196, 30, 58, 0.9)',
                                color: 'white',
                                width: 70,
                                height: 70,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                '&:hover': {
                                  backgroundColor: 'rgba(196, 30, 58, 1)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              ▶
                            </Box>
                          </Box>

                          {/* Date Badge */}
                          {podcast.publishedAt && (
                            <Chip
                              label={new Date(podcast.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>

                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          {/* Title */}
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            gutterBottom
                            sx={{ 
                              fontWeight: 'bold',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '3.2em'
                            }}
                          >
                            {podcast.title}
                          </Typography>

                          {/* Description */}
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '4.5em'
                            }}
                          >
                            {podcast.description}
                          </Typography>

                          {/* Podcast Stats */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            {podcast.publishedAt && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(podcast.publishedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>

                          {/* Action Button */}
                          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                            <Button
                              variant="contained"
                              size="small"
                              fullWidth
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                backgroundColor: '#c41e3a',
                                '&:hover': {
                                  backgroundColor: '#a01729'
                                }
                              }}
                            >
                              Listen Now
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
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
                    endIcon={showAllVideos ? <ExpandLess /> : <ExpandMore />}
                    sx={{
                      borderColor: '#c41e3a',
                      color: '#c41e3a',
                      '&:hover': {
                        borderColor: '#a01729',
                        backgroundColor: 'rgba(196, 30, 58, 0.1)'
                      }
                    }}
                  >
                    {showAllVideos ? 'Show Less' : 'View All'}
                  </Button>
                )}
              </Box>
            
            {latestVideos.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                <Typography sx={{ fontSize: '4rem', mb: 2 }}>📹</Typography>
                <Typography variant="h5" gutterBottom>
                  No Videos Available
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  We're working on creating amazing video content for you. Check back soon!
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {latestVideos.slice(0, 8).map((video, index) => (
                  <Grid item xs={12} sm={6} lg={4} xl={3} key={video._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease-in-out',
                          cursor: 'pointer',
                          borderRadius: 3,
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                            '& .video-overlay': {
                              opacity: 1
                            }
                          }
                        }}
                        component={RouterLink}
                        to={`/videos/${video.slug}`}
                        style={{ textDecoration: 'none' }}
                      >
                        {/* Video Thumbnail */}
                        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                          {video.thumbnail?.url ? (
                            <CardMedia
                              component="img"
                              height="220"
                              image={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${video.thumbnail.url}`}
                              alt={video.thumbnail?.alt || video.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.style.background = 'linear-gradient(135deg, #ff4081 0%, #c41e3a 50%, #8b0000 100%)';
                                e.target.parentElement.style.display = 'flex';
                                e.target.parentElement.style.alignItems = 'center';
                                e.target.parentElement.style.justifyContent = 'center';
                                e.target.parentElement.style.height = '220px';
                                e.target.parentElement.innerHTML = '<div style="color: white; text-align: center; font-size: 4rem; opacity: 0.9;">🎬</div>';
                              }}
                              sx={{ 
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                            />
                          ) : (
                            <Box 
                              sx={{ 
                                height: '220px',
                                background: 'linear-gradient(135deg, #ff4081 0%, #c41e3a 50%, #8b0000 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Box sx={{ 
                                fontSize: '4rem', 
                                color: 'white', 
                                opacity: 0.9,
                                textAlign: 'center'
                              }}>
                                🎬
                              </Box>
                            </Box>
                          )}
                          
                          {/* Video Badge */}
                          <Chip
                            label="VIDEO"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              backgroundColor: '#c41e3a',
                              color: 'white',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}
                          />

                          {/* Play Button Overlay */}
                          <Box
                            className="video-overlay"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.3s ease'
                            }}
                          >
                            <Box
                              sx={{
                                backgroundColor: 'rgba(196, 30, 58, 0.9)',
                                color: 'white',
                                width: 70,
                                height: 70,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                '&:hover': {
                                  backgroundColor: 'rgba(196, 30, 58, 1)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              ▶
                            </Box>
                          </Box>

                          {/* Date Badge */}
                          {video.publishedAt && (
                            <Chip
                              label={new Date(video.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>

                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          {/* Title */}
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            gutterBottom
                            sx={{ 
                              fontWeight: 'bold',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '3.2em'
                            }}
                          >
                            {video.title}
                          </Typography>

                          {/* Description */}
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '4.5em'
                            }}
                          >
                            {video.description}
                          </Typography>

                          {/* Video Stats */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            {video.publishedAt && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(video.publishedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>

                          {/* Action Button */}
                          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                            <Button
                              variant="contained"
                              size="small"
                              fullWidth
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                backgroundColor: '#c41e3a',
                                '&:hover': {
                                  backgroundColor: '#a01729'
                                }
                              }}
                            >
                              Watch Now
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
            </Paper>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
