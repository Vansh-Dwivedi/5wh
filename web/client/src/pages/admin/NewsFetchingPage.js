import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  LinearProgress,
  Switch
} from '@mui/material';
import {
  RssFeed as RssIcon,
  Web as WebIcon,
  Refresh as RefreshIcon,
  GetApp as FetchIcon,
  ArrowBack,
  Timeline as TimelineIcon,
  ArticleOutlined as ArticleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useRoleBasedNavigation from '../../hooks/useRoleBasedNavigation';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';

const NewsFetchingPage = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleBasedNavigation();
  const [loading, setLoading] = useState({
    rss: false,
    scraping: false,
    combined: false,
    status: false,
    autoSync: false
  });
  const [results, setResults] = useState({});
  const [status, setStatus] = useState(null);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [error, setError] = useState('');

  const handleFetch = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setError('');
    
    try {
      let endpoint = '';
      switch (type) {
        case 'rss':
          endpoint = '/fetch/fetch-rss';
          break;
        case 'scraping':
          endpoint = '/fetch/fetch-scraping';
          break;
        case 'combined':
          endpoint = '/fetch/fetch-all';
          break;
        default:
          throw new Error('Invalid fetch type');
      }
      
      const response = await api.post(endpoint);
      setResults(prev => ({ ...prev, [type]: response.data }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Fetch failed');
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleGetStatus = async () => {
    setLoading(prev => ({ ...prev, status: true }));
    setError('');
    
    try {
      const response = await api.get('/fetch/status');
      setStatus(response.data.data);
      
      // Also get scheduler status
      const schedulerResponse = await api.get('/fetch/scheduler-status');
      setSchedulerStatus(schedulerResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Status fetch failed');
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  };

  const handleToggleAutoSync = async (event) => {
    const enable = event.target.checked;
    const previousState = schedulerStatus?.enabled || false;
    
    // Optimistically update the UI
    setSchedulerStatus(prev => ({ 
      ...prev, 
      enabled: enable 
    }));
    
    setLoading(prev => ({ ...prev, autoSync: true }));
    setError('');
    
    try {
      const endpoint = enable ? '/fetch/enable-auto-sync' : '/fetch/disable-auto-sync';
      const response = await api.post(endpoint);
      
      console.log('Auto-sync response:', response.data);
      
      // Update with server response
      setSchedulerStatus(response.data.data);
      
      // Show success message
      const message = enable ? 'Auto-sync enabled successfully' : 'Auto-sync disabled successfully';
      setResults(prev => ({ 
        ...prev, 
        autoSync: { 
          success: true, 
          message,
          data: response.data.data 
        } 
      }));
    } catch (err) {
      // Revert to previous state on error
      setSchedulerStatus(prev => ({ 
        ...prev, 
        enabled: previousState 
      }));
      setError(err.response?.data?.message || err.message || 'Auto-sync toggle failed');
    } finally {
      setLoading(prev => ({ ...prev, autoSync: false }));
    }
  };

  // Fetch scheduler status on component mount
  useEffect(() => {
    const fetchSchedulerStatus = async () => {
      try {
        const response = await api.get('/fetch/scheduler-status');
        setSchedulerStatus(response.data.data);
      } catch (err) {
        console.error('Failed to fetch scheduler status:', err);
      }
    };
    
    fetchSchedulerStatus();
  }, []);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <Helmet>
        <title>News Fetching Control Panel - 5WH Media Admin</title>
        <meta name="description" content="Control panel for fetching news from multiple sources" />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigateToDashboard()} color="primary">
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ArticleIcon color="primary" />
                News Fetching Control Panel
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Fetch the latest news from multiple Punjabi sources using RSS feeds and web scraping
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      RSS Feeds
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fast & Reliable
                    </Typography>
                  </Box>
                  <RssIcon sx={{ fontSize: '2rem', color: '#666' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Web Scraping
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive
                    </Typography>
                  </Box>
                  <WebIcon sx={{ fontSize: '2rem', color: '#666' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Combined Fetch
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Maximum Coverage
                    </Typography>
                  </Box>
                  <FetchIcon sx={{ fontSize: '2rem', color: '#666' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Auto Sync
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Every 2 Hours
                    </Typography>
                  </Box>
                  <TimelineIcon sx={{ fontSize: '2rem', color: '#666' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Auto-Sync Control Section */}
        <Card sx={{ mb: 4, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimelineIcon sx={{ mr: 1, color: '#667eea' }} />
              <Typography variant="h6" fontWeight="bold">
                RSS Auto-Sync Settings
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Control automatic RSS feed synchronization. When enabled, news will be fetched automatically every 6 hours.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body1" fontWeight="medium">
                Auto-Sync Status:
              </Typography>
              <Switch
                checked={schedulerStatus?.enabled || false}
                onChange={handleToggleAutoSync}
                disabled={loading.autoSync}
                color="primary"
              />
              <Chip 
                label={schedulerStatus?.enabled ? 'Enabled' : 'Disabled'}
                color={schedulerStatus?.enabled ? 'success' : 'default'}
                size="small"
              />
              {loading.autoSync && <CircularProgress size={20} />}
            </Box>
            
            {schedulerStatus && (
              <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Current Status
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {schedulerStatus.status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Last Run
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {schedulerStatus.lastRun 
                        ? new Date(schedulerStatus.lastRun).toLocaleString() 
                        : 'Never'
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Next Run
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {schedulerStatus.nextRun 
                        ? new Date(schedulerStatus.nextRun).toLocaleString() 
                        : 'Not scheduled'
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {results.autoSync && (
              <Alert 
                severity={results.autoSync.success ? 'success' : 'error'} 
                sx={{ mt: 2 }}
              >
                {results.autoSync.message}
              </Alert>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* RSS Feed Fetch */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RssIcon sx={{ mr: 1, color: '#667eea' }} />
                  <Typography variant="h6" fontWeight="bold">
                    RSS Feed Fetch
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Fetch news from Google RSS feeds (fast, reliable). Gets articles from major Punjabi news sources.
                </Typography>
                {loading.rss && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Fetching RSS feeds...
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="contained"
                  onClick={() => handleFetch('rss')}
                  disabled={loading.rss}
                  startIcon={loading.rss ? <CircularProgress size={20} /> : <RssIcon />}
                  fullWidth
                  sx={{
                    borderRadius: '4px',
                    py: 1.5
                  }}
                >
                  {loading.rss ? 'Fetching RSS...' : 'Fetch RSS News'}
                </Button>
                
                {results.rss && (
                  <Alert severity={results.rss.success ? 'success' : 'error'} sx={{ mt: 2 }}>
                    {results.rss.message}
                    {results.rss.data && (
                      <Box sx={{ mt: 1 }}>
                        <Chip label={`${results.rss.data.articles || 0} articles fetched`} size="small" />
                      </Box>
                    )}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Web Scraping */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WebIcon sx={{ mr: 1, color: '#f5576c' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Web Scraping
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Scrape news directly from Punjabi news websites. More comprehensive but takes longer to complete.
                </Typography>
                {loading.scraping && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Scraping websites...
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleFetch('scraping')}
                  disabled={loading.scraping}
                  startIcon={loading.scraping ? <CircularProgress size={20} /> : <WebIcon />}
                  fullWidth
                  sx={{
                    borderRadius: '4px',
                    py: 1.5
                  }}
                >
                  {loading.scraping ? 'Scraping...' : 'Start Web Scraping'}
                </Button>
                
                {results.scraping && (
                  <Alert severity={results.scraping.success ? 'success' : 'error'} sx={{ mt: 2 }}>
                    {results.scraping.message}
                    {results.scraping.data && (
                      <Box sx={{ mt: 1 }}>
                        <Chip label={`${results.scraping.data.articles || 0} articles scraped`} size="small" />
                      </Box>
                    )}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Combined Fetch */}
          <Grid item xs={12}>
            <Card sx={{ border: '1px solid #e0e0e0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FetchIcon sx={{ mr: 1, color: '#4facfe' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Combined Fetch (Recommended)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Fetch news using both RSS feeds and web scraping for maximum coverage. This is the recommended approach for comprehensive news collection.
                </Typography>
                {loading.combined && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Fetching from all sources...
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleFetch('combined')}
                  disabled={loading.combined}
                  startIcon={loading.combined ? <CircularProgress size={24} /> : <FetchIcon />}
                  sx={{
                    borderRadius: '4px',
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {loading.combined ? 'Fetching All News...' : 'Fetch All News Sources'}
                </Button>
                
                {results.combined && (
                  <Box sx={{ mt: 3 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {results.combined.message}
                    </Alert>
                    {results.combined.data && (
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Fetch Results:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`RSS: ${results.combined.data.rss?.articles || 0} articles`} 
                            color="primary" 
                            size="small" 
                          />
                          <Chip 
                            label={`Scraped: ${results.combined.data.scraping?.articles || 0} articles`} 
                            color="secondary" 
                            size="small" 
                          />
                          <Chip 
                            label={`Total: ${results.combined.data.total || 0} new articles`} 
                            color="success" 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                      </Paper>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Information */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            📋 How News Fetching Works
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>RSS Feeds:</strong> Quick and reliable, fetches news from Google RSS feeds covering major Punjabi news sources.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Web Scraping:</strong> More comprehensive, directly scrapes Punjabi news websites from various sources. 
            Gets more detailed content but takes longer.
          </Typography>
          <Typography variant="body2">
            <strong>Combined Fetch:</strong> Uses both methods for maximum news coverage. 
            This runs automatically every 2 hours, with RSS-only updates every 30 minutes.
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default NewsFetchingPage;
