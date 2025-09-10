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
  Videocam
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI, newsAPI, videosAPI, podcastsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import RoleBadge from '../../components/admin/RoleBadge';

const EditorDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({});
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestNews = async () => {
    try {
      setNewsLoading(true);
      setNewsMessage('');
      const response = await newsAPI.fetchLatest();
      if (response.data.success) {
        setNewsMessage(`Successfully fetched ${response.data.count} news articles`);
        toast.success(response.data.message);
        await fetchDashboardData(); // Refresh dashboard data
      } else {
        setNewsMessage(response.data.message || 'Failed to fetch news');
        toast.error(response.data.message || 'Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsMessage('Error occurred while fetching news');
      toast.error('Error occurred while fetching news');
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user]);

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
        case 'Opinion': updater = async(id)=> fetch(`https://5whmedia.com:5000/api/opinions/${id}`, { method:'PUT', headers:{ 'Authorization':`Bearer ${localStorage.getItem('token')}` }, body: ( ()=>{ const fd = new FormData(); fd.append('status','published'); return fd; })()}); break;
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
        case 'Opinion': updater = (id)=> fetch(`https://5whmedia.com:5000/api/opinions/${id}`, { method:'PUT', headers:{ 'Authorization':`Bearer ${localStorage.getItem('token')}` }, body:(()=>{ const fd=new FormData(); fd.append('status','scheduled'); fd.append('scheduledAt', iso); return fd; })()}); break;
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
        <title>Editor Dashboard - 5WH Media</title>
        <meta name="description" content="Editor dashboard for 5WH Media content management" />
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
                Editor Dashboard
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
          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Published News"
              value={stats.publishedNews}
              icon={<Article />}
              color="#2e7d32"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/editor/news')} fullWidth>
                  Manage News
                </Button>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Published Videos"
              value={stats.publishedVideos}
              icon={<VideoLibrary />}
              color="#d32f2f"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/editor/videos')} fullWidth>
                  Manage Videos
                </Button>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Published Podcasts"
              value={stats.publishedPodcasts}
              icon={<Audiotrack />}
              color="#ed6c02"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/editor/podcasts')} fullWidth>
                  Manage Podcasts
                </Button>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Published Opinions"
              value={stats.publishedOpinions || 0}
              icon={<RateReview />}
              color="#7b1fa2"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/editor/opinions')} fullWidth>
                  Manage Opinions
                </Button>
              }
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Draft Articles"
              value={draftCount}
              icon={<Edit />}
              color="#f57c00"
              action={
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => navigate('/editor/draft-news')}
                  disabled={draftCount === 0}
                  fullWidth
                >
                  {draftCount > 0 ? 'Review Drafts' : 'No Drafts'}
                </Button>
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Scheduled News"
              value={scheduledCounts.news}
              icon={<Article />}
              color="#0288d1"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/editor/news')} fullWidth>
                  View Scheduled
                </Button>
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Scheduled Videos"
              value={scheduledCounts.videos}
              icon={<VideoLibrary />}
              color="#1976d2"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/editor/videos')} fullWidth>
                  View Scheduled
                </Button>
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Scheduled Podcasts"
              value={scheduledCounts.podcasts}
              icon={<Audiotrack />}
              color="#039be5"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/editor/podcasts')} fullWidth>
                  View Scheduled
                </Button>
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Live Streams"
              value="Manage"
              icon={<Videocam />}
              color="#c41e3a"
              action={
                <Button size="small" variant="outlined" onClick={() => navigate('/editor/live-streams')} fullWidth>
                  Manage Streams
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
      </Container>
    </>
  );
};

export default EditorDashboard;
