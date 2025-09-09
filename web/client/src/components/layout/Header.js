import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Article as NewsIcon,
  Headphones as AudioIcon,
  VideoLibrary as VideoIcon,
  Comment as OpinionIcon,
  Person as PersonIcon,
  ContactMail as ContactIcon,
  Info as AboutIcon,
  Radio as RadioIcon,
  LiveTv as LiveIcon,
  Palette as CultureIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AudioPlayer from '../AudioPlayer';
import SubscriptionDialog from '../SubscriptionDialog';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false);
  const [streamInfo, setStreamInfo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const navigationItems = [
    { title: 'Home', path: '/', icon: <HomeIcon /> },
    { title: 'News', path: '/news', icon: <NewsIcon /> },
    { title: 'Audio', path: '/audio', icon: <AudioIcon /> },
    { title: 'Videos', path: '/videos', icon: <VideoIcon /> },
    { title: 'Live', path: '/live', icon: <LiveIcon /> },
    { title: 'Life & Culture', path: '/life-culture', icon: <CultureIcon /> },
    // { title: 'Santokh Singh Dhir', path: '/santokh-singh-dhir', icon: <PersonIcon /> },
    { title: 'Contact', path: '/contact', icon: <ContactIcon /> },
    { title: 'About', path: '/about', icon: <AboutIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const MobileDrawer = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        backgroundColor: '#ffffff',
        color: '#2c2c2c',
        borderRight: '1px solid #e0e0e0',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#2c2c2c',
          color: 'white',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          5WH Media
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List sx={{ pt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.title}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              mb: 0.5,
              mx: 1,
              borderRadius: 0,
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: isActiveRoute(item.path) 
                ? '#f5f5f5' 
                : 'transparent',
              color: '#2c2c2c',
              '&:hover': {
                backgroundColor: '#f8f8f8',
              },
              transition: 'background-color 0.2s ease',
            }}
          >
            <ListItemIcon sx={{ color: '#666666', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title} 
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.875rem',
                  fontWeight: isActiveRoute(item.path) ? 600 : 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }
              }}
            />
          </ListItem>
        ))}
      </List>

  {/* ...removed Live Radio button from mobile drawer... */}

      <Box sx={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#c41e3a',
            '&:hover': {
              backgroundColor: '#8b0000',
            },
            borderRadius: 3,
            py: 1.5,
          }}
        >
          Subscribe
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar sx={{ 
            minHeight: { xs: 64, md: 70 },
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, color: '#2c2c2c' }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo - Newspaper style */}
            <Typography
              variant="h4"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: '#2c2c2c',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '2rem' },
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontFamily: '"Georgia", "Times New Roman", serif',
                borderBottom: '2px solid #c41e3a',
                pb: 0.5,
                '&:hover': {
                  color: '#c41e3a',
                },
                transition: 'color 0.2s ease',
              }}
            >
              5WH Media
            </Typography>

            {/* Desktop Navigation - Clean newspaper style */}
            {!isMobile && (
              <Box sx={{ display: 'flex', ml: 4, flexGrow: 1 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.title}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: '#2c2c2c',
                      mx: 0.5,
                      px: 2,
                      py: 1,
                      borderRadius: 0,
                      fontSize: '0.875rem',
                      fontWeight: isActiveRoute(item.path) ? 600 : 400,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: isActiveRoute(item.path) ? '2px solid #c41e3a' : '2px solid transparent',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(44, 44, 44, 0.04)',
                        borderBottom: '2px solid #c41e3a',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            )}

            {/* Subscribe Button - Desktop */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setSubscriptionDialogOpen(true)}
                  sx={{
                    backgroundColor: '#c41e3a',
                    color: 'white',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#8b0000',
                    },
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Audio Player */}
      {streamInfo && (
        <AudioPlayer
          streamUrl={streamInfo.streamUrl}
          stationName={streamInfo.stationName}
          isVisible={audioPlayerVisible}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onClose={() => setAudioPlayerVisible(false)}
        />
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {MobileDrawer}
      </Drawer>

      {/* Subscription Dialog */}
      <SubscriptionDialog 
        open={subscriptionDialogOpen} 
        onClose={() => setSubscriptionDialogOpen(false)} 
      />
    </>
  );
};

export default Header;
