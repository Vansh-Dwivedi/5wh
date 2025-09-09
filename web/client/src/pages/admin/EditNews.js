import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Card,
  CardMedia
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Preview,
  Image,
  Delete,
  Add,
  CloudUpload
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { newsAPI } from '../../services/api';

const EditNews = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    headline: '',
    content: '',
    excerpt: '',
    category: 'general',
    status: 'draft',
  scheduledAt: '',
    featured: false,
    breaking: false,
    tags: [],
    featuredImage: {
      url: '',
      alt: '',
      caption: '',
      file: null
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    }
  });

  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const categories = [
    'breaking', 'politics', 'sports', 'entertainment', 
    'technology', 'health', 'opinion', 'world', 'local', 
    'business', 'general'
  ];

  // Load existing news article
  useEffect(() => {
    const loadNews = async () => {
      try {
        setInitialLoading(true);
        const response = await newsAPI.getById(id);
        const article = response.data;
        
        setFormData({
          title: article.title || '',
          headline: article.headline || '',
          content: article.content || '',
          excerpt: article.excerpt || '',
          category: article.category || 'general',
          status: article.status || 'draft',
          scheduledAt: article.scheduledAt ? article.scheduledAt.substring(0,16) : '',
          featured: article.featured || false,
          breaking: article.breaking || false,
          tags: article.tags || [],
          featuredImage: {
            url: article.featuredImage?.url || '',
            alt: article.featuredImage?.alt || '',
            caption: article.featuredImage?.caption || ''
          },
          seo: {
            metaTitle: article.seo?.metaTitle || '',
            metaDescription: article.seo?.metaDescription || '',
            keywords: article.seo?.keywords || []
          }
        });
      } catch (err) {
        setError('Failed to load article');
        console.error('Error loading news:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      loadNews();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Auto-update SEO data based on title and excerpt
    if (field === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        seo: {
          ...prev.seo,
          metaTitle: value || prev.seo.metaTitle
        }
      }));
    }

    if (field === 'excerpt') {
      setFormData(prev => ({
        ...prev,
        excerpt: value,
        seo: {
          ...prev.seo,
          metaDescription: value.substring(0, 160) || prev.seo.metaDescription
        }
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.seo.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, newKeyword.trim()]
        }
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(keyword => keyword !== keywordToRemove)
      }
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }
    if (!formData.excerpt.trim()) {
      setError('Excerpt is required');
      return false;
    }
    return true;
  };

  // File upload handler
  const handleFileUpload = async (file, type = 'image') => {
    if (!file) return null;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create form data for upload
      const uploadFormData = new FormData();
      uploadFormData.append(type, file);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Make the actual API call to upload the file
      const endpoint = type === 'video' ? '/api/upload/video' : '/api/upload/image';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: uploadFormData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);

      return {
        url: `https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000${(result.image || result.video).url}`,
        name: (result.image || result.video).name,
        size: (result.image || result.video).size,
        type: (result.image || result.video).type
      };
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleImageUpload = async (event, imageType = 'featured') => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      const uploadResult = await handleFileUpload(file, 'image');
      
      if (imageType === 'featured') {
        setFormData(prev => ({
          ...prev,
          featuredImage: {
            ...prev.featuredImage,
            url: uploadResult.url,
            file: file,
            alt: prev.featuredImage.alt || prev.title
          }
        }));
      }
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  const handleSubmit = async (status = formData.status) => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      if (status === 'scheduled') {
        if (!formData.scheduledAt) {
          setError('Please choose a schedule date/time');
          setLoading(false);
          return;
        }
        const when = new Date(formData.scheduledAt);
        if (when < new Date()) {
          setError('Scheduled time must be in the future');
          setLoading(false);
          return;
        }
      }
      
      const submitData = {
        ...formData,
        status,
        scheduledAt: status === 'scheduled' ? formData.scheduledAt : undefined,
        publishedAt: status === 'published' && formData.status !== 'published' ? new Date() : undefined
      };

      await newsAPI.update(id, submitData);
      setSuccess(`News article ${status === 'published' ? 'published' : 'updated'} successfully!`);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/news');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update article');
      console.error('Error updating news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab (you can implement this later)
    console.log('Preview:', formData);
  };

  if (initialLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading article...
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit News Article - 5WH Media Admin</title>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin/news')} color="primary">
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Edit News Article
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Preview />}
              onClick={handlePreview}
              disabled={loading}
            >
              Preview
            </Button>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={() => handleSubmit('draft')}
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => handleSubmit('published')}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Publish / Update'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={() => handleSubmit('scheduled')}
              disabled={loading || !formData.scheduledAt}
            >
              {loading ? <CircularProgress size={20} /> : 'Schedule'}
            </Button>
          </Box>
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

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Article Content
              </Typography>
              
              <TextField
                fullWidth
                label="Title *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                margin="normal"
                helperText="The main title of your news article"
              />

              <TextField
                fullWidth
                label="Headline"
                value={formData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                margin="normal"
                helperText="A catchy headline"
              />

              <TextField
                fullWidth
                label="Excerpt *"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                margin="normal"
                multiline
                rows={3}
                helperText="A brief summary of the article (max 500 characters)"
                inputProps={{ maxLength: 500 }}
              />

              <TextField
                fullWidth
                label="Content *"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                margin="normal"
                multiline
                rows={12}
                helperText="The full article content"
              />
            </Paper>

            {/* Featured Image */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Featured Image
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  disabled={uploading}
                >
                  Upload Featured Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'featured')}
                  />
                </Button>
                
                {uploading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Uploading... {uploadProgress}%</Typography>
                  </Box>
                )}
              </Box>
              
              <TextField
                fullWidth
                label="Image URL (or upload above)"
                value={formData.featuredImage.url}
                onChange={(e) => handleInputChange('featuredImage.url', e.target.value)}
                margin="normal"
                helperText="URL of the featured image or upload a file above"
              />

              {formData.featuredImage.url && (
                <Card sx={{ mt: 2, maxWidth: 400 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={formData.featuredImage.url}
                    alt="Featured image preview"
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
              )}

              <TextField
                fullWidth
                label="Image Alt Text"
                value={formData.featuredImage.alt}
                onChange={(e) => handleInputChange('featuredImage.alt', e.target.value)}
                margin="normal"
                helperText="Alternative text for accessibility"
              />

              <TextField
                fullWidth
                label="Image Caption"
                value={formData.featuredImage.caption}
                onChange={(e) => handleInputChange('featuredImage.caption', e.target.value)}
                margin="normal"
                helperText="Caption to display with the image"
              />
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Article Settings */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Article Settings
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              {formData.status === 'scheduled' && (
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Scheduled Time"
                  InputLabelProps={{ shrink: true }}
                  value={formData.scheduledAt}
                  onChange={(e)=> handleInputChange('scheduledAt', e.target.value)}
                  margin="normal"
                  helperText="When to auto-publish"
                />
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                  />
                }
                label="Featured Article"
                sx={{ mt: 2, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.breaking}
                    onChange={(e) => handleInputChange('breaking', e.target.checked)}
                  />
                }
                label="Breaking News"
                sx={{ mt: 1, display: 'block' }}
              />
            </Paper>

            {/* Tags */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <IconButton onClick={handleAddTag} color="primary">
                  <Add />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Paper>

            {/* SEO Settings */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                SEO Settings
              </Typography>

              <TextField
                fullWidth
                label="Meta Title"
                value={formData.seo.metaTitle}
                onChange={(e) => handleInputChange('seo.metaTitle', e.target.value)}
                margin="normal"
                helperText="Title for search engines"
              />

              <TextField
                fullWidth
                label="Meta Description"
                value={formData.seo.metaDescription}
                onChange={(e) => handleInputChange('seo.metaDescription', e.target.value)}
                margin="normal"
                multiline
                rows={2}
                helperText="Description for search engines"
                inputProps={{ maxLength: 160 }}
              />

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  SEO Keywords
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    label="Add keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <IconButton onClick={handleAddKeyword} color="primary">
                    <Add />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.seo.keywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      onDelete={() => handleRemoveKeyword(keyword)}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default EditNews;
