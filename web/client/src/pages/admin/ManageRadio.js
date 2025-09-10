import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab
} from '@mui/material';
import {
  ArrowBack,
  Radio,
  Edit,
  Delete,
  Add,
  Save,
  PlayArrow,
  Stop,
  Schedule,
  Settings,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useRoleBasedNavigation from '../../hooks/useRoleBasedNavigation';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ManageRadio = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleBasedNavigation();
  
  // State management
  const [radioConfig, setRadioConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [configDialog, setConfigDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [deleteScheduleDialog, setDeleteScheduleDialog] = useState(false);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(null);
  
  // Form states
  const [streamUrl, setStreamUrl] = useState('');
  const [title, setTitle] = useState('');
  const [currentShow, setCurrentShow] = useState('');
  const [currentArtist, setCurrentArtist] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [listenersCount, setListenersCount] = useState(0);
  
  // Schedule form states
  const [scheduleDay, setScheduleDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showName, setShowName] = useState('');
  const [host, setHost] = useState('');

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Fetch radio configuration
  const fetchRadioConfig = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getRadioConfig();
      const config = response.data.data;
      setRadioConfig(config);
      
      // Populate form fields
      setStreamUrl(config.streamUrl || '');
      setTitle(config.title || '');
      setCurrentShow(config.currentShow || '');
      setCurrentArtist(config.currentArtist || '');
      setIsLive(config.isLive || false);
      setListenersCount(config.listenersCount || 0);
      
      setError('');
    } catch (err) {
      console.error('Error fetching radio config:', err);
      setError('Failed to load radio configuration');
      toast.error('Failed to load radio configuration');
    } finally {
      setLoading(false);
    }
  };

  // Update radio configuration
  const handleUpdateConfig = async () => {
    if (!streamUrl.trim()) {
      toast.error('Stream URL is required');
      return;
    }

    try {
      setSaving(true);
      await adminAPI.updateRadioConfig({
        streamUrl: streamUrl.trim(),
        title: title.trim(),
        currentShow: currentShow.trim(),
        currentArtist: currentArtist.trim(),
        isLive,
        listenersCount
      });
      
      toast.success('Radio configuration updated successfully');
      setConfigDialog(false);
      fetchRadioConfig();
    } catch (err) {
      console.error('Error updating radio config:', err);
      toast.error(err.response?.data?.message || 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  // Add schedule
  const handleAddSchedule = async () => {
    if (!scheduleDay || !startTime || !endTime || !showName.trim()) {
      toast.error('All schedule fields are required');
      return;
    }

    try {
      setSaving(true);
      await adminAPI.addRadioSchedule({
        day: scheduleDay,
        startTime,
        endTime,
        showName: showName.trim(),
        host: host.trim()
      });
      
      toast.success('Schedule added successfully');
      setScheduleDialog(false);
      resetScheduleForm();
      fetchRadioConfig();
    } catch (err) {
      console.error('Error adding schedule:', err);
      toast.error(err.response?.data?.message || 'Failed to add schedule');
    } finally {
      setSaving(false);
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async () => {
    if (!selectedScheduleDay) return;

    try {
      setSaving(true);
      await adminAPI.deleteRadioSchedule(selectedScheduleDay);
      
      toast.success('Schedule deleted successfully');
      setDeleteScheduleDialog(false);
      setSelectedScheduleDay(null);
      fetchRadioConfig();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      toast.error(err.response?.data?.message || 'Failed to delete schedule');
    } finally {
      setSaving(false);
    }
  };

  // Reset schedule form
  const resetScheduleForm = () => {
    setScheduleDay('');
    setStartTime('');
    setEndTime('');
    setShowName('');
    setHost('');
  };

  // Test radio stream
  const testRadioStream = async () => {
    try {
      const response = await fetch('/api/app/radio');
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Radio stream test successful!');
      } else {
        toast.error('Radio stream test failed');
      }
    } catch (err) {
      console.error('Error testing radio stream:', err);
      toast.error('Failed to test radio stream');
    }
  };

  useEffect(() => {
    fetchRadioConfig();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Radio - 5WH Media Admin</title>
        <meta name="description" content="Manage radio stream configuration and schedule" />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={navigateToDashboard}
                sx={{ color: 'white' }}
              >
                <ArrowBack />
              </IconButton>
              <Radio sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  Radio Management
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Configure radio stream settings and schedule
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<Settings />}
              onClick={() => setConfigDialog(true)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 'bold',
                px: 3,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Update Settings
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Current Configuration Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Radio color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Current Configuration
                  </Typography>
                  <Chip 
                    label={radioConfig?.isLive ? 'LIVE' : 'OFFLINE'} 
                    color={radioConfig?.isLive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                {radioConfig ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Stream URL:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, wordBreak: 'break-all' }}>
                      {radioConfig.streamUrl}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Radio Title:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {radioConfig.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Current Show:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {radioConfig.currentShow}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Current Artist:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {radioConfig.currentArtist}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Listeners:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {radioConfig.listenersCount || 0}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Last Updated:</strong>
                    </Typography>
                    <Typography variant="body1">
                      {new Date(radioConfig.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">No configuration found</Typography>
                )}

                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrow />}
                    onClick={testRadioStream}
                    size="small"
                  >
                    Test Stream
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchRadioConfig}
                    size="small"
                  >
                    Refresh
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Schedule Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Weekly Schedule
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setScheduleDialog(true)}
                  >
                    Add Schedule
                  </Button>
                </Box>

                {radioConfig?.schedule && radioConfig.schedule.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Day</strong></TableCell>
                          <TableCell><strong>Time</strong></TableCell>
                          <TableCell><strong>Show</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {radioConfig.schedule.map((schedule, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Chip 
                                label={schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{schedule.startTime} - {schedule.endTime}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {schedule.showName}
                              </Typography>
                              {schedule.host && (
                                <Typography variant="caption" color="text.secondary">
                                  Host: {schedule.host}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedScheduleDay(schedule.day);
                                  setDeleteScheduleDialog(true);
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    No schedule configured
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Configuration Dialog */}
        <Dialog 
          open={configDialog} 
          onClose={() => setConfigDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Radio Configuration</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Stream URL"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              margin="normal"
              required
              type="url"
              helperText="Enter the radio stream URL"
            />
            <TextField
              fullWidth
              label="Radio Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              helperText="Display name for your radio station"
            />
            <TextField
              fullWidth
              label="Current Show"
              value={currentShow}
              onChange={(e) => setCurrentShow(e.target.value)}
              margin="normal"
              helperText="Currently playing show or program"
            />
            <TextField
              fullWidth
              label="Current Artist/Host"
              value={currentArtist}
              onChange={(e) => setCurrentArtist(e.target.value)}
              margin="normal"
              helperText="Current presenter or artist"
            />
            <TextField
              fullWidth
              label="Listeners Count"
              value={listenersCount}
              onChange={(e) => setListenersCount(parseInt(e.target.value) || 0)}
              margin="normal"
              type="number"
              inputProps={{ min: 0 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isLive}
                  onChange={(e) => setIsLive(e.target.checked)}
                />
              }
              label="Stream is currently live"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfigDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateConfig}
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog 
          open={scheduleDialog} 
          onClose={() => setScheduleDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Radio Schedule</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              select
              label="Day"
              value={scheduleDay}
              onChange={(e) => setScheduleDay(e.target.value)}
              margin="normal"
              required
              SelectProps={{ native: true }}
            >
              <option value="">Select a day</option>
              {weekDays.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </option>
              ))}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                margin="normal"
                type="time"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                margin="normal"
                type="time"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              fullWidth
              label="Show Name"
              value={showName}
              onChange={(e) => setShowName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Host (Optional)"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setScheduleDialog(false);
              resetScheduleForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSchedule}
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Add />}
            >
              {saving ? 'Adding...' : 'Add Schedule'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Schedule Dialog */}
        <Dialog 
          open={deleteScheduleDialog} 
          onClose={() => setDeleteScheduleDialog(false)}
        >
          <DialogTitle>Delete Schedule</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the schedule for {selectedScheduleDay}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDeleteScheduleDialog(false);
              setSelectedScheduleDay(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteSchedule}
              color="error"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Delete />}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ManageRadio;
