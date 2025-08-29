import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Pagination,
  Checkbox,
  Toolbar
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  ArrowBack,
  Visibility,
  Star,
  Schedule,
  Search,
  Article
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { newsAPI } from '../../services/api';

const ManageNews = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNews, setSelectedNews] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [filteredNews, setFilteredNews] = useState([]);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    // Filter news based on search term
    const filtered = news.filter(article =>
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNews(filtered);
    setTotalPages(Math.ceil(filtered.length / 10));
    setPage(1);
  }, [news, searchTerm]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsAPI.getAll({ page, limit: 20, search: searchTerm });
      setNews(response.data.news);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to load news articles');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (article) => {
    setSelectedArticle(article);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await newsAPI.delete(selectedArticle._id);
      setDeleteDialog(false);
      setSelectedArticle(null);
      fetchNews();
    } catch (err) {
      setError('Failed to delete article');
      console.error('Error deleting article:', err);
    }
  };

  const handleStatusChange = async (articleId, status) => {
    try {
      await newsAPI.update(articleId, { status });
      fetchNews();
    } catch (err) {
      setError('Failed to update article status');
      console.error('Error updating status:', err);
    }
  };

  const handleFeaturedToggle = async (articleId, featured) => {
    try {
      await newsAPI.update(articleId, { featured: !featured });
      fetchNews();
    } catch (err) {
      setError('Failed to update featured status');
      console.error('Error updating featured status:', err);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedNews(news.map(article => article._id));
      setSelectAll(true);
    } else {
      setSelectedNews([]);
      setSelectAll(false);
    }
  };

  const handleSelectOne = (event, articleId) => {
    const selectedIndex = selectedNews.indexOf(articleId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedNews, articleId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedNews.slice(1));
    } else if (selectedIndex === selectedNews.length - 1) {
      newSelected = newSelected.concat(selectedNews.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedNews.slice(0, selectedIndex),
        selectedNews.slice(selectedIndex + 1),
      );
    }

    setSelectedNews(newSelected);
    setSelectAll(newSelected.length === news.length);
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialog(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      await Promise.all(selectedNews.map(id => newsAPI.delete(id)));
      setSelectedNews([]);
      setSelectAll(false);
      setBulkDeleteDialog(false);
      fetchNews();
    } catch (err) {
      setError('Failed to delete selected articles');
      console.error('Error deleting articles:', err);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Effect to fetch news when search term or page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNews();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm, page]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage News - 5WH Media Admin</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin/dashboard')} color="primary">
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Manage News
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/news/create')}
          >
            Add News Article
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search Box */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search news articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>

        {/* Bulk Actions Toolbar */}
        {selectedNews.length > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" color="text.primary">
                {selectedNews.length} article(s) selected
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setBulkDeleteDialog(true)}
              >
                Delete Selected
              </Button>
            </Box>
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedNews.length > 0 && selectedNews.length < filteredNews.length}
                    checked={filteredNews.length > 0 && selectedNews.length === filteredNews.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Article</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Published</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNews
                .slice((page - 1) * 10, page * 10)
                .map((article) => (
                <TableRow key={article._id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedNews.includes(article._id)}
                      onChange={(event) => handleSelectOne(event, article._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {article.featuredImage?.url ? (
                        <Box
                          component="img"
                          src={article.featuredImage.url.startsWith('http') 
                            ? article.featuredImage.url 
                            : `http://localhost:5000${article.featuredImage.url}`}
                          alt={article.title}
                          sx={{ 
                            width: 60, 
                            height: 40, 
                            borderRadius: 1, 
                            objectFit: 'cover',
                            border: '1px solid #e0e0e0'
                          }}
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            width: 60, 
                            height: 40, 
                            borderRadius: 1, 
                            bgcolor: 'grey.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #e0e0e0',
                            fontSize: '16px'
                          }}
                        >
                          📰
                        </Box>
                      )}
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {article.title?.substring(0, 60)}
                          {article.title?.length > 60 ? '...' : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {article.excerpt?.substring(0, 80)}
                          {article.excerpt?.length > 80 ? '...' : ''}
                        </Typography>
                        {article.featured && (
                          <Chip
                            label="Featured"
                            size="small"
                            color="secondary"
                            icon={<Star />}
                            sx={{ ml: 1, mt: 0.5 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={article.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={article.status}
                      size="small"
                      color={article.status === 'published' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {article.rssAuthor || 'RSS Feed'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => window.open(`/news/${article.slug}`, '_blank')}
                        title="View Article"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/admin/news/edit/${article._id}`)}
                        title="Edit Article"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleFeaturedToggle(article._id, article.featured)}
                        color={article.featured ? 'secondary' : 'default'}
                        title={article.featured ? 'Remove from Featured' : 'Add to Featured'}
                      >
                        <Star />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(article)} 
                        color="error"
                        title="Delete Article"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

        {filteredNews.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {searchTerm ? 'No articles found matching your search' : 'No news articles found'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/news/create')}
              sx={{ mt: 2 }}
            >
              Create First Article
            </Button>
          </Box>
        )}

        {/* Delete Article Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the article "{selectedArticle?.title}"?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Delete Dialog */}
        <Dialog open={bulkDeleteDialog} onClose={() => setBulkDeleteDialog(false)}>
          <DialogTitle>Confirm Bulk Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedNews.length} selected articles?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmBulkDelete} variant="contained" color="error">
              Delete All
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ManageNews;
