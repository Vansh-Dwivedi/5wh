import React, { useState, useEffect } from 'react';
import { cleanArticleSource, SourceDisplay } from '../services/api';
import SubscriptionDialog from '../components/SubscriptionDialog';
import {
  Container,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  AccessTime, 
  Person, 
  Category, 
  Share, 
  Bookmark,
  ArrowBack,
  Launch
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import AdvertisingSidebar from '../components/layout/AdvertisingSidebar';

// Function to clean and format content
const cleanContent = (content) => {
  if (!content) return '';
  
  // Remove common copyright watermarks and source attributions
  let cleanedContent = content
    // Remove specific watermarks and TV names
    .replace(/jagbani\.com?/gi, '')
    .replace(/punjabijagran\.com?/gi, '')
    .replace(/punjabiJagran\.com?/gi, '')
    .replace(/ABP Sanjha?/gi, '')
    .replace(/abpsanjha\.com?/gi, '')
    .replace(/PTC News?/gi, '')
    .replace(/ABP News?/gi, '')
    .replace(/Zee News?/gi, '')
    .replace(/NDTV?/gi, '')
    .replace(/CNN News18?/gi, '')
    .replace(/Times Now?/gi, '')
    .replace(/India Today?/gi, '')
    .replace(/News18?/gi, '')
    .replace(/Republic TV?/gi, '')
    .replace(/jagbani?/gi, '')
    .replace(/punjabi jagran?/gi, '')
    .replace(/The Tribune?/gi, '')
    .replace(/Indian Express?/gi, '')
    .replace(/Hindustan Times?/gi, '')
    .replace(/Times of India?/gi, '')
    // Remove common copyright phrases
    .replace(/\(source:.*?\)/gi, '')
    .replace(/source:.*?(?=\.|$)/gi, '')
    .replace(/©.*?(?=\.|$)/gi, '')
    .replace(/copyright.*?(?=\.|$)/gi, '')
    .replace(/all rights reserved.*?(?=\.|$)/gi, '')
    // Remove URLs that might be watermarks
    .replace(/https?:\/\/\S+/g, '')
    // Remove separator patterns with source info
    .replace(/[-–—]\s*[A-Z][a-z\s]+(?:News|TV|Media|Times|Express|Post|Tribune).*$/gi, '')
    .replace(/[-–—]\s*[A-Z]{2,}.*$/gi, '')
    // Remove duplicate spaces and clean up
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/^[-–—\s]+/, '')
    .replace(/[-–—\s]+$/, '')
    .trim();
    
  // If content doesn't have HTML tags, convert line breaks to paragraphs
  if (cleanedContent && !cleanedContent.includes('<')) {
    cleanedContent = cleanedContent
      .split('\n\n')
      .filter(para => para.trim())
      .map(para => `<p>${para.trim()}</p>`)
      .join('');
  }
    
  return cleanedContent;
};

const NewsDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/news/${slug}`);
      
      // Apply source filtering to the article
      const cleanedArticle = cleanArticleSource(response.data);
      setArticle(cleanedArticle);
      
      // Debug: Log the article data to see what content is available
      console.log('Article data:', cleanedArticle);
      console.log('Article content:', cleanedArticle.content);
      console.log('Article excerpt:', cleanedArticle.excerpt);
      
      // Fetch related news
      if (response.data.category) {
        const relatedResponse = await api.get('/news', {
          params: {
            category: response.data.category,
            limit: 3,
            exclude: response.data._id
          }
        });
        setRelatedNews(relatedResponse.data.news || []);
      }
    } catch (err) {
      setError('Article not found');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading article...
        </Typography>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/news')}
          sx={{ mt: 2 }}
        >
          Back to News
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.seo?.metaTitle || article.title} - 5WH Media</title>
        <meta 
          name="description" 
          content={article.seo?.metaDescription || article.excerpt} 
        />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.featuredImage?.url || ''} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Fixed Left Sidebar */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '200px',
          zIndex: 1000,
          display: { xs: 'none', xl: 'block' },
        }}
      >
        <AdvertisingSidebar placement="left" />
      </Box>

      {/* Fixed Right Sidebar */}
      <Box
        sx={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '200px',
          zIndex: 1000,
          display: { xs: 'none', xl: 'block' },
        }}
      >
        <AdvertisingSidebar placement="right" />
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content Area */}
          <Grid item xs={12}>
            {/* Back Button */}
            <Button 
              startIcon={<ArrowBack />} 
              onClick={() => navigate('/news')}
              sx={{ mb: 3 }}
            >
              Back to News
            </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Grid container spacing={4}>
            {/* Main Article */}
            <Grid item xs={12} md={8}>
              <article>
                {/* Category */}
                <Chip 
                  size="medium" 
                  label={article.category}
                  color="primary"
                  icon={<Category />}
                  sx={{ mb: 2 }}
                />

                {/* Title */}
                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom
                  fontWeight="bold"
                  sx={{ lineHeight: 1.2 }}
                >
                  {article.title}
                </Typography>

                {/* Excerpt */}
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  paragraph
                  sx={{ fontStyle: 'italic' }}
                >
                  {article.excerpt}
                </Typography>

                {/* Meta Information */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ width: 32, height: 32 }}
                      src={article.author?.avatar}
                    >
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {article.author?.firstName && article.author?.lastName 
                          ? `${article.author.firstName} ${article.author.lastName}`
                          : article.author?.username || article.rssAuthor || 'Anonymous'
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Author
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(article.publishedAt)}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Button
                    startIcon={<Share />}
                    onClick={handleShare}
                    variant="outlined"
                    size="small"
                  >
                    Share
                  </Button>
                  <Button
                    startIcon={<Bookmark />}
                    variant="outlined"
                    size="small"
                  >
                    Save
                  </Button>
                  {article.originalUrl && (
                    <Button
                      startIcon={<Launch />}
                      href={article.originalUrl}
                      target="_blank"
                      variant="outlined"
                      size="small"
                    >
                      Source
                    </Button>
                  )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Featured Image */}
                <Box sx={{ mb: 4 }}>
                  {article.featuredImage && article.featuredImage.url ? (
                    <>
                      <img
                        src={article.featuredImage.url.startsWith('http') ? article.featuredImage.url : `https://5whmedia.com:5000${article.featuredImage.url}`}
                        alt={article.featuredImage.alt || article.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)';
                          e.target.parentElement.style.display = 'flex';
                          e.target.parentElement.style.alignItems = 'center';
                          e.target.parentElement.style.justifyContent = 'center';
                          e.target.parentElement.style.height = '400px';
                          e.target.parentElement.style.borderRadius = '8px';
                          e.target.parentElement.innerHTML = '<div style="color: white; text-align: center; font-size: 5rem; opacity: 0.9;">📰</div>';
                        }}
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: 8,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                      {article.featuredImage.caption && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            textAlign: 'center',
                            mt: 1,
                            fontStyle: 'italic',
                            color: 'text.secondary'
                          }}
                        >
                          {article.featuredImage.caption}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Box 
                      sx={{ 
                        width: '100%',
                        height: '400px',
                        background: 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Box sx={{ 
                        fontSize: '5rem', 
                        color: 'white', 
                        opacity: 0.9,
                        textAlign: 'center'
                      }}>
                        📰
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Content */}
                {(article.content || article.description || article.excerpt) ? (
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ 
                      lineHeight: 1.8,
                      fontSize: '1.1rem',
                      '& p': { mb: 2 },
                      '& img': { 
                        maxWidth: '100%', 
                        height: 'auto',
                        borderRadius: 1,
                        my: 2
                      }
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: cleanContent(
                        article.content || 
                        article.description || 
                        article.excerpt || 
                        'This article content is not available.'
                      ) 
                    }}
                  />
                ) : (
                  <Box sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                    border: '1px dashed grey.300'
                  }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Content Not Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      The full content for this article is not available. 
                      {article.originalUrl && (
                        <>
                          <br />
                          <Button
                            href={article.originalUrl}
                            target="_blank"
                            variant="outlined"
                            startIcon={<Launch />}
                            sx={{ mt: 2 }}
                          >
                            Read Original Article
                          </Button>
                        </>
                      )}
                    </Typography>
                  </Box>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {article.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </article>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Related News */}
              {relatedNews.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Related News
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {relatedNews.map((relatedArticle) => (
                      <Card 
                        key={relatedArticle._id}
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-2px)' }
                        }}
                        onClick={() => navigate(`/news/${relatedArticle.slug}`)}
                      >
                        {relatedArticle.featuredImage && relatedArticle.featuredImage.url ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={relatedArticle.featuredImage.url.startsWith('http') ? relatedArticle.featuredImage.url : `https://5whmedia.com:5000${relatedArticle.featuredImage.url}`}
                            alt={relatedArticle.featuredImage.alt || relatedArticle.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.style.background = 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)';
                              e.target.parentElement.style.display = 'flex';
                              e.target.parentElement.style.alignItems = 'center';
                              e.target.parentElement.style.justifyContent = 'center';
                              e.target.parentElement.style.height = '140px';
                              e.target.parentElement.innerHTML = '<div style="color: white; text-align: center; font-size: 3rem; opacity: 0.9;">📰</div>';
                            }}
                          />
                        ) : (
                          <Box 
                            sx={{ 
                              height: '140px',
                              background: 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Box sx={{ 
                              fontSize: '3rem', 
                              color: 'white', 
                              opacity: 0.9,
                              textAlign: 'center'
                            }}>
                              📰
                            </Box>
                          </Box>
                        )}
                        <CardContent>
                          <Typography 
                            variant="h6" 
                            component="h3"
                            sx={{ fontSize: '1rem', lineHeight: 1.3 }}
                          >
                            {relatedArticle.title}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ mt: 1, display: 'block' }}
                          >
                            {formatDate(relatedArticle.publishedAt)}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Newsletter Signup */}
              <Card sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  Stay Updated
                </Typography>
                <Typography variant="body2" paragraph>
                  Get the latest news and updates delivered straight to your inbox.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary"
                  fullWidth
                  onClick={() => setSubscriptionDialogOpen(true)}
                >
                  Subscribe to Newsletter
                </Button>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Subscription Dialog */}
      <SubscriptionDialog 
        open={subscriptionDialogOpen} 
        onClose={() => setSubscriptionDialogOpen(false)} 
      />
    </>
  );
};

export default NewsDetailPage;
