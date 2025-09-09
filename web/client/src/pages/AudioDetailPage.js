import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
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
  ListItemAvatar
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Schedule,
  Person,
  ArrowBack,
  Share,
  Download,
  Favorite,
  FavoriteBorder,
  Visibility
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { podcastsAPI } from '../services/api';

const AudioDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPodcast();
    }
  }, [slug]);

  const fetchPodcast = async () => {
    try {
      setLoading(true);
      const response = await podcastsAPI.getBySlug(slug);
      setPodcast(response.data);
    } catch (err) {
      setError('Podcast not found');
      console.error('Error fetching podcast:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !podcast) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{podcast.title} - 5WH Media</title>
        <meta name="description" content={podcast.description} />
        <meta name="keywords" content={podcast.tags?.join(', ') || 'podcast, audio'} />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/audio')}
          sx={{ mb: 3 }}
        >
          Back to Podcasts
        </Button>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Left Column - Podcast Image */}
          <Box sx={{ flex: '0 0 400px', maxWidth: { xs: '100%', md: '400px' } }}>
            <Card>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="400"
                  image={
                    podcast.thumbnail?.url 
                      ? `https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000${podcast.thumbnail.url}`
                      : '/api/placeholder/400/400'
                  }
                  alt={podcast.thumbnail?.alt || podcast.title}
                  sx={{ objectFit: 'cover' }}
                />
                
                {/* Play Button Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <IconButton
                    onClick={handlePlayPause}
                    sx={{
                      backgroundColor: 'rgba(25, 118, 210, 0.9)',
                      color: 'white',
                      width: 80,
                      height: 80,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 1)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {isPlaying ? (
                      <Pause sx={{ fontSize: 40 }} />
                    ) : (
                      <PlayArrow sx={{ fontSize: 40 }} />
                    )}
                  </IconButton>
                </Box>

                {/* Featured Badge */}
                {podcast.featured && (
                  <Chip
                    label="Featured"
                    color="secondary"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </Box>
            </Card>

            {/* Audio Player */}
            {podcast.audioUrl && (
              <Paper sx={{ p: 2, mt: 2 }}>
                <audio 
                  controls 
                  style={{ width: '100%', height: '50px' }}
                  preload="metadata"
                >
                  <source src={`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000${podcast.audioUrl}`} type="audio/mpeg" />
                  <source src={`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000${podcast.audioUrl}`} type="audio/wav" />
                  <source src={`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000${podcast.audioUrl}`} type="audio/ogg" />
                  Your browser does not support the audio element.
                </audio>
              </Paper>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
                onClick={handleLike}
                variant={isLiked ? 'contained' : 'outlined'}
                fullWidth
              >
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <IconButton color="primary">
                <Share />
              </IconButton>
              <IconButton color="primary">
                <Download />
              </IconButton>
            </Box>
          </Box>

          {/* Right Column - Podcast Details */}
          <Box sx={{ flex: 1 }}>
            {/* Category and Meta Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={podcast.category}
                color="primary"
                variant="outlined"
              />
              {podcast.duration && (
                <Chip
                  icon={<Schedule />}
                  label={podcast.duration}
                  variant="outlined"
                />
              )}
              {podcast.plays && (
                <Chip
                  icon={<Visibility />}
                  label={`${podcast.plays} plays`}
                  variant="outlined"
                />
              )}
            </Box>

            {/* Title */}
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 'bold', lineHeight: 1.2 }}
            >
              {podcast.title}
            </Typography>

            {/* Host */}
            {podcast.host && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Person sx={{ color: 'primary.main' }} />
                <Typography variant="h6" color="primary.main">
                  Hosted by {podcast.host}
                </Typography>
              </Box>
            )}

            {/* Description */}
            <Typography 
              variant="body1" 
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              {podcast.description}
            </Typography>

            {/* Published Date */}
            {podcast.publishedAt && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Published on {new Date(podcast.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            )}

            {/* Guests */}
            {podcast.guests && podcast.guests.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Guests
                </Typography>
                <List>
                  {podcast.guests.map((guest, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar src={guest.avatar}>
                          {guest.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={guest.name}
                        secondary={guest.bio}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Show Notes */}
            {podcast.showNotes && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Show Notes
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                >
                  {podcast.showNotes}
                </Typography>
              </Paper>
            )}

            {/* Transcript */}
            {podcast.transcript && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Transcript
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 300, overflow: 'auto' }}
                >
                  {podcast.transcript}
                </Typography>
              </Paper>
            )}

            {/* Tags */}
            {podcast.tags && podcast.tags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {podcast.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default AudioDetailPage;
