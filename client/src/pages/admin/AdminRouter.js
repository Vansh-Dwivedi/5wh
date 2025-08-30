import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import ManageUsers from './ManageUsers';
import ManageNews from './ManageNews';
import ManagePodcasts from './ManagePodcasts';
import ManageVideos from './ManageVideos';
import ManageAdvertisers from './ManageAdvertisers';
import LiveStreamManager from './LiveStreamManager';
import CreateNews from './CreateNews';
import CreatePodcast from './CreatePodcast';
import CreateVideo from './CreateVideo';
import EditNews from './EditNews';
import EditVideo from './EditVideo';
import NewsFetchingPage from './NewsFetchingPage';
import DraftNewsManager from './DraftNewsManager';

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

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/users" element={<ManageUsers />} />
      <Route path="/news" element={<ManageNews />} />
      <Route path="/podcasts" element={<ManagePodcasts />} />
      <Route path="/videos" element={<ManageVideos />} />
      <Route path="/live-streams" element={<LiveStreamManager />} />
      <Route path="/advertisers" element={<ManageAdvertisers />} />
      <Route path="/news-fetching" element={<NewsFetchingPage />} />
      <Route path="/draft-news" element={<DraftNewsManager />} />
      
      {/* Create routes */}
      <Route path="/news/create" element={<CreateNews />} />
      <Route path="/podcasts/create" element={<CreatePodcast />} />
      <Route path="/videos/create" element={<CreateVideo />} />
      
      {/* Edit routes */}
      <Route path="/news/edit/:id" element={<EditNews />} />
      <Route path="/podcasts/edit/:id" element={<ComingSoon title="Edit Podcast" backUrl="/admin/podcasts" />} />
      <Route path="/videos/edit/:id" element={<EditVideo />} />
      <Route path="/users/edit/:id" element={<ComingSoon title="Edit User" backUrl="/admin/users" />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRouter;
