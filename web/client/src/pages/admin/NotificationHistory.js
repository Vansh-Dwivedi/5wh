import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Pagination,
  Avatar,
  Tooltip,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Search,
  Notifications,
  Schedule,
  People,
  VolumeUp,
  Delete,
  Visibility,
  Download,
  FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotificationHistory = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  useEffect(() => {
    fetchNotificationHistory();
    fetchStats();
  }, [page]);

  useEffect(() => {
    // Filter notifications based on search term
    if (searchTerm) {
      const filtered = notifications.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNotifications(filtered);
    } else {
      setFilteredNotifications(notifications);
    }
  }, [notifications, searchTerm]);

  const fetchNotificationHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com/api/notifications/history?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setTotalPages(Math.ceil(data.pagination.total / data.pagination.limit));
      } else {
        setError(data.message || 'Failed to fetch notification history');
      }
    } catch (error) {
      console.error('Error fetching notification history:', error);
      setError('Failed to fetch notification history');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'breaking': return 'error';
      case 'live': return 'warning';
      case 'general': return 'info';
      default: return 'default';
    }
  };

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'breaking': return '🚨';
      case 'live': return '🔴';
      case 'general': return '📰';
      default: return '📱';
    }
  };

  const getSoundTypeIcon = (soundType) => {
    switch (soundType) {
      case 'urgent': return '⚠️';
      case 'breaking': return '🚨';
      case 'default': return '🔔';
      default: return '🔔';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchNotificationHistory();
    fetchStats();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const exportToCSV = () => {
    const csvData = notifications.map(notification => ({
      'Date': formatDate(notification.timestamp),
      'Title': notification.title,
      'Message': notification.message,
      'Type': notification.type,
      'Sound': notification.soundType,
      'Target': notification.targetAudience,
      'Devices': notification.deviceCount
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && notifications.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading notification history...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/admin/push-notifications')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              📊 Notification History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage all sent push notifications
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportToCSV}
            disabled={notifications.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ backgroundColor: '#c41e3a', '&:hover': { backgroundColor: '#a01728' } }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {stats.totalNotifications || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sent
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#1976d2' }}>
                  <Notifications />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {stats.todayNotifications || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#2e7d32' }}>
                  <Schedule />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                    {stats.totalDevices || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registered Devices
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#ed6c02' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {stats.notificationTypes?.breaking || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Breaking News
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#d32f2f' }}>
                  🚨
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {filteredNotifications.length} of {notifications.length} notifications
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification History
          </Typography>
          
          {filteredNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'No notifications match your search' : 'No notifications sent yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {searchTerm ? 'Try different search terms' : 'Start sending notifications to see them here'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Title & Message</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Sent</TableCell>
                    <TableCell>Devices</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">
                            {getNotificationTypeIcon(notification.type)}
                          </Typography>
                          <Chip
                            label={notification.type}
                            color={getNotificationTypeColor(notification.type)}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {notification.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {notification.message}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<span>{getSoundTypeIcon(notification.soundType)}</span>}
                            label={notification.soundType}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={notification.targetAudience}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatRelativeTime(notification.timestamp)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.timestamp)}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="h6" color="primary">
                          {notification.deviceCount}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Last notification info */}
      {stats.lastNotification && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📱 Last Notification Sent
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Title:</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{stats.lastNotification.title}</Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Message:</Typography>
                <Typography variant="body1">{stats.lastNotification.message}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Sent:</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {formatRelativeTime(stats.lastNotification.timestamp)}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Devices Reached:</Typography>
                <Typography variant="body1">{stats.lastNotification.deviceCount} devices</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default NotificationHistory;
