import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Grid, Card, CardContent, TextField, Button,
  Select, MenuItem, InputLabel, FormControl, Chip, IconButton, Alert,
  CircularProgress, Switch, FormControlLabel
} from '@mui/material';
import { Save, Add, CloudUpload, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { blogsAPI } from '../../services/api';
import { Helmet } from 'react-helmet-async';

const TAB_OPTIONS = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'opinion', label: '5WH Opinion' },
  { value: 'culture', label: 'Culture' },
  { value: 'health', label: 'Health' },
  { value: 'history', label: 'History' }
];

const CreateBlogPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [post, setPost] = useState({
    title: '',
    tab: 'lifestyle',
    excerpt: '',
    content: '',
    status: 'draft',
    scheduledAt: '',
    featured: false,
    tags: [],
    featuredImage: null
  });

  useEffect(()=> {
    if (isEditing) fetchPost();
    // eslint-disable-next-line
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      // For simplicity use admin list and find locally (or create a /blogs/:id admin endpoint later)
      const res = await blogsAPI.listAdmin();
      const found = res.data.data.find(p => p._id === id);
      if (!found) {
        setError('Post not found');
      } else {
        setPost({ ...post, ...found, featuredImage: found.featuredImage });
        if (found.featuredImage) setImagePreview(found.featuredImage.startsWith('http') ? found.featuredImage : `http://5whmedia.com${found.featuredImage}`);
      }
    } catch (e) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setPost(prev => ({ ...prev, [field]: value }));
    if (field === 'content' && !post.excerpt) {
      const excerpt = value.replace(/<[^>]*>/g, '').substring(0, 200);
      setPost(prev => ({ ...prev, excerpt }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setPost(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPost(prev => ({ ...prev, featuredImage: file }));
      const reader = new FileReader();
      reader.onload = ev => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (status = post.status) => {
    try {
      setSaving(true); setError(''); setSuccess('');
      const fd = new FormData();
      ['title','tab','excerpt','content','status','scheduledAt','featured'].forEach(f=> fd.append(f, post[f]));
      fd.append('tags', JSON.stringify(post.tags));
      if (post.featuredImage && typeof post.featuredImage !== 'string') fd.append('featuredImage', post.featuredImage);
      let res;
      if (isEditing) res = await blogsAPI.update(id, fd); else res = await blogsAPI.create(fd);
      setSuccess(isEditing ? 'Post updated' : 'Post created');
      if (!isEditing) navigate(`/admin/blogs/edit/${res.data.data._id}`);
    } catch (e) {
      console.error(e);
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', py:10 }}><CircularProgress /></Box>;

  return (
    <>
      <Helmet><title>{isEditing ? 'Edit Blog Post' : 'Create Blog Post'} - Admin</title></Helmet>
      <Container maxWidth="lg" sx={{ py:4 }}>
        <Box sx={{ mb:4, display:'flex', gap:2, alignItems:'center' }}>
          <Button startIcon={<ArrowBack />} variant="outlined" onClick={()=> navigate('/admin')}>Dashboard</Button>
          <Typography variant="h4" fontWeight="bold">{isEditing ? 'Edit Blog Post' : 'Create Blog Post'}</Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb:3 }} onClose={()=> setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb:3 }} onClose={()=> setSuccess('')}>{success}</Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb:3 }}>
              <CardContent>
                <TextField fullWidth label="Title" value={post.title} onChange={e=> handleChange('title', e.target.value)} sx={{ mb:3 }} required />
                <FormControl fullWidth sx={{ mb:3 }}>
                  <InputLabel>Tab</InputLabel>
                  <Select value={post.tab} label="Tab" onChange={e=> handleChange('tab', e.target.value)}>
                    {TAB_OPTIONS.map(opt=> <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField fullWidth label="Excerpt" multiline rows={3} value={post.excerpt} onChange={e=> handleChange('excerpt', e.target.value)} sx={{ mb:3 }} />
                <TextField fullWidth label="Content" multiline rows={18} value={post.content} onChange={e=> handleChange('content', e.target.value)} required placeholder="Write content (HTML supported)" />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb:3 }}>
              <CardContent>
                <FormControl fullWidth sx={{ mb:2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={post.status} label="Status" onChange={e=> handleChange('status', e.target.value)} size="small">
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                  </Select>
                </FormControl>
                {post.status === 'scheduled' && (
                  <TextField type="datetime-local" fullWidth size="small" label="Scheduled Time" InputLabelProps={{ shrink:true }} value={post.scheduledAt} onChange={e=> handleChange('scheduledAt', e.target.value)} sx={{ mb:2 }} />
                )}
                <FormControlLabel control={<Switch checked={post.featured} onChange={e=> handleChange('featured', e.target.checked)} />} label="Featured" />
                <Box sx={{ mt:2 }}>
                  <input id="blog-img" type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />
                  <label htmlFor="blog-img">
                    <Button variant="outlined" fullWidth startIcon={<CloudUpload />} component="span">Upload Image</Button>
                  </label>
                  {imagePreview && <Box sx={{ mt:2 }}><img alt="preview" src={imagePreview} style={{ width:'100%', borderRadius:4 }} /></Box>}
                </Box>
                <Box sx={{ mt:3 }}>
                  <TextField fullWidth size="small" label="Add Tag" value={tagInput} onChange={e=> setTagInput(e.target.value)} onKeyPress={e=> { if (e.key==='Enter'){ e.preventDefault(); addTag(); } }} InputProps={{ endAdornment: <IconButton size="small" onClick={addTag} disabled={!tagInput.trim()}><Add /></IconButton> }} />
                  <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, mt:1 }}>
                    {post.tags.map(t=> <Chip key={t} label={t} onDelete={()=> removeTag(t)} size="small" />)}
                  </Box>
                </Box>
                <Button variant="contained" fullWidth sx={{ mt:3 }} startIcon={saving ? <CircularProgress size={18} /> : <Save />} disabled={saving} onClick={()=> handleSave(post.status)}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default CreateBlogPost;