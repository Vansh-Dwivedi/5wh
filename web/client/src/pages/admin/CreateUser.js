import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  PersonAdd,
  Email,
  Lock,
  Person,
  AdminPanelSettings,
  Create,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { adminAPI } from '../../services/api';

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'editor',
    isActive: true,
    sendWelcomeEmail: true
  });

  const roles = [
    { 
      value: 'admin', 
      label: 'Administrator', 
      icon: <AdminPanelSettings />,
      description: 'Full system access and user management',
      color: 'error'
    },
    { 
      value: 'editor', 
      label: 'Editor', 
      icon: <Create />,
      description: 'Can create, edit, and publish content',
      color: 'warning'
    }
  ];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    setError('');
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.checked
    });
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return false;
    }
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive
      };

      await adminAPI.createUser(userData);
      
      setSuccess('User created successfully!');
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const roleData = roles.find(r => r.value === role);
    return roleData?.color || 'default';
  };

  return (
    <>
      <Helmet>
        <title>Create New User - 5WH Media Admin</title>
      </Helmet>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={() => navigate('/admin/users')} color="primary">
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 0.5 }}>
                👤 Create New User
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Add a new user to the system with appropriate role and permissions
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Personal Information */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Person color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    required
                    sx={{ borderRadius: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    required
                    sx={{ borderRadius: 2 }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Username (optional)"
                  value={formData.username}
                  onChange={handleChange('username')}
                  helperText="If left empty, will be auto-generated as firstname.lastname"
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </CardContent>
            </Card>

            {/* Security */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Lock color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Security & Access
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
                    helperText="Minimum 6 characters"
                  />
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    required
                    error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                    helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don't match" : ""}
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>User Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleChange('role')}
                    label="User Role"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {role.icon}
                          <Box>
                            <Typography variant="body1" fontWeight="medium" sx={{ lineHeight: 1.2 }}>
                              {role.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, mt: 0.25 }}>
                              {role.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Account Settings
                </Typography>
                
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleSwitchChange('isActive')}
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ lineHeight: 1.2 }}>Active Account</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, mt: 0.25 }}>
                          User can log in and access the system
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.sendWelcomeEmail}
                        onChange={handleSwitchChange('sendWelcomeEmail')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ lineHeight: 1.2 }}>Send Welcome Email</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, mt: 0.25 }}>
                          Send login credentials and welcome message to user
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Actions */}
            <Paper sx={{ p: 3, borderRadius: 3, background: 'grey.50' }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/users')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<PersonAdd />}
                  disabled={loading}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </form>
      </Container>
    </>
  );
};

export default CreateUser;
