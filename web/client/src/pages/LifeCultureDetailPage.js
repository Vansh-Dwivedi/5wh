import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import axios from 'axios';

const LifeCultureDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch from news API
      // You can later create a dedicated life-culture endpoint
      const response = await axios.get(`/api/news/${slug}`);
      setArticle(response.data);
      
      // Fetch related articles
      const relatedResponse = await axios.get(`/api/news?category=life-culture&limit=3`);
      setRelatedArticles(relatedResponse.data.news || relatedResponse.data.articles || []);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching article:', err);
      if (err.response?.status === 404) {
        setError('Article not found.');
      } else {
        setError('Failed to load article. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/life-culture')}
          sx={{ backgroundColor: '#c41e3a' }}
        >
          Back to Life & Culture
        </Button>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="info">
          Article not found.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/life-culture')}
          sx={{ backgroundColor: '#c41e3a', mt: 2 }}
        >
          Back to Life & Culture
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - Life & Culture | 5WH Media</title>
        <meta name="description" content={article.summary || article.description} />
        <meta name="keywords" content={`life, culture, lifestyle, ${article.title}`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary || article.description} />
        <meta property="og:image" content={article.image} />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/life-culture')}
            sx={{ color: '#c41e3a' }}
          >
            Back to Life & Culture
          </Button>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Article Header */}
          <Box sx={{ mb: 4 }}>
            <Chip 
              label="Life & Culture" 
              sx={{ 
                backgroundColor: '#c41e3a', 
                color: 'white', 
                mb: 2 
              }} 
            />
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                lineHeight: 1.2,
                mb: 3
              }}
            >
              {article.title}
            </Typography>
            
            <Divider 
              sx={{ 
                width: '100px', 
                height: '4px', 
                backgroundColor: '#c41e3a', 
                mb: 3 
              }} 
            />

            {/* Article Meta */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, backgroundColor: '#c41e3a' }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {article.author?.name || 'Editorial Team'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
              <Button
                startIcon={<ShareIcon />}
                onClick={handleShare}
                size="small"
                sx={{ color: '#c41e3a' }}
              >
                Share
              </Button>
            </Box>

            {/* Summary */}
            {article.summary && (
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                  mb: 4
                }}
              >
                {article.summary}
              </Typography>
            )}
          </Box>

          {/* Featured Image */}
          {article.image && (
            <Box sx={{ mb: 4 }}>
              <img
                src={article.image}
                alt={article.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            </Box>
          )}

          {/* Article Content */}
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="body1" 
              component="div"
              sx={{ 
                lineHeight: 1.7,
                fontSize: '1.1rem',
                '& p': { mb: 2 },
                '& h2, & h3, & h4': { 
                  color: '#c41e3a', 
                  mt: 3, 
                  mb: 2,
                  fontWeight: 'bold'
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  my: 2,
                }
              }}
              dangerouslySetInnerHTML={{ __html: article.content || article.description }}
            />
          </Box>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#c41e3a', fontWeight: 'bold' }}>
                Related Stories
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                {relatedArticles.slice(0, 3).map((related) => (
                  <Grid item xs={12} md={4} key={related._id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-2px)' }
                      }}
                      onClick={() => navigate(`/life-culture/${related.slug}`)}
                    >
                      {related.image && (
                        <Box
                          component="img"
                          src={related.image}
                          alt={related.title}
                          sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                          {related.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {related.summary?.substring(0, 100)}...
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </motion.div>
      </Container>
    </>
  );
};

export default LifeCultureDetailPage;
