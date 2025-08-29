import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  YouTube,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook' },
    { icon: <Twitter />, url: '#', label: 'Twitter' },
    { icon: <YouTube />, url: '#', label: 'YouTube' },
    { icon: <Instagram />, url: '#', label: 'Instagram' },
    { icon: <LinkedIn />, url: '#', label: 'LinkedIn' },
  ];

  const quickLinks = [
    { title: 'Home', path: '/' },
    { title: 'News', path: '/news' },
    { title: 'Audio', path: '/audio' },
    { title: 'Videos', path: '/videos' },
    { title: '5WH Opinion', path: '/5wh-opinion' },
    { title: 'About Us', path: '/about' },
  ];

  const legalLinks = [
    { title: 'Privacy Policy', path: '/privacy' },
    { title: 'Terms of Service', path: '/terms' },
    { title: 'Disclaimer', path: '/disclaimer' },
    { title: 'Contact Us', path: '/contact' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2c2c2c',
        color: 'white',
        mt: 'auto',
        borderTop: '3px solid #c41e3a',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Brand & Description */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: '1.75rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: '"Georgia", "Times New Roman", serif',
              }}
            >
              5WH Media
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3, 
                opacity: 0.9, 
                lineHeight: 1.6,
                fontSize: '0.875rem',
                color: '#cccccc',
              }}
            >
              Your trusted source for comprehensive news coverage, in-depth analysis, 
              and multimedia content. Delivering quality journalism with integrity 
              and professionalism since our founding.
            </Typography>
            
            {/* Social Media Links */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#cccccc',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      backgroundColor: '#c41e3a',
                      color: 'white',
                      borderColor: '#c41e3a',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: '#cccccc',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#c41e3a',
                      textDecoration: 'underline',
                    },
                    transition: 'color 0.2s ease',
                  }}
                >
                  {link.title}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: '#cccccc',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#c41e3a',
                      textDecoration: 'underline',
                    },
                    transition: 'color 0.2s ease',
                  }}
                >
                  {link.title}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Contact Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ color: '#c41e3a', fontSize: '1.2rem' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#cccccc',
                    fontSize: '0.875rem',
                  }}
                >
                  editorial@5whmedia.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ color: '#c41e3a', fontSize: '1.2rem' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#cccccc',
                    fontSize: '0.875rem',
                  }}
                >
                  +1 (555) 5WH-NEWS
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn sx={{ color: '#c41e3a', mt: 0.5, fontSize: '1.2rem' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#cccccc',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  }}
                >
                  5WH Media Headquarters<br />
                  123 Press Boulevard<br />
                  Media City, MC 12345
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Bottom Section - Newspaper style */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            pt: 2,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#cccccc',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            © {currentYear} 5WH Media Corporation. All rights reserved.
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#cccccc',
              fontSize: '0.75rem',
              fontStyle: 'italic',
            }}
          >
            Established 2024 • Independent Journalism
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
