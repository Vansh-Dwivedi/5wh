import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, Skeleton } from '@mui/material';

const AdPlacement = ({
  adType = 'sidebar',
  placement = 'right',
  maxAds = 1,
  width = '300px',
  height = '250px',
  sx = {}
}) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvertisements();
  }, [adType, placement]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000/api/advertisers?active=true&adType=${adType}&placement=${placement}`
      );
      const data = await response.json();
      
      if (data.success) {
        setAdvertisements(data.data.slice(0, maxAds));
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = async (ad) => {
    try {
      // Track click
      await fetch(`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000/api/advertisers/${ad._id}/click`, {
        method: 'POST'
      });
      
      // Open link
      if (ad.link) {
        window.open(ad.link, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const getAdStyles = () => {
    const baseStyles = {
      width,
      height,
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'scale(1.02)'
      },
      ...sx
    };

    switch (adType) {
      case 'banner':
        return {
          ...baseStyles,
          width: '100%',
          height: '120px'
        };
      case 'premium':
        return {
          ...baseStyles,
          width: '100%',
          height: '400px'
        };
      case 'sponsored':
        return {
          ...baseStyles,
          width: '100%',
          height: '200px'
        };
      default:
        return baseStyles;
    }
  };

  if (loading) {
    return (
      <Box sx={getAdStyles()}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    );
  }

  // Show placeholder if no ads available
  if (advertisements.length === 0) {
    return (
      <Box sx={getAdStyles()}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          border: '2px dashed #ccc'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Advertisement Space
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {adType.charAt(0).toUpperCase() + adType.slice(1)} ad slot available
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {placement} placement • {width} × {height}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {advertisements.map((ad) => {
        // Handle different logo formats
        let logoUrl = '';
        if (ad.logo) {
          if (typeof ad.logo === 'string') {
            logoUrl = ad.logo;
          } else if (typeof ad.logo === 'object') {
            logoUrl = ad.logo.url || ad.logo.path || ad.logo.filename || ad.logo.src || '';
            // If it's still an object, try to construct URL
            if (!logoUrl && ad.logo.fieldname) {
              logoUrl = `/uploads/${ad.logo.filename || ad.logo.originalname || ''}`;
            }
          }
        }
        
        // Fix any incorrect paths from database (legacy fix)
        if (logoUrl.includes('/uploads/images/')) {
          logoUrl = logoUrl.replace('/uploads/images/', '/uploads/');
        }
        
        // Ensure URL is absolute for proper loading
        if (logoUrl && !logoUrl.startsWith('http')) {
          logoUrl = `https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000${logoUrl}`;
        }
        
        console.log('Ad data:', ad); // Debug log
        console.log('Generated logo URL:', logoUrl); // Debug log
        
        return (
          <Card
            key={ad._id}
            sx={getAdStyles()}
            onClick={() => handleAdClick(ad)}
          >
            {logoUrl && (
              <Box sx={{ position: 'relative', height: '100%' }}>
                <CardMedia
                  component="img"
                  image={logoUrl}
                  alt={ad.name}
                  sx={{
                    width: '100%',
                    height: 'calc(100% - 60px)', // Leave space for text
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    console.error('Failed to load ad image:', logoUrl);
                    e.target.style.display = 'none';
                  }}
                />
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {ad.name}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    fontSize: '0.7rem',
                    opacity: 0.8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Advertisement
                  </Typography>
                </Box>
              </Box>
            )}
            {!logoUrl && (
              <CardContent sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {ad.name}
                  </Typography>
                  {ad.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {ad.description}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ 
                    fontSize: '0.7rem',
                    opacity: 0.6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Advertisement
                  </Typography>
                </Box>
              </CardContent>
            )}
          </Card>
        );
      })}
    </Box>
  );
};

export default AdPlacement;
