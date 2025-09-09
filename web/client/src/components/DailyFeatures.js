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
  Container
} from '@mui/material';
import { FormatQuote, Person, Star, OpenInNew } from '@mui/icons-material';
import { personOfTheDayService } from '../services/personService';
import axios from 'axios';

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// ZenQuotes API service for fetching real quotes
const quoteService = {
  // Fetch quote from zenquotes.io API
  fetchQuoteOfTheDay: async () => {
    const cacheKey = `quote_${new Date().toDateString()}`;
    const cachedQuote = cache.get(cacheKey);
    
    if (cachedQuote && Date.now() - cachedQuote.timestamp < CACHE_DURATION) {
      return cachedQuote.data;
    }

    try {
      const response = await axios.get('https://zenquotes.io/api/today');
      
      if (response.data && response.data.length > 0) {
        const quoteData = response.data[0];
        
        const quote = {
          id: `zenquote_${new Date().toDateString()}`,
          text: quoteData.q,
          author: quoteData.a,
          category: 'Daily Inspiration'
        };

        // Cache the quote
        cache.set(cacheKey, {
          data: quote,
          timestamp: Date.now()
        });
        
        return quote;
      } else {
        throw new Error('No quote data received');
      }
    } catch (error) {
      console.error('Error fetching quote from ZenQuotes:', error);
      // Return error message instead of fallback
      return {
        id: 'error',
        text: "Unable to load today's quote from ZenQuotes API. Please check your internet connection.",
        author: "System Message",
        category: "Error"
      };
    }
  }
};

const QuoteOfTheDay = () => {
  const [dailyQuote, setDailyQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuoteOfTheDay = async () => {
      try {
        setLoading(true);
        const quote = await quoteService.fetchQuoteOfTheDay();
        setDailyQuote(quote);
      } catch (error) {
        console.error('Error loading quote:', error);
        // Fallback quote
        setDailyQuote({
          id: 'fallback',
          text: "The only way to do great work is to love what you do.",
          author: "Steve Jobs",
          category: "Motivation"
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuoteOfTheDay();
  }, []);

  if (loading) {
    return (
      <Card 
        elevation={3}
        sx={{ 
          backgroundColor: '#2c2c2c',
          color: 'white',
          borderRadius: 0,
          border: '2px solid #c41e3a',
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography color="white">Loading quote of the day...</Typography>
      </Card>
    );
  }

  if (!dailyQuote) return null;

  return (
    <Card 
      elevation={3}
      sx={{ 
        backgroundColor: '#2c2c2c',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 0,
        border: '2px solid #c41e3a'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormatQuote sx={{ fontSize: 30, mr: 2, color: '#c41e3a' }} />
          <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
            Quote of the Day
          </Typography>
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '1.1rem', 
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
  );
};

const PersonOfTheDay = () => {
  const [dailyPerson, setDailyPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPersonOfTheDay = async () => {
      try {
        setLoading(true);
        const person = await personOfTheDayService.getPersonOfTheDay();
        setDailyPerson(person);
      } catch (error) {
        console.error('Error loading person of the day:', error);
        // Show error message instead of fallback
        setDailyPerson({
          name: "Unable to Load",
          title: "Wikipedia API Error",
          description: "Sorry, we couldn't fetch today's person from Wikipedia API. Please check your internet connection and try again.",
          achievement: "Online data unavailable",
          birthYear: "Unknown",
          field: "Error",
          image: "https://ui-avatars.com/api/?name=Wikipedia+Error&size=200&background=c41e3a&color=fff&bold=true"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPersonOfTheDay();
  }, []);

  if (loading) {
    return (
      <Card elevation={4} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Typography>Loading person of the day...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!dailyPerson) return null;

  return (
    <Card elevation={4} sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Person sx={{ fontSize: 30, mr: 2, color: '#c41e3a' }} />
          <Typography variant="h6" fontWeight="bold" color="primary">
            Person of the Day
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Avatar
            src={dailyPerson.image}
            alt={dailyPerson.name}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {dailyPerson.name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {dailyPerson.title}
            </Typography>
            <Chip 
              label={dailyPerson.field} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {dailyPerson.description}
        </Typography>
        
        {dailyPerson.wikiUrl && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography 
              component="a" 
              href={dailyPerson.wikiUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ 
                color: '#c41e3a', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Learn More <OpenInNew sx={{ ml: 0.5, fontSize: 16 }} />
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const DailyFeatures = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          align="center"
          sx={{ mb: 4, fontWeight: 'bold' }}
        >
          Daily Inspiration
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <QuoteOfTheDay />
          </Grid>
          <Grid item xs={12} md={6}>
            <PersonOfTheDay />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DailyFeatures;
