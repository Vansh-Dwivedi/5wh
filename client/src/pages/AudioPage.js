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
  Divider
} from '@mui/material';
import {
  Schedule,
  Person,
  Audiotrack,
  Share,
  Download
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { podcastsAPI } from '../services/api';
import AdvertisingSidebar from '../components/layout/AdvertisingSidebar';

const AudioPage = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const response = await podcastsAPI.getAll();
      setPodcasts(response.data.podcasts || []);
    } catch (err) {
      setError('Failed to load podcasts');
      console.error('Error fetching podcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Audio Podcasts - 5WH Media</title>
        <meta name="description" content="Listen to our latest podcasts covering politics, culture, interviews, and current affairs." />
        <meta name="keywords" content="podcasts, audio, interviews, politics, culture, 5WH Media" />
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
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Audio Podcasts
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Discover insightful conversations, interviews, and analysis on politics, culture, and current affairs
          </Typography>
          <Divider sx={{ maxWidth: 200, mx: 'auto' }} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {podcasts.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
            <Audiotrack sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Podcasts Available Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We're working on creating amazing podcast content for you. Check back soon!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {podcasts.map((podcast) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={podcast._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <Box sx={{ position: 'relative' }}>
                    {podcast.thumbnail?.url ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={`http://localhost:5000${podcast.thumbnail.url}`}
                        alt={podcast.thumbnail?.alt || podcast.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #ff6b35 0%, #c41e3a 50%, #8b0000 100%)';
                          e.target.parentElement.style.display = 'flex';
                          e.target.parentElement.style.alignItems = 'center';
                          e.target.parentElement.style.justifyContent = 'center';
                          e.target.parentElement.style.height = '200px';
                          e.target.parentElement.innerHTML = '<div style="color: white; text-align: center; font-size: 4rem; opacity: 0.9;">🎙️</div>';
                        }}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box 
                        sx={{ 
                          height: '200px',
                          background: 'linear-gradient(135deg, #ff6b35 0%, #c41e3a 50%, #8b0000 100%)',
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
                          🎙️
                        </Box>
                      </Box>
                    )}

                    {/* Featured Badge */}
                    {podcast.featured && (
                      <Chip
                        label="Featured"
                        color="secondary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Category and Duration */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip
                        label={podcast.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {podcast.duration && (
                        <Chip
                          icon={<Schedule />}
                          label={podcast.duration}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

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
                        overflow: 'hidden'
                      }}
                    >
                      {podcast.title}
                    </Typography>

                    {/* Host */}
                    {podcast.host && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Hosted by {podcast.host}
                        </Typography>
                      </Box>
                    )}

                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {podcast.description}
                    </Typography>

                    {/* Audio Player */}
                    {podcast.audioUrl && (
                      <Box sx={{ mb: 2 }}>
                        <audio 
                          controls 
                          style={{ width: '100%', height: '40px' }}
                          preload="metadata"
                          controlsList="nodownload"
                          onError={(e) => {
                            console.error('Audio error:', e);
                            e.target.style.display = 'none';
                          }}
                        >
                          <source src={`http://localhost:5000${podcast.audioUrl}`} type="audio/mpeg" />
                          <source src={`http://localhost:5000${podcast.audioUrl}`} type="audio/mp4" />
                          <source src={`http://localhost:5000${podcast.audioUrl}`} type="audio/wav" />
                          <source src={`http://localhost:5000${podcast.audioUrl}`} type="audio/ogg" />
                          Your browser does not support the audio element.
                        </audio>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Button
                        component={Link}
                        to={`/audio/${podcast.slug}`}
                        variant="contained"
                        size="small"
                        fullWidth
                        sx={{ textTransform: 'none' }}
                      >
                        Listen Full Episode
                      </Button>
                      <IconButton size="small" color="primary">
                        <Share />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <Download />
                      </IconButton>
                    </Box>

                    {/* Published Date */}
                    {podcast.publishedAt && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Published {new Date(podcast.publishedAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Load More Button (if needed) */}
        {podcasts.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button variant="outlined" size="large">
              Load More Podcasts
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

export default AudioPage;
