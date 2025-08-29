import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
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
  Person, 
  Star,
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
import Advertisement from './Advertisement';
import { advertisementConfig, handleAdClick } from '../config/advertisements';
import { weatherService } from '../services/weatherService';
import { personOfTheDayService } from '../services/personService';
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
  const [dailyPerson, setDailyPerson] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingPerson, setLoadingPerson] = useState(true);

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

      // Fetch person of the day based on location
      console.log('CombinedDashboard: Fetching person of the day...');
      await fetchPersonOfTheDay(location);

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
      
      await fetchPersonOfTheDay(null);
      await fetchWeatherData(null);
    }
  };

  const fetchPersonOfTheDay = async (location) => {
    console.log('CombinedDashboard: fetchPersonOfTheDay called with location:', location);
    try {
      setLoadingPerson(true);
      const person = await personOfTheDayService.getPersonOfTheDay(location);
      console.log('CombinedDashboard: Got person from service:', person);
      if (person) {
        setDailyPerson(person);
      } else {
        // If no person returned, try getting a regional person directly
        console.log('CombinedDashboard: No person returned, trying regional person...');
        const regionalPerson = personOfTheDayService.getRegionalPerson(location);
        console.log('CombinedDashboard: Got regional person:', regionalPerson);
        if (regionalPerson) {
          // Try to fetch photo for the regional person
          try {
            const photoUrl = await personOfTheDayService.fetchPersonPhoto(regionalPerson);
            setDailyPerson({
              ...regionalPerson,
              image: photoUrl
            });
          } catch (photoError) {
            console.warn('Could not fetch photo, using person without photo:', photoError);
            setDailyPerson({
              ...regionalPerson,
              image: `https://ui-avatars.com/api/?name=${encodeURIComponent(regionalPerson.name)}&size=200&background=c41e3a&color=fff&bold=true`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching person of the day:', error);
      // Try to get any regional person from the service
      try {
        console.log('CombinedDashboard: Error occurred, trying fallback regional person...');
        const fallbackPerson = personOfTheDayService.getRegionalPerson(null);
        console.log('CombinedDashboard: Got fallback person:', fallbackPerson);
        if (fallbackPerson) {
          setDailyPerson({
            ...fallbackPerson,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackPerson.name)}&size=200&background=c41e3a&color=fff&bold=true`
          });
        }
      } catch (serviceError) {
        console.error('Person service completely failed:', serviceError);
        // Final fallback - use service to generate a basic person entry
        setDailyPerson({
          id: Date.now(),
          name: "Daily Inspiration",
          title: "Motivational Figure",
          description: "Every day brings new opportunities to learn about remarkable people who have shaped our world. Our person service is temporarily unavailable, but we encourage you to explore history and discover inspiring figures.",
          achievement: "Inspiring curiosity and learning",
          birthYear: "Every Era",
          field: "Human Achievement",
          image: "https://ui-avatars.com/api/?name=Daily+Inspiration&size=200&background=c41e3a&color=fff&bold=true"
        });
      }
    } finally {
      setLoadingPerson(false);
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
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Advertisement
            width="100%"
            height="80px"
            title="Advertisement Banner"
            subtitle="728x90 Leaderboard"
            backgroundColor="rgba(44,44,44,0.1)"
            borderColor="rgba(196,30,58,0.3)"
            textColor="#666"
            onClick={() => handleAdClick({
              id: 'dashboard-top',
              title: 'Dashboard Top Banner',
              link: 'https://example.com'
            })}
          />
        </Box>

        {/* Main Flex Container */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'stretch'
        }}>
          
          {/* Left Side - Daily Features */}
          <Box sx={{ flex: 1 }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              {/* Quote of the Day */}
              <Grid item xs={12}>
                <Card 
                  elevation={3}
                  sx={{ 
                    backgroundColor: '#2c2c2c',
                    color: 'white',
                    borderRadius: 0,
                    border: '2px solid #c41e3a',
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FormatQuote sx={{ fontSize: 30, mr: 2, color: '#c41e3a' }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'white' }}>
                        Quote of the Day
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontSize: '1rem', 
                        fontStyle: 'italic', 
                        lineHeight: 1.6,
                        mb: 2,
                        color: 'white'
                      }}
                    >
                      "{dailyQuote.text}"
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                        — {dailyQuote.author}
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: '#c41e3a', 
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {dailyQuote.category}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Person of the Day */}
              <Grid item xs={12}>
                <Card elevation={3} sx={{ height: '100%', borderRadius: 0, border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Person sx={{ fontSize: 24, mr: 1.5, color: '#c41e3a' }} />
                      <Typography variant="h6" fontWeight="bold" color="#2c2c2c" sx={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem' }}>
                        Person of the Day
                      </Typography>
                    </Box>
                    
                    {loadingPerson ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={30} sx={{ color: '#c41e3a' }} />
                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                          Loading person of the day...
                        </Typography>
                      </Box>
                    ) : dailyPerson ? (
                      <>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                          <Avatar
                            src={dailyPerson.image}
                            alt={dailyPerson.name}
                            sx={{ width: 60, height: 60, mr: 2 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom color="#2c2c2c">
                              {dailyPerson.name}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              {dailyPerson.title}
                            </Typography>
                            <Box sx={{ 
                              backgroundColor: '#f5f5f5',
                              color: '#2c2c2c',
                              px: 1,
                              py: 0.5,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              display: 'inline-block'
                            }}>
                              {dailyPerson.field}
                            </Box>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.9rem' }}>
                          {dailyPerson.description}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                              Key Achievement
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                              {dailyPerson.achievement}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                              Born
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {dailyPerson.birthYear}
                            </Typography>
                          </Box>
                        </Box>
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              </Grid>

              {/* Advertisement Slot */}
              <Grid item xs={12}>
                <Advertisement
                  width="100%"
                  height="120px"
                  title="Sponsored Content"
                  subtitle="300x120 Banner"
                  backgroundColor="rgba(44,44,44,0.05)"
                  borderColor="rgba(196,30,58,0.2)"
                  textColor="#666"
                  onClick={() => handleAdClick({
                    id: 'dashboard-left',
                    title: 'Dashboard Left Banner',
                    link: 'https://example.com'
                  })}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Right Side - Weather & Time */}
          <Box sx={{ flex: 1 }}>
            {/* Current Time Card */}
            <Card 
              elevation={3}
              sx={{ 
                mb: 2, 
                backgroundColor: '#2c2c2c',
                color: 'white',
                borderRadius: 0,
                border: '2px solid #c41e3a'
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Schedule sx={{ fontSize: 24, mr: 1, color: '#c41e3a' }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', color: 'white', fontSize: '1.1rem' }}>
                    Live Time
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: 'monospace', mb: 1, color: '#c41e3a' }}>
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontSize: '0.9rem' }}>
                  {formatDate(currentTime)}
                </Typography>
              </CardContent>
            </Card>

            {/* Weather Section */}
            <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#2c2c2c', textTransform: 'uppercase' }}>
                Weather {weatherData.length > 0 && `(${weatherData.length})`}
              </Typography>
              {weatherData.length > 6 && (
                <IconButton 
                  onClick={() => setExpanded(!expanded)}
                  sx={{ 
                    backgroundColor: '#c41e3a', 
                    color: 'white',
                    '&:hover': { backgroundColor: '#a01728' },
                    width: 32,
                    height: 32
                  }}
                >
                  {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
              )}
            </Box>

            <Grid container spacing={1.5}>
              {loadingWeather ? (
                <Grid item xs={12} sx={{ textAlign: 'center', py: 2 }}>
                  <CircularProgress size={24} sx={{ color: '#c41e3a' }} />
                  <Typography variant="body2" sx={{ mt: 0.5, color: '#666', fontSize: '0.85rem' }}>
                    Loading weather data...
                  </Typography>
                </Grid>
              ) : weatherData.length > 0 ? (
                weatherData
                  .slice(0, expanded ? 9 : 6)
                  .map((weather, index) => (
                  <Grid item xs={4} sm={4} key={index}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        borderRadius: 0,
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(196, 30, 58, 0.15)',
                          borderColor: '#c41e3a'
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.75 }}>
                          <LocationOn sx={{ fontSize: 12, mr: 0.5, color: '#c41e3a' }} />
                          <Typography variant="caption" fontWeight="bold" color="#2c2c2c" sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            {weather.location}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 0.75 }}>
                          {getWeatherIcon(weatherService.getConditionType(weather.condition))}
                        </Box>
                        
                        <Typography variant="h6" fontWeight="bold" color="#2c2c2c" sx={{ mb: 0.5, fontSize: '1rem' }}>
                          {weather.temperature}°C
                        </Typography>
                        
                        <Typography 
                          variant="caption" 
                          display="block" 
                          sx={{ 
                            textTransform: 'uppercase', 
                            fontWeight: 'bold', 
                            color: '#666',
                            fontSize: '0.65rem'
                          }}
                        >
                          {weather.condition}
                        </Typography>
                        
                        <Typography 
                          variant="caption" 
                          display="block" 
                          sx={{ 
                            color: '#999',
                            fontSize: '0.6rem',
                            mt: 0.5
                          }}
                        >
                          Feels: {weather.feelsLike}°C
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12} sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                    Weather data unavailable
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Right Side Advertisement */}
            <Box sx={{ mt: 2 }}>
              <Advertisement
                width="100%"
                height="220px"
                title="Premium Advertisement"
                subtitle="300x220 Medium Rectangle"
                backgroundColor="rgba(44,44,44,0.05)"
                borderColor="rgba(196,30,58,0.2)"
                textColor="#666"
                onClick={() => handleAdClick({
                  id: 'dashboard-right',
                  title: 'Dashboard Right Banner',
                  link: 'https://example.com'
                })}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CombinedDashboard;
