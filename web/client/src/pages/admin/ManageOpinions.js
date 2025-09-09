import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Star,
  StarBorder,
  Search,
  FilterList,
  Refresh,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
import { opinionsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ManageOpinions = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleBasedNavigation();
  const [opinions, setOpinions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    opinion: null
  });

  const categories = [
    'Editorial', 'Analysis', 'Commentary', 'Politics', 'Society', 
    'Culture', 'Economy', 'Media & Technology', 'Education'
  ];

  const statusColors = {
    draft: 'warning',
  scheduled: 'info',
    published: 'success',
    archived: 'default'
  };

  useEffect(() => {
    fetchOpinions();
  }, [searchTerm, statusFilter, categoryFilter, pagination.current]);

  const fetchOpinions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

  const response = await opinionsAPI.getAdmin(Object.fromEntries(params));
  setOpinions(response.data.data);
  setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching opinions:', error);
      setError('Failed to fetch opinions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (opinion) => {
    try {
  await opinionsAPI.toggleFeatured(opinion._id);
  toast.success('Toggled featured');
  fetchOpinions();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setError('Failed to update opinion');
    }
  };

  const handleStatusChange = async (opinion, newStatus) => {
    try {
  await opinionsAPI.updateStatus(opinion._id, newStatus);
  toast.success('Status updated');
  fetchOpinions();
    } catch (error) {
      console.error('Error updating opinion status:', error);
      setError('Failed to update opinion status');
    }
  };

  const handleDeleteOpinion = async () => {
    try {
  await opinionsAPI.delete(deleteDialog.opinion._id);
  toast.success('Opinion deleted');
  setDeleteDialog({ open: false, opinion: null });
  fetchOpinions();
    } catch (error) {
      console.error('Error deleting opinion:', error);
      setError('Failed to delete opinion');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Helmet>
        <title>Manage Opinions - 5WH Admin</title>
      </Helmet>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header with back button */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={navigateToDashboard}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Manage Opinions
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create, edit, and manage opinion articles and editorial content
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search opinions..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/admin/opinions/create')}
                    sx={{ minWidth: 'auto' }}
                  >
                    Create Opinion
                  </Button>
                  <IconButton onClick={fetchOpinions} color="primary">
                    <Refresh />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Opinions Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Featured</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : opinions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        No opinions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  opinions.map((opinion) => (
                    <TableRow key={opinion._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {opinion.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {opinion.excerpt.substring(0, 80)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {opinion.author}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {opinion.createdBy?.name || 'Unknown'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={opinion.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                          <Select
                            value={opinion.status}
                            onChange={(e) => handleStatusChange(opinion, e.target.value)}
                            variant="outlined"
                          >
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="published">Published</MenuItem>
                            <MenuItem value="archived">Archived</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      
                      <TableCell>
                        <IconButton
                          onClick={() => handleToggleFeatured(opinion)}
                          color={opinion.featured ? 'warning' : 'default'}
                        >
                          {opinion.featured ? <Star /> : <StarBorder />}
                        </IconButton>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {opinion.views.toLocaleString()}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(opinion.createdAt)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/opinions/edit/${opinion._id}`)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          
                          <IconButton
                            size="small"
                            onClick={() => window.open(`/opinion/${opinion.slug}`, '_blank')}
                            color="info"
                          >
                            <Visibility />
                          </IconButton>
                          
                          <IconButton
                            size="small"
                            onClick={() => setDeleteDialog({ open: true, opinion })}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              disabled={pagination.current === 1}
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
            >
              Previous
            </Button>
            <Typography sx={{ mx: 2, alignSelf: 'center' }}>
              Page {pagination.current} of {pagination.pages}
            </Typography>
            <Button
              disabled={pagination.current === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
            >
              Next
            </Button>
          </Box>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, opinion: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the opinion "{deleteDialog.opinion?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, opinion: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteOpinion} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageOpinions;
