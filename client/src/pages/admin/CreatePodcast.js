import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  IconButton,
  LinearProgress,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Preview,
  CloudUpload,
  AudioFile,
  Image as ImageIcon,
  Delete,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { podcastsAPI } from '../../services/api';

const CreatePodcast = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    durationSeconds: '',
    host: '',
    guests: [],
    category: 'interviews',
    tags: '',
    status: 'draft',
    featured: false,
    transcript: '',
    showNotes: '',
    thumbnailAlt: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  });

  // File upload state
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newGuest, setNewGuest] = useState('');

  // Podcast categories
  const categories = [
    { value: 'interviews', label: 'Interviews' },
    { value: 'news', label: 'News' },
    { value: 'politics', label: 'Politics' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'opinion', label: 'Opinion' },
    { value: 'history', label: 'History' },
    { value: 'culture', label: 'Culture' },
    { value: 'other', label: 'Other' }
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle audio file upload
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
      setError('');
    } else {
      setError('Please select a valid audio file');
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  };

  // Add guest
  const handleAddGuest = () => {
    if (newGuest.trim() && !formData.guests.some(g => g.name === newGuest.trim())) {
      setFormData(prev => ({
        ...prev,
        guests: [...prev.guests, { name: newGuest.trim(), bio: '', avatar: '' }]
      }));
      setNewGuest('');
    }
  };

  // Remove guest
  const handleRemoveGuest = (index) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index)
    }));
  };

  // Convert duration to seconds
  const convertDurationToSeconds = (duration) => {
    const parts = duration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return 0;
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!audioFile) {
      setError('Audio file is required');
      return;
    }

    setLoading(true);
    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const submitFormData = new FormData();
      
      // Add text fields
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description);
      submitFormData.append('duration', formData.duration);
      submitFormData.append('durationSeconds', convertDurationToSeconds(formData.duration));
      submitFormData.append('host', formData.host);
      submitFormData.append('guests', JSON.stringify(formData.guests));
      submitFormData.append('category', formData.category);
      submitFormData.append('tags', formData.tags);
      submitFormData.append('status', formData.status);
      submitFormData.append('featured', formData.featured);
      submitFormData.append('transcript', formData.transcript);
      submitFormData.append('showNotes', formData.showNotes);
      submitFormData.append('thumbnailAlt', formData.thumbnailAlt);
      submitFormData.append('slug', generateSlug(formData.title));
      
      // Add SEO data
      submitFormData.append('seo', JSON.stringify({
        metaTitle: formData.seo.metaTitle || formData.title,
        metaDescription: formData.seo.metaDescription || formData.description.substring(0, 160),
        keywords: formData.seo.keywords ? formData.seo.keywords.split(',').map(k => k.trim()) : []
      }));

      // Add files
      if (audioFile) {
        submitFormData.append('audio', audioFile);
      }
      if (thumbnailFile) {
        submitFormData.append('thumbnail', thumbnailFile);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Submit to API
      const response = await podcastsAPI.create(submitFormData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setSuccess('Podcast created successfully!');
      
      // Redirect after success
      setTimeout(() => {
        navigate('/admin/podcasts');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create podcast');
      console.error('Error creating podcast:', err);
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Podcast - 5WH Media Admin</title>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/podcasts')} color="primary">
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Create New Podcast
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {uploading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Uploading podcast... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Podcast Details
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Podcast Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter podcast title..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter podcast description..."
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Duration (mm:ss or hh:mm:ss)"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g., 45:30 or 1:45:30"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Host"
                        name="host"
                        value={formData.host}
                        onChange={handleChange}
                        placeholder="Enter host name..."
                      />
                    </Grid>

                    {/* Guests */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Guests
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {formData.guests.map((guest, index) => (
                          <Chip
                            key={index}
                            label={guest.name}
                            onDelete={() => handleRemoveGuest(index)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="Add Guest"
                          value={newGuest}
                          onChange={(e) => setNewGuest(e.target.value)}
                          size="small"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGuest())}
                        />
                        <Button onClick={handleAddGuest} startIcon={<Add />}>
                          Add
                        </Button>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Show Notes"
                        name="showNotes"
                        value={formData.showNotes}
                        onChange={handleChange}
                        placeholder="Enter show notes, links, and additional information..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="Transcript (Optional)"
                        name="transcript"
                        value={formData.transcript}
                        onChange={handleChange}
                        placeholder="Enter full transcript of the podcast..."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    SEO Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Meta Title"
                        name="seo.metaTitle"
                        value={formData.seo.metaTitle}
                        onChange={handleChange}
                        placeholder="SEO title for search engines..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Meta Description"
                        name="seo.metaDescription"
                        value={formData.seo.metaDescription}
                        onChange={handleChange}
                        placeholder="SEO description for search engines..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Keywords"
                        name="seo.keywords"
                        value={formData.seo.keywords}
                        onChange={handleChange}
                        placeholder="SEO keywords separated by commas..."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* File Uploads */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Media Files
                  </Typography>
                  
                  {/* Audio Upload */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Audio File *
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        border: '2px dashed #ddd',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => document.getElementById('audio-upload').click()}
                    >
                      <input
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        style={{ display: 'none' }}
                      />
                      {audioFile ? (
                        <Box>
                          <AudioFile color="primary" sx={{ fontSize: 48, mb: 1 }} />
                          <Typography variant="body2">
                            {audioFile.name}
                          </Typography>
                          {audioPreview && (
                            <audio controls style={{ width: '100%', marginTop: '8px' }}>
                              <source src={audioPreview} type={audioFile.type} />
                            </audio>
                          )}
                        </Box>
                      ) : (
                        <Box>
                          <CloudUpload color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Click to upload audio file
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Box>

                  {/* Thumbnail Upload */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Thumbnail Image
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        border: '2px dashed #ddd',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => document.getElementById('thumbnail-upload').click()}
                    >
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        style={{ display: 'none' }}
                      />
                      {thumbnailPreview ? (
                        <Box>
                          <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            style={{ 
                              width: '100%', 
                              maxHeight: '200px', 
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }} 
                          />
                          <TextField
                            fullWidth
                            size="small"
                            label="Alt Text"
                            name="thumbnailAlt"
                            value={formData.thumbnailAlt}
                            onChange={handleChange}
                            sx={{ mt: 2 }}
                            placeholder="Describe the image..."
                          />
                        </Box>
                      ) : (
                        <Box>
                          <ImageIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Click to upload thumbnail
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Settings
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          label="Category"
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.value} value={category.value}>
                              {category.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="Enter tags separated by commas..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          label="Status"
                        >
                          <MenuItem value="draft">Draft</MenuItem>
                          <MenuItem value="published">Published</MenuItem>
                          <MenuItem value="archived">Archived</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="featured"
                            checked={formData.featured}
                            onChange={handleChange}
                          />
                        }
                        label="Featured Podcast"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Submit Actions */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Creating...' : 'Create Podcast'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Preview />}
                  disabled={loading}
                  fullWidth
                  onClick={() => {
                    // Could add preview functionality here
                    console.log('Preview:', formData);
                  }}
                >
                  Preview
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </>
  );
};

export default CreatePodcast;
