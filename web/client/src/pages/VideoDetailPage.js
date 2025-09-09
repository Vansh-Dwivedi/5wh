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
  Avatar,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Rating
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  Fullscreen,
  Share,
  ThumbUp,
  ThumbDown,
  Bookmark,
  BookmarkBorder,
  Download,
  Schedule,
  Visibility,
  Person,
  ArrowBack,
  MoreVert
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { videosAPI, MEDIA_BASE_URL } from '../services/api';

const VideoDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [userRating, setUserRating] = useState(0);

  // Helper function to extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url) => {
    if (!url) return '';
    
    // If it's already just the video ID, return it
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
      return url;
    }
    
    // Handle various YouTube URL formats
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/,
      /(?:https?:\/\/)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no pattern matches, return the original URL (might be just the ID)
    return url;
  };

  useEffect(() => {
    if (slug) {
      fetchVideo();
      fetchRelatedVideos();
    }
  }, [slug]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await videosAPI.getBySlug(slug);
      const videoData = response.data;
      setVideo(videoData);
      console.log('Video data:', videoData); // Debug log
      console.log('Video URL:', videoData.videoUrl); // Debug log
      console.log('Full video source URL:', `${MEDIA_BASE_URL}${videoData.videoUrl}`); // Debug log
    } catch (err) {
      setError('Video not found');
      console.error('Error fetching video:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const response = await videosAPI.getAll();
      // Filter out current video and get 4 related videos
      const related = response.data.videos
        ?.filter(v => v.slug !== slug)
        ?.slice(0, 4) || [];
      setRelatedVideos(related);
    } catch (err) {
      console.error('Error fetching related videos:', err);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

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

  if (error || !video) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/videos')}
            variant="contained"
          >
            Back to Videos
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{video.title} - 5WH Media Videos</title>
        <meta name="description" content={video.description} />
        <meta name="keywords" content={`video, ${video.category}, ${video.tags?.join(', ')}, 5WH Media`} />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Back Button */}
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/videos')}
          sx={{ mb: 3, textTransform: 'none' }}
        >
          Back to Videos
        </Button>

        <Grid container spacing={4}>
          {/* Main Video Section */}
          <Grid item xs={12} lg={8}>
            {/* Video Player */}
            <Paper 
              elevation={8}
              sx={{ 
                borderRadius: 3, 
                overflow: 'hidden', 
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <Box sx={{ position: 'relative', paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
                {video.videoType === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.videoUrl)}`}
                    title={video.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    allowFullScreen
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <video
                      controls
                      style={{ width: '100%', height: '100%' }}
                      poster={
                        video.thumbnail?.url 
                          ? `${MEDIA_BASE_URL}${video.thumbnail.url}`
                          : undefined
                      }
                      onError={(e) => {
                        console.error('Video error:', e);
                        console.error('Video source:', e.target.src);
                      }}
                      onLoadStart={() => console.log('Video load started')}
                      onCanPlay={() => console.log('Video can play')}
                    >
                      <source src={`${MEDIA_BASE_URL}${video.videoUrl}`} type="video/mp4" />
                      <source src={`${MEDIA_BASE_URL}${video.videoUrl}`} type="video/webm" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Video Info */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ fontWeight: 'bold', lineHeight: 1.2 }}
              >
                {video.title}
              </Typography>

              {/* Video Meta */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={video.category?.toUpperCase()}
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
                {video.quality && (
                  <Chip
                    label={video.quality}
                    sx={{ 
                      backgroundColor: 'success.main', 
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                )}
                <Chip
                  icon={<Schedule />}
                  label={video.duration || formatDuration(video.durationSeconds)}
                  variant="outlined"
                />
                <Chip
                  icon={<Visibility />}
                  label={formatViews(video.views || 0)}
                  variant="outlined"
                />
                {video.publishedAt && (
                  <Typography variant="body2" color="text.secondary">
                    Published {new Date(video.publishedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<ThumbUp />}
                  sx={{ borderRadius: 3 }}
                >
                  {video.likes || 0} Likes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                  onClick={handleBookmark}
                  sx={{ borderRadius: 3 }}
                >
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  sx={{ borderRadius: 3 }}
                >
                  Share
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  sx={{ borderRadius: 3 }}
                >
                  Download
                </Button>
              </Box>

              {/* User Rating */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Rate this video:
                </Typography>
                <Rating
                  value={userRating}
                  onChange={(event, newValue) => setUserRating(newValue)}
                  size="large"
                />
              </Box>
            </Box>

            {/* Tabs for Description, Comments, etc. */}
            <Paper elevation={2} sx={{ borderRadius: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Description" />
                <Tab label="Transcript" />
                <Tab label="Comments" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <Box>
                    <Typography variant="body1" paragraph>
                      {video.description}
                    </Typography>
                    
                    {video.tags && video.tags.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Tags:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {video.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                              clickable
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Typography variant="body1">
                      {video.transcript || 'Transcript not available for this video.'}
                    </Typography>
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <Typography variant="body1" color="text.secondary">
                      Comments feature coming soon...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Related Videos */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Related Videos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {relatedVideos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No related videos found.
                </Typography>
              ) : (
                <List disablePadding>
                  {relatedVideos.map((relatedVideo, index) => (
                    <ListItem
                      key={relatedVideo._id}
                      disablePadding
                      sx={{ mb: 2 }}
                    >
                      <Card
                        component={Link}
                        to={`/videos/${relatedVideo.slug}`}
                        sx={{
                          width: '100%',
                          textDecoration: 'none',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex' }}>
                          <CardMedia
                            component="img"
                            sx={{ width: 120, height: 90 }}
                            image={
                              relatedVideo.thumbnail?.url 
                                ? `${MEDIA_BASE_URL}${relatedVideo.thumbnail.url}`
                                : '/api/placeholder/120/90'
                            }
                            alt={relatedVideo.title}
                          />
                          <CardContent sx={{ flex: 1, p: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 'bold',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {relatedVideo.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatViews(relatedVideo.views || 0)}
                            </Typography>
                          </CardContent>
                        </Box>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default VideoDetailPage;
