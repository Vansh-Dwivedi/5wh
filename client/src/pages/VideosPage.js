import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  Divider,
  Tabs,
  Tab,
  Badge,
  Avatar
} from '@mui/material';
import {
  PlayArrow,
  Schedule,
  Visibility,
  Share,
  Bookmark,
  BookmarkBorder,
  FilterList,
  Videocam,
  TrendingUp,
  LiveTv,
  Article
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { videosAPI, MEDIA_BASE_URL } from '../services/api';
import AdvertisingSidebar from '../components/layout/AdvertisingSidebar';

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [bookmarkedVideos, setBookmarkedVideos] = useState(new Set());

  const categories = [
    { value: 'all', label: 'All Videos', icon: <Videocam /> },
    { value: 'breaking', label: 'Breaking News', icon: <LiveTv /> },
    { value: 'interviews', label: 'Interviews', icon: <Article /> },
    { value: 'analysis', label: 'Analysis', icon: <TrendingUp /> },
    { value: 'documentaries', label: 'Documentaries', icon: <Videocam /> },
    { value: 'live', label: 'Live', icon: <LiveTv /> }
  ];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videosAPI.getAll();
      setVideos(response.data.videos || []);
    } catch (err) {
      setError('Failed to load videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const handleBookmark = (videoId) => {
    const newBookmarks = new Set(bookmarkedVideos);
    if (newBookmarks.has(videoId)) {
      newBookmarks.delete(videoId);
    } else {
      newBookmarks.add(videoId);
    }
    setBookmarkedVideos(newBookmarks);
  };

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Videos - 5WH Media</title>
        <meta name="description" content="Watch the latest videos covering breaking news, interviews, analysis, and documentaries." />
        <meta name="keywords" content="videos, news, interviews, documentaries, analysis, breaking news, 5WH Media" />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content Area */}
          <Grid item xs={12} lg={9}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: 'black',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              mb: 2
            }}
          >
            Video Gallery
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Explore our comprehensive video collection featuring breaking news, exclusive interviews, and in-depth analysis
          </Typography>
          <Divider sx={{ maxWidth: 200, mx: 'auto' }} />
        </Box>

        {/* Category Tabs */}
        <Paper 
          elevation={2} 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}
        >
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 60,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '0.95rem'
              }
            }}
          >
            {categories.map((category) => (
              <Tab
                key={category.value}
                value={category.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {category.icon}
                    {category.label}
                    <Badge 
                      badgeContent={
                        category.value === 'all' 
                          ? videos.length 
                          : videos.filter(v => v.category === category.value).length
                      } 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {filteredVideos.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
            <Videocam sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Videos Available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {selectedCategory === 'all' 
                ? "We're working on creating amazing video content for you. Check back soon!"
                : `No videos found in the ${categories.find(c => c.value === selectedCategory)?.label} category.`
              }
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredVideos.map((video) => (
              <Grid item xs={12} sm={6} lg={4} xl={3} key={video._id}>
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
                  onMouseEnter={() => setHoveredVideo(video._id)}
                  onMouseLeave={() => setHoveredVideo(null)}
                >
                  {/* Video Thumbnail */}
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    {video.thumbnail?.url ? (
                      <CardMedia
                        component="img"
                        height="220"
                        image={`${MEDIA_BASE_URL}${video.thumbnail.url}`}
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
                    
                    {/* Duration Badge */}
                    <Chip
                      icon={<Schedule />}
                      label={video.duration || formatDuration(video.durationSeconds)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        fontWeight: 'bold'
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
                      <IconButton
                        component={Link}
                        to={`/videos/${video.slug}`}
                        sx={{
                          backgroundColor: 'rgba(233, 30, 99, 0.9)',
                          color: 'white',
                          width: 70,
                          height: 70,
                          '&:hover': {
                            backgroundColor: 'rgba(233, 30, 99, 1)',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <PlayArrow sx={{ fontSize: 40 }} />
                      </IconButton>
                    </Box>

                    {/* Category Badge */}
                    <Chip
                      label={video.category?.toUpperCase()}
                      size="small"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    />

                    {/* Quality Badge */}
                    {video.quality && (
                      <Chip
                        label={video.quality}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(76, 175, 80, 0.9)',
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatViews(video.views || 0)}
                        </Typography>
                      </Box>
                      {video.publishedAt && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(video.publishedAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Button
                        component={Link}
                        to={`/videos/${video.slug}`}
                        variant="contained"
                        size="small"
                        fullWidth
                        startIcon={<PlayArrow />}
                        sx={{ 
                          textTransform: 'none',
                          borderRadius: 2,
                          background: 'linear-gradient(45deg, #e91e63, #f50057)'
                        }}
                      >
                        Watch Now
                      </Button>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleBookmark(video._id)}
                      >
                        {bookmarkedVideos.has(video._id) ? <Bookmark /> : <BookmarkBorder />}
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <Share />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Load More Button */}
        {filteredVideos.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
                px: 4,
                py: 1.5
              }}
            >
              Load More Videos
            </Button>
          </Box>
        )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={3}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <AdvertisingSidebar />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default VideosPage;
