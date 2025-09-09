import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EditorDashboard from './EditorDashboard';
import ManageNews from './ManageNews';
import ManagePodcasts from './ManagePodcasts';
import ManageVideos from './ManageVideos';
import CreateNews from './CreateNews';
import CreatePodcast from './CreatePodcast';
import CreateVideo from './CreateVideo';
import EditNews from './EditNews';
import EditVideo from './EditVideo';
import EditPodcast from './EditPodcast';
import DraftNewsManager from './DraftNewsManager';
import ManageOpinions from './ManageOpinions';
import CreateOpinion from './CreateOpinion';
import EditOpinion from './EditOpinion';
import LiveStreamManager from './LiveStreamManager';

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

const EditorRouter = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<EditorDashboard />} />
      <Route path="/news" element={<ManageNews />} />
      <Route path="/podcasts" element={<ManagePodcasts />} />
      <Route path="/videos" element={<ManageVideos />} />
      <Route path="/opinions" element={<ManageOpinions />} />
      <Route path="/live-streams" element={<LiveStreamManager />} />
      <Route path="/draft-news" element={<DraftNewsManager />} />
      
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
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/editor/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/editor/dashboard" replace />} />
    </Routes>
  );
};

export default EditorRouter;
