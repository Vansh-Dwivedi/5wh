import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  TextField,
  Button,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Email, 
  Phone, 
  LocationOn, 
  Facebook, 
  YouTube, 
  Instagram, 
  Send
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setShowAlert(true);
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <Email />, 
      title: "Email",
      details: "fivewhnewsmedia@gmail.com",
      subtitle: "General inquiries and story tips"
    },
    {
      icon: <Phone />,
      title: "Phone (India)",
      details: "+91 987-62-97823",
      subtitle: "Available for WhatsApp & Calls"
    },
    {
      icon: <Phone />,
      title: "Phone (Canada)",
      details: "+1 780-243-7033",
      subtitle: "Available for WhatsApp & Calls"
    },
    {
      icon: <LocationOn />,
      title: "Location",
      details: "India & Canada",
      subtitle: "Serving both regions"
    }
  ];

  const socialLinks = [
    { icon: <Facebook />, url: 'https://www.facebook.com/5whmedia/', label: 'Facebook' },
    { icon: <YouTube />, url: 'https://www.youtube.com/@5wh_media', label: 'YouTube' },
    { icon: <Instagram />, url: 'https://www.instagram.com/5whmedia/', label: 'Instagram' },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us - 5WH Media</title>
        <meta name="description" content="Get in touch with 5WH Media. Contact us for story tips, feedback, collaboration opportunities, or general inquiries." />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Main Content Area */}
          <Grid item xs={12}>
            {/* Header - Newspaper style */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3rem' },
                  fontWeight: 700,
                  color: '#2c2c2c',
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Contact Us
              </Typography>
              <Box sx={{ 
                height: '3px', 
                backgroundColor: '#c41e3a', 
                width: '80px', 
                mx: 'auto', 
                mb: 3 
              }} />
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '1rem',
                  fontWeight: 400,
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                We'd love to hear from you. Get in touch with our team for any inquiries, story tips, or collaboration opportunities.
              </Typography>
            </Box>

            {/* Contact Form and Info */}
            <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 4, boxShadow: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                Send us a message
              </Typography>
              
              <Snackbar
                open={showAlert}
                autoHideDuration={6000}
                onClose={() => setShowAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <Alert severity="success" onClose={() => setShowAlert(false)}>
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              </Snackbar>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="email"
                      type="email"
                      label="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  name="subject"
                  label="Subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  name="message"
                  label="Your Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={6}
                  variant="outlined"
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  startIcon={<Send />}
                  sx={{
                    py: 1.5,
                    backgroundColor: '#c41e3a',
                    '&:hover': {
                      backgroundColor: '#a01729'
                    }
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Get in Touch
              </Typography>
              
              {contactInfo.map((info, index) => (
                <Card key={index} sx={{ mb: 2, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ color: '#c41e3a', mt: 0.5 }}>
                      {info.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {info.title}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {info.details}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {info.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>

            {/* Social Media */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: '#c41e3a',
                      '&:hover': {
                        backgroundColor: 'rgba(196, 30, 58, 0.1)'
                      }
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Card>
          </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ContactPage;