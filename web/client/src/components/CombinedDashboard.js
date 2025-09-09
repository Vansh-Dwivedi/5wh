import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider,
  Paper,
  Container,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  FormatQuote, 
  Star,
  WbSunny,
  Cloud,
  CloudQueue,
  Grain,
  AcUnit,
  Thunderstorm,
  Visibility,
  Schedule,
  LocationOn
} from '@mui/icons-material';
import Advertisement from './Advertisement';
import AdPlacement from './AdPlacement';
import { advertisementConfig, handleAdClick } from '../config/advertisements';
import { weatherService } from '../services/weatherService';
import { quotesService } from '../services/quotesService';

const getWeatherIcon = (condition) => {
  switch (condition) {
    case 'sunny':
      return <WbSunny sx={{ color: '#c41e3a', fontSize: 24 }} />;
    case 'cloudy':
      return <CloudQueue sx={{ color: '#666', fontSize: 24 }} />;
    case 'rainy':
      return <Grain sx={{ color: '#c41e3a', fontSize: 24 }} />;
    case 'snowy':
      return <AcUnit sx={{ color: '#666', fontSize: 24 }} />;
    case 'stormy':
      return <Thunderstorm sx={{ color: '#c41e3a', fontSize: 24 }} />;
    default:
      return <WbSunny sx={{ color: '#c41e3a', fontSize: 24 }} />;
  }
};

const CombinedDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyQuote, setDailyQuote] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Initialize location and fetch real data
    initializeData();

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const initializeData = async () => {
    console.log('CombinedDashboard: Starting data initialization...');
    try {
      // Get user location
      const location = await weatherService.getCurrentLocation();
      console.log('CombinedDashboard: Got location:', location);
      setUserLocation(location);

      // Get real quote of the day based on location
      console.log('CombinedDashboard: Fetching enhanced quote...');
      const realQuote = await quotesService.getEnhancedQuote(location);
      console.log('CombinedDashboard: Got quote:', realQuote);
      if (realQuote) {
        setDailyQuote(realQuote);
      }

      // Fetch weather data
      console.log('CombinedDashboard: Fetching weather data...');
      await fetchWeatherData(location);

    } catch (error) {
      console.error('Error initializing dashboard data:', error);
      // Fallback to real service data without location
      try {
        console.log('CombinedDashboard: Using fallback quote service...');
        const fallbackQuote = quotesService.getQuoteOfTheDay();
        console.log('CombinedDashboard: Got fallback quote:', fallbackQuote);
        setDailyQuote(fallbackQuote);
      } catch (quoteError) {
        console.error('Error fetching fallback quote:', quoteError);
        // Get random quote from service as final fallback
        try {
          const randomQuote = quotesService.getRandomQuote();
          setDailyQuote(randomQuote);
        } catch (finalError) {
          console.error('All quote services failed:', finalError);
          setDailyQuote({
            text: "Service temporarily unavailable. Please refresh the page.",
            author: "System",
            category: "Notice"
          });
        }
      }
      
      await fetchWeatherData(null);
    }
  };

  const fetchWeatherData = async (location) => {
    try {
      setLoadingWeather(true);
      
      // Get regional cities based on user location
      const cities = weatherService.getRegionalCities(location);
      console.log('Fetching weather for cities:', cities);
      
      // Fetch weather for multiple cities
      const weatherResults = await weatherService.getMultipleCitiesWeather(cities);
      console.log('Weather results:', weatherResults);
      
      setWeatherData(weatherResults);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Fallback to empty array
      setWeatherData([]);
    } finally {
      setLoadingWeather(false);
    }
  };

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

  if (!dailyQuote) return null;

  return (
    <Box sx={{ py: 2, backgroundColor: 'white', borderTop: '3px solid #c41e3a' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          align="center"
          sx={{ 
            mb: 2, 
            fontWeight: 'bold', 
            color: '#2c2c2c',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Daily Dashboard
        </Typography>

        {/* Top Advertisement Banner */}
        <AdPlacement
          adType="sidebar"
          placement="right"
          maxAds={1}
          width="100%"
          height="120px"
          sx={{ mb: 2 }}
        />

        {/* Main Dashboard Grid */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            md: '1fr 1fr'
          },
          gridTemplateRows: {
            xs: 'auto auto auto',
            md: 'auto auto'
          },
          gap: 2,
          alignItems: 'start'
        }}>
          
          {/* Row 1, Col 1 - Quote of the Day */}
          <Card 
            elevation={3}
            sx={{ 
              backgroundColor: '#2c2c2c',
              color: 'white',
              borderRadius: 0,
              border: '2px solid #c41e3a',
              height: '180px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormatQuote sx={{ fontSize: 24, mr: 1.5, color: '#c41e3a' }} />
                <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'white', fontSize: '0.9rem' }}>
                  Quote of the Day
                </Typography>
              </Box>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '0.95rem', 
                  fontStyle: 'italic', 
                  lineHeight: 1.4,
                  mb: 1.5,
                  color: 'white',
                  flex: 1
                }}
              >
                "{dailyQuote.text}"
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white', fontSize: '0.85rem' }}>
                  — {dailyQuote.author}
                </Typography>
                <Box sx={{ 
                  backgroundColor: '#c41e3a', 
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {dailyQuote.category}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Row 1, Col 2 - Live Time */}
          <Card 
            elevation={3}
            sx={{ 
              backgroundColor: '#2c2c2c',
              color: 'white',
              borderRadius: 0,
              border: '2px solid #c41e3a',
              height: '180px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Schedule sx={{ fontSize: 24, mr: 1, color: '#c41e3a' }} />
                <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', color: 'white', fontSize: '0.9rem' }}>
                  Live Time
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', fontFamily: 'monospace', mb: 0.5, color: '#c41e3a', fontSize: '2.2rem' }}>
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontSize: '0.85rem' }}>
                {formatDate(currentTime)}
              </Typography>
            </CardContent>
          </Card>

          {/* Row 2 - Weather Section (Full Width) */}
          <Card elevation={3} sx={{ 
            borderRadius: 0, 
            border: '1px solid #e0e0e0',
            gridColumn: { xs: '1', md: '1 / -1' } // Span full width on medium screens and up
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#2c2c2c', textTransform: 'uppercase' }}>
                  Weather {weatherData.length > 0 && `(${weatherData.length})`}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
                {loadingWeather ? (
                  <Grid item xs={12} sx={{ textAlign: 'center', py: 3 }}>
                    <CircularProgress size={24} sx={{ color: '#c41e3a' }} />
                    <Typography variant="body2" sx={{ mt: 1, color: '#666', fontSize: '0.85rem' }}>
                      Loading weather data...
                    </Typography>
                  </Grid>
                ) : weatherData.length > 0 ? (
                  weatherData
                    .map((weather, index) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} xl={2} key={index} sx={{ display: 'flex' }}>
                      <Card 
                        elevation={1}
                        sx={{ 
                          borderRadius: 2,
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          transition: 'all 0.3s ease',
                          width: '100%',
                          height: '160px',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(196, 30, 58, 0.15)',
                            borderColor: '#c41e3a'
                          }
                        }}
                      >
                        <CardContent sx={{ 
                          textAlign: 'center', 
                          p: 2,
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                            <LocationOn sx={{ fontSize: 14, mr: 0.5, color: '#c41e3a' }} />
                            <Typography variant="caption" fontWeight="bold" color="#2c2c2c" sx={{ 
                              textTransform: 'uppercase', 
                              fontSize: '0.75rem',
                              lineHeight: 1.2
                            }}>
                              {weather.location}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                            {getWeatherIcon(weatherService.getConditionType(weather.condition))}
                          </Box>
                          
                          <Typography variant="h5" fontWeight="bold" color="#2c2c2c" sx={{ 
                            mb: 0.5, 
                            fontSize: '1.25rem',
                            lineHeight: 1
                          }}>
                            {weather.temperature}°C
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            display="block" 
                            sx={{ 
                              textTransform: 'capitalize', 
                              fontWeight: 500, 
                              color: '#666',
                              fontSize: '0.7rem',
                              mb: 0.5
                            }}
                          >
                            {weather.condition}
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            display="block" 
                            sx={{ 
                              color: '#999',
                              fontSize: '0.65rem'
                            }}
                          >
                            Feels: {weather.feelsLike}°C
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                      Weather data unavailable
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Row 3 - Full Width Sponsored Advertisement */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <AdPlacement
              adType="sponsored"
              placement="bottom"
              maxAds={1}
              width="100%"
              height="150px"
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CombinedDashboard;
