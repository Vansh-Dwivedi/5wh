import React, { useState } from 'react';
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
  CardMedia,
  LinearProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Preview,
  Image,
  Delete,
  Add,
  VideoFile,
  CloudUpload,
  ExpandMore,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { newsAPI } from '../../services/api';

const CreateNews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    headline: '',
    content: '',
    excerpt: '',
    category: 'general',
    status: 'draft',
    featured: false,
    breaking: false,
    tags: [],
    featuredImage: {
      url: '',
      alt: '',
      caption: '',
      file: null
    },
    videos: [],
    additionalImages: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      focusKeyword: '',
      canonicalUrl: '',
      socialTitle: '',
      socialDescription: '',
      socialImage: ''
    },
    readingTime: 0,
    wordCount: 0
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [seoScore, setSeoScore] = useState(0);
  const [seoChecks, setSeoChecks] = useState([]);

  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [categories, setCategories] = useState([
    { value: 'breaking', label: 'Breaking News', color: '#f44336' },
    { value: 'politics', label: 'Politics', color: '#2196f3' },
    { value: 'sports', label: 'Sports', color: '#4caf50' },
    { value: 'entertainment', label: 'Entertainment', color: '#ff9800' },
    { value: 'technology', label: 'Technology', color: '#9c27b0' },
    { value: 'health', label: 'Health & Wellness', color: '#00bcd4' },
    { value: 'business', label: 'Business & Finance', color: '#795548' },
    { value: 'world', label: 'World News', color: '#607d8b' },
    { value: 'local', label: 'Local News', color: '#ff5722' },
    { value: 'opinion', label: 'Opinion & Editorial', color: '#673ab7' },
    { value: 'lifestyle', label: 'Lifestyle', color: '#e91e63' },
    { value: 'science', label: 'Science', color: '#009688' },
    { value: 'general', label: 'General', color: '#757575' }
  ]);

  // Calculate reading time and word count
  const calculateReadingMetrics = (content) => {
    const words = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    return { wordCount: words, readingTime };
  };

  // SEO Analysis
  const performSEOAnalysis = () => {
    const checks = [];
    let score = 0;

    // Title checks
    if (formData.title.length > 0) {
      checks.push({ type: 'success', message: 'Title is present' });
      score += 10;
    } else {
      checks.push({ type: 'error', message: 'Title is missing' });
    }

    if (formData.title.length >= 30 && formData.title.length <= 60) {
      checks.push({ type: 'success', message: 'Title length is optimal (30-60 characters)' });
      score += 10;
    } else if (formData.title.length > 0) {
      checks.push({ type: 'warning', message: `Title should be 30-60 characters (current: ${formData.title.length})` });
      score += 5;
    }

    // Meta description checks
    if (formData.seo.metaDescription.length >= 120 && formData.seo.metaDescription.length <= 160) {
      checks.push({ type: 'success', message: 'Meta description length is optimal (120-160 characters)' });
      score += 15;
    } else if (formData.seo.metaDescription.length > 0) {
      checks.push({ type: 'warning', message: `Meta description should be 120-160 characters (current: ${formData.seo.metaDescription.length})` });
      score += 7;
    } else {
      checks.push({ type: 'error', message: 'Meta description is missing' });
    }

    // Focus keyword checks
    if (formData.seo.focusKeyword) {
      checks.push({ type: 'success', message: 'Focus keyword is set' });
      score += 10;

      const keyword = formData.seo.focusKeyword.toLowerCase();
      if (formData.title.toLowerCase().includes(keyword)) {
        checks.push({ type: 'success', message: 'Focus keyword appears in title' });
        score += 10;
      } else {
        checks.push({ type: 'warning', message: 'Focus keyword should appear in title' });
      }

      if (formData.content.toLowerCase().includes(keyword)) {
        checks.push({ type: 'success', message: 'Focus keyword appears in content' });
        score += 10;
      } else {
        checks.push({ type: 'warning', message: 'Focus keyword should appear in content' });
      }
    } else {
      checks.push({ type: 'error', message: 'Focus keyword is missing' });
    }

    // Content checks
    if (formData.content.length >= 300) {
      checks.push({ type: 'success', message: 'Content length is sufficient (300+ words)' });
      score += 15;
    } else if (formData.content.length > 0) {
      checks.push({ type: 'warning', message: `Content should be at least 300 words (current: ${formData.wordCount} words)` });
      score += 7;
    }

    // Image checks
    if (formData.featuredImage.url || formData.featuredImage.file) {
      checks.push({ type: 'success', message: 'Featured image is present' });
      score += 10;
      
      if (formData.featuredImage.alt) {
        checks.push({ type: 'success', message: 'Featured image has alt text' });
        score += 10;
      } else {
        checks.push({ type: 'warning', message: 'Featured image should have alt text' });
      }
    } else {
      checks.push({ type: 'error', message: 'Featured image is missing' });
    }

    // Tags check
    if (formData.tags.length >= 3) {
      checks.push({ type: 'success', message: 'Good number of tags (3+)' });
      score += 10;
    } else if (formData.tags.length > 0) {
      checks.push({ type: 'warning', message: 'Add more tags for better categorization' });
      score += 5;
    }

    setSeoChecks(checks);
    setSeoScore(score);
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
        url: `http://localhost:5000${(result.image || result.video).url}`,
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

    // Auto-generate slug, headline, and SEO data
    if (field === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      setFormData(prev => ({
        ...prev,
        title: value,
        headline: value, // Auto-fill headline
        seo: {
          ...prev.seo,
          metaTitle: value,
          metaDescription: prev.excerpt || value.substring(0, 160),
          socialTitle: value,
          canonicalUrl: `https://5whmedia.com/news/${slug}`
        }
      }));
    }

    if (field === 'excerpt') {
      setFormData(prev => ({
        ...prev,
        excerpt: value,
        seo: {
          ...prev.seo,
          metaDescription: value.substring(0, 160),
          socialDescription: value.substring(0, 160)
        }
      }));
    }

    if (field === 'content') {
      const metrics = calculateReadingMetrics(value);
      setFormData(prev => ({
        ...prev,
        content: value,
        readingTime: metrics.readingTime,
        wordCount: metrics.wordCount
      }));
    }

    // Trigger SEO analysis
    setTimeout(performSEOAnalysis, 100);
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
      } else {
        setFormData(prev => ({
          ...prev,
          additionalImages: [...prev.additionalImages, {
            url: uploadResult.url,
            file: file,
            alt: '',
            caption: ''
          }]
        }));
      }
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Video size should be less than 50MB');
      return;
    }

    try {
      const uploadResult = await handleFileUpload(file, 'video');
      
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, {
          url: uploadResult.url,
          file: file,
          title: '',
          description: ''
        }]
      }));
    } catch (err) {
      setError('Failed to upload video');
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.find(cat => cat.value === newCategory.toLowerCase())) {
      const categoryValue = newCategory.toLowerCase().replace(/\s+/g, '-');
      const newCat = {
        value: categoryValue,
        label: newCategory.trim(),
        color: '#757575'
      };
      setCategories(prev => [...prev, newCat]);
      setFormData(prev => ({ ...prev, category: categoryValue }));
      setNewCategory('');
      setShowCategoryForm(false);
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
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (status = 'draft') => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      
      // Format data for backend compatibility
      const submitData = {
        title: formData.title,
        headline: formData.headline || formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        status,
        featured: formData.featured,
        breaking: formData.breaking,
        tags: formData.tags,
        featuredImage: {
          url: formData.featuredImage.url || '',
          alt: formData.featuredImage.alt || '',
          caption: formData.featuredImage.caption || ''
        },
        seo: {
          metaTitle: formData.seo.metaTitle || formData.title,
          metaDescription: formData.seo.metaDescription || formData.excerpt,
          keywords: formData.seo.keywords || [],
          focusKeyword: formData.seo.focusKeyword || '',
          canonicalUrl: formData.seo.canonicalUrl || '',
          socialTitle: formData.seo.socialTitle || formData.title,
          socialDescription: formData.seo.socialDescription || formData.excerpt,
          socialImage: formData.seo.socialImage || formData.featuredImage.url || ''
        },
        publishedAt: status === 'published' ? new Date() : undefined
      };

      console.log('Submitting data:', submitData); // Debug log

      await newsAPI.create(submitData);
      setSuccess(`News article ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/news');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating news:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Failed to save article';
      
      if (err.response?.data?.errors) {
        // Validation errors
        const validationErrors = err.response.data.errors.map(error => 
          `${error.field}: ${error.message}`
        ).join(', ');
        errorMessage = `Validation errors: ${validationErrors}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab (you can implement this later)
    console.log('Preview:', formData);
  };

  return (
    <>
      <Helmet>
        <title>Create News Article - 5WH Media Admin</title>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin/news')} color="primary">
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Create News Article
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
              {loading ? <CircularProgress size={20} /> : 'Publish'}
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
                helperText="A catchy headline (auto-filled from title)"
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

            {/* Media Upload Section */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Media Content
              </Typography>
              
              {/* Featured Image Upload */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Featured Image *
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
                  <Typography variant="body2" color="text.secondary">
                    Max 5MB (JPG, PNG, WebP)
                  </Typography>
                </Box>

                {uploading && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Uploading... {uploadProgress}%
                    </Typography>
                  </Box>
                )}

                {(formData.featuredImage.url || formData.featuredImage.file) && (
                  <Card sx={{ mb: 2, maxWidth: 400 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={formData.featuredImage.url}
                      alt="Featured image preview"
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box sx={{ p: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Alt Text (SEO Important)"
                        value={formData.featuredImage.alt}
                        onChange={(e) => handleInputChange('featuredImage.alt', e.target.value)}
                        helperText="Describe the image for accessibility and SEO"
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Caption"
                        value={formData.featuredImage.caption}
                        onChange={(e) => handleInputChange('featuredImage.caption', e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Card>
                )}

                <TextField
                  fullWidth
                  label="Or Image URL"
                  value={formData.featuredImage.url}
                  onChange={(e) => handleInputChange('featuredImage.url', e.target.value)}
                  helperText="Alternatively, provide an image URL"
                  size="small"
                />
              </Box>

              {/* Video Upload */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Video Content (Optional)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<VideoFile />}
                  disabled={uploading}
                  sx={{ mb: 2 }}
                >
                  Upload Video
                  <input
                    type="file"
                    hidden
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Max 50MB (MP4, WebM, MOV)
                </Typography>

                {formData.videos.map((video, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle2">
                          Video {index + 1}
                        </Typography>
                        <IconButton 
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              videos: prev.videos.filter((_, i) => i !== index)
                            }));
                          }}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        label="Video Title"
                        value={video.title}
                        onChange={(e) => {
                          const newVideos = [...formData.videos];
                          newVideos[index].title = e.target.value;
                          setFormData(prev => ({ ...prev, videos: newVideos }));
                        }}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Video Description"
                        value={video.description}
                        onChange={(e) => {
                          const newVideos = [...formData.videos];
                          newVideos[index].description = e.target.value;
                          setFormData(prev => ({ ...prev, videos: newVideos }));
                        }}
                        multiline
                        rows={2}
                      />
                    </Box>
                  </Card>
                ))}
              </Box>

              {/* Additional Images */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Images (Optional)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<Image />}
                  disabled={uploading}
                  sx={{ mb: 2 }}
                >
                  Add More Images
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'additional')}
                  />
                </Button>
                
                {formData.additionalImages.map((image, index) => (
                  <Card key={index} sx={{ mb: 2, maxWidth: 300 }}>
                    <CardMedia
                      component="img"
                      height="150"
                      image={image.url}
                      alt={`Additional image ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">
                          Image {index + 1}
                        </Typography>
                        <IconButton 
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              additionalImages: prev.additionalImages.filter((_, i) => i !== index)
                            }));
                          }}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        label="Alt Text"
                        value={image.alt}
                        onChange={(e) => {
                          const newImages = [...formData.additionalImages];
                          newImages[index].alt = e.target.value;
                          setFormData(prev => ({ ...prev, additionalImages: newImages }));
                        }}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Caption"
                        value={image.caption}
                        onChange={(e) => {
                          const newImages = [...formData.additionalImages];
                          newImages[index].caption = e.target.value;
                          setFormData(prev => ({ ...prev, additionalImages: newImages }));
                        }}
                      />
                    </Box>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Content Metrics */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 4, height: 20, bgcolor: 'success.main', borderRadius: 1 }} />
                Content Analytics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {formData.wordCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Words
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="secondary.main" fontWeight="bold">
                      {formData.readingTime}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Min Read
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: seoScore >= 80 ? 'success.50' : seoScore >= 60 ? 'warning.50' : 'error.50', borderRadius: 1 }}>
                    <Typography 
                      variant="h4" 
                      fontWeight="bold"
                      color={seoScore >= 80 ? 'success.main' : seoScore >= 60 ? 'warning.main' : 'error.main'}
                    >
                      {seoScore}/100
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SEO Score
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {formData.wordCount < 300 && (
                    <>⚠️ Consider adding more content (recommended: 300+ words)</>
                  )}
                  {formData.wordCount >= 300 && formData.wordCount < 600 && (
                    <>✅ Good content length</>
                  )}
                  {formData.wordCount >= 600 && (
                    <>🎯 Excellent content length for SEO</>
                  )}
                </Typography>
              </Box>
            </Paper>

            {/* SEO Analysis */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                SEO Analysis
              </Typography>
              <List dense>
                {seoChecks.map((check, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {check.type === 'success' && <CheckCircle color="success" fontSize="small" />}
                      {check.type === 'warning' && <Info color="warning" fontSize="small" />}
                      {check.type === 'error' && <Error color="error" fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={check.message} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Article Settings */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 4, height: 20, bgcolor: 'primary.main', borderRadius: 1 }} />
                Publication Settings
              </Typography>

              {/* Category Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Category *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    displayEmpty
                    sx={{ mb: 1 }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select a category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              bgcolor: category.color, 
                              borderRadius: '50%' 
                            }} 
                          />
                          {category.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Add New Category */}
                {!showCategoryForm ? (
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setShowCategoryForm(true)}
                    sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                  >
                    Add New Category
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleAddCategory}
                      disabled={!newCategory.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setShowCategoryForm(false);
                        setNewCategory('');
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Status & Priority Settings */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Publication Status
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <MenuItem value="draft">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: 'warning.main', borderRadius: '50%' }} />
                          Draft
                        </Box>
                      </MenuItem>
                      <MenuItem value="published">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
                          Published
                        </Box>
                      </MenuItem>
                      <MenuItem value="scheduled">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: 'info.main', borderRadius: '50%' }} />
                          Scheduled
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* Priority Toggles */}
                  <Box sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    p: 2,
                    bgcolor: 'grey.50'
                  }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Article Priority
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.breaking}
                          onChange={(e) => handleInputChange('breaking', e.target.checked)}
                          color="error"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={formData.breaking ? 600 : 400}>
                            Breaking News
                          </Typography>
                          {formData.breaking && (
                            <Chip 
                              label="URGENT" 
                              size="small" 
                              color="error" 
                              sx={{ height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      }
                      sx={{ mb: 1, display: 'block' }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.featured}
                          onChange={(e) => handleInputChange('featured', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={formData.featured ? 600 : 400}>
                            Featured Article
                          </Typography>
                          {formData.featured && (
                            <Chip 
                              label="FEATURED" 
                              size="small" 
                              color="primary" 
                              sx={{ height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      }
                      sx={{ display: 'block' }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Publishing Schedule */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Publishing Options
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    type="datetime-local"
                    label="Publish Date & Time"
                    size="small"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="Leave empty to publish immediately"
                  />
                </Box>
              </Box>

              {/* Author Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Author Information
                </Typography>
                
                <TextField
                  fullWidth
                  size="small"
                  label="Author Name"
                  defaultValue="Current User"
                  helperText="Author will be set to current logged-in user"
                  disabled
                />
              </Box>
            </Paper>

            {/* Tags */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 4, height: 20, bgcolor: 'secondary.main', borderRadius: 1 }} />
                Tags & Keywords
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add relevant tags to help readers discover your content
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="Add tag"
                  placeholder="e.g., politics, election, news"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Tooltip title="Add tag">
                  <IconButton 
                    onClick={handleAddTag} 
                    color="primary"
                    disabled={!newTag.trim()}
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&:disabled': { bgcolor: 'grey.300' }
                    }}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ 
                minHeight: 60,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                bgcolor: 'grey.50'
              }}>
                {formData.tags.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        size="small"
                        sx={{
                          bgcolor: 'primary.50',
                          color: 'primary.main',
                          '& .MuiChip-deleteIcon': {
                            color: 'primary.main',
                            '&:hover': { color: 'primary.dark' }
                          }
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No tags added yet. Tags help improve SEO and content discovery.
                  </Typography>
                )}
              </Box>

              {formData.tags.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''} added
                </Typography>
              )}
            </Paper>

            {/* Advanced SEO Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Advanced SEO</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Focus Keyword"
                    value={formData.seo.focusKeyword}
                    onChange={(e) => handleInputChange('seo.focusKeyword', e.target.value)}
                    helperText="Main keyword to optimize for"
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Meta Title"
                    value={formData.seo.metaTitle}
                    onChange={(e) => handleInputChange('seo.metaTitle', e.target.value)}
                    helperText={`${formData.seo.metaTitle.length}/60 characters`}
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Meta Description"
                    value={formData.seo.metaDescription}
                    onChange={(e) => handleInputChange('seo.metaDescription', e.target.value)}
                    multiline
                    rows={3}
                    helperText={`${formData.seo.metaDescription.length}/160 characters`}
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Canonical URL"
                    value={formData.seo.canonicalUrl}
                    onChange={(e) => handleInputChange('seo.canonicalUrl', e.target.value)}
                    helperText="Canonical URL for this article"
                    size="small"
                  />

                  <Divider />

                  <Typography variant="subtitle2" gutterBottom>
                    Social Media Optimization
                  </Typography>

                  <TextField
                    fullWidth
                    label="Social Media Title"
                    value={formData.seo.socialTitle}
                    onChange={(e) => handleInputChange('seo.socialTitle', e.target.value)}
                    helperText="Title for social media sharing"
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Social Media Description"
                    value={formData.seo.socialDescription}
                    onChange={(e) => handleInputChange('seo.socialDescription', e.target.value)}
                    multiline
                    rows={2}
                    helperText="Description for social media sharing"
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Social Media Image URL"
                    value={formData.seo.socialImage}
                    onChange={(e) => handleInputChange('seo.socialImage', e.target.value)}
                    helperText="Image for social media sharing (1200x630px)"
                    size="small"
                  />

                  <Divider />

                  <Typography variant="subtitle2" gutterBottom>
                    SEO Keywords
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      label="Add SEO keyword"
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
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default CreateNews;
