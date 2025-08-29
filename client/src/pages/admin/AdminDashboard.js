import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Avatar
} from '@mui/material';
import {
  Article,
  Audiotrack,
  VideoLibrary,
  People,
  Refresh,
  Add,
  Edit,
  Visibility,
  CloudDownload
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [draftCount, setDraftCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsMessage, setNewsMessage] = useState('');

  // Define functions before useEffect hooks
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setStats(response.data.stats);
      setRecentUsers(response.data.recentUsers);
      
      // Fetch draft count
      try {
        const draftResponse = await adminAPI.getNews({ status: 'draft', limit: 0 });
        setDraftCount(draftResponse.data.total || 0);
      } catch (err) {
        console.error('Error fetching draft count:', err);
      }
      
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsFetch = async () => {
    try {
      setNewsLoading(true);
      setNewsMessage('');
      const response = await adminAPI.fetchNews();
      setNewsMessage(`Successfully fetched ${response.data.totalArticles} new articles`);
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      setNewsMessage('Failed to fetch news articles');
      console.error('Error fetching news:', err);
    } finally {
      setNewsLoading(false);
    }
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch dashboard data when component mounts or user changes
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  // Don't render if user is not loaded yet or not admin
  if (authLoading || !user || user.role !== 'admin') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, icon, color, action }) => (
    <Card sx={{ 
      height: '100%', 
      border: '1px solid #e0e0e0',
      borderRadius: 3,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
      }
    }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
              {value || 0}
            </Typography>
          </Box>
          <Box sx={{ 
            width: { xs: 56, md: 64 }, 
            height: { xs: 56, md: 64 }, 
            borderRadius: '50%', 
            backgroundColor: color || '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: { xs: '24px', md: '28px' },
            boxShadow: `0 4px 12px ${color}40`
          }}>
            {icon}
          </Box>
        </Box>
        {action && (
          <Box sx={{ mt: { xs: 2, md: 3 } }}>
            {action}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - 5WH Media</title>
        <meta name="description" content="Admin dashboard for 5WH Media content management" />
      </Helmet>

      <Box sx={{ 
        backgroundColor: '#1976d2', 
        color: 'white', 
        py: { xs: 3, md: 4 }, 
        px: { xs: 2, md: 4 }, 
        borderRadius: 2, 
        mb: 4 
      }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
                fontSize: { xs: '1.75rem', md: '2.125rem' },
                color: 'white'
              }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" sx={{ 
                opacity: 0.9, 
                fontSize: { xs: '0.875rem', md: '1rem' },
                color: 'white'
              }}>
                Welcome back, {user?.name}! Here's what's happening with your content.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchDashboardData}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                minWidth: { xs: '100%', sm: 'auto' }
              }}
            >
              Refresh
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* News Fetch Message */}
        {newsMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {newsMessage}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<People />}
              color="#1976d2"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/admin/users')} fullWidth>
                  Manage Users
                </Button>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Published News"
              value={stats.publishedNews}
              icon={<Article />}
              color="#2e7d32"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/admin/news')} fullWidth>
                  Manage News
                </Button>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Published Podcasts"
              value={stats.publishedPodcasts}
              icon={<Audiotrack />}
              color="#ed6c02"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/admin/podcasts')} fullWidth>
                  Manage Podcasts
                </Button>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Published Videos"
              value={stats.publishedVideos}
              icon={<VideoLibrary />}
              color="#d32f2f"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/admin/videos')} fullWidth>
                  Manage Videos
                </Button>
              }
            />
          </Grid>
          
          {/* News Fetching Card */}
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="News Fetching"
              value="Auto + Manual"
              icon={<Article />}
              color="#0288d1"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/admin/news-fetching')} fullWidth>
                  Manage Sources
                </Button>
              }
            />
          </Grid>

          {/* Draft News Card */}
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Pending Review"
              value={draftCount}
              icon={<Edit />}
              color="#f57c00"
              action={
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => navigate('/admin/draft-news')}
                  disabled={draftCount === 0}
                  fullWidth
                >
                  {draftCount > 0 ? 'Review Now' : 'No Drafts'}
                </Button>
              }
            />
          </Grid>
        </Grid>

        {/* RSS Feed Section */}
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e0e0e0'
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 2,
              gap: { xs: 2, sm: 0 }
            }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#2e7d32', fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
                  📰 News Fetching Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Automatically fetch news from multiple Punjabi sources
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Article />}
                onClick={handleNewsFetch}
                disabled={newsLoading}
                sx={{
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
                  borderRadius: 2,
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                {newsLoading ? 'Fetching...' : 'Fetch Latest News'}
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Automatically fetch the latest news from multiple Punjabi news sources. This will import new articles into your news database with automatic image search.
            </Typography>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/news/create')}
                >
                  Create News
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/podcasts/create')}
                >
                  Create Podcast
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/videos/create')}
                >
                  Create Video
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<People />}
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  startIcon={<Edit />}
                  onClick={() => navigate('/admin/draft-news')}
                >
                  Review Drafts
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CloudDownload />}
                  onClick={() => navigate('/admin/news-fetching')}
                >
                  Fetch News
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => navigate('/admin/advertisers')}
                  sx={{
                    color: '#ff4757',
                    borderColor: '#ff4757',
                    '&:hover': {
                      borderColor: '#c41e3a',
                      backgroundColor: 'rgba(255, 71, 87, 0.04)'
                    }
                  }}
                >
                  Manage Advertisers
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Users
            </Typography>

            {/* Recent Users Table */}
            {/* Recent Users Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {user.firstName ? user.firstName.charAt(0) : 'U'}
                          </Avatar>
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'Unknown'}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={user.role || 'N/A'} 
                          color={user.role === 'admin' ? 'error' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default AdminDashboard;
