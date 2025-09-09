import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Chip,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    PlayArrow,
    AccessTime
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const NewsSlider = ({ news = [] }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const autoPlayRef = useRef();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Get latest 10 news for slider
    const sliderNews = news.slice(0, 10);

    // Auto-play functionality
    useEffect(() => {
        if (isAutoPlay && sliderNews.length > 1) {
            autoPlayRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % sliderNews.length);
            }, 6000); // Change slide every 6 seconds
        }

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isAutoPlay, sliderNews.length]);

    // Pause auto-play on hover
    const handleMouseEnter = () => {
        setIsAutoPlay(false);
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
    };

    // Resume auto-play on mouse leave
    const handleMouseLeave = () => {
        setIsAutoPlay(true);
    };

    // Navigate to specific slide
    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Navigate to previous slide
    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + sliderNews.length) % sliderNews.length);
    };

    // Navigate to next slide
    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % sliderNews.length);
    };

    // Clean content function
    const cleanContent = (content) => {
        if (!content) return '';

        return content
            // Remove website domains
            .replace(/jagbani\.com?/gi, '')
            .replace(/punjabijagran\.com?/gi, '')
            .replace(/punjabiJagran\.com?/gi, '')
            .replace(/abpsanjha\.com?/gi, '')
            .replace(/ptcnews\.tv/gi, '')
            .replace(/dailypost\.in/gi, '')
            .replace(/tribuneindia\.com/gi, '')
            .replace(/indianexpress\.com/gi, '')
            .replace(/hindustantimes\.com/gi, '')
            .replace(/timesofindia\.com/gi, '')
            .replace(/ndtv\.com/gi, '')
            .replace(/zeenews\.india\.com/gi, '')
            // Remove TV channel names and news sources
            .replace(/PTC News?/gi, '')
            .replace(/PTC/gi, '')
            .replace(/SGPC/gi, '')
            .replace(/Google News/gi, '')
            .replace(/ABP Sanjha?/gi, '')
            .replace(/ABP News?/gi, '')
            .replace(/Zee News?/gi, '')
            .replace(/NDTV?/gi, '')
            .replace(/CNN News18?/gi, '')
            .replace(/Times Now?/gi, '')
            .replace(/ETV Bharat?/gi, '')
            .replace(/India Today?/gi, '')
            .replace(/News18?/gi, '')
            .replace(/Republic TV?/gi, '')
            .replace(/Aaj Tak?/gi, '')
            .replace(/DD News?/gi, '')
            .replace(/Mirror Now?/gi, '')
            .replace(/ET Now?/gi, '')
            .replace(/jagbani?/gi, '')
            .replace(/punjabi jagran?/gi, '')
            .replace(/The Tribune?/gi, '')
            .replace(/Indian Express?/gi, '')
            .replace(/Hindustan Times?/gi, '')
            .replace(/Times of India?/gi, '')
            .replace(/Daily Post?/gi, '')
            // Remove common source patterns
            .replace(/\(source:.*?\)/gi, '')
            .replace(/source:.*?(?=\.|$)/gi, '')
            .replace(/\- source:.*?(?=\.|$)/gi, '')
            .replace(/via.*?(?=\.|$)/gi, '')
            .replace(/\(via.*?\)/gi, '')
            .replace(/courtesy:.*?(?=\.|$)/gi, '')
            .replace(/\(courtesy:.*?\)/gi, '')
            .replace(/reports?:.*?(?=\.|$)/gi, '')
            .replace(/\(reports?:.*?\)/gi, '')
            // Remove copyright and attribution
            .replace(/©.*?(?=\.|$)/gi, '')
            .replace(/copyright.*?(?=\.|$)/gi, '')
            .replace(/all rights reserved.*?(?=\.|$)/gi, '')
            // Remove URLs
            .replace(/https?:\/\/\S+/g, '')
            // Remove common separator patterns that might contain source info
            .replace(/[-–—]\s*[A-Z][a-z\s]+(?:News|TV|Media|Times|Express|Post|Tribune).*$/gi, '')
            .replace(/[-–—]\s*[A-Z]{2,}.*$/gi, '')
            // Clean up spacing and punctuation
            .replace(/\s+/g, ' ')
            .replace(/\s+\./g, '.')
            .replace(/\s+,/g, ',')
            .replace(/\s+:/g, ':')
            .replace(/^[-–—\s]+/, '')
            .replace(/[-–—\s]+$/, '')
            .trim();
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return '';
        }
    };

    if (!sliderNews.length) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: { xs: '400px', md: '500px' },
                overflow: 'hidden'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Main Slider */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <Box
                            sx={{
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Background Image */}
                            <CardMedia
                                component="div"
                                sx={{
                                    height: '100%',
                                    position: 'relative',
                                    backgroundImage: sliderNews[currentSlide]?.featuredImage?.url
                                        ? `url(${sliderNews[currentSlide].featuredImage.url.startsWith('http')
                                            ? sliderNews[currentSlide].featuredImage.url
                                            : `https://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com${sliderNews[currentSlide].featuredImage.url}`})`
                                        : 'linear-gradient(135deg, #ff4757 0%, #c41e3a 50%, #8b0000 100%)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%)',
                                        zIndex: 1
                                    }
                                }}
                            />

                            {/* Content Overlay */}
                            <CardContent
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    p: { xs: 4, md: 6, lg: 8 },
                                    pb: { xs: 5, md: 7, lg: 9 },
                                    zIndex: 2,
                                    color: 'white'
                                }}
                            >
                                <Box sx={{ mb: 2 }}>
                                    <Chip
                                        label="BREAKING NEWS"
                                        sx={{
                                            backgroundColor: '#c41e3a',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem',
                                            mb: 2
                                        }}
                                    />
                                </Box>

                                <Typography
                                    variant={isMobile ? 'h3' : 'h2'}
                                    component="h1"
                                    sx={{
                                        fontWeight: 'bold',
                                        mb: 3,
                                        color: 'white',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                                        display: '-webkit-box',
                                        WebkitLineClamp: { xs: 3, md: 4 },
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        fontSize: { xs: '1.8rem', md: '3rem', lg: '3.5rem' },
                                        lineHeight: { xs: 1.4, md: 1.6 }
                                    }}
                                >
                                    {cleanContent(sliderNews[currentSlide]?.title || '')}
                                </Typography>

                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 4,
                                        color: 'rgba(255,255,255,0.95)',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                        display: { xs: 'none', md: '-webkit-box' },
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        fontSize: { md: '1.3rem', lg: '1.5rem' },
                                        fontWeight: 400,
                                        lineHeight: 1.4
                                    }}
                                >
                                    {cleanContent(sliderNews[currentSlide]?.excerpt || '')}
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: 2
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTime sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                            {formatDate(sliderNews[currentSlide]?.createdAt)}
                                        </Typography>
                                    </Box>

                                    <Button
                                        component={RouterLink}
                                        to={`/news/${sliderNews[currentSlide]?.slug}`}
                                        variant="contained"
                                        startIcon={<PlayArrow />}
                                        sx={{
                                            backgroundColor: '#c41e3a',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            px: 3,
                                            py: 1.5,
                                            textTransform: 'uppercase',
                                            fontSize: '0.875rem',
                                            '&:hover': {
                                                backgroundColor: '#8b0000',
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Read Full Story
                                    </Button>
                                </Box>
                            </CardContent>
                        </Box>
                    </motion.div>
                </AnimatePresence>
            </Box>

            {/* Navigation Arrows */}
            <IconButton
                onClick={goToPrevious}
                sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#c41e3a',
                    zIndex: 3,
                    '&:hover': {
                        backgroundColor: 'white',
                        transform: 'translateY(-50%) scale(1.1)'
                    },
                    transition: 'all 0.3s ease'
                }}
            >
                <ChevronLeft />
            </IconButton>

            <IconButton
                onClick={goToNext}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#c41e3a',
                    zIndex: 3,
                    '&:hover': {
                        backgroundColor: 'white',
                        transform: 'translateY(-50%) scale(1.1)'
                    },
                    transition: 'all 0.3s ease'
                }}
            >
                <ChevronRight />
            </IconButton>

            {/* Slide Indicators */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1,
                    zIndex: 3
                }}
            >
                {sliderNews.map((_, index) => (
                    <Box
                        key={index}
                        onClick={() => goToSlide(index)}
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: index === currentSlide ? '#c41e3a' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: index === currentSlide ? '#c41e3a' : 'rgba(255,255,255,0.8)',
                                transform: 'scale(1.2)'
                            }
                        }}
                    />
                ))}
            </Box>

            {/* Slide Counter */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    zIndex: 3
                }}
            >
                {currentSlide + 1} / {sliderNews.length}
            </Box>
        </Box>
    );
};

export default NewsSlider;
