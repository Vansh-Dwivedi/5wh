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
  CloudDownload,
  RateReview,
  Notifications,
  MenuBook
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI, newsAPI, videosAPI, podcastsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import RoleBadge from '../../components/admin/RoleBadge';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [draftCount, setDraftCount] = useState(0);
  const [scheduledCounts, setScheduledCounts] = useState({ news:0, podcasts:0, videos:0, opinions:0 });
  const [upcoming, setUpcoming] = useState([]);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleItem, setRescheduleItem] = useState(null);
  const [newScheduleTime, setNewScheduleTime] = useState('');
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
      setScheduledCounts({
        news: response.data.stats.scheduledNews || 0,
        podcasts: response.data.stats.scheduledPodcasts || 0,
        videos: response.data.stats.scheduledVideos || 0,
        opinions: response.data.stats.scheduledOpinions || 0
      });
      
      // Fetch draft count
      try {
        const draftResponse = await adminAPI.getNews({ status: 'draft', limit: 0 });
        setDraftCount(draftResponse.data.total || 0);
      } catch (err) {
        console.error('Error fetching draft count:', err);
      }

      // Fetch upcoming scheduled items
      try {
        const upcomingRes = await adminAPI.getUpcomingScheduled(6);
        const aggregate = [];
        const pushItems = (arr, type) => arr.forEach(i => aggregate.push({
          type,
            title: i.title,
              id: i._id,
            scheduledAt: i.scheduledAt,
            status: i.status
        }));
        pushItems(upcomingRes.data.news, 'News');
        pushItems(upcomingRes.data.podcasts, 'Podcast');
        pushItems(upcomingRes.data.videos, 'Video');
        pushItems(upcomingRes.data.opinions, 'Opinion');
        aggregate.sort((a,b)=> new Date(a.scheduledAt) - new Date(b.scheduledAt));
        setUpcoming(aggregate.slice(0,6));
      } catch (e) {
        console.error('Error fetching upcoming scheduled:', e);
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

  // Normalize role once
  const normalizedRole = (user?.role || '').toString().trim().toLowerCase();

  // Redirect if not authenticated or not admin/editor
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'editor'].includes(normalizedRole))) {
      navigate('/login');
    }
  }, [user, authLoading, navigate, normalizedRole]);

  // Fetch dashboard data when component mounts or user changes
  useEffect(() => {
    if (user && ['admin', 'editor'].includes(normalizedRole)) {
      fetchDashboardData();
    }
  }, [user, normalizedRole]);

  // Don't render if user is not loaded yet or not admin/editor
  if (authLoading || !user || !['admin', 'editor'].includes(normalizedRole)) {
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
            boxShadow: color ? `0 4px 12px ${color}40` : 'none'
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

  const handlePublishNow = async (item) => {
    try {
      let updater;
      switch(item.type){
        case 'News': updater = (id,data)=> newsAPI.update(id, { status:'published' }); break;
        case 'Video': updater = (id,data)=> videosAPI.update(id, (()=>{ const fd=new FormData(); fd.append('status','published'); return fd; })()); break;
        case 'Podcast': updater = (id,data)=> podcastsAPI.update(id, (()=>{ const fd=new FormData(); fd.append('status','published'); return fd; })()); break;
        case 'Opinion': updater = async(id)=> fetch(`http://localhost:5000/api/opinions/${id}`, { method:'PUT', headers:{ 'Authorization':`Bearer ${localStorage.getItem('token')}` }, body: ( ()=>{ const fd = new FormData(); fd.append('status','published'); return fd; })()}); break;
        default: return;
      }
  await updater(item.id);
  toast.success(`${item.type} published now`);
  fetchDashboardData();
    } catch(e){
  console.error('Publish now failed', e);
  toast.error('Publish failed');
    }
  };

  const openReschedule = (item) => {
    setRescheduleItem(item);
    setNewScheduleTime(item.scheduledAt ? item.scheduledAt.substring(0,16) : '');
    setRescheduleOpen(true);
  };

  const applyReschedule = async () => {
    if(!rescheduleItem || !newScheduleTime) return;
    try {
      const iso = new Date(newScheduleTime).toISOString();
      let updater;
      switch(rescheduleItem.type){
        case 'News': updater = (id)=> newsAPI.update(id, { status:'scheduled', scheduledAt: iso }); break;
        case 'Video': updater = (id)=> { const fd=new FormData(); fd.append('status','scheduled'); fd.append('scheduledAt', iso); return videosAPI.update(id, fd); }; break;
        case 'Podcast': updater = (id)=> { const fd=new FormData(); fd.append('status','scheduled'); fd.append('scheduledAt', iso); return podcastsAPI.update(id, fd); }; break;
        case 'Opinion': updater = (id)=> fetch(`http://localhost:5000/api/opinions/${id}`, { method:'PUT', headers:{ 'Authorization':`Bearer ${localStorage.getItem('token')}` }, body:(()=>{ const fd=new FormData(); fd.append('status','scheduled'); fd.append('scheduledAt', iso); return fd; })()}); break;
        default: return;
      }
  await updater(rescheduleItem.id);
      setRescheduleOpen(false);
      setRescheduleItem(null);
  toast.success(`${rescheduleItem.type} rescheduled`);
  fetchDashboardData();
    } catch(e){
  console.error('Reschedule failed', e);
  toast.error('Reschedule failed');
    }
  };

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
        <title>{user?.role === 'admin' ? 'Admin' : 'Editor'} Dashboard - 5WH Media</title>
        <meta name="description" content={`${user?.role === 'admin' ? 'Admin' : 'Editor'} dashboard for 5WH Media content management`} />
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
                {user?.role === 'admin' ? 'Admin' : 'Editor'} Dashboard
              </Typography>
              <Typography variant="body1" sx={{ 
                opacity: 0.9, 
                fontSize: { xs: '0.875rem', md: '1rem' },
                color: 'white'
              }}>
                Welcome back, {user?.name}! Here's what's happening with your content.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <RoleBadge role={user?.role} />
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
          {user?.role === 'admin' && (
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
          )}
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
              title="Scheduled News"
              value={scheduledCounts.news}
              icon={<Article />}
              color="#0288d1"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/admin/news')} fullWidth>
                  View News
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
              title="Scheduled Podcasts"
              value={scheduledCounts.podcasts}
              icon={<Audiotrack />}
              color="#039be5"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/admin/podcasts')} fullWidth>
                  View Podcasts
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
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Scheduled Videos"
              value={scheduledCounts.videos}
              icon={<VideoLibrary />}
              color="#1976d2"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/admin/videos')} fullWidth>
                  View Videos
                </Button>
              }
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Published Opinions"
              value={stats.publishedOpinions || 0}
              icon={<RateReview />}
              color="#7b1fa2"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/admin/opinions')} fullWidth>
                  Manage Opinions
                </Button>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Scheduled Opinions"
              value={scheduledCounts.opinions}
              icon={<RateReview />}
              color="#6a1b9a"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/admin/opinions')} fullWidth>
                  View Opinions
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

          {/* Live Streams Card */}
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Live Streams"
              value="Manage"
              icon={<VideoLibrary />}
              color="#c41e3a"
              action={
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => navigate('/admin/live-streams')}
                  fullWidth
                >
                  Manage Streams
                </Button>
              }
            />
          </Grid>

          {/* Push Notifications Card */}
          <Grid item xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Push Notifications"
              value="Send Alerts"
              icon={<Notifications />}
              color="#9c27b0"
              action={
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => navigate('/admin/push-notifications')}
                  fullWidth
                >
                  Send Notification
                </Button>
              }
            />
          </Grid>
        </Grid>

        {/* Upcoming Scheduled */}
        {upcoming.length > 0 && (
          <Paper sx={{ p:3, mb:4, borderRadius:3 }}>
            <Typography variant="h6" gutterBottom>Upcoming Scheduled Publications</Typography>
            <Grid container spacing={2}>
              {upcoming.map((item, idx)=>(
                <Grid item xs={12} md={6} lg={4} key={idx}>
                  <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight:600 }}>{item.title || 'Untitled'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.type} • {new Date(item.scheduledAt).toLocaleString()}
                    </Typography>
                    <Box sx={{ mt:1, display:'flex', gap:1 }}>
                      <Button size="small" variant="contained" color="success" onClick={()=>handlePublishNow(item)}>
                        Publish Now
                      </Button>
                      <Button size="small" variant="outlined" onClick={()=>openReschedule(item)}>
                        Reschedule
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        <Dialog open={!!rescheduleOpen} onClose={()=>setRescheduleOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Reschedule {rescheduleItem?.type}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              type="datetime-local"
              label="New Scheduled Time"
              InputLabelProps={{ shrink: true }}
              value={newScheduleTime}
              onChange={(e)=> setNewScheduleTime(e.target.value)}
              sx={{ mt:1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setRescheduleOpen(false)}>Cancel</Button>
            <Button onClick={applyReschedule} variant="contained" disabled={!newScheduleTime}>Save</Button>
          </DialogActions>
        </Dialog>

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
              {user?.role === 'admin' && (
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
              )}
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
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MenuBook />}
                  onClick={() => navigate('/admin/books')}
                  sx={{
                    color: '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Manage Books
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Article />}
                  onClick={() => navigate('/admin/life-culture')}
                  sx={{
                    color: '#c41e3a',
                    borderColor: '#c41e3a',
                    '&:hover': {
                      borderColor: '#a01729',
                      backgroundColor: 'rgba(196, 30, 58, 0.04)'
                    }
                  }}
                >
                  Manage Life & Culture
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Recent Users - Admin Only */}
        {user?.role === 'admin' && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Users
              </Typography>

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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Container>
    </>
  );
};

export default AdminDashboard;
