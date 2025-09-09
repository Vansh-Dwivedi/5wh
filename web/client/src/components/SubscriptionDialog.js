import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress
} from '@mui/material';
import { Email as EmailIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const SubscriptionDialog = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    dailyNews: true,
    breakingNews: true,
    weeklyDigest: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          preferences
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setEmail('');
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (preference) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const isValidEmail = (email) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon color="primary" />
          <Typography variant="h6">Subscribe to Newsletter</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.main" gutterBottom>
              Successfully Subscribed!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thank you for subscribing to our newsletter. You'll start receiving updates soon.
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Stay updated with the latest news from 5WH Media. Get breaking news, daily updates, and weekly digests delivered to your inbox.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={email && !isValidEmail(email)}
              helperText={email && !isValidEmail(email) ? 'Please enter a valid email address' : ''}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <Typography variant="subtitle2" gutterBottom>
              Subscription Preferences:
            </Typography>

            <Box sx={{ ml: 1, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={preferences.dailyNews}
                    onChange={() => handlePreferenceChange('dailyNews')}
                    disabled={loading}
                  />
                }
                label="Daily News Updates"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={preferences.breakingNews}
                    onChange={() => handlePreferenceChange('breakingNews')}
                    disabled={loading}
                  />
                }
                label="Breaking News Alerts"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={preferences.weeklyDigest}
                    onChange={() => handlePreferenceChange('weeklyDigest')}
                    disabled={loading}
                  />
                }
                label="Weekly Digest"
              />
            </Box>
          </form>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !email || !isValidEmail(email)}
            sx={{
              minWidth: 120,
              backgroundColor: '#c41e3a',
              '&:hover': {
                backgroundColor: '#8b0000',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Subscribe'
            )}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default SubscriptionDialog;
