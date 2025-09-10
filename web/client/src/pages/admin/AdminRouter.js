import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import AdminDashboard from './AdminDashboard';
import EditorDashboard from './EditorDashboard';
import { useAuth } from '../../contexts/AuthContext';
import ManageUsers from './ManageUsers';
import CreateUser from './CreateUser';
import ManageNews from './ManageNews';
import ManagePodcasts from './ManagePodcasts';
import ManageVideos from './ManageVideos';
import ManageRadio from './ManageRadio';
import ManageAdvertisers from './ManageAdvertisers';
import ManageBooks from './ManageBooks';
import ManageLifeCulture from '../../components/admin/ManageLifeCulture';
import LiveStreamManager from './LiveStreamManager';
import CreateNews from './CreateNews';
import CreatePodcast from './CreatePodcast';
import CreateVideo from './CreateVideo';
import EditNews from './EditNews';
import EditVideo from './EditVideo';
import EditPodcast from './EditPodcast';
import NewsFetchingPage from './NewsFetchingPage';
import DraftNewsManager from './DraftNewsManager';
import ManageOpinions from './ManageOpinions';
import CreateOpinion from './CreateOpinion';
import EditOpinion from './EditOpinion';
import PushNotificationManager from './PushNotificationManager';
import NotificationHistory from './NotificationHistory';
import AuditLogsPage from './AuditLogsPage';

// Placeholder component for create/edit pages
const ComingSoon = ({ title, backUrl }) => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This feature is coming soon! We're working hard to bring you the best content management experience.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate(backUrl)}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

// Role-based dashboard component
const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else if (user?.role === 'editor') {
    return <EditorDashboard />;
  }
  
  // Fallback - shouldn't happen with proper auth
  return <Navigate to="/admin/login" replace />;
};

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<RoleBasedDashboard />} />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageUsers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users/create" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateUser />
          </ProtectedRoute>
        } 
      />
      <Route path="/news" element={<ManageNews />} />
      <Route path="/podcasts" element={<ManagePodcasts />} />
      <Route path="/videos" element={<ManageVideos />} />
      <Route path="/radio" element={<ManageRadio />} />
      <Route path="/live-streams" element={<LiveStreamManager />} />
      <Route path="/opinions" element={<ManageOpinions />} />
      <Route 
        path="/books" 
        element={
          <ProtectedRoute allowedRoles={['admin','editor']}>
            <ManageBooks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/life-culture" 
        element={
          <ProtectedRoute allowedRoles={['admin','editor']}>
            <ManageLifeCulture />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/advertisers" 
        element={
          <ProtectedRoute allowedRoles={['admin','editor']}>
            <ManageAdvertisers />
          </ProtectedRoute>
        } 
      />
      <Route path="/news-fetching" element={<NewsFetchingPage />} />
      <Route path="/draft-news" element={<DraftNewsManager />} />
      <Route path="/push-notifications" element={<PushNotificationManager />} />
      <Route path="/notification-history" element={<NotificationHistory />} />
      <Route 
        path="/audit-logs" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AuditLogsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Create routes */}
      <Route path="/news/create" element={<CreateNews />} />
      <Route path="/podcasts/create" element={<CreatePodcast />} />
      <Route path="/videos/create" element={<CreateVideo />} />
      <Route path="/opinions/create" element={<CreateOpinion />} />
      
      {/* Edit routes */}
      <Route path="/news/edit/:id" element={<EditNews />} />
  <Route path="/podcasts/edit/:id" element={<EditPodcast />} />
      <Route path="/videos/edit/:id" element={<EditVideo />} />
  <Route path="/opinions/edit/:id" element={<EditOpinion />} />
      <Route path="/users/edit/:id" element={<ComingSoon title="Edit User" backUrl="/admin/users" />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRouter;
