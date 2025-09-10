import React from 'react';
import { Container, Typography, Box, Grid, Card, CardMedia, CardContent, CardActionArea } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const SantokhSinghDhirPage = () => {
  const title = 'Santokh Singh Dhir';
  const description =
    'Santokh Singh Dhir (1920–2010) was a renowned Punjabi writer and poet whose work explored social justice, class struggle, and everyday life, contributing profoundly to modern Punjabi literature.';

  const imageUrl = 'https://5whmedia.com/wp-content/uploads/2025/08/Santokh-Ji.webp';

  return (
    <>
      <Helmet>
        <title>Santokh Singh Dhir - 5WH Media</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://5whmedia.com/santokh-singh-dhir/" />
      </Helmet>

      {/* Container 1: Hero + Biography (equal-width columns) */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2.6rem', md: '3.6rem' },
                color: '#2c2c2c',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {title}
            </Typography>
            <Box sx={{ height: 4, backgroundColor: '#c41e3a', width: 100, mx: 'auto' }} />
          </Box>
        </motion.div>

        <Grid container spacing={6} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', borderRadius: 2, overflow: 'hidden', height: '100%' }}>
                <CardMedia
                  component="img"
                  src={imageUrl}
                  alt="Santokh Singh Dhir"
                  sx={{ width: '100%', height: { xs: 220, md: 280 }, objectFit: 'cover' }}
                />
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%', justifyContent: 'center', textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 2.0, color: '#3a3a3a', fontFamily: '"Georgia", "Times New Roman", serif', fontWeight: 700 }}>
                  <strong>Santokh Singh Dhir</strong> (1920–2010) was a renowned Punjabi writer and poet known for his deep insight into social issues and his
                  contribution to modern Punjabi literature. Born in Dadheri village in Punjab, he started his life as a tailor and briefly worked as a
                  journalist before dedicating himself fully to writing. Over his literary career, Dhir authored around 50 books, including poetry, short
                  stories, novels, and an autobiography titled <em>Brahaspati</em>.
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 2.0, color: '#3a3a3a', fontFamily: '"Georgia", "Times New Roman", serif', fontWeight: 700 }}>
                  His works often explored themes of social justice, class struggle, and the everyday lives of common people. Notable among his story
                  collections is <em>Pakhi</em> (1991), which earned him the prestigious Sahitya Akademi Award in 1996. He was also honored with the Shromani
                  Sahitkar Award by the Punjab Government in 1991 and received fellowships from prominent universities.
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 2.0, color: '#3a3a3a', fontFamily: '"Georgia", "Times New Roman", serif', fontWeight: 700 }}>
                  Dhir’s literary style combined realism with poetic sensitivity, making his stories both impactful and thought‑provoking. Some of his works
                  were adapted into telefilms by Doordarshan. He is remembered not only as a prolific writer but also as a progressive thinker whose writings
                  gave voice to the marginalized. Santokh Singh Dhir passed away in 2010 in Chandigarh, leaving behind a powerful legacy in Punjabi
                  literature that continues to inspire readers and writers alike.
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Image: Santokh Singh Dhir
            </Typography>
          </Box>
        </motion.div>
      </Container>

      {/* Container 2: Colors of Dhir's Pen — Poems as cards */}
      <Box sx={{ bgcolor: '#f8f8f8', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '2.6rem' }, color: '#2c2c2c' }}>
                The Colors of Dhir Sahib’s Pen
              </Typography>
              <Box sx={{ height: 3, backgroundColor: '#c41e3a', width: 80, mx: 'auto' }} />
            </Box>
          </motion.div>
          <Grid container spacing={3} justifyContent="center">
            {[
              { t: 'Saver Hon Tak', s: 'saver-hon-tak' },
              { t: 'Bhet Wali Gal', s: 'bhet-wali-gal' },
              { t: 'Koi Ik Sawar', s: 'koi-ik-sawar' },
              { t: 'Mamla', s: 'mamla' },
              { t: 'Jugni', s: 'jugni' },
              { t: 'Ik Veerangana', s: 'ik-veerangana' },
              { t: 'Sanjhi Kandh', s: 'sanjhi-kandh' },
              { t: 'Mera Ujria Guandhi', s: 'mera-ujria-guandhi' },
              { t: 'Aapna Desh', s: 'aapna-desh' },
              { t: 'Kalyug', s: 'kalyug' },
              { t: 'Tai Nihali', s: 'tai-nihali' },
              { t: 'Mirgi', s: 'mirgi' },
            ].map((p, idx) => (
              <Grid key={idx} item xs={12} sm={6} md={4}>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.04 * idx }}>
                  <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', borderRadius: 2, height: '100%', textAlign: 'center' }}>
                    <CardActionArea component={RouterLink} to={`/santokh-singh-dhir/${p.s}`} sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2c2c2c' }}>
                          {p.t}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default SantokhSinghDhirPage;
