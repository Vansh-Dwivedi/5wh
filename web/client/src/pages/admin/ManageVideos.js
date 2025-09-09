import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  ArrowBack,
  PlayArrow,
  Schedule,
  VideoLibrary,
  Search,
  MoreVert,
  Visibility,
  Star,
  StarBorder,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
import { videosAPI, MEDIA_BASE_URL } from '../../services/api';

const ManageVideos = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleBasedNavigation();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVideoForMenu, setSelectedVideoForMenu] = useState(null);

  const videoCategories = [
    { value: 'all', label: 'All Videos', icon: <VideoLibrary /> },
    { value: 'news', label: 'News', icon: <TrendingUp /> },
    { value: 'interviews', label: 'Interviews', icon: <PlayArrow /> },
    { value: 'documentaries', label: 'Documentaries', icon: <VideoLibrary /> },
    { value: 'live', label: 'Live', icon: <PlayArrow /> }
  ];

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchTerm, activeTab]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videosAPI.getAdmin();
      setVideos(response.data.videos || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication required. Please login to access admin features.');
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to load videos');
      }
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = [...videos];
    
    // Filter by category
    if (activeTab !== 'all') {
      filtered = filtered.filter(video => video.category === activeTab);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredVideos(filtered);
  };

  const handleDelete = (video) => {
    setSelectedVideo(video);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await videosAPI.delete(selectedVideo._id);
      setDeleteDialog(false);
      setSelectedVideo(null);
      fetchVideos();
    } catch (err) {
      setError('Failed to delete video');
      console.error('Error deleting video:', err);
    }
  };

  const handleToggleFeatured = async (video) => {
    try {
      await videosAPI.update(video._id, { featured: !video.featured });
      fetchVideos();
    } catch (err) {
      setError('Failed to update featured status');
    }
  };

  const handleMenuClick = (event, video) => {
    setAnchorEl(event.currentTarget);
    setSelectedVideoForMenu(video);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVideoForMenu(null);
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || '0';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
  case 'scheduled': return 'info';
      case 'archived': return 'default';
      default: return 'default';
    }
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
        <title>Manage Videos - 5WH Media Admin</title>
        <meta name="description" content="Manage video content in the admin dashboard" />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            backgroundColor: 'error.main',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={navigateToDashboard}
                sx={{ color: 'white' }}
              >
                <ArrowBack />
              </IconButton>
              <VideoLibrary sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white' }}>
                  Video Management
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Create, edit, and manage your video content
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/admin/videos/create')}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 'bold',
                px: 3,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Create Video
            </Button>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {videos.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Videos
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {videos.filter(v => v.status === 'published').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Published
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {videos.filter(v => v.featured).length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Featured
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {formatViews(videos.reduce((total, video) => total + (video.views || 0), 0))}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Views
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* Search and Filter Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search videos by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {videoCategories.map((category) => (
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
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                  />
                ))}
              </Tabs>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <VideoLibrary sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Videos Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || activeTab !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first video.'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/videos/create')}
              size="large"
              sx={{ borderRadius: 3 }}
            >
              Create Video
            </Button>
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
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  {/* Video Thumbnail */}
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        video.thumbnail?.url 
                          ? `${MEDIA_BASE_URL}${video.thumbnail.url}`
                          : '/api/placeholder/400/200'
                      }
                      alt={video.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    
                    {/* Overlay with Actions */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 1
                      }}
                    >
                      <Tooltip title={video.featured ? 'Remove from featured' : 'Mark as featured'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleFeatured(video)}
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: video.featured ? 'gold' : 'white',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                          }}
                        >
                          {video.featured ? <Star /> : <StarBorder />}
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, video)}
                        sx={{
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Duration Badge */}
                    <Chip
                      icon={<Schedule />}
                      label={video.duration || 'N/A'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white'
                      }}
                    />

                    {/* Status Badge */}
                    <Chip
                      label={video.status?.toUpperCase() || 'DRAFT'}
                      size="small"
                      color={getStatusColor(video.status)}
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Category */}
                    <Chip
                      label={video.category?.toUpperCase()}
                      size="small"
                      color="primary"
                      sx={{ mb: 2, fontWeight: 'bold' }}
                    />

                    {/* Title */}
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 'bold',
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
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {video.description}
                    </Typography>

                    {/* Video Stats */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatViews(video.views)} views
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
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/admin/videos/edit/${video._id}`)}
                        sx={{ flex: 1, borderRadius: 2 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={() => window.open(`/videos/${video.slug}`, '_blank')}
                        sx={{ flex: 1, borderRadius: 2 }}
                      >
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            navigate(`/admin/videos/edit/${selectedVideoForMenu?._id}`);
            handleMenuClose();
          }}>
            <Edit sx={{ mr: 1 }} />
            Edit Video
          </MenuItem>
          <MenuItem onClick={() => {
            window.open(`/videos/${selectedVideoForMenu?.slug}`, '_blank');
            handleMenuClose();
          }}>
            <PlayArrow sx={{ mr: 1 }} />
            View Video
          </MenuItem>
          <MenuItem onClick={() => {
            handleToggleFeatured(selectedVideoForMenu);
            handleMenuClose();
          }}>
            {selectedVideoForMenu?.featured ? <StarBorder sx={{ mr: 1 }} /> : <Star sx={{ mr: 1 }} />}
            {selectedVideoForMenu?.featured ? 'Remove Featured' : 'Mark Featured'}
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleDelete(selectedVideoForMenu);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete Video
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedVideo?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ManageVideos;
