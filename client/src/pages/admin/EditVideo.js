import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel
} from '@mui/material';
import {
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
  Edit
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { videosAPI } from '../../services/api';

const EditVideo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingVideo, setFetchingVideo] = useState(true);
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
    durationSeconds: 0,
    quality: '1080p',
    tags: [],
    featured: false,
    published: true,
    status: 'published'
  });

  const [originalData, setOriginalData] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [videoPreview, setVideoPreview] = useState(null);
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

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      setFetchingVideo(true);
      const response = await videosAPI.getById(id);
      const video = response.data;
      
      setOriginalData(video);
      setFormData({
        title: video.title || '',
        description: video.description || '',
        category: video.category || '',
        videoType: video.videoType || 'upload',
        videoUrl: video.videoUrl || '',
        videoFile: null,
        thumbnail: null,
        duration: video.duration || '',
        durationSeconds: video.durationSeconds || 0,
        quality: video.quality || '1080p',
        tags: video.tags || [],
        featured: video.featured || false,
        published: video.status === 'published',
        status: video.status || 'published'
      });

      // Set preview URLs for existing media
      if (video.videoUrl && video.videoType === 'upload') {
        setVideoPreview(video.videoUrl);
      }
      if (video.thumbnail?.url) {
        setThumbnailPreview(video.thumbnail.url);
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load video details';
      setError(errorMessage);
      console.error('Error fetching video:', err);
      console.error('Error response:', err.response);
    } finally {
      setFetchingVideo(false);
    }
  };

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
      if (formData.videoType === 'upload' && !formData.videoFile && !originalData.videoUrl) {
        setError('Video file is required for upload type');
        setLoading(false);
        return;
      }
      if (formData.videoType !== 'upload' && !formData.videoUrl) {
        setError('Video URL is required for external videos');
        setLoading(false);
        return;
      }
      
      const submitData = new FormData();

      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'videoFile' && key !== 'thumbnail' && key !== 'tags' && key !== 'published' && key !== 'status') {
          submitData.append(key, formData[key]);
        }
      });

      // Handle published status
      submitData.append('status', formData.published ? 'published' : 'draft');

      // Add tags as JSON string
      submitData.append('tags', JSON.stringify(formData.tags));

      // Calculate duration in seconds if not provided
      if (formData.duration && !formData.durationSeconds) {
        const [minutes, seconds] = formData.duration.split(':').map(Number);
        submitData.append('durationSeconds', (minutes * 60) + seconds);
      }

      // Add files only if new ones are selected
      if (formData.videoFile) {
        submitData.append('video', formData.videoFile);
      }
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }

      const response = await videosAPI.update(id, submitData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      setSuccess('Video updated successfully!');
      setTimeout(() => {
        navigate('/admin/videos');
      }, 2000);

    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication required. Please login to access admin features.');
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to update video');
      }
      console.error('Error updating video:', err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (fetchingVideo) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Video - 5WH Media Admin</title>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/videos')}
            sx={{ mb: 2 }}
          >
            Back to Videos
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            <Edit sx={{ mr: 2, verticalAlign: 'middle' }} />
            Edit Video
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update video information and content
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

        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Uploading... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Video Title"
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
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
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
                  
                  <Grid item xs={12} sm={6}>
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
                </Grid>
              </CardContent>
            </Card>

            {/* Video Content */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Video Content
                </Typography>
                
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
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {type.icon}
                              <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.videoType === 'upload' ? (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          border: '2px dashed #ccc',
                          borderRadius: 2,
                          p: 3,
                          textAlign: 'center',
                          cursor: 'pointer',
                          '&:hover': { borderColor: 'primary.main' }
                        }}
                        onClick={() => document.getElementById('video-upload').click()}
                      >
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          style={{ display: 'none' }}
                        />
                        <VideoFile sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          {formData.videoFile ? 'Replace Video File' : 'Current Video File'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formData.videoFile ? formData.videoFile.name : 'Click to upload new video file'}
                        </Typography>
                      </Box>
                      
                      {videoPreview && (
                        <Box sx={{ mt: 2 }}>
                          <video
                            src={videoPreview}
                            controls
                            style={{ width: '100%', maxHeight: '300px' }}
                          />
                        </Box>
                      )}
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Video URL"
                        value={formData.videoUrl}
                        onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                        placeholder={formData.videoType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://vimeo.com/...'}
                        required
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Duration (MM:SS)"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="3:45"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Details
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Thumbnail Upload */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Thumbnail
                    </Typography>
                    <Box
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => document.getElementById('thumbnail-upload').click()}
                    >
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        style={{ display: 'none' }}
                      />
                      <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {formData.thumbnail ? 'Replace Thumbnail' : 'Current Thumbnail'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.thumbnail ? formData.thumbnail.name : 'Click to upload new thumbnail'}
                      </Typography>
                    </Box>
                    
                    {thumbnailPreview && (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
                        />
                      </Box>
                    )}
                  </Grid>

                  {/* Tags */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TextField
                        label="Add Tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        sx={{ flexGrow: 1, mr: 1 }}
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddTag}
                        startIcon={<Add />}
                      >
                        Add
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          deleteIcon={<Delete />}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Publishing Options
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.published}
                        onChange={(e) => handleInputChange('published', e.target.checked)}
                      />
                    }
                    label="Publish immediately"
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.featured}
                        onChange={(e) => handleInputChange('featured', e.target.checked)}
                      />
                    }
                    label="Featured video"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Updating...' : 'Update Video'}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/admin/videos')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default EditVideo;
