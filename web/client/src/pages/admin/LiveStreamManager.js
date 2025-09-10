import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow,
  Stop,
  Visibility,
  Schedule,
  Videocam as LiveIcon,
  ArrowBack
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useRoleBasedNavigation from '../../hooks/useRoleBasedNavigation';

const LiveStreamManager = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleBasedNavigation();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    streamUrl: '',
    thumbnailUrl: '',
    category: 'News',
    presenter: '',
    language: 'Punjabi',
    scheduledTime: '',
    isLive: false
  });

  const categories = ['News', 'Discussion', 'Event', 'Interview', 'Breaking News', 'Special Coverage'];
  const languages = ['Punjabi', 'English', 'Hindi', 'Punjabi/English'];

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://5whmedia.com:5000/api/live');
      console.log('Fetch streams response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 429) {
          console.error('Rate limited. Stopping automatic refresh.');
          return; // Don't retry if rate limited
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Streams data:', data);
      
      if (data.success) {
        setStreams(data.data);
      } else {
        console.error('API returned unsuccessful response:', data);
        toast.error('Failed to fetch live streams');
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
      
      // Don't show error toast on rate limiting
      if (!error.message.includes('429')) {
        toast.error(`Error fetching live streams: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (stream = null) => {
    if (stream) {
      setEditingStream(stream);
      setFormData({
        title: stream.title,
        description: stream.description,
        streamUrl: stream.streamUrl,
        thumbnailUrl: stream.thumbnailUrl || '',
        category: stream.category,
        presenter: stream.presenter,
        language: stream.language,
        scheduledTime: stream.scheduledTime ? new Date(stream.scheduledTime).toISOString().slice(0, 16) : '',
        isLive: stream.isLive
      });
    } else {
      setEditingStream(null);
      setFormData({
        title: '',
        description: '',
        streamUrl: '',
        thumbnailUrl: '',
        category: 'News',
        presenter: '',
        language: 'Punjabi',
        scheduledTime: '',
        isLive: false
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStream(null);
    setFormData({
      title: '',
      description: '',
      streamUrl: '',
      thumbnailUrl: '',
      category: 'News',
      presenter: '',
      language: 'Punjabi',
      scheduledTime: '',
      isLive: false
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const method = editingStream ? 'PUT' : 'POST';
      const url = editingStream ? `https://5whmedia.com:5000/api/live/${editingStream.id}` : 'https://5whmedia.com:5000/api/live';
      
      const submitData = {
        ...formData,
        scheduledTime: formData.scheduledTime || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        toast.success(editingStream ? 'Stream updated successfully' : 'Stream created successfully');
        fetchStreams();
        handleCloseDialog();
      } else {
        console.error('API Error:', data);
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving stream:', error);
      toast.error(`Error saving stream: ${error.message}`);
    }
  };

  const handleDelete = async (streamId) => {
    if (!window.confirm('Are you sure you want to delete this live stream?')) {
      return;
    }

    try {
      const response = await fetch(`https://5whmedia.com:5000/api/live/${streamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Stream deleted successfully');
        fetchStreams();
      } else {
        toast.error(data.message || 'Failed to delete stream');
      }
    } catch (error) {
      console.error('Error deleting stream:', error);
      toast.error('Error deleting stream');
    }
  };

  const handleToggleLive = async (stream) => {
    try {
      const response = await fetch(`https://5whmedia.com:5000/api/live/${stream.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isLive: !stream.isLive
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(stream.isLive ? 'Stream stopped' : 'Stream started');
        fetchStreams();
      } else {
        toast.error(data.message || 'Failed to toggle stream status');
      }
    } catch (error) {
      console.error('Error toggling stream:', error);
      toast.error('Error toggling stream status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with back button */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigateToDashboard()}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c2c2c' }}>
            Live Stream Manager
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#c41e3a', '&:hover': { backgroundColor: '#a01728' } }}
        >
          Add Stream
        </Button>
      </Box>

      {loading ? (
        <Alert severity="info">Loading live streams...</Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Presenter</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Viewers</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Scheduled</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {streams.map((stream) => (
                <TableRow key={stream.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {stream.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {stream.description.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {stream.isLive ? (
                      <Chip
                        icon={<LiveIcon />}
                        label="LIVE"
                        color="error"
                        size="small"
                        sx={{ backgroundColor: '#c41e3a' }}
                      />
                    ) : (
                      <Chip
                        label="Offline"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={stream.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{stream.presenter}</TableCell>
                  <TableCell>
                    {stream.isLive ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                        {stream.viewerCount || 0}
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {stream.scheduledTime ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          {formatDate(stream.scheduledTime)}
                        </Typography>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleLive(stream)}
                        sx={{ 
                          color: stream.isLive ? '#f44336' : '#4caf50',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                        }}
                      >
                        {stream.isLive ? <Stop /> : <PlayArrow />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(stream)}
                        sx={{ color: '#666' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(stream.id)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
          {editingStream ? 'Edit Live Stream' : 'Add New Live Stream'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stream Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stream URL"
                value={formData.streamUrl}
                onChange={(e) => handleInputChange('streamUrl', e.target.value)}
                placeholder="https://your-stream-url.com/stream"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thumbnail URL (Optional)"
                value={formData.thumbnailUrl}
                onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  label="Language"
                >
                  {languages.map((language) => (
                    <MenuItem key={language} value={language}>
                      {language}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Presenter/Host"
                value={formData.presenter}
                onChange={(e) => handleInputChange('presenter', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scheduled Time (Optional)"
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isLive}
                    onChange={(e) => handleInputChange('isLive', e.target.checked)}
                    color="primary"
                  />
                }
                label="Start Live Stream Immediately"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ backgroundColor: '#c41e3a', '&:hover': { backgroundColor: '#a01728' } }}
          >
            {editingStream ? 'Update Stream' : 'Create Stream'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveStreamManager;
