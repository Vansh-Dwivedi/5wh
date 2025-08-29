import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';

const AdvertisingSidebar = ({ sx = {} }) => {
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdvertisers();
  }, []);

  const fetchAdvertisers = async () => {
    try {
      const response = await fetch('/api/advertisers');
      if (response.ok) {
        const result = await response.json();
        setAdvertisers(result.data || []); // Extract data array from response
      } else {
        throw new Error('Failed to load advertisers');
      }
    } catch (error) {
      console.error('Error fetching advertisers:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvertiserClick = async (advertiser) => {
    try {
      // Track click
      await fetch(`/api/advertisers/${advertiser._id}/click`, {
        method: 'POST'
      });

      // Open link if available
      if (advertiser.link) {
        window.open(advertiser.link, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
      // Still open link even if tracking fails
      if (advertiser.link) {
        window.open(advertiser.link, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleAdvertiserImpression = async (advertiserId) => {
    try {
      await fetch(`/api/advertisers/${advertiserId}/impression`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  useEffect(() => {
    // Track impressions for all visible advertisers
    advertisers.forEach(advertiser => {
      handleAdvertiserImpression(advertiser._id);
    });
  }, [advertisers]);

  if (loading) {
    return (
      <Box sx={{ ...sx }}>
        <Typography variant="h6" fontWeight="bold" mb={2} color="#ff4757">
          Advertisers
        </Typography>
        {[1, 2, 3].map(index => (
          <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ ...sx }}>
        <Typography variant="h6" fontWeight="bold" mb={2} color="#ff4757">
          Advertisers
        </Typography>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load advertisers
        </Alert>
      </Box>
    );
  }

  if (advertisers.length === 0) {
    return null; // Don't show the section if no advertisers
  }

  // Safety check to ensure advertisers is an array
  const validAdvertisers = Array.isArray(advertisers) ? advertisers : [];

  if (validAdvertisers.length === 0) {
    return null;
  }

  return (
    <Box sx={{ ...sx }}>
      <Typography 
        variant="h6" 
        fontWeight="bold" 
        mb={2} 
        sx={{
          color: '#ff4757',
          textAlign: 'center',
          pb: 1,
          borderBottom: '2px solid #ff4757'
        }}
      >
        🎯 Sponsored
      </Typography>
      
      {validAdvertisers.map((advertiser, index) => (
        <motion.div
          key={advertiser._id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            sx={{
              mb: 2,
              borderRadius: 2,
              cursor: advertiser.link ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              border: '1px solid #e0e0e0',
              '&:hover': advertiser.link ? {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 71, 87, 0.15)',
                borderColor: '#ff4757'
              } : {},
              '&:last-child': {
                mb: 0
              }
            }}
            onClick={() => advertiser.link && handleAdvertiserClick(advertiser)}
          >
            <CardContent sx={{ p: 2 }}>
              {advertiser.logo ? (
                <Box
                  component="img"
                  src={advertiser.logo}
                  alt={advertiser.name}
                  sx={{
                    width: '100%',
                    height: 80,
                    objectFit: 'contain',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: '#f5f5f5'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Fallback for broken/missing images */}
              <Box
                sx={{
                  width: '100%',
                  height: 80,
                  display: advertiser.logo ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  mb: 1,
                  background: 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                {advertiser.name.charAt(0).toUpperCase()}
              </Box>

              <Typography 
                variant="subtitle2" 
                fontWeight="bold"
                sx={{ 
                  color: '#333',
                  mb: 0.5,
                  fontSize: '0.9rem'
                }}
              >
                {advertiser.name}
              </Typography>
              
              {advertiser.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.8rem',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {advertiser.description}
                </Typography>
              )}

              {advertiser.link && (
                <Box
                  sx={{
                    mt: 1,
                    pt: 1,
                    borderTop: '1px solid #e0e0e0',
                    textAlign: 'center'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#ff4757',
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  >
                    Click to Visit →
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      {/* Sponsored disclaimer */}
      <Typography 
        variant="caption" 
        color="text.secondary"
        sx={{ 
          display: 'block',
          textAlign: 'center',
          mt: 2,
          fontSize: '0.7rem',
          fontStyle: 'italic'
        }}
      >
        Sponsored content
      </Typography>
    </Box>
  );
};

export default AdvertisingSidebar;
