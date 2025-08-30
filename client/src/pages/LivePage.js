import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Paper,
  Avatar,
  Divider,
  Alert,
  Skeleton,
  Fade
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Fullscreen,
  Share,
  Favorite,
  FavoriteBorder,
  Visibility,
  Schedule,
  Videocam as LiveIcon,
  VideoCameraFront,
  Radio,
  People
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const LivePage = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    // Load live streams from API
    const loadLiveStreams = async () => {
      setLoading(true);
      
      try {
        console.log('Attempting to fetch live streams...');
        const response = await fetch('/api/live');
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.success) {
          setLiveStreams(data.data);
          console.log('Live streams loaded:', data.data);
          
          // Set the first live stream as selected
          const liveStream = data.data.find(stream => stream.isLive);
          if (liveStream) {
            setSelectedStream(liveStream);
            setViewerCount(liveStream.viewerCount);
          }
        } else {
          console.error('API returned error:', data.message);
          // Use fallback data
          loadFallbackData();
        }
      } catch (error) {
        console.error('Error loading live streams:', error);
        // Use fallback data
        loadFallbackData();
      } finally {
        setLoading(false);
      }
    };

    const loadFallbackData = () => {
      console.log('Loading fallback data...');
      const mockStreams = [
        {
          id: 1,
          title: 'Breaking News: Punjab Assembly Session Live',
          description: 'Live coverage of the Punjab Assembly session with real-time updates and analysis.',
          streamUrl: 'https://example.com/stream/punjab-assembly',
          thumbnailUrl: 'https://via.placeholder.com/640x360/c41e3a/ffffff?text=Live+Stream',
          isLive: true,
          viewerCount: 1245,
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
          category: 'News',
          presenter: 'News Anchor',
          language: 'Punjabi'
        },
        {
          id: 2,
          title: 'Weekly Discussion: Current Affairs Analysis',
          description: 'Join our panel for an in-depth discussion on current political and social issues affecting Punjab.',
          streamUrl: 'https://example.com/stream/weekly-discussion',
          thumbnailUrl: 'https://via.placeholder.com/640x360/2c2c2c/ffffff?text=Discussion+Panel',
          isLive: false,
          scheduledTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // Starts in 1 hour
          category: 'Discussion',
          presenter: 'Panel of Experts',
          language: 'Punjabi/English'
        }
      ];
      
      setLiveStreams(mockStreams);
      console.log('Fallback streams set:', mockStreams);
      
      // Set the first live stream as selected
      const liveStream = mockStreams.find(stream => stream.isLive);
      if (liveStream) {
        setSelectedStream(liveStream);
        setViewerCount(liveStream.viewerCount);
        console.log('Selected stream:', liveStream);
      }
    };

    loadLiveStreams();

    // Update viewer count every 30 seconds for live streams
    const interval = setInterval(() => {
      if (selectedStream && selectedStream.isLive) {
        setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 5);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedStream]);

  const formatDuration = (startTime) => {
    const now = new Date();
    const diff = now - startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatScheduledTime = (scheduledTime) => {
    return scheduledTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" height={60} width={300} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 2 }} />
              <Skeleton variant="text" height={40} width="60%" />
              <Skeleton variant="text" height={20} width="80%" />
            </Grid>
            <Grid item xs={12} lg={4}>
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 1 }} />
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 'bold',
                color: '#2c2c2c',
                mb: 2,
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              <LiveIcon sx={{ fontSize: 40, mr: 2, color: '#c41e3a', verticalAlign: 'middle' }} />
              Live Streams
            </Typography>
            <Typography variant="h6" sx={{ color: '#666', maxWidth: 600, mx: 'auto' }}>
              Watch live news, discussions, and special events as they happen
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Debug: Found {liveStreams.length} streams. Selected: {selectedStream?.title || 'None'}
              </Alert>
            </Grid>
          )}

          {/* Main Stream Player */}
          <Grid item xs={12} lg={8}>
            {selectedStream ? (
              <Fade in={true}>
                <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  {/* Video Player Area */}
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      backgroundColor: '#000',
                      backgroundImage: `url(${selectedStream.thumbnailUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Live Indicator */}
                    {selectedStream.isLive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          backgroundColor: '#c41e3a',
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        <LiveIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        LIVE
                      </Box>
                    )}

                    {/* Viewer Count */}
                    {selectedStream.isLive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.875rem'
                        }}
                      >
                        <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                        {viewerCount.toLocaleString()} viewers
                      </Box>
                    )}

                    {/* Play Button Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(196, 30, 58, 0.9)',
                        borderRadius: '50%',
                        width: 80,
                        height: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(196, 30, 58, 1)',
                          transform: 'translate(-50%, -50%) scale(1.1)'
                        }
                      }}
                    >
                      <PlayArrow sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                  </Box>

                  {/* Stream Info */}
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#2c2c2c' }}>
                          {selectedStream.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                          {selectedStream.description}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                        <IconButton sx={{ color: '#666' }}>
                          <FavoriteBorder />
                        </IconButton>
                        <IconButton sx={{ color: '#666' }}>
                          <Share />
                        </IconButton>
                        <IconButton sx={{ color: '#666' }}>
                          <Fullscreen />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                      <Chip 
                        label={selectedStream.category} 
                        sx={{ backgroundColor: '#c41e3a', color: 'white' }} 
                      />
                      <Chip label={selectedStream.language} variant="outlined" />
                      <Box sx={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                        <VideoCameraFront sx={{ fontSize: 18, mr: 0.5 }} />
                        {selectedStream.presenter}
                      </Box>
                      {selectedStream.isLive && selectedStream.startTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                          <Schedule sx={{ fontSize: 18, mr: 0.5 }} />
                          Started {formatDuration(selectedStream.startTime)} ago
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            ) : (
              <Card elevation={3} sx={{ borderRadius: 2, p: 4, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#666' }}>
                  No live streams available at the moment
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
                  Check back later for live coverage of events and discussions
                </Typography>
              </Card>
            )}
          </Grid>

          {/* Stream List Sidebar */}
          <Grid item xs={12} lg={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#2c2c2c' }}>
              Available Streams
            </Typography>
            
            {liveStreams.map((stream, index) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    border: selectedStream?.id === stream.id ? '2px solid #c41e3a' : '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => setSelectedStream(stream)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {stream.isLive ? (
                        <Chip
                          label="LIVE"
                          size="small"
                          sx={{ backgroundColor: '#c41e3a', color: 'white', mr: 1 }}
                        />
                      ) : (
                        <Chip
                          label={`Starts ${formatScheduledTime(stream.scheduledTime)}`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                      )}
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {stream.category}
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {stream.title}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                      {stream.description.substring(0, 80)}...
                    </Typography>
                    
                    {stream.isLive && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: '#666' }}>
                        <People sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          {stream.viewerCount} watching
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* No Streams Message */}
            {liveStreams.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  No live streams scheduled at the moment. Follow us for updates on upcoming live events.
                </Typography>
              </Alert>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LivePage;
