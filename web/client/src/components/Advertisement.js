import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Advertisement = ({
  width = '100%',
  height = '400px',
  title = 'Advertisement',
  subtitle = 'Banner Space',
  imageUrl = null,
  link = null,
  backgroundColor = 'rgba(255,255,255,0.1)',
  borderColor = 'rgba(255,255,255,0.3)',
  textColor = 'rgba(255,255,255,0.7)',
  onClick = null,
  style = {}
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width,
        height,
        backgroundColor: imageUrl ? 'transparent' : backgroundColor,
        border: imageUrl ? 'none' : `2px dashed ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        borderRadius: 2,
        cursor: (onClick || link) ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        '&:hover': {
          backgroundColor: imageUrl ? 'transparent' : 'rgba(255,255,255,0.15)',
          borderColor: imageUrl ? 'none' : 'rgba(255,255,255,0.5)',
          transform: (onClick || link) ? 'scale(1.02)' : 'none'
        },
        ...style
      }}
      onClick={handleClick}
    >
      {/* Overlay for image ads */}
      {imageUrl && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'flex-end',
            p: 2
          }}
        >
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Content for non-image ads */}
      {!imageUrl && (
        <>
          <Typography variant="h6" sx={{ mb: 1, color: textColor }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.5)', 
                textAlign: 'center' 
              }}
            >
              {subtitle}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
};

export default Advertisement;
