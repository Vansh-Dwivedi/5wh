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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  Badge,
  Stack,
  Divider,
  InputAdornment,
  Checkbox,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Fab,
  TablePagination
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  ArrowBack,
  Search,
  FilterList,
  MoreVert,
  PersonAdd,
  Download,
  Upload,
  Email,
  Phone,
  CalendarToday,
  TrendingUp,
  Group,
  AdminPanelSettings,
  Create,
  Visibility,
  Block,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useRoleBasedNavigation from '../../hooks/useRoleBasedNavigation';
import { Helmet } from 'react-helmet-async';
import { adminAPI } from '../../services/api';

const ManageUsers = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleBasedNavigation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    editors: 0,
    authors: 0
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'editor',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const filterUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && user.isActive !== false) ||
                           (statusFilter === 'inactive' && user.isActive === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
  };

  const calculateStats = (userList) => {
    const stats = {
      total: userList.length,
      active: userList.filter(u => u.isActive !== false).length,
      inactive: userList.filter(u => u.isActive === false).length,
      admins: userList.filter(u => u.role === 'admin').length,
      editors: userList.filter(u => u.role === 'editor').length
    };
    setStats(stats);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
      calculateStats(response.data.users);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'editor': return 'warning';
      case 'author': return 'info';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'editor': return <Create />;
      case 'author': return <Visibility />;
      default: return <Group />;
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const handleBulkAction = async (action) => {
    try {
      if (action === 'delete') {
        await Promise.all(selectedUsers.map(id => adminAPI.deleteUser(id)));
      } else if (action === 'activate') {
        await Promise.all(selectedUsers.map(id => adminAPI.updateUser(id, { isActive: true })));
      } else if (action === 'deactivate') {
        await Promise.all(selectedUsers.map(id => adminAPI.updateUser(id, { isActive: false })));
      }
      setSelectedUsers([]);
      fetchUsers();
      setMoreMenuAnchor(null);
    } catch (err) {
      setError(`Failed to ${action} users`);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'editor',
      isActive: user.isActive !== false
    });
    setEditDialog(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      await adminAPI.updateUser(selectedUser._id, formData);
      setEditDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await adminAPI.deleteUser(selectedUser._id);
      setDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role');
      console.error('Error updating role:', err);
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await adminAPI.updateUserStatus(userId, isActive);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
      console.error('Error updating status:', err);
    }
  };

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
        <title>Manage Users - 5WH Media Admin</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigateToDashboard()} color="primary">
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 0.5 }}>
                  👥 User Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage system users, roles, and permissions
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/admin/users/create')}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Add New User
            </Button>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Group sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                  <Typography variant="h4" fontWeight="bold" color="text.primary">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Users</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
                  <Typography variant="h4" fontWeight="bold" color="text.primary">{stats.active}</Typography>
                  <Typography variant="body2" color="text.secondary">Active</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <AdminPanelSettings sx={{ fontSize: 40, mb: 1, color: 'error.main' }} />
                  <Typography variant="h4" fontWeight="bold" color="text.primary">{stats.admins}</Typography>
                  <Typography variant="body2" color="text.secondary">Admins</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Create sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
                  <Typography variant="h4" fontWeight="bold" color="text.primary">{stats.editors}</Typography>
                  <Typography variant="body2" color="text.secondary">Editors</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Visibility sx={{ fontSize: 40, mb: 1, color: 'info.main' }} />
                  <Typography variant="h4" fontWeight="bold" color="text.primary">{stats.authors}</Typography>
                  <Typography variant="body2" color="text.secondary">Authors</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Block sx={{ fontSize: 40, mb: 1, color: 'grey.500' }} />
                  <Typography variant="h4" fontWeight="bold" color="text.primary">{stats.inactive}</Typography>
                  <Typography variant="body2" color="text.secondary">Inactive</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filter Controls */}
          <Card sx={{ borderRadius: 3, p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    label="Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="editor">Editor</MenuItem>
                    <MenuItem value="author">Author</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2}>
                  {selectedUsers.length > 0 && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<MoreVert />}
                        onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
                      >
                        Bulk Actions ({selectedUsers.length})
                      </Button>
                      <Menu
                        anchorEl={moreMenuAnchor}
                        open={Boolean(moreMenuAnchor)}
                        onClose={() => setMoreMenuAnchor(null)}
                      >
                        <MenuItem onClick={() => handleBulkAction('activate')}>
                          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                          <ListItemText>Activate Selected</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleBulkAction('deactivate')}>
                          <ListItemIcon><Block color="warning" /></ListItemIcon>
                          <ListItemText>Deactivate Selected</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => handleBulkAction('delete')}>
                          <ListItemIcon><Delete color="error" /></ListItemIcon>
                          <ListItemText>Delete Selected</ListItemText>
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                  <Button variant="outlined" startIcon={<Download />}>
                    Export
                  </Button>
                  <Button variant="outlined" startIcon={<Upload />}>
                    Import
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Users Table */}
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: 'grey.50' }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                      checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight="bold">User</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight="bold">Role</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight="bold">Status</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight="bold">Joined</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight="bold">Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                  <TableRow key={user._id} hover sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            user.isActive !== false ? (
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: 'success.main',
                                  border: 2,
                                  borderColor: 'background.paper'
                                }}
                              />
                            ) : null
                          }
                        >
                          <Avatar
                            sx={{
                              backgroundColor: getRoleColor(user.role) + '.main',
                              width: 48,
                              height: 48,
                              fontSize: '1.1rem'
                            }}
                          >
                            {getUserInitials(user)}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.username || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Author'}
                        color={getRoleColor(user.role)}
                        size="small"
                        sx={{ borderRadius: 2, fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive !== false ? 'Active' : 'Inactive'}
                        color={user.isActive !== false ? 'success' : 'error'}
                        size="small"
                        variant={user.isActive !== false ? 'filled' : 'outlined'}
                        sx={{ borderRadius: 2, fontWeight: 'medium' }}
                        onClick={() => handleStatusChange(user._id, user.isActive === false)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(user)}
                            color="primary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send Email">
                          <IconButton
                            size="small"
                            onClick={() => window.open(`mailto:${user.email}`)}
                            color="info"
                          >
                            <Email fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(user)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Card>


        {/* Edit User Dialog */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="author">Author</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user "{selectedUser?.firstName} {selectedUser?.lastName}"?
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
      </Container>
    </>
  );
};

export default ManageUsers;
