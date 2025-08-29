import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Avatar,
  Chip,
  Button,
  Divider
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const SantokhSinghDhirPage = () => {
  // Placeholder articles and content for Santokh Singh Dhir
  const authorInfo = {
    name: "Santokh Singh Dhir",
    title: "Senior Political Analyst & Commentator",
    bio: "Santokh Singh Dhir is a renowned political analyst and commentator with over two decades of experience in journalism and political commentary. Known for his insightful analysis of Punjab politics and regional affairs, he brings deep understanding of political dynamics and social issues to his writing.",
    expertise: ["Punjab Politics", "Regional Affairs", "Policy Analysis", "Social Commentary"],
    experience: "20+ years in journalism and political analysis"
  };

  const recentArticles = [
    {
      id: 1,
      title: "The Changing Political Landscape of Punjab",
      excerpt: "An in-depth analysis of recent political developments and their implications for the future of Punjab.",
      publishedAt: "2025-08-20",
      category: "Politics",
      readTime: "8 min read"
    },
    {
      id: 2,
      title: "Agricultural Reforms: Impact on Punjab's Farmers",
      excerpt: "Examining the effects of recent agricultural policies on farming communities in Punjab.",
      publishedAt: "2025-08-15",
      category: "Agriculture",
      readTime: "10 min read"
    },
    {
      id: 3,
      title: "Youth and Politics: A New Generation's Voice",
      excerpt: "Understanding how young people are shaping political discourse in contemporary Punjab.",
      publishedAt: "2025-08-10",
      category: "Youth & Politics",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Economic Development in Rural Punjab",
      excerpt: "Strategies for sustainable economic growth in rural areas of Punjab.",
      publishedAt: "2025-08-05",
      category: "Economics",
      readTime: "7 min read"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Santokh Singh Dhir - Political Analyst & Commentator</title>
        <meta name="description" content="Read the latest political analysis and commentary by Santokh Singh Dhir, senior political analyst covering Punjab politics, regional affairs, and policy analysis." />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section - Author Profile */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card sx={{ mb: 8, border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 6 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 150,
                      height: 150,
                      mx: 'auto',
                      mb: 2,
                      backgroundColor: '#c41e3a',
                      fontSize: '3rem',
                      fontWeight: 'bold',
                    }}
                  >
                    SD
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Senior Political Analyst
                  </Typography>
                </Grid>
                <Grid item xs={12} md={9}>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 2,
                      color: '#2c2c2c',
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    {authorInfo.name}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="primary"
                    sx={{ 
                      mb: 3,
                      fontWeight: 500,
                    }}
                  >
                    {authorInfo.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3,
                      lineHeight: 1.6,
                      color: '#555555',
                      fontSize: '1.1rem',
                    }}
                  >
                    {authorInfo.bio}
                  </Typography>
                  
                  {/* Expertise Tags */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Areas of Expertise:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {authorInfo.expertise.map((expertise, index) => (
                        <Chip
                          key={index}
                          label={expertise}
                          size="small"
                          sx={{
                            backgroundColor: '#f0f0f0',
                            '&:hover': {
                              backgroundColor: '#e0e0e0',
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Experience: {authorInfo.experience}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Articles Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 4,
                color: '#2c2c2c',
                fontSize: { xs: '1.75rem', md: '2rem' },
                textAlign: 'center',
              }}
            >
              Recent Articles & Analysis
            </Typography>
            <Box sx={{ 
              height: '3px', 
              backgroundColor: '#c41e3a', 
              width: '80px', 
              mx: 'auto', 
              mb: 6 
            }} />
            
            <Grid container spacing={4}>
              {recentArticles.map((article, index) => (
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
                              backgroundColor: '#c41e3a',
                              color: 'white',
                              fontWeight: 'bold',
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
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {article.readTime}
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
                            Read Article
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

        {/* Featured Quote/Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            mt: 8, 
            p: 6, 
            backgroundColor: '#f8f8f8', 
            borderRadius: 2,
            border: '1px solid #e0e0e0',
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: '#2c2c2c',
              fontStyle: 'italic',
              fontFamily: '"Georgia", "Times New Roman", serif',
            }}>
              "Understanding politics requires not just analysis of events, but deep comprehension of the social fabric that shapes our society."
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#666666',
              fontWeight: 500,
            }}>
              — Santokh Singh Dhir
            </Typography>
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
            mt: 6, 
            p: 4, 
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#2c2c2c' }}>
              Stay Updated
            </Typography>
            <Typography variant="body1" sx={{ 
              maxWidth: '600px', 
              mx: 'auto', 
              lineHeight: 1.6,
              color: '#666666',
              mb: 4
            }}>
              Follow Santokh Singh Dhir's latest political analysis and commentary. Get insights into Punjab politics, 
              policy developments, and regional affairs.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/news"
              size="large"
              sx={{
                backgroundColor: '#c41e3a',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mr: 2,
                '&:hover': {
                  backgroundColor: '#8b0000',
                },
              }}
            >
              View All Articles
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/contact"
              size="large"
              sx={{
                borderColor: '#c41e3a',
                color: '#c41e3a',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '&:hover': {
                  borderColor: '#8b0000',
                  backgroundColor: 'rgba(196, 30, 58, 0.1)',
                },
              }}
            >
              Contact Author
            </Button>
          </Box>
        </motion.div>
      </Container>
    </>
  );
};

export default SantokhSinghDhirPage;
