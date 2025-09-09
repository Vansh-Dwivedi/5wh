import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Share,
  BookmarkBorder,
  Visibility
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const OpinionDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [opinion, setOpinion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOpinion();
  }, [slug]);

  const fetchOpinion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/opinions/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setOpinion(data.data);
      } else {
        setError('Opinion article not found');
      }
    } catch (error) {
      console.error('Error fetching opinion:', error);
      setError('Failed to load opinion article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: opinion.title,
        text: opinion.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !opinion) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Opinion article not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/5wh-opinion')}
        >
          Back to Opinions
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{opinion.metaTitle || opinion.title} - 5WH Opinion</title>
        <meta name="description" content={opinion.metaDescription || opinion.excerpt} />
        <meta property="og:title" content={opinion.title} />
        <meta property="og:description" content={opinion.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {opinion.featuredImage && (
          <meta property="og:image" content={`http://localhost:5000${opinion.featuredImage}`} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={opinion.title} />
        <meta name="twitter:description" content={opinion.excerpt} />
        {opinion.featuredImage && (
          <meta name="twitter:image" content={`http://localhost:5000${opinion.featuredImage}`} />
        )}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": opinion.title,
            "description": opinion.excerpt,
            "author": {
              "@type": "Person",
              "name": opinion.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "5WH Media"
            },
            "datePublished": opinion.publishedAt || opinion.createdAt,
            "dateModified": opinion.updatedAt,
            ...(opinion.featuredImage && {
              "image": `http://localhost:5000${opinion.featuredImage}`
            })
          })}
        </script>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/life-culture')}
            sx={{ mb: 4 }}
          >
            Back to Life & Culture
          </Button>
        </motion.div>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ mb: 4 }}>
            <Chip
              label={opinion.category}
              sx={{
                backgroundColor: '#c41e3a',
                color: 'white',
                fontWeight: 'bold',
                mb: 2
              }}
            />
            
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2rem', md: '3rem' },
                lineHeight: 1.2,
                color: '#2c2c2c'
              }}
            >
              {opinion.title}
            </Typography>

            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                mb: 4,
                lineHeight: 1.6,
                fontFamily: '"Georgia", "Times New Roman", serif',
                fontStyle: 'italic'
              }}
            >
              {opinion.excerpt}
            </Typography>

            {/* Article Meta */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 4,
              flexWrap: 'wrap'
            }}>
              <Avatar sx={{ bgcolor: '#c41e3a' }}>
                {opinion.author.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {opinion.author}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(opinion.publishedAt || opinion.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {opinion.readTime}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" color="disabled" />
                    <Typography variant="body2" color="text.secondary">
                      {opinion.views} views
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Action Buttons */}
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <IconButton onClick={handleShare} color="primary">
                  <Share />
                </IconButton>
                <IconButton color="primary">
                  <BookmarkBorder />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Featured Image */}
        {opinion.featuredImage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card sx={{ mb: 6, border: 'none', boxShadow: 'none' }}>
              <CardMedia
                component="img"
                image={`http://localhost:5000${opinion.featuredImage}`}
                alt={opinion.title}
                sx={{
                  height: { xs: 300, md: 500 },
                  objectFit: 'cover',
                  borderRadius: 2
                }}
              />
            </Card>
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card sx={{ border: 'none', boxShadow: 'none' }}>
            <CardContent sx={{ p: 0 }}>
              <Typography 
                variant="body1"
                sx={{
                  fontSize: '1.125rem',
                  lineHeight: 1.8,
                  color: '#2c2c2c',
                  fontFamily: '"Georgia", "Times New Roman", serif',
                  '& p': {
                    mb: 3
                  },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    fontWeight: 600,
                    mt: 4,
                    mb: 2,
                    color: '#2c2c2c'
                  },
                  '& blockquote': {
                    borderLeft: '4px solid #c41e3a',
                    pl: 3,
                    py: 2,
                    my: 3,
                    backgroundColor: '#f8f8f8',
                    fontStyle: 'italic',
                    fontSize: '1.1rem'
                  },
                  '& ul, & ol': {
                    pl: 3,
                    mb: 3
                  },
                  '& li': {
                    mb: 1
                  }
                }}
                dangerouslySetInnerHTML={{ __html: opinion.content }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tags */}
        {opinion.tags && opinion.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Box sx={{ mt: 6, pt: 4 }}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {opinion.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#c41e3a',
                      color: '#c41e3a',
                      '&:hover': {
                        backgroundColor: '#c41e3a',
                        color: 'white'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Author Bio / Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Box sx={{ 
            mt: 8,
            p: 4,
            backgroundColor: '#f8f8f8',
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Share Your Thoughts
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              What do you think about this opinion? We'd love to hear your perspective.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/contact')}
              sx={{
                backgroundColor: '#c41e3a',
                '&:hover': {
                  backgroundColor: '#8b0000'
                }
              }}
            >
              Contact Us
            </Button>
          </Box>
        </motion.div>
      </Container>
    </>
  );
};

export default OpinionDetailPage;
