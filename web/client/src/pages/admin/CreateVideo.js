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
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  CloudUpload,
  VideoFile,
  Image as ImageIcon,
  Delete,
  Add,
  ArrowBack,
  Save,
  Preview,
  YouTube,
  Upload,
  Movie,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { videosAPI } from '../../services/api';

const CreateVideo = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    videoType: 'upload',
    videoUrl: '',
    videoFile: null,
    thumbnail: null,
    duration: '',
    quality: '1080p',
  tags: [],
  featured: false,
  status: 'draft',
  scheduledAt: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [videoPreview, setVideoPreview] = useState(null);

  // Helper function to extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url) => {
    if (!url) return '';
    
    // If it's already just the video ID, return it
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
      return url;
    }
    
    // Handle various YouTube URL formats
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/,
      /(?:https?:\/\/)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no pattern matches, return the original URL (might be just the ID)
    return url;
  };
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const categories = [
    'news', 'interviews', 'live', 'documentaries', 'analysis', 
    'breaking', 'entertainment', 'sports'
  ];

  const videoTypes = [
    { value: 'upload', label: 'Upload Video File', icon: <Upload /> },
    { value: 'youtube', label: 'YouTube Video', icon: <YouTube /> },
    { value: 'vimeo', label: 'Vimeo Video', icon: <Movie /> }
  ];

  const qualityOptions = ['720p', '1080p', '4K'];

  const steps = [
    {
      label: 'Basic Information',
      description: 'Enter video title, description, and category'
    },
    {
      label: 'Video Content',
      description: 'Upload video file or provide video URL'
    },
    {
      label: 'Additional Details',
      description: 'Add thumbnail, tags, and other metadata'
    },
    {
      label: 'Review & Publish',
      description: 'Review all information and publish'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleVideoFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, videoFile: file }));
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setVideoPreview(url);
        
        // Get video duration
        const video = document.createElement('video');
        video.src = url;
        video.onloadedmetadata = () => {
          const totalSeconds = Math.floor(video.duration);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          setFormData(prev => ({
            ...prev,
            duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            durationSeconds: totalSeconds
          }));
        };
      } else {
        setError('Please select a valid video file');
      }
    }
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, thumbnail: file }));
        const url = URL.createObjectURL(file);
        setThumbnailPreview(url);
      } else {
        setError('Please select a valid image file');
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.title && formData.description && formData.category;
      case 1:
        return formData.videoType === 'upload' 
          ? formData.videoFile 
          : formData.videoUrl;
      case 2:
        return true; // Optional step
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    } else {
      setError('Please fill in all required fields for this step');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!formData.title) {
        setError('Title is required');
        setLoading(false);
        return;
      }
      if (!formData.description) {
        setError('Description is required');
        setLoading(false);
        return;
      }
      if (!formData.category) {
        setError('Category is required');
        setLoading(false);
        return;
      }
      if (formData.videoType === 'upload' && !formData.videoFile) {
        setError('Video file is required for upload type');
        setLoading(false);
        return;
      }
      if (formData.videoType !== 'upload' && !formData.videoUrl) {
        setError('Video URL is required for external videos');
        setLoading(false);
        return;
      }
      
      // Validate scheduling
      if (formData.status === 'scheduled') {
        if (!formData.scheduledAt) {
          setError('Please select a schedule date/time');
          setLoading(false);
          return;
        }
        const scheduledDate = new Date(formData.scheduledAt);
        if (scheduledDate < new Date()) {
          setError('Scheduled time must be in the future');
          setLoading(false);
          return;
        }
      }

      const submitData = new FormData();

      // Append primitive fields except files & tags (handled separately)
      Object.entries(formData).forEach(([key, value]) => {
        if (['videoFile', 'thumbnail', 'tags', 'scheduledAt', 'status'].includes(key)) return;
        if (value !== undefined && value !== null) submitData.append(key, value);
      });

      // Status & scheduling
      if (formData.status === 'scheduled') {
        submitData.append('status', 'scheduled');
        submitData.append('scheduledAt', formData.scheduledAt);
      } else {
        submitData.append('status', formData.status);
      }

      // Tags
      submitData.append('tags', JSON.stringify(formData.tags));

      // Duration seconds if available
      if (formData.durationSeconds) {
        submitData.append('durationSeconds', formData.durationSeconds);
      }

      // Files
      if (formData.videoType === 'upload' && formData.videoFile) {
        submitData.append('video', formData.videoFile);
      }
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }

      await videosAPI.create(submitData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      setSuccess('Video created successfully!');
      setTimeout(() => {
        navigate('/admin/videos');
      }, 2000);

    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication required. Please login to access admin features.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to create video');
      }
      console.error('Error creating video:', err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Video Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                helperText="Enter a compelling title for your video"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={4}
                required
                helperText="Provide a detailed description of your video content"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Quality</InputLabel>
                <Select
                  value={formData.quality}
                  label="Quality"
                  onChange={(e) => handleInputChange('quality', e.target.value)}
                >
                  {qualityOptions.map((quality) => (
                    <MenuItem key={quality} value={quality}>
                      {quality}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} label="Status" onChange={(e)=> handleInputChange('status', e.target.value)}>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="published">Publish Now</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.status === 'scheduled' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Scheduled Time"
                  InputLabelProps={{ shrink: true }}
                  value={formData.scheduledAt}
                  onChange={(e)=> handleInputChange('scheduledAt', e.target.value)}
                  helperText="Auto-publish time"
                />
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Video Type</InputLabel>
                <Select
                  value={formData.videoType}
                  label="Video Type"
                  onChange={(e) => handleInputChange('videoType', e.target.value)}
                >
                  {videoTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {formData.videoType === 'upload' ? (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      borderColor: 'primary.dark'
                    }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    hidden
                    accept="video/*"
                    onChange={handleVideoFileChange}
                  />
                  <VideoFile sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {formData.videoFile ? formData.videoFile.name : 'Click to upload video'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: MP4, WebM, AVI, MOV (Max size: 100MB)
                  </Typography>
                </Paper>

                {videoPreview && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Video Preview:
                    </Typography>
                    <video
                      src={videoPreview}
                      controls
                      style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }}
                    />
                  </Box>
                )}
              </Grid>
            ) : (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={`${formData.videoType.charAt(0).toUpperCase() + formData.videoType.slice(1)} URL`}
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder={
                    formData.videoType === 'youtube' 
                      ? 'https://www.youtube.com/watch?v=...' 
                      : 'https://vimeo.com/...'
                  }
                  helperText={`Enter the full URL of the ${formData.videoType} video`}
                  required
                />
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'secondary.main',
                  borderRadius: 3,
                  cursor: 'pointer'
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                <ImageIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Upload Thumbnail
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click to upload custom thumbnail
                </Typography>
              </Paper>

              {thumbnailPreview && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    label="Add tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 10:30"
                helperText="Format: MM:SS or HH:MM:SS"
                sx={{ mt: 3 }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review Video Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Basic Information
                  </Typography>
                  <Typography variant="body2"><strong>Title:</strong> {formData.title}</Typography>
                  <Typography variant="body2"><strong>Category:</strong> {formData.category}</Typography>
                  <Typography variant="body2"><strong>Quality:</strong> {formData.quality}</Typography>
                  <Typography variant="body2"><strong>Duration:</strong> {formData.duration}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Content Details
                  </Typography>
                  <Typography variant="body2"><strong>Video Type:</strong> {formData.videoType}</Typography>
                  <Typography variant="body2">
                    <strong>Source:</strong> {
                      formData.videoType === 'upload' 
                        ? formData.videoFile?.name || 'No file selected'
                        : formData.videoUrl || 'No URL provided'
                    }
                  </Typography>
                  <Typography variant="body2"><strong>Thumbnail:</strong> {formData.thumbnail ? 'Custom thumbnail uploaded' : 'Default thumbnail'}</Typography>
                  <Typography variant="body2"><strong>Tags:</strong> {formData.tags.length > 0 ? formData.tags.join(', ') : 'No tags'}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                Please review all information before publishing. Once published, the video will be visible to all users.
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Video - Admin Dashboard</title>
        <meta name="description" content="Create and upload new video content" />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/videos')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Create New Video
          </Typography>
        </Box>

        {/* Progress Indicator */}
        {loading && uploadProgress > 0 && (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Uploading video... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Paper>
        )}

        {/* Alerts */}
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

        {/* Stepper */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="h6">{step.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 4 }}>
                    {renderStepContent(index)}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      Back
                    </Button>
                    {index === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        sx={{ 
                          backgroundColor: 'primary.main',
                          px: 4
                        }}
                      >
                        {loading ? 'Creating...' : 'Create Video'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!validateStep(index)}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length && (
            <Paper square elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Video Created Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your video has been created and is now available.
              </Typography>
            </Paper>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default CreateVideo;
