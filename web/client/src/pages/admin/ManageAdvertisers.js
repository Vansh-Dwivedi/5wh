import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  ArrowBack
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
import { advertisersAPI } from '../../services/api';

const ManageAdvertisers = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleBasedNavigation();
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAdvertiser, setEditingAdvertiser] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    link: '',
    description: '',
    contactEmail: '',
    isActive: true,
    startDate: '',
    endDate: '',
    displayOrder: 1,
    adType: 'sidebar',
    placement: 'right',
    size: {
      width: '300px',
      height: '250px'
    }
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchAdvertisers();
  }, []);

  const fetchAdvertisers = async () => {
    try {
      const res = await advertisersAPI.getAdmin();
      setAdvertisers(res.data.data || []);
    } catch (error) {
      console.error('Error fetching advertisers:', error);
      showSnackbar('Error fetching advertisers', 'error');
    } finally { setLoading(false); }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenDialog = (advertiser = null) => {
    if (advertiser) {
      setEditingAdvertiser(advertiser);
      setFormData({
        name: advertiser.name,
        logo: advertiser.logo,
        link: advertiser.link || '',
        description: advertiser.description || '',
        contactEmail: advertiser.contactEmail || '',
        isActive: advertiser.isActive,
        startDate: advertiser.startDate ? new Date(advertiser.startDate).toISOString().split('T')[0] : '',
        endDate: advertiser.endDate ? new Date(advertiser.endDate).toISOString().split('T')[0] : '',
        displayOrder: advertiser.displayOrder,
        adType: advertiser.adType || 'sidebar',
        placement: advertiser.placement || 'right',
        size: advertiser.size || { width: '300px', height: '250px' }
      });
      setLogoPreview(advertiser.logo);
    } else {
      setEditingAdvertiser(null);
      setFormData({
        name: '',
        logo: '',
        link: '',
        description: '',
        contactEmail: '',
        isActive: true,
        startDate: '',
        endDate: '',
        displayOrder: Math.max(...advertisers.map(a => a.displayOrder || 0), 0) + 1,
        adType: 'sidebar',
        placement: 'right',
        size: { width: '300px', height: '250px' }
      });
      setLogoPreview(null);
    }
    setLogoFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAdvertiser(null);
    setFormData({
      name: '',
      logo: '',
      link: '',
      description: '',
      contactEmail: '',
      isActive: true,
      startDate: '',
      endDate: '',
      displayOrder: 1,
      adType: 'sidebar',
      placement: 'right',
      size: { width: '300px', height: '250px' }
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSizeChange = (dimension, value) => {
    setFormData(prev => ({
      ...prev,
      size: {
        ...prev.size,
        [dimension]: value
      }
    }));
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getAdTypeFromTab = (tabIndex) => {
    const types = ['all', 'premium', 'sponsored', 'sidebar'];
    return types[tabIndex];
  };

  const getTabLabel = (tabIndex) => {
    const labels = ['All Ads', 'Premium Ads', 'Sponsored Content', 'Sidebar Ads'];
    return labels[tabIndex];
  };

  const filteredAdvertisers = selectedTab === 0 
    ? advertisers 
    : advertisers.filter(ad => ad.adType === getAdTypeFromTab(selectedTab));

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
  const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'size') {
          // Handle size object specially
          if (formData.size.width) {
            submitData.append('size.width', formData.size.width);
          }
          if (formData.size.height) {
            submitData.append('size.height', formData.size.height);
          }
        } else if (formData[key] !== '' && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      if (logoFile) {
        submitData.append('logo', logoFile);
      }

  if (editingAdvertiser) await advertisersAPI.update(editingAdvertiser._id, submitData);
  else await advertisersAPI.create(submitData);
  showSnackbar(`Advertiser ${editingAdvertiser ? 'updated' : 'created'} successfully`);
  fetchAdvertisers();
  handleCloseDialog();
    } catch (error) {
      console.error('Error saving advertiser:', error);
      showSnackbar(error.message || 'Error saving advertiser', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertiser?')) {
      try {
    await advertisersAPI.delete(id);
    showSnackbar('Advertiser deleted successfully');
    fetchAdvertisers();
      } catch (error) {
        console.error('Error deleting advertiser:', error);
        showSnackbar(error.message || 'Error deleting advertiser', 'error');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
  await advertisersAPI.toggleActive(id, !currentStatus);
  showSnackbar(`Advertiser ${!currentStatus ? 'activated' : 'deactivated'}`);
  fetchAdvertisers();
    } catch (error) {
      console.error('Error toggling advertiser status:', error);
      showSnackbar(error.message || 'Error updating advertiser status', 'error');
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        width="100%"
      >
        <Typography>Loading advertisers...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh',
      width: '100%',
      p: 3 
    }}>
      <Box sx={{ 
        width: '100%', 
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Back button header */}
        <Box sx={{ width: '100%', mb: 2 }}>
          <IconButton
            onClick={navigateToDashboard}
            sx={{ mb: 2 }}
          >
            <ArrowBack />
          </IconButton>
        </Box>
        
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={3}
          sx={{ width: '100%' }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Manage Advertisers
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.dark'
              }
            }}
          >
            Add Advertiser
          </Button>
        </Box>

        {/* Advertisement Type Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, width: '100%' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="All Ads" />
            <Tab label="Premium Ads" />
            <Tab label="Sponsored Content" />
            <Tab label="Sidebar Ads" />
          </Tabs>
        </Box>

        <Grid container spacing={3} sx={{ width: '100%', justifyContent: 'center' }}>
          {filteredAdvertisers.map((advertiser, index) => (
            <Grid item xs={12} md={6} lg={4} key={advertiser._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        src={advertiser.logo}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      >
                        {advertiser.name.charAt(0)}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="h6" fontWeight="bold">
                          {advertiser.name}
                        </Typography>
                        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                          <Chip
                            label={advertiser.isActive ? 'Active' : 'Inactive'}
                            color={advertiser.isActive ? 'success' : 'default'}
                            size="small"
                          />
                          <Chip
                            label={`${(advertiser.adType || 'sidebar').toUpperCase()}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            label={`Order: ${advertiser.displayOrder}`}
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            label={`${advertiser.placement || 'right'}`}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Box>

                    {advertiser.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {advertiser.description}
                      </Typography>
                    )}

                    <Box mb={2}>
                      <Typography variant="body2">
                        <strong>Clicks:</strong> {advertiser.clickCount || 0}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Impressions:</strong> {advertiser.impressionCount || 0}
                      </Typography>
                      {advertiser.contactEmail && (
                        <Typography variant="body2">
                          <strong>Contact:</strong> {advertiser.contactEmail}
                        </Typography>
                      )}
                    </Box>

                    {(advertiser.startDate || advertiser.endDate) && (
                      <Box mb={2}>
                        {advertiser.startDate && (
                          <Typography variant="body2">
                            <strong>Start:</strong> {new Date(advertiser.startDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {advertiser.endDate && (
                          <Typography variant="body2">
                            <strong>End:</strong> {new Date(advertiser.endDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleOpenDialog(advertiser)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {advertiser.link && (
                        <Tooltip title="Visit Link">
                          <IconButton
                            component="a"
                            href={advertiser.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                          >
                            <LinkIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Box>
                      <Tooltip title={advertiser.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          onClick={() => handleToggleActive(advertiser._id, advertiser.isActive)}
                          color={advertiser.isActive ? 'success' : 'default'}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(advertiser._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Add/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingAdvertiser ? 'Edit Advertiser' : 'Add New Advertiser'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Advertisement Type</InputLabel>
                  <Select
                    value={formData.adType}
                    label="Advertisement Type"
                    onChange={(e) => handleInputChange('adType', e.target.value)}
                  >
                    <MenuItem value="premium">Premium Advertisement</MenuItem>
                    <MenuItem value="sponsored">Sponsored Content</MenuItem>
                    <MenuItem value="sidebar">Sidebar (Default)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Placement</InputLabel>
                  <Select
                    value={formData.placement}
                    label="Placement"
                    onChange={(e) => handleInputChange('placement', e.target.value)}
                  >
                    <MenuItem value="left">Left Sidebar</MenuItem>
                    <MenuItem value="right">Right Sidebar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Width"
                  value={formData.size.width}
                  onChange={(e) => handleSizeChange('width', e.target.value)}
                  placeholder="300px, 100%, auto"
                  helperText="e.g., 300px, 100%, auto"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Height"
                  value={formData.size.height}
                  onChange={(e) => handleSizeChange('height', e.target.value)}
                  placeholder="250px, auto"
                  helperText="e.g., 250px, auto"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Link (Optional)"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  placeholder="https://example.com"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Display Order"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Logo
                  </Typography>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="logo-upload"
                    type="file"
                    onChange={handleLogoUpload}
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                    >
                      Upload Logo
                    </Button>
                  </label>
                  {logoPreview && (
                    <Box mt={2}>
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '100px',
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.name}
              sx={{
                backgroundColor: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.dark'
                }
              }}
            >
              {editingAdvertiser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ManageAdvertisers;
