import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  let hasPermission = true;
  
  const normalizedRole = (user?.role || '').toString().trim().toLowerCase();
  
  // Debug logging
  console.log('[ProtectedRoute] User:', user);
  console.log('[ProtectedRoute] User role:', normalizedRole);
  console.log('[ProtectedRoute] Required roles:', allowedRoles);
  console.log('[ProtectedRoute] Current path:', location.pathname);
  
  if (allowedRoles) {
    hasPermission = allowedRoles.map(r => r.toLowerCase()).includes(normalizedRole);
    console.log('[ProtectedRoute] Has permission:', hasPermission);
  } else if (requiredRole) {
    const req = requiredRole.toLowerCase();
    if (req === 'admin') {
      hasPermission = ['admin', 'editor'].includes(normalizedRole);
    } else {
      hasPermission = normalizedRole === req;
    }
  }

  if (!hasPermission) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
          textAlign: 'center',
          p: 3,
        }}
      >
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
