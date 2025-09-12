import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
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
  Fab
} from '@mui/material';
import {
  ArrowBack,
  Radio,
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
  // Player state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(()=> setIsPlaying(true)).catch(err => {
        console.error('Play failed', err);
      });
    }
  };

  const handleAudioEnded = () => setIsPlaying(false);

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
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={navigateToDashboard}>
              <ArrowBack />
            </IconButton>
            <Radio sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Radio Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Single station stream & weekly schedule
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => setConfigDialog(true)}
          >
            Update Settings
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Single Radio Section (no card) */}
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Radio color="primary" />
                <Typography variant="h6" fontWeight="bold">Radio Station</Typography>
                <Chip 
                  label={radioConfig?.isLive ? 'LIVE' : 'OFFLINE'}
                  color={radioConfig?.isLive ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              {radioConfig ? (
                <Box>
                  <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {radioConfig.title || 'Untitled Station'}
                  </Typography>
                  {radioConfig.currentShow && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Show: <strong>{radioConfig.currentShow}</strong>
                    </Typography>
                  )}
                  {radioConfig.currentArtist && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Host/Artist: <strong>{radioConfig.currentArtist}</strong>
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Listeners: {radioConfig.listenersCount || 0} • Updated {new Date(radioConfig.updatedAt).toLocaleTimeString()}
                  </Typography>
                  {radioConfig.streamUrl ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> 
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={isPlaying ? <Stop /> : <PlayArrow />}
                          onClick={handleTogglePlay}
                        >
                          {isPlaying ? 'Stop' : 'Play'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Refresh />}
                          onClick={fetchRadioConfig}
                        >
                          Refresh
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={testRadioStream}
                        >
                          Test
                        </Button>
                      </Box>
                      <audio
                        ref={audioRef}
                        src={radioConfig.streamUrl}
                        onEnded={handleAudioEnded}
                        style={{ width: '100%', marginTop: 12 }}
                        controls
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Stream URL: {radioConfig.streamUrl}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No stream URL configured.</Typography>
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">No configuration found</Typography>
              )}
            </Paper>
          </Grid>

          {/* Schedule (retain card) */}
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule color="primary" />
                  <Typography variant="h6" fontWeight="bold">Weekly Schedule</Typography>
                </Box>
                <Button size="small" startIcon={<Add />} onClick={() => setScheduleDialog(true)}>Add Schedule</Button>
              </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                </Box>

                {radioConfig?.schedule && radioConfig.schedule.length > 0 ? (
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                    {radioConfig.schedule.map((schedule, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                          <Chip 
                            label={schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedScheduleDay(schedule.day);
                              setDeleteScheduleDialog(true);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {schedule.showName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {schedule.startTime} - {schedule.endTime}
                        </Typography>
                        {schedule.host && (
                          <Typography variant="caption" color="text.secondary">
                            Host: {schedule.host}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    No schedule configured
                  </Typography>
                )}
            </Paper>
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
