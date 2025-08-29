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
import { FormatQuote, Person, Star } from '@mui/icons-material';

// Sample quotes data - in a real app, this would come from an API
const quotes = [
  {
    id: 1,
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Motivation"
  },
  {
    id: 2,
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Wisdom"
  },
  {
    id: 3,
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Courage"
  },
  {
    id: 4,
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Dreams"
  },
  {
    id: 5,
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "Hope"
  }
];

// Sample people data - in a real app, this would come from an API
const people = [
  {
    id: 1,
    name: "Dr. APJ Abdul Kalam",
    title: "Former President of India & Scientist",
    description: "Known as the 'Missile Man of India', Dr. Kalam was a visionary scientist and beloved leader who inspired millions with his dedication to education and space research.",
    achievement: "Developed India's first satellite launch vehicle",
    image: "/api/placeholder/150/150",
    birthYear: "1931",
    field: "Science & Politics"
  },
  {
    id: 2,
    name: "Marie Curie",
    title: "Nobel Prize-winning Physicist & Chemist",
    description: "First woman to win a Nobel Prize and the only person to win Nobel Prizes in two different scientific fields (Physics and Chemistry).",
    achievement: "Discovered radium and polonium",
    image: "/api/placeholder/150/150",
    birthYear: "1867",
    field: "Science"
  },
  {
    id: 3,
    name: "Nelson Mandela",
    title: "Anti-apartheid Leader & Former President",
    description: "A global icon who fought against apartheid and became South Africa's first Black president, promoting reconciliation and human rights.",
    achievement: "Ended apartheid in South Africa",
    image: "/api/placeholder/150/150",
    birthYear: "1918",
    field: "Politics & Human Rights"
  },
  {
    id: 4,
    name: "Malala Yousafzai",
    title: "Education Activist & Nobel Laureate",
    description: "The youngest Nobel Prize laureate who advocates for female education and women's rights around the world.",
    achievement: "Nobel Peace Prize for education advocacy",
    image: "/api/placeholder/150/150",
    birthYear: "1997",
    field: "Education & Activism"
  },
  {
    id: 5,
    name: "Mahatma Gandhi",
    title: "Leader of Indian Independence Movement",
    description: "Pioneer of non-violent resistance and civil rights activism who led India to independence from British rule.",
    achievement: "Led India's independence through non-violence",
    image: "/api/placeholder/150/150",
    birthYear: "1869",
    field: "Politics & Philosophy"
  }
];

const QuoteOfTheDay = () => {
  const [dailyQuote, setDailyQuote] = useState(null);

  useEffect(() => {
    // Get a quote based on the current date
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % quotes.length;
    setDailyQuote(quotes[quoteIndex]);
  }, []);

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

  useEffect(() => {
    // Get a person based on the current date
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const personIndex = dayOfYear % people.length;
    setDailyPerson(people[personIndex]);
  }, []);

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
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Key Achievement
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {dailyPerson.achievement}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Born
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {dailyPerson.birthYear}
            </Typography>
          </Box>
        </Box>
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
