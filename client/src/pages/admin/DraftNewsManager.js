import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
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
  Tooltip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Badge,
  Avatar
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Image as ImageIcon,
  Language as LanguageIcon,
  Source as SourceIcon,
  Schedule as DraftIcon,
  Done as PublishedIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api, { adminAPI } from '../../services/api';

const DraftNewsManager = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({ draft: 0, published: 0, scraped: 0 });

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    category: '',
    featured: false,
    breaking: false
  });

  useEffect(() => {
    fetchDraftArticles();
    fetchStats();
  }, [filter]);

  const fetchDraftArticles = async () => {
    try {
      setLoading(true);
      
      const params = {
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await adminAPI.getNews(params);
      setArticles(response.data.news || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getNews({ limit: 0 });
      const allArticles = response.data.news || [];
      const statsData = {
        draft: allArticles.filter(a => a.status === 'draft').length,
        published: allArticles.filter(a => a.status === 'published').length,
        scraped: allArticles.length
      };
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handlePreview = (article) => {
    setSelectedArticle(article);
    setPreviewOpen(true);
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
    setEditForm({
      title: article.title,
      content: article.content,
      category: article.category,
      featured: article.featured || false,
      breaking: article.breaking || false
    });
    setEditOpen(true);
  };

  const handlePublish = async (articleId, publish = true) => {
    setActionLoading(prev => ({ ...prev, [articleId]: 'publishing' }));
    
    try {
      await api.patch(`/news/${articleId}`, {
        status: publish ? 'published' : 'draft',
        publishedAt: publish ? new Date() : null
      });
      
      setArticles(prev => prev.map(article => 
        article._id === articleId 
          ? { ...article, status: publish ? 'published' : 'draft' }
          : article
      ));
      
      // Optionally refresh stats
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${publish ? 'publish' : 'unpublish'} article`);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[articleId];
        return newState;
      });
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    
    setActionLoading(prev => ({ ...prev, [articleId]: 'deleting' }));
    
    try {
      await api.delete(`/news/${articleId}`);
      setArticles(prev => prev.filter(article => article._id !== articleId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete article');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[articleId];
        return newState;
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedArticle) return;
    
    try {
      const response = await api.patch(`/news/${selectedArticle._id}`, editForm);
      setArticles(prev => prev.map(article => 
        article._id === selectedArticle._id 
          ? { ...article, ...editForm }
          : article
      ));
      setEditOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update article');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'primary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <PublishedIcon />;
      case 'draft': return <DraftIcon />;
      default: return <DraftIcon />;
    }
  };

  const tabFilters = [
    { label: 'All', value: 'all', count: articles.length },
    { label: 'Drafts', value: 'draft', count: articles.filter(a => a.status === 'draft').length },
    { label: 'Published', value: 'published', count: articles.filter(a => a.status === 'published').length }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📝 Draft News Manager
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Review, edit, and publish scraped news articles. Articles are automatically saved as drafts for your review.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <DraftIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{articles.filter(a => a.status === 'draft').length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Review
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PublishedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{articles.filter(a => a.status === 'published').length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Published
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <SourceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{articles.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Scraped
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            setTabValue(newValue);
            setFilter(tabFilters[newValue].value);
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabFilters.map((tab, index) => (
            <Tab
              key={tab.value}
              label={
                <Badge badgeContent={tab.count} color="primary">
                  {tab.label}
                </Badge>
              }
            />
          ))}
        </Tabs>
      </Card>

      {/* Articles Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Article</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      No articles found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {article.featuredImage?.url && (
                          <Avatar
                            src={article.featuredImage.url}
                            variant="rounded"
                            sx={{ width: 60, height: 40, mr: 2 }}
                          >
                            <ImageIcon />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 300 }}>
                            {article.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {article.excerpt?.substring(0, 100)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={article.rssAuthor || article.source || 'Unknown'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={article.category}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(article.status)}
                        label={article.status}
                        size="small"
                        color={getStatusColor(article.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(article.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={() => handlePreview(article)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(article)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {article.status === 'draft' ? (
                          <Tooltip title="Publish">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handlePublish(article._id, true)}
                              disabled={actionLoading[article._id] === 'publishing'}
                            >
                              {actionLoading[article._id] === 'publishing' ? (
                                <CircularProgress size={16} />
                              ) : (
                                <PublishIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Unpublish">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handlePublish(article._id, false)}
                              disabled={actionLoading[article._id] === 'publishing'}
                            >
                              {actionLoading[article._id] === 'publishing' ? (
                                <CircularProgress size={16} />
                              ) : (
                                <DraftIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(article._id)}
                            disabled={actionLoading[article._id] === 'deleting'}
                          >
                            {actionLoading[article._id] === 'deleting' ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Article Preview
        </DialogTitle>
        <DialogContent>
          {selectedArticle && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedArticle.title}
              </Typography>
              
              {selectedArticle.featuredImage?.url && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={selectedArticle.featuredImage.url}
                    alt={selectedArticle.title}
                    style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}
                  />
                </Box>
              )}
              
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={selectedArticle.category} size="small" />
                <Chip label={selectedArticle.source} size="small" variant="outlined" />
                <Chip 
                  label={selectedArticle.status} 
                  size="small" 
                  color={getStatusColor(selectedArticle.status)} 
                />
              </Box>
              
              <Typography variant="body1" paragraph>
                {selectedArticle.content}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                Source: {selectedArticle.rssAuthor || selectedArticle.source}
                <br />
                Scraped: {formatDate(selectedArticle.createdAt)}
                {selectedArticle.seo?.originalUrl && (
                  <>
                    <br />
                    Original URL: <a href={selectedArticle.seo.originalUrl} target="_blank" rel="noopener noreferrer">
                      {selectedArticle.seo.originalUrl}
                    </a>
                  </>
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
          {selectedArticle && selectedArticle.status === 'draft' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handlePublish(selectedArticle._id, true);
                setPreviewOpen(false);
              }}
              startIcon={<PublishIcon />}
            >
              Publish Now
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Article
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={8}
              value={editForm.content}
              onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={editForm.category}
                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="politics">Politics</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="entertainment">Entertainment</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="lifestyle">Lifestyle</MenuItem>
                <MenuItem value="world">World</MenuItem>
                <MenuItem value="local">Local</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.featured}
                    onChange={(e) => setEditForm(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                }
                label="Featured Article"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.breaking}
                    onChange={(e) => setEditForm(prev => ({ ...prev, breaking: e.target.checked }))}
                  />
                }
                label="Breaking News"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DraftNewsManager;
