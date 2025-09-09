import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Alert,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton, LinearProgress,
  Switch, FormControlLabel
} from '@mui/material';
import { ArrowBack, Save, Add, Delete, Audiotrack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { podcastsAPI } from '../../services/api';
import { useScheduleValidation } from '../../hooks/useScheduleValidation';
import { toast } from 'react-toastify';

const categories = [
  'interviews','news','politics','analysis','opinion','history','culture','other'
];

const EditPodcast = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { validateSchedule } = useScheduleValidation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioPreview, setAudioPreview] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', duration: '', durationSeconds: 0, host: '',
    guests: [], category: 'interviews', tags: [], status: 'draft', featured: false,
    transcript: '', showNotes: '', scheduledAt: '', seo: { metaTitle:'', metaDescription:'', keywords: '' },
    audioFile: null, thumbnailFile: null, thumbnailAlt: ''
  });

  useEffect(()=>{ fetchPodcast(); },[id]);

  const fetchPodcast = async () => {
    try {
      const res = await podcastsAPI.getById(id);
      const pod = res.data;
      setForm(f=>({
        ...f,
        title: pod.title || '', description: pod.description || '', duration: pod.duration || '',
        durationSeconds: pod.durationSeconds || 0, host: pod.host || '', guests: pod.guests || [],
        category: pod.category || 'interviews', tags: pod.tags || [], status: pod.status || 'draft',
        featured: pod.featured || false, transcript: pod.transcript || '', showNotes: pod.showNotes || '',
        scheduledAt: pod.scheduledAt ? pod.scheduledAt.substring(0,16) : '',
        seo: { metaTitle: pod.seo?.metaTitle || '', metaDescription: pod.seo?.metaDescription || '', keywords: (pod.seo?.keywords||[]).join(', ') },
        thumbnailAlt: pod.thumbnail?.alt || ''
      }));
      if (pod.audioUrl) setAudioPreview(pod.audioUrl);
      if (pod.thumbnail?.url) setThumbnailPreview(pod.thumbnail.url);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load podcast');
    } finally { setLoading(false); }
  };

  const handleChange = (field, value) => {
    setForm(prev=> ({ ...prev, [field]: value }));
  };

  const handleGuestAdd = (name) => {
    if (!name.trim()) return;
    setForm(prev=> ({ ...prev, guests:[...prev.guests, { name: name.trim() }] }));
  };
  const handleGuestRemove = (idx) => {
    setForm(prev=> ({ ...prev, guests: prev.guests.filter((_,i)=> i!==idx) }));
  };
  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev=> ({ ...prev, tags:[...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };
  const removeTag = (t) => setForm(prev=> ({ ...prev, tags: prev.tags.filter(x=> x!==t) }));

  const onAudioFile = e => { const file = e.target.files[0]; if(file){ setForm(p=>({...p,audioFile:file})); setAudioPreview(URL.createObjectURL(file)); }};
  const onThumbFile = e => { const file = e.target.files[0]; if(file){ setForm(p=>({...p,thumbnailFile:file})); setThumbnailPreview(URL.createObjectURL(file)); }};

  const submit = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title required'); return; }
    if (!form.description.trim()) { setError('Description required'); return; }
    if (!form.host.trim()) { setError('Host required'); return; }
    if (form.status === 'scheduled') {
      const v = validateSchedule(form.status, form.scheduledAt);
      if (!v.valid) { setError(v.message); return; }
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('duration', form.duration);
      fd.append('durationSeconds', form.durationSeconds || 0);
      fd.append('host', form.host);
      fd.append('guests', JSON.stringify(form.guests));
      fd.append('category', form.category);
      fd.append('tags', form.tags.join(','));
      fd.append('status', form.status);
      if (form.status === 'scheduled') fd.append('scheduledAt', form.scheduledAt);
      fd.append('featured', form.featured);
      fd.append('transcript', form.transcript);
      fd.append('showNotes', form.showNotes);
      fd.append('seo', JSON.stringify({ metaTitle: form.seo.metaTitle, metaDescription: form.seo.metaDescription, keywords: form.seo.keywords.split(',').map(k=>k.trim()).filter(Boolean) }));
      if (form.audioFile) fd.append('audio', form.audioFile);
      if (form.thumbnailFile) fd.append('thumbnail', form.thumbnailFile);
      if (form.thumbnailAlt) fd.append('thumbnailAlt', form.thumbnailAlt);

      await podcastsAPI.update(id, fd, { onUploadProgress: evt => { if (evt.total) setUploadProgress(Math.round(evt.loaded*100/evt.total)); }});
      setSuccess('Podcast updated');
      toast.success('Podcast updated');
      setTimeout(()=> navigate('/admin/podcasts'), 1200);
    } catch(err){
      console.error(err);
      const msg = err.response?.data?.message || 'Update failed';
      setError(msg);
      toast.error(msg);
    } finally { setSaving(false); setUploadProgress(0); }
  };

  if (loading) {
    return (<Container maxWidth="lg" sx={{py:4}}><Typography>Loading podcast...</Typography></Container>);
  }

  return (
    <>
      <Helmet><title>Edit Podcast - 5WH Admin</title></Helmet>
      <Container maxWidth="lg" sx={{ py:4 }}>
        <Box sx={{ mb:3, display:'flex', alignItems:'center', gap:2 }}>
          <IconButton onClick={()=> navigate('/admin/podcasts')}><ArrowBack /></IconButton>
          <Typography variant="h4" fontWeight={700}>Edit Podcast</Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb:2 }} onClose={()=> setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb:2 }} onClose={()=> setSuccess('')}>{success}</Alert>}
        {uploadProgress>0 && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb:2 }} />}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb:3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Podcast Details</Typography>
                <TextField fullWidth label="Title" value={form.title} onChange={e=>handleChange('title', e.target.value)} sx={{ mb:2 }} />
                <TextField fullWidth multiline rows={4} label="Description" value={form.description} onChange={e=>handleChange('description', e.target.value)} sx={{ mb:2 }} />
                <Grid container spacing={2} sx={{ mb:2 }}>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Duration (e.g. 45:30)" value={form.duration} onChange={e=>handleChange('duration', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Host" value={form.host} onChange={e=>handleChange('host', e.target.value)} /></Grid>
                </Grid>
                <Typography variant="subtitle2" sx={{ mt:1 }}>Guests</Typography>
                <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:1 }}>
                  {form.guests.map((g,i)=>(<Chip key={i} label={g.name} onDelete={()=> handleGuestRemove(i)} size="small" />))}
                </Box>
                <Box sx={{ display:'flex', gap:1, mb:2 }}>
                  <TextField size="small" placeholder="Add guest" onKeyDown={e=> { if(e.key==='Enter'){ e.preventDefault(); handleGuestAdd(e.target.value); e.target.value=''; } }} />
                  <Button variant="outlined" onClick={()=> { const el=document.getElementById('guestInputTemp'); }} sx={{ display:'none' }}>Add</Button>
                </Box>
                <TextField fullWidth multiline rows={4} label="Show Notes" value={form.showNotes} onChange={e=>handleChange('showNotes', e.target.value)} sx={{ mb:2 }} />
                <TextField fullWidth multiline rows={4} label="Transcript" value={form.transcript} onChange={e=>handleChange('transcript', e.target.value)} />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>SEO</Typography>
                <TextField fullWidth label="Meta Title" value={form.seo.metaTitle} onChange={e=> setForm(p=>({...p, seo:{...p.seo, metaTitle:e.target.value}}))} sx={{ mb:2 }} />
                <TextField fullWidth multiline rows={3} label="Meta Description" value={form.seo.metaDescription} onChange={e=> setForm(p=>({...p, seo:{...p.seo, metaDescription:e.target.value}}))} sx={{ mb:2 }} />
                <TextField fullWidth label="Keywords (comma separated)" value={form.seo.keywords} onChange={e=> setForm(p=>({...p, seo:{...p.seo, keywords:e.target.value}}))} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb:3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Publishing</Typography>
                <FormControl fullWidth size="small" sx={{ mb:2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={form.status} onChange={e=>handleChange('status', e.target.value)}>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
                {form.status === 'scheduled' && (
                  <TextField type="datetime-local" fullWidth size="small" label="Scheduled Time" InputLabelProps={{ shrink:true }} value={form.scheduledAt} onChange={e=>handleChange('scheduledAt', e.target.value)} helperText="Auto publish time" sx={{ mb:2 }} />
                )}
                <FormControlLabel control={<Switch checked={form.featured} onChange={e=>handleChange('featured', e.target.checked)} />} label="Featured" sx={{ mb:2 }} />
                <Button fullWidth variant="contained" startIcon={<Save />} disabled={saving} onClick={submit}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              </CardContent>
            </Card>
            <Card sx={{ mb:3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Media</Typography>
                <Box sx={{ mb:2 }}>
                  <Button component="label" variant="outlined" startIcon={<Audiotrack />}>Replace Audio<input hidden type="file" accept="audio/*" onChange={onAudioFile} /></Button>
                  {audioPreview && <Typography variant="caption" display="block" sx={{ mt:1 }}>{audioPreview.split('/').pop()}</Typography>}
                </Box>
                <Box>
                  <Button component="label" variant="outlined">Thumbnail<input hidden type="file" accept="image/*" onChange={onThumbFile} /></Button>
                  {thumbnailPreview && <Box sx={{ mt:1 }}><img alt="thumb" src={thumbnailPreview} style={{ width:'100%', borderRadius:8 }} /></Box>}
                  <TextField fullWidth size="small" label="Thumbnail Alt" value={form.thumbnailAlt} onChange={e=>handleChange('thumbnailAlt', e.target.value)} sx={{ mt:1 }} />
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Tags & Category</Typography>
                <FormControl fullWidth size="small" sx={{ mb:2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select label="Category" value={form.category} onChange={e=>handleChange('category', e.target.value)}>
                    {categories.map(c=> <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
                <Box sx={{ display:'flex', gap:1, mb:1 }}>
                  <TextField size="small" label="Add Tag" value={tagInput} onChange={e=> setTagInput(e.target.value)} onKeyDown={e=> { if(e.key==='Enter'){ e.preventDefault(); handleAddTag(); } }} />
                  <Button variant="outlined" onClick={handleAddTag}>Add</Button>
                </Box>
                <Box sx={{ display:'flex', flexWrap:'wrap', gap:1 }}>
                  {form.tags.map(t=> <Chip key={t} label={t} onDelete={()=> removeTag(t)} size="small" deleteIcon={<Delete />} />)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default EditPodcast;
