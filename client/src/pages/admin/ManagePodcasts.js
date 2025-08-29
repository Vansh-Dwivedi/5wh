import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  ArrowBack,
  PlayArrow,
  Schedule,
  Audiotrack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { podcastsAPI } from '../../services/api';

const ManagePodcasts = () => {
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState(null);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const response = await podcastsAPI.getAll();
      setPodcasts(response.data.podcasts);
    } catch (err) {
      setError('Failed to load podcasts');
      console.error('Error fetching podcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (podcast) => {
    setSelectedPodcast(podcast);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await podcastsAPI.delete(selectedPodcast._id);
      setDeleteDialog(false);
      setSelectedPodcast(null);
      fetchPodcasts();
    } catch (err) {
      setError('Failed to delete podcast');
      console.error('Error deleting podcast:', err);
    }
  };

  const handleStatusChange = async (podcastId, status) => {
    try {
      await podcastsAPI.update(podcastId, { status });
      fetchPodcasts();
    } catch (err) {
      setError('Failed to update podcast status');
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Podcasts - 5WH Media Admin</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin/dashboard')} color="primary">
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Manage Podcasts
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/podcasts/create')}
          >
            Add Podcast
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {podcasts.map((podcast) => (
            <Grid item xs={12} md={6} lg={4} key={podcast._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={podcast.category || 'General'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={podcast.status || 'draft'}
                      size="small"
                      color={podcast.status === 'published' ? 'success' : 'warning'}
                    />
                    {podcast.duration && (
                      <Chip
                        label={podcast.duration}
                        size="small"
                        icon={<Schedule />}
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Audiotrack sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.3 }}>
                      {podcast.title || 'Untitled Podcast'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {podcast.description?.substring(0, 120) || 'No description available'}...
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    {podcast.host || 'Unknown Host'} • {podcast.publishedAt ? new Date(podcast.publishedAt).toLocaleDateString() : 'Not published'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => window.open(`/audio/${podcast.slug}`, '_blank')}
                      title="Play Podcast"
                      color="primary"
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/admin/podcasts/edit/${podcast._id}`)}
                      title="Edit Podcast"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(podcast)} 
                      color="error"
                      title="Delete Podcast"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {podcasts.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Audiotrack sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No podcasts found
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/podcasts/create')}
            >
              Create First Podcast
            </Button>
          </Box>
        )}

        {/* Delete Podcast Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the podcast "{selectedPodcast?.title}"?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ManagePodcasts;
