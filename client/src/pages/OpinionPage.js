import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Chip,
  Button,
  Divider
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const OpinionPage = () => {
  // Placeholder opinion articles data
  const opinionArticles = [
    {
      id: 1,
      title: "The Future of Digital Media in Punjab",
      excerpt: "Exploring how digital transformation is reshaping media consumption and news delivery in the region.",
      author: "Editorial Team",
      publishedAt: "2025-08-20",
      category: "Media & Technology",
      readTime: "5 min read",
      featured: true
    },
    {
      id: 2,
      title: "Building Stronger Communities Through Local Journalism",
      excerpt: "The vital role of community-focused journalism in fostering civic engagement and democratic participation.",
      author: "Editorial Team",
      publishedAt: "2025-08-18",
      category: "Journalism",
      readTime: "7 min read",
      featured: false
    },
    {
      id: 3,
      title: "The Importance of Media Literacy in the Digital Age",
      excerpt: "Why critical thinking and media literacy skills are essential for navigating today's information landscape.",
      author: "Editorial Team",
      publishedAt: "2025-08-15",
      category: "Education",
      readTime: "6 min read",
      featured: false
    }
  ];

  const featuredArticle = opinionArticles.find(article => article.featured);
  const regularArticles = opinionArticles.filter(article => !article.featured);

  return (
    <>
      <Helmet>
        <title>5WH Opinion - Editorial & Analysis</title>
        <meta name="description" content="Read thoughtful analysis, editorial opinions, and commentary on current affairs, politics, culture, and society from the 5WH Media editorial team." />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                color: '#2c2c2c',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              5WH Opinion
            </Typography>
            <Box sx={{ 
              height: '4px', 
              backgroundColor: '#c41e3a', 
              width: '100px', 
              mx: 'auto', 
              mb: 4 
            }} />
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                maxWidth: '800px', 
                mx: 'auto',
                lineHeight: 1.6,
                fontFamily: '"Georgia", "Times New Roman", serif',
              }}
            >
              Thoughtful analysis, editorial commentary, and diverse perspectives on the issues that shape our world
            </Typography>
          </Box>
        </motion.div>

        {/* Featured Article */}
        {featuredArticle && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box sx={{ mb: 8 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 4,
                  color: '#2c2c2c',
                  fontSize: { xs: '1.75rem', md: '2rem' },
                }}
              >
                Featured Opinion
              </Typography>
              <Card sx={{ 
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)',
                }
              }}>
                <Grid container>
                  <Grid item xs={12} md={8}>
                    <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={featuredArticle.category}
                          sx={{
                            backgroundColor: '#c41e3a',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 600, 
                          mb: 2,
                          color: '#2c2c2c',
                          lineHeight: 1.3,
                        }}
                      >
                        {featuredArticle.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 3,
                          lineHeight: 1.6,
                          color: '#555555',
                          flexGrow: 1,
                          fontSize: '1.1rem',
                        }}
                      >
                        {featuredArticle.excerpt}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            By {featuredArticle.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(featuredArticle.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} • {featuredArticle.readTime}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#c41e3a',
                          color: 'white',
                          alignSelf: 'flex-start',
                          '&:hover': {
                            backgroundColor: '#8b0000',
                          },
                        }}
                      >
                        Read Full Article
                      </Button>
                    </CardContent>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      height: { xs: 200, md: '100%' },
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: { md: 300 }
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Featured Image
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Box>
          </motion.div>
        )}

        {/* Regular Opinion Articles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 4,
                color: '#2c2c2c',
                fontSize: { xs: '1.75rem', md: '2rem' },
              }}
            >
              Latest Opinions
            </Typography>
            <Grid container spacing={4}>
              {regularArticles.map((article, index) => (
                <Grid item xs={12} md={6} key={article.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card sx={{ 
                      height: '100%',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        transform: 'translateY(-4px)',
                      }
                    }}>
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={article.category}
                            size="small"
                            sx={{
                              backgroundColor: '#f0f0f0',
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 2,
                            color: '#2c2c2c',
                            lineHeight: 1.3,
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 3,
                            lineHeight: 1.6,
                            color: '#666666',
                            flexGrow: 1,
                          }}
                        >
                          {article.excerpt}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              By {article.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })} • {article.readTime}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            sx={{
                              color: '#c41e3a',
                              '&:hover': {
                                backgroundColor: 'rgba(196, 30, 58, 0.1)',
                              },
                            }}
                          >
                            Read More
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            mt: 8, 
            p: 6, 
            backgroundColor: '#f8f8f8', 
            borderRadius: 2,
          }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: '#2c2c2c' }}>
              Share Your Voice
            </Typography>
            <Typography variant="body1" sx={{ 
              maxWidth: '600px', 
              mx: 'auto', 
              lineHeight: 1.6,
              color: '#666666',
              mb: 4
            }}>
              Have an opinion or perspective you'd like to share? We welcome thoughtful commentary and guest contributions 
              from our community members and experts in various fields.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/contact"
              size="large"
              sx={{
                backgroundColor: '#c41e3a',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '&:hover': {
                  backgroundColor: '#8b0000',
                },
              }}
            >
              Submit Your Opinion
            </Button>
          </Box>
        </motion.div>
      </Container>
    </>
  );
};

export default OpinionPage;
