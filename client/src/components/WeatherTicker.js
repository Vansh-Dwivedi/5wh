import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Container,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  WbSunny,
  Cloud,
  CloudQueue,
  Grain,
  AcUnit,
  Thunderstorm,
  Visibility,
  ExpandMore,
  ExpandLess,
  Schedule,
  LocationOn
} from '@mui/icons-material';

// Mock weather data - in production, you'd use a real weather API like OpenWeatherMap
const mockWeatherData = {
  jalandhar: { temp: 28, condition: 'sunny', humidity: 65, city: 'Jalandhar' },
  amritsar: { temp: 26, condition: 'cloudy', humidity: 70, city: 'Amritsar' },
  losangeles: { temp: 22, condition: 'sunny', humidity: 55, city: 'Los Angeles' },
  toronto: { temp: 15, condition: 'cloudy', humidity: 80, city: 'Toronto' },
  chicago: { temp: 18, condition: 'rainy', humidity: 75, city: 'Chicago' },
  surrey: { temp: 16, condition: 'cloudy', humidity: 85, city: 'Surrey' },
  montreal: { temp: 14, condition: 'cloudy', humidity: 78, city: 'Montreal' },
  newyork: { temp: 20, condition: 'sunny', humidity: 60, city: 'New York' },
  vancouver: { temp: 17, condition: 'rainy', humidity: 82, city: 'Vancouver' }
};

const getWeatherIcon = (condition) => {
  switch (condition) {
    case 'sunny':
      return <WbSunny sx={{ color: '#c41e3a', fontSize: 28 }} />;
    case 'cloudy':
      return <CloudQueue sx={{ color: '#666', fontSize: 28 }} />;
    case 'rainy':
      return <Grain sx={{ color: '#c41e3a', fontSize: 28 }} />;
    case 'snowy':
      return <AcUnit sx={{ color: '#666', fontSize: 28 }} />;
    case 'stormy':
      return <Thunderstorm sx={{ color: '#c41e3a', fontSize: 28 }} />;
    default:
      return <WbSunny sx={{ color: '#c41e3a', fontSize: 28 }} />;
  }
};

const WeatherTicker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expanded, setExpanded] = useState(false);

  const cities = Object.keys(mockWeatherData);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ py: 4, backgroundColor: 'white', borderTop: '3px solid #c41e3a' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          align="center"
          sx={{ 
            mb: 4, 
            fontWeight: 'bold', 
            color: '#2c2c2c',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Live Weather & Time
        </Typography>

        {/* Current Time Card */}
        <Card 
          elevation={3}
          sx={{ 
            mb: 4, 
            backgroundColor: '#2c2c2c',
            color: 'white',
            borderRadius: 0,
            border: '2px solid #c41e3a'
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Schedule sx={{ fontSize: 30, mr: 2, color: '#c41e3a' }} />
              <Typography variant="h5" fontWeight="bold">
                Current Time & Date
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', fontFamily: 'monospace', mb: 1, color: '#c41e3a' }}>
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="h6" sx={{ color: 'white' }}>
              {formatDate(currentTime)}
            </Typography>
          </CardContent>
        </Card>

        {/* Weather Cards Grid */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#2c2c2c', textTransform: 'uppercase' }}>
            Weather Around the World
          </Typography>
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            sx={{ 
              backgroundColor: '#c41e3a', 
              color: 'white',
              '&:hover': { backgroundColor: '#a01728' }
            }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          {Object.entries(mockWeatherData)
            .slice(0, expanded ? 9 : 6)
            .map(([key, weather]) => (
            <Grid item xs={12} sm={6} md={4} lg={expanded ? 4 : 2} key={key}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  borderRadius: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(196, 30, 58, 0.15)',
                    borderColor: '#c41e3a'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 18, mr: 1, color: '#c41e3a' }} />
                    <Typography variant="h6" fontWeight="bold" color="#2c2c2c" sx={{ textTransform: 'uppercase' }}>
                      {weather.city}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ my: 2 }}>
                    {getWeatherIcon(weather.condition)}
                  </Box>
                  
                  <Typography variant="h4" fontWeight="bold" color="#2c2c2c" sx={{ mb: 1 }}>
                    {weather.temp}°C
                  </Typography>
                  
                  <Box sx={{ 
                    backgroundColor: '#f5f5f5',
                    color: '#2c2c2c',
                    px: 1,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {weather.humidity}% humidity
                  </Box>
                  
                  <Typography 
                    variant="caption" 
                    display="block" 
                    sx={{ 
                      mt: 1, 
                      textTransform: 'uppercase', 
                      fontWeight: 'bold', 
                      color: '#666',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {weather.condition}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {!expanded && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
              Click the expand button to see all cities
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default WeatherTicker;
