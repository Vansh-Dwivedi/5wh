import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Paper,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Send,
  Notifications,
  VolumeUp,
  Schedule,
  Preview,
  History
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useRoleBasedNavigation from '../../hooks/useRoleBasedNavigation';

const PushNotificationManager = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleBasedNavigation();
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'general', // 'breaking', 'live', 'general'
    soundType: 'default', // 'default', 'urgent', 'breaking'
    targetAudience: 'all' // 'all', 'subscribed', 'punjabi'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const notificationTypes = [
    { value: 'breaking', label: '🚨 Breaking News', color: 'error' },
    { value: 'live', label: '🔴 Live Stream', color: 'warning' },
    { value: 'general', label: '📰 General Update', color: 'info' }
  ];

  const soundTypes = [
    { value: 'default', label: '🔔 Default Sound' },
    { value: 'urgent', label: '⚠️ Urgent Alert' },
    { value: 'breaking', label: '🚨 Breaking News Sound' }
  ];

  const audienceTypes = [
    { value: 'all', label: '👥 All Users' },
    { value: 'subscribed', label: '✅ Newsletter Subscribers' },
    { value: 'punjabi', label: '🏠 Punjab Region' }
  ];

  const handleInputChange = (field, value) => {
    setNotification(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreview = () => {
    if (!notification.title || !notification.message) {
      setError('Please fill in title and message for preview');
      return;
    }

    // Show browser notification for preview
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo192.png',
            badge: '/favicon.ico'
          });
        }
      });
    }
  };

  const handleTestNotification = async () => {
    if (!notification.title || !notification.message) {
      setError('Please fill in title and message for test');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://5whmedia.com:5000/api/notifications/push-notification-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Test notification sent successfully! (No auth required)`);
      } else {
        setError(data.message || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError(`Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notification.title || !notification.message) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://5whmedia.com:5000/api/notifications/push-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(notification)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Notification sent successfully! Delivered to ${data.deviceCount || 0} devices.`);
        setNotification({
          title: '',
          message: '',
          type: 'general',
          soundType: 'default',
          targetAudience: 'all'
        });
      } else {
        setError(data.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigateToDashboard()}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              📱 Push Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Send instant notifications to mobile app users
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin/notification-history')}
          startIcon={<History />}
          sx={{ px: 3 }}
        >
          View History
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create Notification
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Notification Title"
                  value={notification.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Breaking: Election Results Announced"
                  required
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message Content"
                  value={notification.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Write your notification message here..."
                  required
                  sx={{ mb: 3 }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Notification Type</InputLabel>
                      <Select
                        value={notification.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        label="Notification Type"
                      >
                        {notificationTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Sound Type</InputLabel>
                      <Select
                        value={notification.soundType}
                        onChange={(e) => handleInputChange('soundType', e.target.value)}
                        label="Sound Type"
                      >
                        {soundTypes.map(sound => (
                          <MenuItem key={sound.value} value={sound.value}>
                            {sound.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Target Audience</InputLabel>
                      <Select
                        value={notification.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        label="Target Audience"
                      >
                        {audienceTypes.map(audience => (
                          <MenuItem key={audience.value} value={audience.value}>
                            {audience.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Preview />}
                  onClick={handlePreview}
                  disabled={!notification.title || !notification.message}
                >
                  Preview
                </Button>

                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleTestNotification}
                  disabled={loading || !notification.title || !notification.message}
                >
                  Test (No Auth)
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSendNotification}
                  loading={loading}
                  disabled={loading || !notification.title || !notification.message}
                  sx={{
                    backgroundColor: '#c41e3a',
                    '&:hover': { backgroundColor: '#a01728' }
                  }}
                >
                  {loading ? 'Sending...' : 'Send Notification'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              📱 Mobile Preview
            </Typography>
            
            <Box sx={{ 
              backgroundColor: 'white', 
              p: 2, 
              borderRadius: 2, 
              border: '1px solid #e0e0e0',
              mb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  backgroundColor: '#c41e3a', 
                  borderRadius: '50%', 
                  mr: 1 
                }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  5WH Media
                </Typography>
              </Box>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {notification.title || 'Notification Title'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {notification.message || 'Your notification message will appear here...'}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                now
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Settings:
              </Typography>
              <Chip 
                label={notificationTypes.find(t => t.value === notification.type)?.label || 'General'} 
                size="small" 
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip 
                label={soundTypes.find(s => s.value === notification.soundType)?.label || 'Default'} 
                size="small" 
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip 
                label={audienceTypes.find(a => a.value === notification.targetAudience)?.label || 'All Users'} 
                size="small" 
                sx={{ mb: 1 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PushNotificationManager;
