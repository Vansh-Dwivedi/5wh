import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Slider,
  Paper,
  Tooltip,
  CircularProgress,
  Fade,
  Collapse
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Radio,
  Close,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

const AudioPlayer = ({ streamUrl, stationName, isVisible, onClose, isPlaying, setIsPlaying }) => {
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('Live Stream');
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };
  // Sync play/pause from header button
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue / 100;
    }
    if (newValue === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleAudioLoad = () => {
    setIsLoading(false);
  };

  const handleAudioError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    console.error('Failed to load audio stream');
  };

  if (!isVisible) return null;

  return (
    <Fade in={isVisible}>
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          top: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          width: isExpanded ? 380 : 320,
          backgroundColor: '#2c2c2c',
          color: 'white',
          zIndex: 1300,
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        {/* Audio element */}
        <audio
          ref={audioRef}
          src={streamUrl}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={handleAudioLoad}
          onError={handleAudioError}
          preload="none"
        />

        {/* Main player controls */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Radio sx={{ fontSize: 20, mr: 1, color: '#c41e3a' }} />
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                {stationName}
              </Typography>
            </Box>
            <Box>
              <IconButton
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{ color: 'white', mr: 0.5 }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: 'white' }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handlePlayPause}
              disabled={isLoading}
              sx={{
                backgroundColor: '#c41e3a',
                color: 'white',
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: '#a01728',
                },
                '&:disabled': {
                  backgroundColor: '#666',
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : isPlaying ? (
                <Pause />
              ) : (
                <PlayArrow />
              )}
            </IconButton>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                <IconButton size="small" onClick={handleMuteToggle} sx={{ color: 'white' }}>
                  {isMuted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
              </Tooltip>
              
              <Slider
                size="small"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-labelledby="volume-slider"
                sx={{
                  color: '#c41e3a',
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Expanded content */}
        <Collapse in={isExpanded}>
          <Box sx={{ px: 2, pb: 2, borderTop: '1px solid #444' }}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: '#ccc', textTransform: 'uppercase' }}>
                Now Playing
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {currentTrack}
              </Typography>
              
              <Typography variant="caption" sx={{ color: '#ccc', display: 'block' }}>
                Live Punjabi News & Music
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mt: 2,
                p: 1,
                backgroundColor: '#333',
                borderRadius: 1
              }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#c41e3a',
                  mr: 1,
                  animation: isPlaying ? 'pulse 1.5s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 },
                  }
                }} />
                <Typography variant="caption" sx={{ color: '#c41e3a', fontWeight: 'bold' }}>
                  {isPlaying ? 'LIVE' : 'OFFLINE'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Paper>
    </Fade>
  );
};

export default AudioPlayer;
