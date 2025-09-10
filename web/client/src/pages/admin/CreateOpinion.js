import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  IconButton,
  Input
} from '@mui/material';
import {
  Save,
  Preview,
  Publish,
  Archive,
  Add,
  Delete,
  CloudUpload,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useScheduleValidation } from '../../hooks/useScheduleValidation';
import { toast } from 'react-toastify';
import { opinionsAPI } from '../../services/api';

const CreateOpinion = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [opinion, setOpinion] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    tags: [],
    featured: false,
    status: 'draft',
  scheduledAt: '',
    featuredImage: null,
    metaTitle: '',
    metaDescription: '',
    readTime: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const categories = [
    'Editorial', 'Analysis', 'Commentary', 'Politics', 'Society', 
    'Culture', 'Economy', 'Media & Technology', 'Education'
  ];

  const { validateSchedule } = useScheduleValidation();

  useEffect(() => {
    if (isEditing) {
      fetchOpinion();
    }
  }, [id]);

  const fetchOpinion = async () => {
    try {
      setLoading(true);
  const res = await opinionsAPI.getById(id);
  const op = res.data.data;
  setOpinion(op);
  if (op.featuredImage) setImagePreview(`https://5whmedia.com:5000${op.featuredImage}`);
    } catch (error) {
      console.error('Error fetching opinion:', error);
      setError('Failed to fetch opinion');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setOpinion(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate excerpt if content changes
    if (field === 'content' && value) {
      const excerpt = value.replace(/<[^>]*>/g, '').substring(0, 200);
      setOpinion(prev => ({
        ...prev,
        excerpt: excerpt
      }));
    }

    // Auto-generate meta title if title changes
    if (field === 'title' && value) {
      setOpinion(prev => ({
        ...prev,
        metaTitle: value.length > 60 ? value.substring(0, 57) + '...' : value
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setOpinion(prev => ({
        ...prev,
        featuredImage: file
      }));

      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !opinion.tags.includes(tagInput.trim())) {
      setOpinion(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setOpinion(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleSave = async (status = opinion.status) => {
    try {
      setSaveLoading(true);
      setError('');

      // Validate scheduling fields
      const scheduleValidation = validateSchedule(status, opinion.scheduledAt);
      if (!scheduleValidation.valid) {
        setError(scheduleValidation.message);
        setSaveLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', opinion.title);
      formData.append('content', opinion.content);
      formData.append('excerpt', opinion.excerpt);
      formData.append('author', opinion.author);
      formData.append('category', opinion.category);
      formData.append('tags', JSON.stringify(opinion.tags));
      formData.append('featured', opinion.featured);
      formData.append('status', status);
      if (status === 'scheduled' && opinion.scheduledAt) {
        formData.append('scheduledAt', opinion.scheduledAt);
      }
      formData.append('metaTitle', opinion.metaTitle);
      formData.append('metaDescription', opinion.metaDescription);
      formData.append('readTime', calculateReadTime(opinion.content));

      if (opinion.featuredImage && typeof opinion.featuredImage !== 'string') {
        formData.append('featuredImage', opinion.featuredImage);
      }

      let resp;
      if (isEditing) resp = await opinionsAPI.update(id, formData);
      else resp = await opinionsAPI.create(formData);
      const saved = isEditing ? 'Opinion updated successfully!' : 'Opinion created successfully!';
      setSuccess(saved);
      toast.success(saved);
      if (!isEditing) {
        setTimeout(()=> navigate(`/admin/opinions/edit/${resp.data.data._id}`),1500);
      }
    } catch (error) {
      console.error('Error saving opinion:', error);
      setError('Failed to save opinion');
      toast.error('Failed to save opinion');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePublish = () => {
    handleSave('published');
  };

  const handleArchive = () => {
    handleSave('archived');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Opinion' : 'Create Opinion'} - 5WH Admin</title>
      </Helmet>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/opinions')}
            variant="outlined"
          >
            Back to Opinions
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {isEditing ? 'Edit Opinion' : 'Create New Opinion'}
          </Typography>
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
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Basic Information
                </Typography>
                
                <TextField
                  fullWidth
                  label="Title"
                  value={opinion.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />

                <TextField
                  fullWidth
                  label="Author"
                  value={opinion.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />

                <TextField
                  fullWidth
                  label="Content"
                  multiline
                  rows={15}
                  value={opinion.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your opinion content here... You can use HTML tags for formatting."
                  sx={{ mb: 3 }}
                  required
                />

                <TextField
                  fullWidth
                  label="Excerpt"
                  multiline
                  rows={3}
                  value={opinion.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  helperText="A brief summary that appears in previews and search results"
                  sx={{ mb: 3 }}
                />
              </CardContent>
            </Card>

            {/* SEO Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  SEO Settings
                </Typography>
                
                <TextField
                  fullWidth
                  label="Meta Title"
                  value={opinion.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  helperText={`${opinion.metaTitle.length}/60 characters`}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Meta Description"
                  multiline
                  rows={3}
                  value={opinion.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  helperText={`${opinion.metaDescription.length}/160 characters - Brief description for search engines`}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Publish Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Publish
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={opinion.status}
                      onChange={(e)=> handleInputChange('status', e.target.value)}
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      {opinion.status === 'archived' && <MenuItem value="archived">Archived</MenuItem>}
                    </Select>
                  </FormControl>

                  {opinion.status === 'scheduled' && (
                    <TextField
                      type="datetime-local"
                      fullWidth
                      size="small"
                      label="Scheduled Time"
                      InputLabelProps={{ shrink: true }}
                      value={opinion.scheduledAt}
                      onChange={(e)=> handleInputChange('scheduledAt', e.target.value)}
                      helperText="Auto publish time"
                    />
                  )}

                  <Button
                    variant="contained"
                    onClick={() => handleSave(opinion.status)}
                    disabled={saveLoading}
                    startIcon={saveLoading ? <CircularProgress size={20} /> : <Save />}
                    fullWidth
                  >
                    {opinion.status === 'draft' ? 'Save Draft' : 'Save'}
                  </Button>

                  {opinion.status !== 'published' && opinion.status !== 'scheduled' && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handlePublish}
                      disabled={saveLoading}
                      startIcon={<Publish />}
                      fullWidth
                    >
                      Publish Now
                    </Button>
                  )}

                  {opinion.status === 'published' && (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handleArchive}
                      disabled={saveLoading}
                      startIcon={<Archive />}
                      fullWidth
                    >
                      Archive
                    </Button>
                  )}

                  <FormControlLabel
                    control={
                      <Switch
                        checked={opinion.featured}
                        onChange={(e) => handleInputChange('featured', e.target.checked)}
                      />
                    }
                    label="Featured Article"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Categories & Tags */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Categories & Tags
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={opinion.category}
                    label="Category"
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={handleAddTag} disabled={!tagInput.trim()}>
                          <Add />
                        </IconButton>
                      )
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {opinion.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Featured Image
                </Typography>
                
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Upload Image
                  </Button>
                </label>

                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 4,
                        border: '1px solid #ddd'
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default CreateOpinion;
