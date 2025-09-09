import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Avatar } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Editorial Team",
      role: "News & Analysis",
      description: "Dedicated journalists committed to delivering accurate, unbiased news coverage."
    },
    {
      name: "Content Creators",
      role: "Multimedia Production",
      description: "Experienced producers creating engaging podcasts and video content."
    },
    {
      name: "Research Team",
      role: "Fact-checking & Verification",
      description: "Ensuring accuracy and credibility in all our published content."
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us - 5WH Media</title>
        <meta name="description" content="Learn about 5WH Media - Your trusted source for news, analysis, and multimedia content covering politics, culture, and global affairs." />
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
              About 5WH Media
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
              Your trusted source for comprehensive news coverage, insightful analysis, and engaging multimedia content
            </Typography>
          </Box>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Grid container spacing={6} sx={{ mb: 8 }}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#2c2c2c',
                }}
              >
                Our Mission
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.7,
                  color: '#555555',
                  fontFamily: '"Georgia", "Times New Roman", serif',
                }}
              >
                At 5WH Media, we are committed to delivering accurate, unbiased, and comprehensive news coverage. 
                We believe in the power of journalism to inform, educate, and empower our communities. Our mission 
                is to provide quality content that helps our audience understand the complex world around them.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#2c2c2c',
                }}
              >
                Our Values
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['Integrity', 'Accuracy', 'Independence', 'Transparency'].map((value, index) => (
                  <Box key={value} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      backgroundColor: '#c41e3a', 
                      borderRadius: '50%' 
                    }} />
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </motion.div>

        {/* What We Cover */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                color: '#2c2c2c',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              What We Cover
            </Typography>
            <Box sx={{ 
              height: '3px', 
              backgroundColor: '#c41e3a', 
              width: '80px', 
              mx: 'auto', 
              mb: 4 
            }} />
          </Box>

          <Grid container spacing={4} sx={{ mb: 8 }}>
            {[
              {
                title: "Politics & Governance",
                description: "In-depth coverage of political developments, policy analysis, and government affairs."
              },
              {
                title: "Culture & Society",
                description: "Exploring cultural trends, social issues, and community stories that matter."
              },
              {
                title: "Global Affairs",
                description: "International news and analysis with a focus on regional and global perspectives."
              },
              {
                title: "Multimedia Content",
                description: "Engaging podcasts and videos that bring stories to life through multiple formats."
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    transform: 'translateY(-4px)',
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#2c2c2c' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#666666' }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                color: '#2c2c2c',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Our Team
            </Typography>
            <Box sx={{ 
              height: '3px', 
              backgroundColor: '#c41e3a', 
              width: '80px', 
              mx: 'auto', 
              mb: 4 
            }} />
          </Box>

          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    transform: 'translateY(-4px)',
                  }
                }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      backgroundColor: '#c41e3a',
                      fontSize: '2rem',
                    }}
                  >
                    {member.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 500 }}>
                    {member.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {member.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            mt: 8, 
            p: 6, 
            backgroundColor: '#f8f8f8', 
            borderRadius: 2,
          }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: '#2c2c2c' }}>
              Get In Touch
            </Typography>
            <Typography variant="body1" sx={{ 
              maxWidth: '600px', 
              mx: 'auto', 
              lineHeight: 1.6,
              color: '#666666',
              mb: 3
            }}>
              Have a story tip, feedback, or want to collaborate with us? We'd love to hear from you.
            </Typography>
            <Typography variant="body1" sx={{ color: '#c41e3a', fontWeight: 500 }}>
              Contact us through our Contact page or reach out via our social media channels.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </>
  );
};

export default AboutPage;
