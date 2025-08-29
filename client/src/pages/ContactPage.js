import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Button,
  IconButton,
  Alert
} from '@mui/material';
import { 
  Email, 
  Phone, 
  LocationOn, 
  Facebook, 
  Twitter, 
  YouTube, 
  Instagram, 
  LinkedIn 
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: <Email />,
      title: "Email",
      details: "contact@5whmedia.com",
      subtitle: "General inquiries and story tips"
    },
    {
      icon: <Phone />,
      title: "Phone",
      details: "+1 (555) 123-4567",
      subtitle: "Monday to Friday, 9 AM - 6 PM"
    },
    {
      icon: <LocationOn />,
      title: "Address",
      details: "123 Media Street, News District",
      subtitle: "City, State 12345"
    }
  ];

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook', color: '#1877f2' },
    { icon: <Twitter />, url: '#', label: 'Twitter', color: '#1da1f2' },
    { icon: <YouTube />, url: '#', label: 'YouTube', color: '#ff0000' },
    { icon: <Instagram />, url: '#', label: 'Instagram', color: '#e4405f' },
    { icon: <LinkedIn />, url: '#', label: 'LinkedIn', color: '#0077b5' },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us - 5WH Media</title>
        <meta name="description" content="Get in touch with 5WH Media. Contact us for story tips, feedback, collaboration opportunities, or general inquiries." />
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
              Contact Us
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
                maxWidth: '600px', 
                mx: 'auto',
                lineHeight: 1.6,
                fontFamily: '"Georgia", "Times New Roman", serif',
              }}
            >
              We'd love to hear from you. Get in touch with our team for any inquiries, story tips, or collaboration opportunities.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card sx={{ p: 4, border: '1px solid #e0e0e0' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: '#2c2c2c' }}>
                  Send us a Message
                </Typography>
                
                {showAlert && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thank you for your message! We'll get back to you soon.
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        multiline
                        rows={6}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
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
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Contact Info Cards */}
                {contactInfo.map((info, index) => (
                  <Card key={index} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        color: '#c41e3a', 
                        '& svg': { fontSize: '2rem' } 
                      }}>
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
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

                {/* Social Media */}
                <Card sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Follow Us
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {socialLinks.map((social, index) => (
                      <IconButton
                        key={index}
                        href={social.url}
                        target="_blank"
                        sx={{
                          color: social.color,
                          border: `1px solid ${social.color}`,
                          '&:hover': {
                            backgroundColor: social.color,
                            color: 'white',
                          },
                        }}
                      >
                        {social.icon}
                      </IconButton>
                    ))}
                  </Box>
                </Card>

                {/* Office Hours */}
                <Card sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Office Hours
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Monday - Friday</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>9:00 AM - 6:00 PM</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Saturday</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>10:00 AM - 4:00 PM</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Sunday</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Closed</Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Additional Info Section */}
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
              Story Tips & News Leads
            </Typography>
            <Typography variant="body1" sx={{ 
              maxWidth: '800px', 
              mx: 'auto', 
              lineHeight: 1.6,
              color: '#666666',
              mb: 3
            }}>
              Have a story tip or news lead? We value your input and encourage our community to reach out with 
              information about important stories. Your tips help us stay connected to what matters most to our audience.
            </Typography>
            <Typography variant="body1" sx={{ color: '#c41e3a', fontWeight: 500 }}>
              All tips are treated confidentially and are thoroughly investigated by our editorial team.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </>
  );
};

export default ContactPage;
