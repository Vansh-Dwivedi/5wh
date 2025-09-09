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

const AdvertisingSidebar = ({ placement = 'right', sx = {} }) => {
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdvertisers();
  }, [placement]);

  const fetchAdvertisers = async () => {
    try {
      const url = `https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000/api/advertisers?active=true&adType=sidebar&placement=${placement}`;
      console.log(`Fetching ${placement} sidebar ads from:`, url);
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        console.log(`${placement} sidebar ads response:`, result);
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
      await fetch(`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000/api/advertisers/${advertiser._id}/click`, {
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
      await fetch(`https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000/api/advertisers/${advertiserId}/impression`, {
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
    // Show placeholder when no advertisers for this placement
    return (
      <Box sx={{ ...sx }}>
        <Card sx={{ borderRadius: 2, bgcolor: '#f8f9fa' }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No {placement} sidebar ads available
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Safety check to ensure advertisers is an array
  const validAdvertisers = Array.isArray(advertisers) ? advertisers : [];

  if (validAdvertisers.length === 0) {
    // Show placeholder for invalid data
    return (
      <Box sx={{ ...sx }}>
        <Card sx={{ borderRadius: 2, bgcolor: '#f8f9fa' }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Advertisement space available
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ ...sx }}>
      {validAdvertisers.map((advertiser, index) => (
        <motion.div
          key={advertiser._id}
          initial={{ opacity: 0, x: placement === 'left' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            sx={{
              mb: 1.5,
              borderRadius: 1.5,
              cursor: advertiser.link ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': advertiser.link ? {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(255, 71, 87, 0.15)',
                borderColor: '#ff4757'
              } : {},
              '&:last-child': {
                mb: 0
              }
            }}
            onClick={() => advertiser.link && handleAdvertiserClick(advertiser)}
          >
            <CardContent sx={{ p: 1.5 }}>
              {advertiser.logo?.url ? (
                <Box
                  component="img"
                  src={
                    advertiser.logo.url.startsWith('http') 
                      ? advertiser.logo.url 
                      : `https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000${advertiser.logo.url}`
                  }
                  alt={advertiser.logo?.alt || advertiser.name}
                  sx={{
                    width: '100%',
                    height: 60,
                    objectFit: 'contain',
                    borderRadius: 1,
                    mb: 0.5,
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
                  height: 60,
                  display: advertiser.logo?.url ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  mb: 0.5,
                  background: 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                {advertiser.name.charAt(0).toUpperCase()}
              </Box>

              <Typography 
                variant="body2" 
                fontWeight="bold"
                sx={{ 
                  color: '#333',
                  mb: 0.25,
                  fontSize: '0.8rem'
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
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
};

export default AdvertisingSidebar;
