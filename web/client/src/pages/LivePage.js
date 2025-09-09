import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Tabs,
  Tab,
  Alert,
  Skeleton,
  Switch,
  FormControlLabel
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
  Radio,
  People,
  OpenInNew,
  Refresh
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const LivePage = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState(null);
  const [playerType, setPlayerType] = useState('iframe'); // 'iframe', 'embed', 'custom'
  const [autoplay, setAutoplay] = useState(true);
  
  // Prevent multiple simultaneous requests
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);

  // Format duration for display
  const formatDuration = useCallback((startTime) => {
    if (!startTime) return '0:00';
    
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Format scheduled time
  const formatScheduledTime = useCallback((scheduledTime) => {
    if (!scheduledTime) return 'Soon';
    
    const scheduled = typeof scheduledTime === 'string' ? new Date(scheduledTime) : scheduledTime;
    const now = new Date();
    const diff = scheduled - now;
    
    if (diff <= 0) return 'Starting soon';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    return `in ${minutes}m`;
  }, []);

  // Convert YouTube URLs to embed format with live stream optimizations
  const convertToEmbedUrl = useCallback((url, isLiveStream = false) => {
    if (!url) return '';
    
    // Parameters for live streams - removes controls and distractions
    const liveParams = isLiveStream 
      ? '?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0'
      : '?autoplay=1&rel=0&modestbranding=1';
    
    /* Live stream parameters explained:
     * autoplay=1 - Auto-start the video
     * mute=1 - Start muted (required for autoplay)
     * controls=0 - Hide player controls (play/pause, volume, etc.)
     * showinfo=0 - Hide video title and info
     * rel=0 - Don't show related videos at end
     * modestbranding=1 - Reduce YouTube branding
     * iv_load_policy=3 - Disable annotations
     * disablekb=1 - Disable keyboard controls
     * fs=0 - Disable fullscreen button
     */
    
    // Handle YouTube Live URLs like: https://www.youtube.com/live/PDazSUCBhvs?si=aDGr-QFXg_PIDULx
    const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
    if (liveMatch) {
      const videoId = liveMatch[1];
      return `https://www.youtube.com/embed/${videoId}${liveParams}`;
    }
    
    // Handle regular YouTube URLs like: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      const videoId = watchMatch[1];
      return `https://www.youtube.com/embed/${videoId}${liveParams}`;
    }
    
    // Handle YouTube short URLs like: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) {
      const videoId = shortMatch[1];
      return `https://www.youtube.com/embed/${videoId}${liveParams}`;
    }
    
    // Handle existing embed URLs - add live parameters if it's a live stream
    if (url.includes('youtube.com/embed/')) {
      const baseUrl = url.split('?')[0]; // Remove existing parameters
      const videoId = baseUrl.split('/').pop();
      return `${baseUrl}${liveParams}`;
    }
    
    // If already an embed URL or other format, return as is
    return url;
  }, []);

  // Load live streams with proper throttling
  const loadLiveStreams = useCallback(async (force = false) => {
    const now = Date.now();
    
    if (!force && (fetchingRef.current || now - lastFetchRef.current < 5000)) {
      console.log('Skipping fetch - too soon or already fetching');
      return;
    }

    fetchingRef.current = true;
    lastFetchRef.current = now;
    setError(null);

    try {
      console.log('Fetching live streams...');
      const response = await fetch('http://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000/api/live');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Enhance stream data with proper embed URLs
        const enhancedStreams = data.data.map(stream => {
          // Convert any YouTube URL to proper embed format, passing isLive status
          const convertedUrl = convertToEmbedUrl(stream.streamUrl, stream.isLive);
          
          return {
            ...stream,
            // Use converted URL for iframe, fallback to working YouTube video if invalid
            iframeUrl: convertedUrl && !convertedUrl.includes('example.com') 
              ? convertedUrl 
              : convertToEmbedUrl('https://www.youtube.com/embed/Y_OIU_05eAk', stream.isLive),
            embedUrl: stream.embedUrl && !stream.embedUrl.includes('example.com')
              ? stream.embedUrl 
              : 'https://player.vimeo.com/video/76979871?autoplay=1',
            m3u8Url: stream.m3u8Url || 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
          };
        });

        setLiveStreams(enhancedStreams);
        console.log(`Loaded ${enhancedStreams.length} live streams`);
        
        if (!selectedStream || !enhancedStreams.find(s => s.id === selectedStream.id)) {
          const liveStream = enhancedStreams.find(stream => stream.isLive);
          const streamToSelect = liveStream || enhancedStreams[0];
          
          if (streamToSelect) {
            setSelectedStream(streamToSelect);
            setViewerCount(streamToSelect.viewerCount || 0);
          }
        }
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading live streams:', error);
      setError(error.message);
      
      if (liveStreams.length === 0) {
        loadFallbackData();
      }
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [selectedStream, liveStreams.length]);

  // Fallback data with different stream types
  const loadFallbackData = useCallback(() => {
    console.log('Loading fallback data...');
    const mockStreams = [
      {
        id: 1,
        title: 'Breaking News: Punjab Assembly Session Live',
        description: 'Live coverage of the Punjab Assembly session with real-time updates and analysis.',
        streamUrl: 'https://www.youtube.com/embed/Y_OIU_05eAk',
        iframeUrl: convertToEmbedUrl('https://www.youtube.com/embed/Y_OIU_05eAk', true), // true = isLive
        embedUrl: 'https://player.vimeo.com/video/76979871?autoplay=1',
        m3u8Url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
        thumbnailUrl: 'https://img.youtube.com/vi/Y_OIU_05eAk/maxresdefault.jpg',
        isLive: true,
        viewerCount: 1245,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        category: 'News',
        presenter: 'News Anchor',
        language: 'Punjabi'
      },
      {
        id: 2,
        title: 'Weekly Discussion: Current Affairs Analysis',
        description: 'Join our panel for an in-depth discussion on current political and social issues affecting Punjab.',
        streamUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
        iframeUrl: convertToEmbedUrl('https://www.youtube.com/embed/jNQXAC9IVRw', false), // false = not live
        embedUrl: 'https://player.vimeo.com/video/76979871?autoplay=1',
        m3u8Url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
        thumbnailUrl: 'https://via.placeholder.com/640x360/2c2c2c/ffffff?text=Discussion+Panel',
        isLive: false,
        scheduledTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
        category: 'Discussion',
        presenter: 'Panel Host',
        language: 'Punjabi'
      }
    ];

    setLiveStreams(mockStreams);
    setSelectedStream(mockStreams[0]);
    setViewerCount(mockStreams[0].viewerCount);
  }, []);

  // Initial load
  useEffect(() => {
    loadLiveStreams(true);
  }, []);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadLiveStreams();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadLiveStreams]);

  // Handle stream selection
  const handleStreamSelect = useCallback((stream) => {
    setSelectedStream(stream);
    setViewerCount(stream.viewerCount || 0);
  }, []);

  // Get current stream URL based on player type
  const getCurrentStreamUrl = () => {
    if (!selectedStream) return '';
    
    switch (playerType) {
      case 'iframe':
        return selectedStream.iframeUrl || selectedStream.streamUrl;
      default:
        return selectedStream.streamUrl;
    }
  };

  // Render different player types
  const renderPlayer = () => {
    const streamUrl = getCurrentStreamUrl();
    
    if (!streamUrl) {
      return (
        <Box sx={{ 
          height: 400, 
          backgroundColor: '#000', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white'
        }}>
          <Typography>No stream available</Typography>
        </Box>
      );
    }

    switch (playerType) {
      case 'iframe':
        return (
          <Box sx={{ position: 'relative', height: 400, backgroundColor: '#000', borderRadius: 2 }}>
            <iframe
              src={streamUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: '8px' }}
              title={selectedStream?.title || 'Live Stream'}
              onError={(e) => {
                console.error('Iframe failed to load:', streamUrl);
                e.target.style.display = 'none';
              }}
            />
            {/* Fallback overlay in case iframe fails */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              zIndex: -1,
              borderRadius: 2
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <PlayArrow sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6">Stream Loading...</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {selectedStream?.title}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      
      default:
        return (
          <Box sx={{ 
            height: 400, 
            backgroundColor: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 2,
            backgroundImage: selectedStream?.thumbnailUrl ? `url(${selectedStream.thumbnailUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <IconButton 
              sx={{ 
                backgroundColor: 'rgba(196, 30, 58, 0.8)',
                color: 'white',
                width: 80,
                height: 80,
                '&:hover': { backgroundColor: 'rgba(196, 30, 58, 1)' }
              }}
            >
              <PlayArrow sx={{ fontSize: 40 }} />
            </IconButton>
          </Box>
        );
    }
  };

  if (loading && liveStreams.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
            <Skeleton variant="text" sx={{ mt: 2 }} />
            <Skeleton variant="text" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} />
            <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center',
      px: { xs: 2, xl: '250px' } // Add padding to account for fixed sidebars on XL screens
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
            Live Streams
          </Typography>
          <Box sx={{
            height: '3px',
            backgroundColor: '#c41e3a',
            width: '80px',
            mx: 'auto',
            mb: 3
          }} />
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: '#666',
              fontSize: '1.1rem',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Watch live coverage and discussions from Punjab
          </Typography>
          {error && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {error} - Using cached data
            </Alert>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Main Video Player */}
          <Grid item xs={12} md={8}>
            {selectedStream ? (
              <Card sx={{ mb: 3, boxShadow: 3 }}>
                {/* Player Controls */}
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Tabs 
                      value={playerType} 
                      onChange={(e, newValue) => setPlayerType(newValue)}
                      sx={{ minHeight: 36 }}
                    >
                      <Tab label="Iframe" value="iframe" />
                    </Tabs>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={autoplay} 
                            onChange={(e) => setAutoplay(e.target.checked)}
                            size="small"
                          />
                        }
                        label="Autoplay"
                        sx={{ mr: 2 }}
                      />
                      <IconButton size="small" onClick={() => loadLiveStreams(true)}>
                        <Refresh />
                      </IconButton>
                      <IconButton size="small">
                        <OpenInNew />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                {/* Video Player Area */}
                {renderPlayer()}

                {/* Stream Info */}
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#2c2c2c' }}>
                    {selectedStream.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                    {selectedStream.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {selectedStream.isLive ? (
                      <>
                        <Chip
                          label="LIVE"
                          size="small"
                          sx={{ backgroundColor: '#c41e3a', color: 'white' }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <People sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {viewerCount.toLocaleString()} watching
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {formatDuration(selectedStream.startTime)}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Chip
                        label={`Starts ${formatScheduledTime(selectedStream.scheduledTime)}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {selectedStream.category}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <Share />
                    </IconButton>
                    <IconButton size="small">
                      <FavoriteBorder />
                    </IconButton>
                    <IconButton size="small">
                      <Fullscreen />
                    </IconButton>
                  </Box>

                  {/* Stream URL Info */}
                  <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                      Current Stream URL ({playerType}):
                      {selectedStream?.isLive && (
                        <Chip 
                          label="Controls Disabled" 
                          size="small" 
                          color="info" 
                          sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                        />
                      )}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#333', wordBreak: 'break-all', mb: 1 }}>
                      {getCurrentStreamUrl()}
                    </Typography>
                    {selectedStream?.isLive && (
                      <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem', fontStyle: 'italic' }}>
                        Live streams have simplified controls for distraction-free viewing
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ mb: 3, boxShadow: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <LiveIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#666' }}>
                    No live streams available at the moment
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
                    Check back later for live coverage
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Stream List Sidebar */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c2c2c' }}>
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
                  onClick={() => handleStreamSelect(stream)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 45,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          backgroundImage: stream.thumbnailUrl ? `url(${stream.thumbnailUrl})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          flexShrink: 0,
                          position: 'relative'
                        }}
                      >
                        {stream.isLive && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              left: 4,
                              backgroundColor: '#c41e3a',
                              color: 'white',
                              px: 0.5,
                              borderRadius: 0.5,
                              fontSize: '0.7rem',
                              fontWeight: 'bold'
                            }}
                          >
                            LIVE
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 'medium',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            '-webkit-line-clamp': 2,
                            '-webkit-box-orient': 'vertical'
                          }}
                        >
                          {stream.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          {stream.isLive ? (
                            <>
                              <People sx={{ fontSize: 12, color: '#666' }} />
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {(stream.viewerCount || 0).toLocaleString()}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Schedule sx={{ fontSize: 12, color: '#666' }} />
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {formatScheduledTime(stream.scheduledTime)}
                              </Typography>
                            </>
                          )}
                        </Box>
                        
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {stream.category}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {liveStreams.length === 0 && !loading && (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Radio sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#666' }}>
                  No streams available
                </Typography>
                <Button
                  size="small"
                  onClick={() => loadLiveStreams(true)}
                  sx={{ mt: 1 }}
                >
                  Refresh
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LivePage;
