import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  RefreshControl,
  Animated,
  Platform,
  Modal
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Audio, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
// WebView import - conditionally imported based on platform
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

// --- Notification Configuration ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// --- App Theme & Configuration ---
const COLORS = {
  primary: '#DC143C',        // Crimson Red
  primaryDark: '#B71C1C',    // Dark Red
  primaryLight: '#FF6B6B',   // Light Red
  secondary: '#FF4444',      // Bright Red
  accent: '#E57373',         // Soft Red
  white: '#FFFFFF',          // Pure White
  offWhite: '#FAFAFA',       // Off White
  lightGray: '#F5F5F5',      // Very Light Gray
  mediumGray: '#BDBDBD',     // Medium Gray
  darkGray: '#424242',       // Dark Gray
  black: '#212121',          // Near Black
  shadow: 'rgba(220, 20, 60, 0.3)', // Red shadow
  overlay: 'rgba(0, 0, 0, 0.5)',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
};

// Theme Context (simplified)
const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return a default theme instead of throwing error
    return {
      currentColors: COLORS
    };
  }
  return context;
};

// --- API Configuration ---
// NOTE: If you encounter CORS errors during development, make sure your backend server
// at 5whmedia.com allows requests from the Expo development server (localhost:8081).
// Add this origin to your backend CORS configuration.
const API_BASE_URL = 'https://5whmedia.com/app/fetch';
const LIVE_API_URL = 'https://5whmedia.com/api/live';
const RADIO_API_URL = 'https://5whmedia.com/api/app/radio';
const API_TOKEN = 'APPFETCHCOMMAND!@!@!';

// Development mode detection
const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;

// --- Screen Components ---

// Contact Screen - Combined with About
function ContactScreen() {
    const [activeTab, setActiveTab] = useState('contact');

    return (
        <View style={styles.container}>
            <StunningHeader title="Contact & About" />
            
            {/* Simple Tab Switcher */}
            <View style={styles.simpleTabContainer}>
                <TouchableOpacity 
                    style={[styles.simpleTab, activeTab === 'contact' && styles.simpleActiveTab]}
                    onPress={() => setActiveTab('contact')}
                >
                    <Text style={[styles.simpleTabText, activeTab === 'contact' && styles.simpleActiveTabText]}>
                        Contact
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.simpleTab, activeTab === 'about' && styles.simpleActiveTab]}
                    onPress={() => setActiveTab('about')}
                >
                    <Text style={[styles.simpleTabText, activeTab === 'about' && styles.simpleActiveTabText]}>
                        About
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'contact' ? (
                    /* Contact Tab Content */
                    <MindBlowingCard style={styles.contactCard}>
                        <View style={styles.contactHeader}>
                            <Ionicons name="mail" size={48} color={COLORS.primary} />
                            <Text style={styles.contactTitle}>Get In Touch</Text>
                            <Text style={styles.contactSubtitle}>We'd love to hear from you</Text>
                        </View>

                        <View style={styles.contactInfo}>
                            <TouchableOpacity 
                                style={styles.contactItem}
                                onPress={() => openLink('mailto:fivewhnewsmedia@gmail.com')}
                            >
                                <Ionicons name="mail-outline" size={24} color={COLORS.primary} />
                                <View style={styles.contactItemText}>
                                    <Text style={styles.contactItemTitle}>Email</Text>
                                    <Text style={styles.contactItemValue}>fivewhnewsmedia@gmail.com</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.contactItem}
                                onPress={() => openLink('tel:+919876297823')}
                            >
                                <Ionicons name="call-outline" size={24} color={COLORS.primary} />
                                <View style={styles.contactItemText}>
                                    <Text style={styles.contactItemTitle}>Phone (India)</Text>
                                    <Text style={styles.contactItemValue}>+91 987-62-97823</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.contactItem}
                                onPress={() => openLink('tel:+17802437033')}
                            >
                                <Ionicons name="call-outline" size={24} color={COLORS.primary} />
                                <View style={styles.contactItemText}>
                                    <Text style={styles.contactItemTitle}>Phone (Canada)</Text>
                                    <Text style={styles.contactItemValue}>+1 780-243-7033</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.contactItem}
                                onPress={() => openLink('https://5whmedia.com')}
                            >
                                <Ionicons name="globe-outline" size={24} color={COLORS.primary} />
                                <View style={styles.contactItemText}>
                                    <Text style={styles.contactItemTitle}>Website</Text>
                                    <Text style={styles.contactItemValue}>Visit 5whmedia.com</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                            </TouchableOpacity>

                            <View style={styles.contactItem}>
                                <Ionicons name="location-outline" size={24} color={COLORS.primary} />
                                <View style={styles.contactItemText}>
                                    <Text style={styles.contactItemTitle}>Locations</Text>
                                    <Text style={styles.contactItemValue}>India & Canada</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.socialMedia}>
                            <Text style={styles.socialTitle}>Follow Us</Text>
                            <View style={styles.socialButtons}>
                                <TouchableOpacity 
                                    style={styles.socialButton}
                                    onPress={() => openLink('https://www.facebook.com/5whmedia/')}
                                >
                                    <Ionicons name="logo-facebook" size={24} color={COLORS.white} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.socialButton}
                                    onPress={() => openLink('http://instagram.com/5whmedia')}
                                >
                                    <Ionicons name="logo-instagram" size={24} color={COLORS.white} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.socialButton}
                                    onPress={() => openLink('https://www.youtube.com/@5wh_media')}
                                >
                                    <Ionicons name="logo-youtube" size={24} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </MindBlowingCard>
                ) : (
                    /* About Tab Content */
                    <>
                        <MindBlowingCard style={styles.aboutCard}>
                            <View style={styles.aboutHeader}>
                                <Image 
                                    source={{ uri: 'https://placehold.co/200x100/DC143C/FFFFFF?text=5WH+MEDIA' }}
                                    style={styles.aboutLogo}
                                />
                                <Text style={styles.aboutTitle}>5WH Media</Text>
                                <Text style={styles.aboutSubtitle}>Your Voice, Your Stories</Text>
                            </View>

                            <View style={styles.aboutContent}>
                                <Text style={styles.aboutText}>
                                    5WH Media is a premier broadcasting company dedicated to bringing you the latest news, 
                                    engaging talk shows, and quality entertainment. We believe in the power of storytelling 
                                    and the importance of staying connected with our community.
                                </Text>

                                <Text style={styles.aboutSectionTitle}>Our Mission</Text>
                                <Text style={styles.aboutText}>
                                    To provide accurate, timely, and engaging content that informs, entertains, and connects 
                                    our audience. We strive to be the voice of the community and a platform for diverse perspectives.
                                </Text>

                                <Text style={styles.aboutSectionTitle}>What We Offer</Text>
                                <View style={styles.featuresList}>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="radio" size={20} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Live Radio Broadcasting</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="newspaper" size={20} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Breaking News Coverage</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="videocam" size={20} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Live Video Streams</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="book" size={20} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Cultural Content</Text>
                                    </View>
                                </View>
                            </View>
                        </MindBlowingCard>

                        <MindBlowingCard style={styles.statsCard}>
                            <Text style={styles.statsTitle}>Our Impact</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>50K+</Text>
                                    <Text style={styles.statLabel}>Daily Listeners</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>24/7</Text>
                                    <Text style={styles.statLabel}>Live Broadcasting</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>100+</Text>
                                    <Text style={styles.statLabel}>News Stories Daily</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>5</Text>
                                    <Text style={styles.statLabel}>Years Experience</Text>
                                </View>
                            </View>
                        </MindBlowingCard>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

// Podcasts & Videos Screen
function PodcastsVideosScreen() {
    const [podcasts, setPodcasts] = useState([]);
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('podcasts');

    useEffect(() => {
        const loadContent = async () => {
            try {
                // Try to fetch real data first
                const podcastsData = await fetchWithToken('podcasts');
                const videosData = await fetchWithToken('videos');
                
                if (podcastsData && podcastsData.data) {
                    setPodcasts(podcastsData.data);
                } else {
                    // Fallback podcast data
                    setPodcasts([
                        {
                            id: 1,
                            title: 'Morning Talk Show',
                            description: 'Daily discussions on current events and community news',
                            duration: '45 min',
                            date: 'Today',
                            thumbnail: 'https://placehold.co/300x200/DC143C/FFFFFF?text=Morning+Talk'
                        },
                        {
                            id: 2,
                            title: 'Tech Tuesday',
                            description: 'Weekly technology news and reviews',
                            duration: '30 min',
                            date: 'Tuesday',
                            thumbnail: 'https://placehold.co/300x200/DC143C/FFFFFF?text=Tech+Tuesday'
                        },
                        {
                            id: 3,
                            title: 'Community Spotlight',
                            description: 'Featuring local businesses and community leaders',
                            duration: '25 min',
                            date: 'Wednesday',
                            thumbnail: 'https://placehold.co/300x200/DC143C/FFFFFF?text=Community'
                        }
                    ]);
                }

                if (videosData && videosData.data) {
                    setVideos(videosData.data);
                } else {
                    // Fallback video data
                    setVideos([
                        {
                            id: 1,
                            title: 'Live News Broadcast',
                            description: 'Watch our latest news broadcast live',
                            duration: '1h 15min',
                            views: '2.3K views',
                            thumbnail: 'https://placehold.co/300x200/DC143C/FFFFFF?text=News+Live'
                        },
                        {
                            id: 2,
                            title: 'Interview Special',
                            description: 'Exclusive interview with city mayor',
                            duration: '35 min',
                            views: '1.8K views',
                            thumbnail: 'https://placehold.co/300x200/DC143C/FFFFFF?text=Interview'
                        },
                        {
                            id: 3,
                            title: 'Weather Update',
                            description: 'Weekly weather forecast and analysis',
                            duration: '10 min',
                            views: '950 views',
                            thumbnail: 'https://placehold.co/300x200/DC143C/FFFFFF?text=Weather'
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error loading media content:', error);
            }
            setIsLoading(false);
        };

        loadContent();
    }, []);

    const renderPodcasts = () => (
        <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {podcasts.length > 0 ? (
                podcasts.map((podcast) => (
                    <MindBlowingCard key={podcast.id} style={styles.mediaCard}>
                        <View style={styles.mediaContent}>
                            <Image 
                                source={{ uri: podcast.thumbnail }}
                                style={styles.mediaThumbnail}
                            />
                            <View style={styles.mediaInfo}>
                                <Text style={styles.mediaTitle} numberOfLines={2}>{podcast.title}</Text>
                                <Text style={styles.mediaDescription} numberOfLines={2}>{podcast.description}</Text>
                                <View style={styles.mediaMeta}>
                                    <Text style={styles.mediaMetaText}>{podcast.duration}</Text>
                                    <Text style={styles.mediaMetaText}>•</Text>
                                    <Text style={styles.mediaMetaText}>{podcast.date}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.playButton}>
                                <Ionicons name="play" size={24} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </MindBlowingCard>
                ))
            ) : (
                <EmptyState
                    icon="mic-outline"
                    title="No Podcasts Available"
                    message="We're preparing amazing podcast episodes for you. Check back soon for great audio content!"
                />
            )}
        </ScrollView>
    );

    const renderVideos = () => (
        <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {videos.length > 0 ? (
                videos.map((video) => (
                    <MindBlowingCard key={video.id} style={styles.mediaCard}>
                        <View style={styles.mediaContent}>
                            <Image 
                                source={{ uri: video.thumbnail }}
                                style={styles.mediaThumbnail}
                            />
                            <View style={styles.mediaInfo}>
                                <Text style={styles.mediaTitle} numberOfLines={2}>{video.title}</Text>
                                <Text style={styles.mediaDescription} numberOfLines={2}>{video.description}</Text>
                                <View style={styles.mediaMeta}>
                                    <Text style={styles.mediaMetaText}>{video.duration}</Text>
                                    <Text style={styles.mediaMetaText}>•</Text>
                                    <Text style={styles.mediaMetaText}>{video.views}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.playButton}>
                                <Ionicons name="play-circle" size={24} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </MindBlowingCard>
                ))
            ) : (
                <EmptyState
                    icon="videocam-outline"
                    title="No Videos Available"
                    message="We're creating engaging video content for you. Stay tuned for exciting videos!"
                />
            )}
        </ScrollView>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <StunningHeader title="Podcasts & Videos" />
                <LoadingSpinner text="Loading media content..." />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StunningHeader title="Podcasts & Videos" />
            
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'podcasts' && styles.activeTab]}
                    onPress={() => setActiveTab('podcasts')}
                >
                    <Ionicons 
                        name="mic" 
                        size={20} 
                        color={activeTab === 'podcasts' ? COLORS.white : COLORS.primary} 
                    />
                    <Text style={[
                        styles.tabText, 
                        activeTab === 'podcasts' && styles.activeTabText
                    ]}>Podcasts</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
                    onPress={() => setActiveTab('videos')}
                >
                    <Ionicons 
                        name="videocam" 
                        size={20} 
                        color={activeTab === 'videos' ? COLORS.white : COLORS.primary} 
                    />
                    <Text style={[
                        styles.tabText, 
                        activeTab === 'videos' && styles.activeTabText
                    ]}>Videos</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'podcasts' ? renderPodcasts() : renderVideos()}
        </View>
    );
}

// --- Helper Functions & Components ---
const fetchNews = async () => {
    try {
    console.log('Fetching news from: https://5whmedia.com/api/news');
        
        // Try with no-cors mode first (will get opaque response)
        let response;
        try {
            response = await fetch('https://5whmedia.com/api/news', {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (corsError) {
            console.warn('CORS request failed, trying no-cors mode...');
            // Fallback to no-cors mode
            response = await fetch('https://5whmedia.com/api/news', {
                method: 'GET',
                mode: 'no-cors',
            });
        }

        if (response.type === 'opaque') {
            console.warn('Received opaque response due to CORS. Cannot read data.');
            throw new Error('CORS_OPAQUE_RESPONSE');
        }

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('News data received:', data);
        return data;
        
    } catch (error) {
        console.error('Error fetching news:', error);
        
        // Provide helpful CORS error message and fallback data
        console.warn('===========================================');
        console.warn('🚨 CORS ERROR - NEWS SERVER CONFIGURATION NEEDED 🚨');
        console.warn('===========================================');
        console.warn('Your news server at 5whmedia.com needs CORS configuration.');
        console.warn('Add these headers to your news server responses:');
        console.warn('');
        console.warn('For Express.js servers, add this before your routes:');
        console.warn('app.use((req, res, next) => {');
        console.warn('  res.header("Access-Control-Allow-Origin", "https://localhost:8081");');
        console.warn('  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");');
        console.warn('  res.header("Access-Control-Allow-Headers", "Content-Type");');
        console.warn('  if (req.method === "OPTIONS") res.sendStatus(200);');
        console.warn('  else next();');
        console.warn('});');
        console.warn('===========================================');
        
        // Return fallback news data so the app still works
        return [
            {
                id: 1,
                title: '🔧 CORS Configuration Required',
                subtitle: 'News server needs CORS headers',
                content: 'Your news server at 5whmedia.com is blocking requests from localhost:8081 due to CORS policy. Please add the required headers to your news server.',
                timestamp: new Date().toISOString(),
                category: 'Technical Issue',
                author: 'System'
            },
            {
                id: 2,
                title: '💡 How to Fix CORS Error',
                subtitle: 'Step-by-step solution',
                content: 'Add Access-Control-Allow-Origin: https://localhost:8081 header to your news server responses. If using Express.js, use the middleware shown in the console.',
                timestamp: new Date().toISOString(),
                category: 'Solution',
                author: 'System'
            },
            {
                id: 3,
                title: '📡 Testing News Connection',
                subtitle: 'Fallback data is working',
                content: 'This is fallback news data. Once you fix CORS on your news server, real news data will appear here.',
                timestamp: new Date().toISOString(),
                category: 'Test',
                author: 'System'
            }
        ];
    }
};

const fetchWithToken = async (endpoint, queryParams = {}) => {
    try {
        // Build URL with query parameters
        const url = new URL(`${API_BASE_URL}/${endpoint}`);
        Object.keys(queryParams).forEach(key => {
            url.searchParams.append(key, queryParams[key]);
        });
        
        console.log(`🔄 Fetching from: ${url.toString()}`);
        console.log(`🔑 Authorization header: Bearer ${API_TOKEN}`);
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        console.log(`📊 Response status: ${response.status} ${response.statusText}`);
        console.log(`📊 Response headers:`, response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ HTTP error! status: ${response.status}, body: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();
        console.log(`✅ Successfully fetched ${endpoint}:`, data);
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        
        // Check if it's a CORS error
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            console.warn(`🚨 CORS ERROR DETECTED for ${endpoint}:`);
            console.warn(`🔧 Your backend server needs to allow requests from: ${window.location?.origin || 'https://localhost:8081'}`);
            console.warn(`📝 Add this to your backend CORS configuration:`);
            console.warn(`   - https://localhost:8081 (Expo dev server)`);
            console.warn(`   - https://localhost:19006 (Expo web)`);
            
            if (isDevelopment) {
                console.warn(`🔄 Using fallback data for development...`);
                return null; // Return null to trigger fallback data
            }
        }
        
        throw error;
    }
};

// Enhanced radio config fetch with multiple fallbacks & diagnostics
const RADIO_ENDPOINT_CANDIDATES = [
    RADIO_API_URL,                                 // configured constant
    'https://5whmedia.com/api/radio',
    'https://5whmedia.com/api/app/radio/config',
    'https://5whmedia.com/api/radio/config',
    'https://5whmedia.com/app/radio',
    `${API_BASE_URL}/radio`,                       // token-protected fetch endpoint
];

const normalizeRadioData = (data) => {
    if (!data) return null;
    // Sometimes API may wrap in data / result
    const core = data.streamUrl ? data : data.data || data.result || data.radio || data.config || {};
    if (!core || !core.streamUrl) return null;
    return {
        streamUrl: core.streamUrl,
        title: core.title || core.name || '5WH Live Radio',
        artist: core.artist || core.currentShow || 'Live Stream',
        isLive: core.isLive !== undefined ? core.isLive : true,
        currentShow: core.currentShow || core.program || 'Live Broadcast',
        _raw: data
    };
};

const fetchRadioConfig = async () => {
    console.log('🔎 Attempting to load radio config from candidates...');

    // Allow override via (future) AsyncStorage or global (dev quick test)
    try {
        if (global.RADIO_STREAM_OVERRIDE) {
            console.warn('⚠️ Using global RADIO_STREAM_OVERRIDE');
            return {
                streamUrl: global.RADIO_STREAM_OVERRIDE,
                title: '5WH Live Radio (Override)',
                artist: 'Override Source',
                isLive: true,
                currentShow: 'Override'
            };
        }
    } catch (_) {}

    const attemptLogs = [];
    for (const endpoint of RADIO_ENDPOINT_CANDIDATES) {
        if (!endpoint) continue;
        try {
            const headers = { 'Content-Type': 'application/json' };
            // If using the token-based fetch path, add Authorization header
            if (endpoint.startsWith(API_BASE_URL)) {
                headers['Authorization'] = `Bearer ${API_TOKEN}`;
            }
            console.log(`🎯 Trying radio endpoint: ${endpoint}`);
            const res = await fetch(endpoint, { method: 'GET', headers });
            const statusInfo = `${res.status} ${res.statusText}`;
            let bodyText = '';
            if (!res.ok) {
                try { bodyText = await res.text(); } catch (_) {}
                attemptLogs.push({ endpoint, status: statusInfo, body: bodyText.slice(0, 300) });
                if (res.status === 404) {
                    console.warn(`🟥 404 at ${endpoint} – trying next candidate`);
                    continue; // try next
                } else {
                    console.warn(`🟧 Non-OK (${statusInfo}) at ${endpoint}, continuing...`);
                    continue;
                }
            }
            // Parse JSON
            let json;
            try { json = await res.json(); } catch (e) {
                attemptLogs.push({ endpoint, status: statusInfo, body: 'Invalid JSON' });
                continue;
            }
            attemptLogs.push({ endpoint, status: statusInfo, body: 'OK', keys: Object.keys(json) });
            const normalized = normalizeRadioData(json);
            if (normalized) {
                console.log('✅ Radio config loaded from:', endpoint, '\n🔑 Keys:', Object.keys(json));
                return { ...normalized, sourceEndpoint: endpoint };
            } else {
                console.warn(`⚠️ Endpoint ${endpoint} returned JSON but no usable streamUrl. Keys:`, Object.keys(json));
            }
        } catch (err) {
            attemptLogs.push({ endpoint, error: err.message });
            console.warn(`❌ Error fetching ${endpoint}:`, err.message);
            continue;
        }
    }

    console.error('🚫 All radio endpoint attempts failed. Summary below:');
    console.table ? console.table(attemptLogs) : console.log(attemptLogs);
    console.warn('🛠  Troubleshooting tips:');
    console.warn('1. Confirm the correct radio API URL in server routes.');
    console.warn('2. If the working “invoke” method is POST, expose a GET endpoint or adjust this client to POST.');
    console.warn('3. Ensure CORS allows the Expo dev origin.');
    console.warn('4. Return JSON with a top-level streamUrl field.');
    console.warn('5. Sample minimal JSON: { "streamUrl": "https://example.com/live.mp3", "title": "5WH Live" }');

    return null; // triggers fallback player
};

const fetchLiveStreams = async (queryParams = {}) => {
    try {
        // Build URL with query parameters
        const url = new URL(LIVE_API_URL);
        Object.keys(queryParams).forEach(key => {
            url.searchParams.append(key, queryParams[key]);
        });
        
        console.log(`🔄 Fetching live streams from: ${url.toString()}`);
        console.log(`🔑 Authorization header: Bearer ${API_TOKEN}`);
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        console.log(`📊 Live streams response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Live streams HTTP error! status: ${response.status}, body: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();
        console.log(`✅ Successfully fetched live streams:`, data);
        return data;
    } catch (error) {
        console.error('Error fetching live streams:', error);
        
        // Check if it's a CORS error
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            console.warn(`🚨 CORS ERROR DETECTED for live streams:`);
            console.warn(`🔧 Your backend server needs to allow requests from: ${window.location?.origin || 'https://localhost:8081'}`);
            
            if (isDevelopment) {
                console.warn(`🔄 Using fallback data for development...`);
                return null; // Return null to trigger fallback data
            }
        }
        
        throw error;
    }
};

const openLink = (url) => Linking.openURL(url).catch(err => console.error("Couldn't load page", err));

const openYouTubePlayer = (youtubeId) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    Linking.openURL(youtubeUrl).catch(err => console.error("Couldn't open YouTube", err));
};

const paginateArray = (array, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return array.slice(startIndex, endIndex);
};

const getTotalPages = (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
};

// --- Notification Functions ---
const getNotificationSound = (soundType) => {
    switch (soundType) {
        case 'breaking': return 'breaking_news.wav';
        case 'urgent': return 'urgent_alert.wav';
        case 'live': return 'live_stream.wav';
        default: return 'default_notification.wav';
    }
};

const playNotificationSound = async (soundType) => {
    try {
        if (Platform.OS !== 'web') {
            // Play notification sound using Audio
            const { sound } = await Audio.Sound.createAsync(
                { uri: `./assets/sounds/${getNotificationSound(soundType)}` },
                { shouldPlay: true, volume: 0.8 }
            );
            // Unload sound after playing
            setTimeout(() => {
                sound.unloadAsync();
            }, 3000);
        }
    } catch (error) {
        console.log('Error playing notification sound:', error);
    }
};

const showLocalNotification = async (notification) => {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: notification.title,
                body: notification.message,
                data: { 
                    type: notification.type,
                    id: notification.id,
                    url: notification.url 
                },
                sound: Platform.OS === 'ios' ? getNotificationSound(notification.soundType) : 'default',
            },
            trigger: null, // Show immediately
        });
        
        // Play custom sound
        playNotificationSound(notification.soundType);
        
        // Add haptic feedback
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    } catch (error) {
        console.error('Error showing notification:', error);
    }
};

const checkForNotifications = async () => {
    try {
        console.log('🔔 Checking for new notifications...');
        const lastCheck = await AsyncStorage.getItem('lastNotificationCheck');
        const response = await fetch(
            `https://5whmedia.com/api/notifications/latest?lastCheck=${lastCheck}`
        );
        const data = await response.json();
        
        if (data.success && data.notifications && data.notifications.length > 0) {
            console.log(`🔔 Found ${data.notifications.length} new notifications`);
            
            // Show notifications with sound
            data.notifications.forEach(notification => {
                console.log('🔔 Showing notification:', notification.title);
                showLocalNotification(notification);
            });
            
            // Update last check time
            await AsyncStorage.setItem('lastNotificationCheck', data.serverTime);
        } else {
            console.log('🔔 No new notifications');
        }
    } catch (error) {
        console.error('❌ Error checking notifications:', error);
    }
};

const StunningHeader = ({ title, rightComponent }) => {
    return (
    <View style={styles.stunningHeader}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{title}</Text>
            {rightComponent && <View style={styles.headerRight}>{rightComponent}</View>}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const MindBlowingCard = ({ children, style, onPress, elevated = true }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };
  
  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };
  
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <CardComponent 
        style={[
          elevated ? styles.elevatedCard : styles.flatCard, 
          style
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
};

const BeautifulButton = ({ title, onPress, variant = 'primary', icon, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };
  
  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButtonText;
      default:
        return styles.buttonText;
    }
  };
  
  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={variant === 'outline' ? [COLORS.white, COLORS.white] : [COLORS.primary, COLORS.primaryDark]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {icon && <Ionicons name={icon} size={20} color={variant === 'outline' ? COLORS.primary : COLORS.white} style={styles.buttonIcon} />}
          <Text style={getTextStyle()}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const LoadingSpinner = ({ text = "Loading amazing content..." }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>{text}</Text>
  </View>
);

const EmptyState = ({ icon, title, message, actionText, onActionPress }) => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.emptyStateIconContainer}>
      <Ionicons name={icon} size={64} color={COLORS.mediumGray} />
    </View>
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateMessage}>{message}</Text>
    {actionText && onActionPress && (
      <TouchableOpacity style={styles.emptyStateButton} onPress={onActionPress}>
        <Text style={styles.emptyStateButtonText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// --- Screen Components ---

function HomeScreen() {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [radioInfo, setRadioInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [volume, setVolume] = useState(1);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        const setupAudioPlayer = async (streamUrl) => {
            try {
                await Audio.setAudioModeAsync({ 
                  allowsRecordingIOS: false, 
                  playsInSilentModeIOS: true, 
                  shouldDuckAndroid: true, 
                  playThroughEarpieceAndroid: false 
                });
                const { sound } = await Audio.Sound.createAsync(
                  { uri: streamUrl }, 
                  { shouldPlay: false }
                );
                setSound(sound);
            } catch (error) { 
                console.error("Error setting up audio player:", error); 
            }
        };

        const useFallbackRadioData = async () => {
            const fallbackRadioData = {
                title: '5WH Live Radio',
                artist: 'Live Stream',
                streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
                isLive: true,
                currentShow: 'Live Broadcast',
                description: 'Live radio stream'
            };
            setRadioInfo(fallbackRadioData);
            await setupAudioPlayer(fallbackRadioData.streamUrl);
        };

        const loadRadio = async () => {
            try {
                // Try to fetch from the new radio API
                const data = await fetchRadioConfig();
                if (data && data.streamUrl) {
                    setRadioInfo(data);
                    await setupAudioPlayer(data.streamUrl);
                } else {
                    // Use fallback data if no valid data received
                    await useFallbackRadioData();
                }
            } catch (error) {
                console.warn('Failed to load radio data from server, using fallback data');
                await useFallbackRadioData();
            }
            setIsLoading(false);
            
            // Stunning entrance animations
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
              }),
            ]).start();
        };
        
        loadRadio();
        return () => { sound?.unloadAsync(); };
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const togglePlayback = async () => {
        if (!sound) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        isPlaying ? await sound.pauseAsync() : await sound.playAsync();
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = async (value) => {
        if (sound) { 
          await sound.setVolumeAsync(value); 
          setVolume(value); 
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <StunningHeader title="5WH Live Radio" />
                <LoadingSpinner />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StunningHeader 
                title="5WH Live Radio" 
            />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }}>
                    {radioInfo && sound ? (
                        /* Hero Radio Card */
                        <MindBlowingCard style={styles.heroRadioCard}>
                            <View style={styles.radioImageContainer}>
                                <Image 
                                    source={{ uri: 'https://placehold.co/400x300/DC143C/FFFFFF?text=5WH+LIVE' }} 
                                    style={styles.radioImage} 
                                />
                                <LinearGradient
                                    colors={['transparent', COLORS.overlay]}
                                    style={styles.radioOverlay}
                                />
                                <View style={styles.liveIndicator}>
                                    <Text style={styles.liveText}>LIVE NOW</Text>
                                </View>
                            </View>
                            
                            <View style={styles.radioInfo}>
                                <Text style={styles.radioTitle}>{radioInfo?.title}</Text>
                                <Text style={styles.radioSubtitle}>{radioInfo?.artist}</Text>
                                
                                <View style={styles.playButtonContainer}>
                                    <TouchableOpacity 
                                        style={styles.playButton} 
                                        onPress={togglePlayback}
                                    >
                                        <LinearGradient
                                            colors={[COLORS.primary, COLORS.primaryDark]}
                                            style={styles.playButtonGradient}
                                        >
                                            <Ionicons 
                                                name={isPlaying ? 'pause' : 'play'} 
                                                size={40} 
                                                color={COLORS.white} 
                                            />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={styles.volumeContainer}>
                                    <TouchableOpacity 
                                        style={styles.volumeButton}
                                        onPress={() => handleVolumeChange(Math.max(0, volume - 0.2))}
                                    >
                                        <Ionicons name="volume-low" size={20} color={COLORS.mediumGray} />
                                    </TouchableOpacity>
                                    
                                    <View style={styles.volumeDisplay}>
                                        <View style={styles.volumeTrack}>
                                            <View 
                                                style={[
                                                    styles.volumeFill, 
                                                    { width: `${volume * 100}%` }
                                                ]} 
                                            />
                                        </View>
                                    </View>
                                    
                                    <TouchableOpacity 
                                        style={styles.volumeButton}
                                        onPress={() => handleVolumeChange(Math.min(1, volume + 0.2))}
                                    >
                                        <Ionicons name="volume-high" size={20} color={COLORS.mediumGray} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </MindBlowingCard>
                    ) : (
                        /* Radio Error State */
                        <EmptyState
                            icon="radio-outline"
                            title="Radio Not Available"
                            message="We're experiencing technical difficulties with our live radio stream. Please try refreshing or check back later."
                            actionText="Refresh"
                            onActionPress={onRefresh}
                        />
                    )}
                </Animated.View>
            </ScrollView>
        </View>
    );
}


function NewsListScreen() {
    const [recordedNews, setRecordedNews] = useState([]);
    const [liveStreams, setLiveStreams] = useState([]);
    const [selectedNews, setSelectedNews] = useState(null);
    const [activeStream, setActiveStream] = useState(null);
    const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);
    const [currentStreamUrl, setCurrentStreamUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreNews, setHasMoreNews] = useState(true);
    const [totalNewsCount, setTotalNewsCount] = useState(0);
    const [currentStreamsPage, setCurrentStreamsPage] = useState(1);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const loadMoreAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(50)).current;

    const NEWS_PER_PAGE = 8;
    const STREAMS_PER_PAGE = 5;

    // Function to open video player in-app (embedded)
    const openInAppVideoPlayer = (streamUrl, streamTitle) => {
        console.log('🎬 Opening embedded video player for:', streamTitle);
        console.log('🎬 Stream URL:', streamUrl);
        console.log('🎬 Platform:', Platform.OS);
        
        // Convert YouTube embed URL to embedded format
        let embedUrl = streamUrl;
        if (streamUrl.includes('youtube.com/embed/')) {
            // Already in embed format, remove autoplay for embedded view
            embedUrl = streamUrl.includes('?') 
                ? `${streamUrl}&controls=1&rel=0`
                : `${streamUrl}?controls=1&rel=0`;
        } else if (streamUrl.includes('youtube.com/watch?v=')) {
            // Convert watch URL to embed URL
            const videoId = streamUrl.split('v=')[1]?.split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}?controls=1&rel=0`;
        }
        
        setCurrentStreamUrl(embedUrl);
        setVideoPlayerVisible(true);
    };

    const closeVideoPlayer = () => {
        setVideoPlayerVisible(false);
        setCurrentStreamUrl(null);
    };

    useEffect(() => {
        const loadNews = async () => {
            try {
                console.log('Loading news data...');
                
                // Load initial news data - first page only
                const newsData = await fetchWithToken('news', { 
                    page: 1,
                    limit: NEWS_PER_PAGE
                });
                console.log('Initial news data loaded:', newsData);
                
                // Load streams data - fetch all available streams
                console.log('🔄 Fetching live streams...');
                const streamsData = await fetchLiveStreams({ 
                    limit: 100 
                });
                console.log('📡 Raw streams response:', streamsData);
                console.log('📡 Streams data type:', typeof streamsData);
                console.log('📡 Streams data keys:', streamsData ? Object.keys(streamsData) : 'null');
                
                if (streamsData && streamsData.success) {
                    console.log('✅ Live streams API call successful!');
                    console.log('📊 Streams count:', streamsData.count);
                    console.log('📊 Streams data length:', streamsData.data ? streamsData.data.length : 0);
                } else {
                    console.log('⚠️ Live streams API call failed or returned no success flag');
                }
                
                // Set news data with fallback
                if (newsData && newsData.success && Array.isArray(newsData.data) && newsData.data.length > 0) {
                    setRecordedNews(newsData.data);
                    setTotalNewsCount(newsData.total || newsData.data.length);
                    setHasMoreNews(newsData.data.length >= NEWS_PER_PAGE);
                    console.log('Set news items:', newsData.data.length, 'Total:', newsData.total);
                } else {
                    console.log('Using fallback news data');
                    setRecordedNews([
                        { 
                            id: 'fallback-1', 
                            title: 'Breaking: 5WH Media Updates', 
                            subtitle: 'Your trusted source for news is now more beautiful than ever.',
                            image: 'https://placehold.co/600x400/DC143C/ffffff?text=5WH+NEWS',
                            content: 'We have redesigned our news experience with stunning visuals and improved functionality.'
                        },
                        { 
                            id: 'fallback-2', 
                            title: 'Live Broadcasting Excellence', 
                            subtitle: 'Experience our enhanced live streaming platform.',
                            image: 'https://placehold.co/600x400/8B0000/ffffff?text=LIVE+NEWS',
                            content: 'Our live streaming platform now offers better quality and reliability for all our viewers.'
                        }
                    ]);
                }
                
                // Set streams data with fallback
                console.log('🔍 Processing streams data...');
                if (streamsData && streamsData.success && Array.isArray(streamsData.data) && streamsData.data.length > 0) {
                    console.log('✅ Using structured response format');
                    setLiveStreams(streamsData.data);
                    console.log('Set stream items:', streamsData.data.length);
                    console.log('First stream sample:', streamsData.data[0]);
                } else if (streamsData && Array.isArray(streamsData) && streamsData.length > 0) {
                    console.log('✅ Using direct array format');
                    // Fallback for direct array response
                    setLiveStreams(streamsData);
                    console.log('Set stream items (direct array):', streamsData.length);
                } else {
                    console.log('⚠️ No valid streams data, using fallback');
                    console.log('Streams data structure check:');
                    console.log('- streamsData exists:', !!streamsData);
                    console.log('- streamsData.success:', streamsData?.success);
                    console.log('- streamsData.data is array:', Array.isArray(streamsData?.data));
                    console.log('- streamsData.data length:', streamsData?.data?.length);
                    console.log('- streamsData is array:', Array.isArray(streamsData));
                    console.log('- streamsData length:', streamsData?.length);
                    console.log('Using fallback streams data');
                    setLiveStreams([
                        { 
                            id: 'stream-1', 
                            title: '5WH Live News', 
                            streamUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                            image: 'https://placehold.co/600x400/DC143C/ffffff?text=LIVE+NOW'
                        },
                        { 
                            id: 'stream-2', 
                            title: 'Evening Update', 
                            streamUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                            image: 'https://placehold.co/600x400/B91C1C/ffffff?text=EVENING+LIVE'
                        }
                    ]);
                }
                
            } catch (error) {
                console.error('Error loading data:', error);
                // Set fallback data on error
                setRecordedNews([
                    { 
                        id: 'error-1', 
                        title: 'News Service Temporarily Unavailable', 
                        subtitle: 'We are working to restore our news feed.',
                        image: 'https://placehold.co/600x400/DC143C/ffffff?text=SERVICE+UPDATE',
                        content: 'Our news service is temporarily experiencing issues. Please try refreshing or check back later.'
                    }
                ]);
                setLiveStreams([
                    { 
                        id: 'error-stream', 
                        title: 'Service Update Stream', 
                        streamUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                        image: 'https://placehold.co/600x400/DC143C/ffffff?text=SERVICE+UPDATE'
                    }
                ]);
            } finally {
                setIsLoading(false);
                
                // Fade in animation
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            }
        };
        
        loadNews();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        try {
            // Reset pagination and fetch first page
            setCurrentPage(1);
            const newsData = await fetchWithToken('news', { 
                page: 1,
                limit: NEWS_PER_PAGE
            });
            const streamsData = await fetchLiveStreams({ 
                limit: 100 
            });
            
            if (newsData && newsData.success && Array.isArray(newsData.data)) {
                setRecordedNews(newsData.data);
                setTotalNewsCount(newsData.total || newsData.data.length);
                setHasMoreNews(newsData.data.length >= NEWS_PER_PAGE);
            }
            if (streamsData && streamsData.success && Array.isArray(streamsData.data)) {
                setLiveStreams(streamsData.data);
            } else if (streamsData && Array.isArray(streamsData)) {
                setLiveStreams(streamsData);
            }
        } catch (error) {
            console.error('Error refreshing:', error);
        }
        
        setRefreshing(false);
    };

    const loadMoreNews = async () => {
        if (loadingMore || !hasMoreNews) return;
        
        setLoadingMore(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Reset slide animation
        slideUpAnim.setValue(50);
        
        // Animate load more button
        Animated.sequence([
            Animated.timing(loadMoreAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(loadMoreAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
        
        try {
            const nextPage = currentPage + 1;
            const newsData = await fetchWithToken('news', { 
                page: nextPage,
                limit: NEWS_PER_PAGE
            });
            
            if (newsData && newsData.success && Array.isArray(newsData.data)) {
                if (newsData.data.length > 0) {
                    // Animate new items sliding up
                    Animated.timing(slideUpAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }).start();
                    
                    setRecordedNews(prevNews => [...prevNews, ...newsData.data]);
                    setCurrentPage(nextPage);
                    setTotalNewsCount(newsData.total || (recordedNews.length + newsData.data.length));
                    setHasMoreNews(newsData.data.length >= NEWS_PER_PAGE);
                    
                    console.log('Loaded more news:', newsData.data.length, 'Total loaded:', recordedNews.length + newsData.data.length);
                } else {
                    setHasMoreNews(false);
                }
            } else {
                setHasMoreNews(false);
            }
        } catch (error) {
            console.error('Error loading more news:', error);
        }
        
        setLoadingMore(false);
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <StunningHeader title="News & Live Streams" />
                <LoadingSpinner text="Loading latest news..." />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StunningHeader 
                title="News & Live Streams" 
                rightComponent={
                    <TouchableOpacity 
                        style={styles.notificationBell}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            checkForNotifications();
                        }}
                    >
                        <Ionicons name="notifications" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                }
            />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Active Video Stream - Simplified */}
                    {activeStream && (
                        <MindBlowingCard style={styles.activeVideoCard}>
                            <View style={styles.videoPlayerPlaceholder}>
                                <Text style={styles.videoPlayerText}>
                                    Video Player: {activeStream.title}
                                </Text>
                                <Text style={styles.videoPlayerSubtext}>
                                    YouTube ID: {activeStream.youtubeId || activeStream.streamUrl || 'N/A'}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.closeVideoButton} 
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    setActiveStream(null);
                                }}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.primaryDark]}
                                    style={styles.closeButtonGradient}
                                >
                                    <Ionicons name="close" size={24} color={COLORS.white} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </MindBlowingCard>
                    )}

                    {/* Live Streams Section */}
                    {liveStreams.length > 0 && (
                        <>
                            <View style={styles.professionalSectionHeader}>
                                <View style={styles.professionalHeaderContent}>
                                    <Ionicons name="videocam" size={24} color={COLORS.primary} />
                                    <Text style={styles.professionalSectionTitle}>Live Streams</Text>
                                </View>
                                <View style={styles.professionalUnderline} />
                            </View>
                            
                            {paginateArray(liveStreams, currentStreamsPage, STREAMS_PER_PAGE).length > 0 ? (
                                paginateArray(liveStreams, currentStreamsPage, STREAMS_PER_PAGE).map((item) => (
                                    <MindBlowingCard 
                                        key={item.id} 
                                        style={styles.liveStreamCard}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                            console.log('🎬 Live stream clicked:', item);
                                            console.log('🎬 Stream URL:', item.streamUrl);
                                            
                                            // Handle different stream URL formats
                                            if (item.streamUrl) {
                                                openInAppVideoPlayer(item.streamUrl, item.title);
                                            } else if (item.youtubeId) {
                                                const youtubeUrl = `https://www.youtube.com/embed/${item.youtubeId}`;
                                                openInAppVideoPlayer(youtubeUrl, item.title);
                                            } else if (item.url) {
                                                openInAppVideoPlayer(item.url, item.title);
                                            } else {
                                                console.warn('⚠️ No stream URL available for this stream:', item);
                                            }
                                        }}
                                    >
                                        <View style={styles.streamImageContainer}>
                                            <Image 
                                                source={{ uri: item.thumbnailUrl || item.imageUrl || item.image || 'https://placehold.co/400x200/DC143C/FFFFFF?text=LIVE+STREAM' }} 
                                                style={styles.streamImage} 
                                            />
                                            <LinearGradient
                                                colors={['transparent', COLORS.overlay]}
                                                style={styles.streamOverlay}
                                            />
                                            {item.isLive && (
                                                <View style={styles.liveStreamBadge}>
                                                    <Text style={styles.liveBadgeText}>🛑 LIVE</Text>
                                                    {item.viewerCount && (
                                                        <Text style={styles.viewerCountText}>{item.viewerCount} viewers</Text>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.streamContent}>
                                            <Text style={styles.streamTitle}>{item.title}</Text>
                                            <BeautifulButton
                                                title="Watch Now"
                                                variant="outline"
                                                icon="play-circle"
                                                style={styles.watchButton}
                                            />
                                        </View>
                                    </MindBlowingCard>
                                ))
                            ) : (
                                <View style={styles.emptyStateContainer}>
                                    <Ionicons name="radio-outline" size={80} color={COLORS.lightGray} />
                                    <Text style={styles.emptyStateTitle}>No Live Streams</Text>
                                    <Text style={styles.emptyStateSubtitle}>
                                        We're currently offline. Check back soon for live broadcasts!
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.refreshButton} 
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            // Refresh live streams data
                                        }}
                                    >
                                        <Text style={styles.refreshButtonText}>Refresh</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            
                            {/* Pagination Controls for Live Streams */}
                            {liveStreams.length > STREAMS_PER_PAGE && (
                                <View style={styles.paginationContainer}>
                                    <TouchableOpacity 
                                        style={[styles.paginationButton, currentStreamsPage === 1 && styles.paginationButtonDisabled]}
                                        onPress={() => {
                                            if (currentStreamsPage > 1) {
                                                setCurrentStreamsPage(currentStreamsPage - 1);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }
                                        }}
                                        disabled={currentStreamsPage === 1}
                                    >
                                        <Ionicons name="chevron-back" size={16} color={currentStreamsPage === 1 ? COLORS.gray : COLORS.primary} />
                                        <Text style={[styles.paginationButtonText, currentStreamsPage === 1 && styles.paginationButtonTextDisabled]}>Previous</Text>
                                    </TouchableOpacity>
                                    
                                    <View style={styles.paginationInfo}>
                                        <Text style={styles.paginationText}>
                                            {currentStreamsPage} of {getTotalPages(liveStreams.length, STREAMS_PER_PAGE)}
                                        </Text>
                                    </View>
                                    
                                    <TouchableOpacity 
                                        style={[styles.paginationButton, currentStreamsPage === getTotalPages(liveStreams.length, STREAMS_PER_PAGE) && styles.paginationButtonDisabled]}
                                        onPress={() => {
                                            if (currentStreamsPage < getTotalPages(liveStreams.length, STREAMS_PER_PAGE)) {
                                                setCurrentStreamsPage(currentStreamsPage + 1);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }
                                        }}
                                        disabled={currentStreamsPage === getTotalPages(liveStreams.length, STREAMS_PER_PAGE)}
                                    >
                                        <Text style={[styles.paginationButtonText, currentStreamsPage === getTotalPages(liveStreams.length, STREAMS_PER_PAGE) && styles.paginationButtonTextDisabled]}>Next</Text>
                                        <Ionicons name="chevron-forward" size={16} color={currentStreamsPage === getTotalPages(liveStreams.length, STREAMS_PER_PAGE) ? COLORS.gray : COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}

                    {/* News Articles Section */}
                    {recordedNews.length > 0 && (
                        <>
                            <View style={styles.professionalSectionHeader}>
                                <View style={styles.professionalHeaderContent}>
                                    <Ionicons name="newspaper" size={24} color={COLORS.primary} />
                                    <Text style={styles.professionalSectionTitle}>Latest News</Text>
                                    <View style={styles.newsCountBadge}>
                                        <Text style={styles.newsCountText}>
                                            {recordedNews.length}{totalNewsCount > recordedNews.length ? ` of ${totalNewsCount}` : ''}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.professionalUnderline} />
                            </View>
                            
                            {/* Recorded News Bar Items */}
                            <View style={styles.recordedNewsContainer}>
                                {recordedNews.length > 0 ? (
                                    recordedNews.map((item) => (
                                        <TouchableOpacity 
                                            key={item.id} 
                                            style={styles.newsBarItem} 
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setSelectedNews(item);
                                            }}
                                        >
                                        <View style={styles.newsBarContent}>
                                            <View style={styles.newsBarInfo}>
                                                <Text style={styles.newsBarTitle} numberOfLines={2}>{item.title}</Text>
                                                <Text style={styles.newsBarSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                                                <View style={styles.newsBarMeta}>
                                                    <Text style={styles.newsBarDate}>{item.date}</Text>
                                                    <Text style={styles.newsBarCategory}>{item.category}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.newsBarImageContainer}>
                                                <Image 
                                                    source={{ uri: item.image || 'https://placehold.co/120x80/DC143C/FFFFFF?text=NEWS' }} 
                                                    style={styles.newsBarImage}
                                                    resizeMode="cover"
                                                />
                                                <View style={styles.newsBarReadMore}>
                                                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.emptyStateContainer}>
                                        <Ionicons name="newspaper-outline" size={80} color={COLORS.lightGray} />
                                        <Text style={styles.emptyStateTitle}>No News Available</Text>
                                        <Text style={styles.emptyStateSubtitle}>
                                            We're working on bringing you the latest news. Please check back soon.
                                        </Text>
                                        <TouchableOpacity 
                                            style={styles.refreshButton} 
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                // Refresh news data
                                            }}
                                        >
                                            <Text style={styles.refreshButtonText}>Refresh</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            
                            {/* Load More Button */}
                            {hasMoreNews && (
                                <Animated.View 
                                    style={[
                                        styles.loadMoreContainer,
                                        {
                                            transform: [{
                                                scale: loadMoreAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [1, 0.95]
                                                })
                                            }]
                                        }
                                    ]}
                                >
                                    <TouchableOpacity 
                                        style={[
                                            styles.loadMoreButton,
                                            loadingMore && styles.loadMoreButtonLoading
                                        ]}
                                        onPress={loadMoreNews}
                                        disabled={loadingMore}
                                    >
                                        <LinearGradient
                                            colors={loadingMore ? [COLORS.mediumGray, COLORS.lightGray] : [COLORS.primary, COLORS.primaryDark]}
                                            style={styles.loadMoreGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            {loadingMore ? (
                                                <ActivityIndicator size="small" color={COLORS.white} />
                                            ) : (
                                                <Ionicons name="chevron-down" size={20} color={COLORS.white} />
                                            )}
                                            <Text style={styles.loadMoreText}>
                                                {loadingMore ? 'Loading...' : 'Load More News'}
                                            </Text>
                                            {!loadingMore && (
                                                <View style={styles.loadMoreBadge}>
                                                    <Text style={styles.loadMoreBadgeText}>
                                                        {Math.max(0, totalNewsCount - recordedNews.length)}
                                                    </Text>
                                                </View>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        </>
                    )}

                    {/* Empty State */}
                    {recordedNews.length === 0 && liveStreams.length === 0 && (
                        <EmptyState
                            icon="newspaper-outline"
                            title="No Content Available"
                            message="We're working hard to bring you the latest news and live streams. Please check back soon!"
                            actionText="Refresh"
                            onActionPress={onRefresh}
                        />
                    )}
                </Animated.View>
            </ScrollView>
            
            {/* Embedded Video Player Modal */}
            <Modal
                visible={videoPlayerVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeVideoPlayer}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.embeddedVideoContainer}>
                        <View style={styles.embeddedVideoHeader}>
                            <Text style={styles.videoTitle} numberOfLines={1}>
                                Now Playing
                            </Text>
                            <TouchableOpacity 
                                style={styles.closeButtonSmall} 
                                onPress={closeVideoPlayer}
                            >
                                <Ionicons name="close" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                        {currentStreamUrl && (
                            <View style={styles.embeddedVideoPlayerContainer}>
                                {Platform.OS === 'web' ? (
                                    // Web: Use iframe
                                    <iframe
                                        src={currentStreamUrl}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            border: 'none',
                                            borderRadius: '8px'
                                        }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    // Mobile: Use WebView
                                    <WebView
                                        source={{ uri: currentStreamUrl }}
                                        style={styles.embeddedWebView}
                                        allowsFullscreenVideo={true}
                                        mediaPlaybackRequiresUserAction={false}
                                        javaScriptEnabled={true}
                                        domStorageEnabled={true}
                                        startInLoadingState={true}
                                        renderLoading={() => (
                                            <View style={styles.embeddedWebViewLoading}>
                                                <ActivityIndicator size="large" color={COLORS.primary} />
                                                <Text style={styles.embeddedLoadingText}>Loading stream...</Text>
                                            </View>
                                        )}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
            
            {/* News Detail Modal */}
            {selectedNews && (
                <View style={styles.newsDetailModal}>
                    <ScrollView style={styles.newsDetailScrollView}>
                        <View style={styles.newsDetailHeader}>
                            <TouchableOpacity 
                                style={styles.closeDetailButton}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    setSelectedNews(null);
                                }}
                            >
                                <Ionicons name="close" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                        
                        <MindBlowingCard style={styles.newsDetailCard}>
                            <View style={styles.newsDetailImageContainer}>
                                <Image 
                                    source={{ uri: selectedNews.image || 'https://placehold.co/400x250/DC143C/FFFFFF?text=NEWS+DETAIL' }} 
                                    style={styles.newsDetailImage} 
                                />
                                <LinearGradient
                                    colors={['transparent', COLORS.overlay]}
                                    style={styles.newsDetailOverlay}
                                />
                            </View>
                            
                            <View style={styles.newsDetailContent}>
                                <Text style={styles.newsDetailTitle}>{selectedNews.title}</Text>
                                
                                <View style={styles.newsDetailMeta}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="time" size={16} color={COLORS.primary} />
                                        <Text style={styles.metaText}>5 min read</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="calendar" size={16} color={COLORS.primary} />
                                        <Text style={styles.metaText}>Today</Text>
                                    </View>
                                </View>
                                
                                <Text style={styles.newsDetailText}>{selectedNews.content}</Text>
                            </View>
                        </MindBlowingCard>
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const StunningIcon = ({ name, url, color, size = 24 }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    const handlePressIn = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
    };
    
    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };
    
    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    openLink(url);
                }}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.stunningIcon, { backgroundColor: color }]}
            >
                <Ionicons name={name} size={size} color={COLORS.white} />
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- Life & Culture Tabs ---

function BooksArticlesTab() {
  const [books, setBooks] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Load books
        const booksResponse = await fetch('https://5whmedia.com/api/lifeculture/books');
        const booksData = await booksResponse.json();
        
        if (Array.isArray(booksData)) {
          setBooks(booksData);
        } else if (booksData && Array.isArray(booksData.books)) {
          setBooks(booksData.books);
        } else {
          setBooks([]);
        }
        
        // Load articles
        const articlesResponse = await fetch('https://5whmedia.com/api/news?page=1&limit=10');
        const articlesData = await articlesResponse.json();
        setArticles(articlesData.articles || []);
        
      } catch (error) {
        console.error('Error loading life & culture content:', error);
        setBooks([]);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.lifeCultureContainer}>
        <LoadingSpinner text="Loading books & articles..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.lifeCultureContainer} showsVerticalScrollIndicator={false}>
      {/* Books Section */}
      <View style={styles.lifeCultureSection}>
        <View style={styles.professionalSectionHeader}>
          <View style={styles.professionalHeaderContent}>
            <Ionicons name="book" size={24} color={COLORS.primary} />
            <Text style={styles.professionalSectionTitle}>Book Recommendations</Text>
          </View>
          <View style={styles.professionalUnderline} />
        </View>
        
        {books.length > 0 ? (
          books.map((book, index) => (
            <MindBlowingCard key={book.id || index} style={styles.lifeCultureCard}>
              <View style={styles.cardContent}>
                <View style={styles.bookIconContainer}>
                  <Ionicons name="book-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{book.title || 'Sample Book'}</Text>
                  <Text style={styles.cardAuthor}>by {book.author || 'Unknown Author'}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {book.description || 'A fascinating book that will captivate your imagination.'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.cardAction}>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                </TouchableOpacity>
              </View>
            </MindBlowingCard>
          ))
        ) : (
          <EmptyState
            icon="book-outline"
            title="No Books Available"
            message="We're working on bringing you amazing book recommendations. Check back soon!"
          />
        )}
      </View>

      {/* Articles Section */}
      <View style={styles.lifeCultureSection}>
        <View style={styles.professionalSectionHeader}>
          <View style={styles.professionalHeaderContent}>
            <Ionicons name="newspaper" size={24} color={COLORS.primary} />
            <Text style={styles.professionalSectionTitle}>Featured Articles</Text>
          </View>
          <View style={styles.professionalUnderline} />
        </View>
        
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <MindBlowingCard key={article.id || article.slug || index} style={styles.lifeCultureCard}>
              <View style={styles.cardContent}>
                <View style={styles.articleIconContainer}>
                  <Ionicons name="newspaper-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{article.title || 'Sample Article'}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {article.summary || 'An interesting article about culture and lifestyle.'}
                  </Text>
                  <Text style={styles.cardMeta}>5 min read</Text>
                </View>
                <TouchableOpacity style={styles.cardAction}>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                </TouchableOpacity>
              </View>
            </MindBlowingCard>
          ))
        ) : (
          <EmptyState
            icon="newspaper-outline"
            title="No Articles Available"
            message="We're preparing engaging articles for you. Stay tuned for updates!"
          />
        )}
      </View>
    </ScrollView>
  );
}

function OpinionsTab() {
  const [opinions, setOpinions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadOpinions = async () => {
      try {
        const response = await fetch('https://5whmedia.com/api/opinions?page=1&limit=10');
        const data = await response.json();
        setOpinions(data.opinions || []);
      } catch (error) {
        console.error('Error loading opinions:', error);
        setOpinions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOpinions();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.lifeCultureContainer}>
        <LoadingSpinner text="Loading opinions..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.lifeCultureContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.lifeCultureSection}>
        <View style={styles.professionalSectionHeader}>
          <View style={styles.professionalHeaderContent}>
            <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
            <Text style={styles.professionalSectionTitle}>Opinion Pieces</Text>
          </View>
          <View style={styles.professionalUnderline} />
        </View>
        
        {opinions.length > 0 ? (
          opinions.map((opinion, index) => (
            <MindBlowingCard key={opinion.id || opinion.slug || index} style={styles.lifeCultureCard}>
              <View style={styles.cardContent}>
                <View style={styles.opinionIconContainer}>
                  <Ionicons name="chatbubble-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{opinion.title || 'Sample Opinion'}</Text>
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {opinion.summary || 'A thoughtful opinion piece on current events and social issues.'}
                  </Text>
                  <Text style={styles.cardMeta}>Opinion • 3 min read</Text>
                </View>
                <TouchableOpacity style={styles.cardAction}>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
                </TouchableOpacity>
              </View>
            </MindBlowingCard>
          ))
        ) : (
          <EmptyState
            icon="chatbubbles-outline"
            title="No Opinions Available"
            message="We're gathering diverse perspectives and opinions. Check back later for thought-provoking content!"
          />
        )}
      </View>
    </ScrollView>
  );
}

function LifeCulturePage() {
  const [activeTab, setActiveTab] = useState('books');

  return (
    <View style={styles.container}>
      <StunningHeader title="Life & Culture" />
      
      {/* Simple Tab Switcher */}
      <View style={styles.simpleTabContainer}>
        <TouchableOpacity 
          style={[styles.simpleTab, activeTab === 'books' && styles.simpleActiveTab]}
          onPress={() => setActiveTab('books')}
        >
          <Ionicons 
            name="book" 
            size={18} 
            color={activeTab === 'books' ? COLORS.white : COLORS.primary} 
            style={styles.tabIcon}
          />
          <Text style={[styles.simpleTabText, activeTab === 'books' && styles.simpleActiveTabText]}>
            Books & Articles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.simpleTab, activeTab === 'opinions' && styles.simpleActiveTab]}
          onPress={() => setActiveTab('opinions')}
        >
          <Ionicons 
            name="chatbubbles" 
            size={18} 
            color={activeTab === 'opinions' ? COLORS.white : COLORS.primary} 
            style={styles.tabIcon}
          />
          <Text style={[styles.simpleTabText, activeTab === 'opinions' && styles.simpleActiveTabText]}>
            Opinions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'books' ? <BooksArticlesTab /> : <OpinionsTab />}
    </View>
  );
}

// --- Navigation Setup ---
const Tab = createBottomTabNavigator();

// Simple App component without problematic Stack Navigator
export default function App() {
  // Setup notifications and periodic checking
  useEffect(() => {
    let notificationInterval;
    
    const setupNotifications = async () => {
      try {
        // Request notification permissions
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          if (newStatus !== 'granted') {
            console.log('Notification permissions not granted');
            return;
          }
        }
        
        console.log('🔔 Notification permissions granted');
        
        // Initial notification check
        checkForNotifications();
        
        // Set up periodic checking every 30 seconds
        notificationInterval = setInterval(() => {
          checkForNotifications();
        }, 30000);
        
        console.log('🔔 Notification service started - checking every 30 seconds');
        
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };
    
    // Handle notification responses (when user taps notification)
    const handleNotificationResponse = (response) => {
      const data = response.notification.request.content.data;
      console.log('🔔 Notification tapped:', data);
      
      // Handle different notification types
      if (data.url) {
        Linking.openURL(data.url);
      }
    };
    
    // Setup notifications
    setupNotifications();
    
    // Listen for notification responses
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    
    // Cleanup
    return () => {
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.mediumGray,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="radio" size={size} color={color} />
          }}
        />
        <Tab.Screen 
          name="News" 
          component={NewsListScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="newspaper" size={size} color={color} />
          }}
        />
                <Tab.Screen 
                    name="Media" 
                    component={PodcastsVideosScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Ionicons name="play-circle" size={size} color={color} />
                    }}
                />
                <Tab.Screen 
                    name="Life & Culture" 
                    component={LifeCulturePage}
                    options={{
                        tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />
                    }}
                />
                <Tab.Screen 
                    name="Contact & About" 
                    component={ContactScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Ionicons name="information-circle" size={size} color={color} />
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

// --- Stylesheet ---
const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
        backgroundColor: COLORS.offWhite,
    },
    
    // Header Styles
    stunningHeader: {
        elevation: 8,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 1000,
    },
    headerGradient: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    // Scroll View
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    
    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.offWhite,
        padding: 40,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: COLORS.darkGray,
        textAlign: 'center',
        fontWeight: '500',
    },
    
    // Cards
    elevatedCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        margin: 8,
        padding: 16,
        elevation: 8,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    flatCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        margin: 8,
        padding: 16,
    },
    
    // Hero Radio Card
    heroRadioCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        margin: 16,
        overflow: 'hidden',
        elevation: 12,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    radioImageContainer: {
        position: 'relative',
        height: 200,
    },
    radioImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    radioOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    liveIndicator: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255, 68, 68, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    liveText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    radioInfo: {
        padding: 20,
    },
    radioTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 8,
    },
    radioSubtitle: {
        fontSize: 16,
        color: COLORS.mediumGray,
        marginBottom: 20,
    },
    playButtonContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    playButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    volumeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    volumeButton: {
        padding: 12,
    },
    volumeDisplay: {
        flex: 1,
        marginHorizontal: 12,
    },
    volumeTrack: {
        height: 6,
        backgroundColor: COLORS.lightGray,
        borderRadius: 3,
        overflow: 'hidden',
    },
    volumeFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    
    // Notification Bell
    notificationBell: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    
    // Beautiful Buttons
    primaryButton: {
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    secondaryButton: {
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: COLORS.lightGray,
    },
    outlineButton: {
        borderRadius: 25,
        borderWidth: 2,
        borderColor: COLORS.primary,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
    },
    buttonGradient: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    outlineButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    buttonIcon: {
        marginRight: 8,
    },
    
    // Home Screen - Hero Radio Card
    heroRadioCard: {
        marginBottom: 30,
    },
    radioImageContainer: {
        position: 'relative',
        height: 300,
    },
    radioImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    radioOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    liveIndicator: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    liveText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    radioInfo: {
        padding: 30,
        alignItems: 'center',
    },
    radioTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 8,
    },
    radioSubtitle: {
        fontSize: 16,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginBottom: 30,
    },
    playButtonContainer: {
        marginBottom: 30,
    },
    playButton: {
        borderRadius: 50,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    playButtonGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    volumeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        width: '100%',
        gap: 15,
    },
    volumeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    volumeDisplay: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    volumeTrack: {
        width: '100%',
        height: 4,
        backgroundColor: COLORS.lightGray,
        borderRadius: 2,
        overflow: 'hidden',
    },
    volumeFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    volumeText: {
        fontSize: 12,
        color: COLORS.darkGray,
        fontWeight: '600',
    },
    
    // News Screen
    sectionHeader: {
        marginBottom: 20,
    },
    sectionTitleContainer: {
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    sectionTitleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginLeft: 8,
        letterSpacing: 0.5,
        flex: 1,
    },
    newsCountBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginLeft: 12,
    },
    newsCountText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.white,
    },
    
    // Live Stream Cards
    liveStreamCard: {
        marginBottom: 20,
    },
    streamImageContainer: {
        position: 'relative',
        height: 200,
    },
    streamImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    streamOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    liveStreamBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#FF4500',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        border: '2px solid #000000ff',
    },
    liveBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    viewerCountText: {
        color: COLORS.white,
        fontSize: 8,
        fontWeight: '600',
        marginTop: 2,
        opacity: 0.9,
    },
    livePulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF0000',
        marginRight: 6,
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 3,
    },
    streamContent: {
        padding: 20,
    },
    streamTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 15,
        lineHeight: 24,
    },
    watchButton: {
        alignSelf: 'flex-start',
    },
    
    // News Cards
    newsCard: {
        marginBottom: 20,
    },
    newsImageContainer: {
        position: 'relative',
        height: 180,
    },
    newsImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    newsOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    newsContent: {
        padding: 20,
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 8,
        lineHeight: 24,
    },
    newsSubtitle: {
        fontSize: 14,
        color: COLORS.darkGray,
        lineHeight: 20,
        marginBottom: 15,
    },
    newsFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    
    // Video Player
    activeVideoCard: {
        marginBottom: 20,
        position: 'relative',
    },
    videoPlayer: {
        width: '100%',
        height: screenWidth * 9 / 16,
    },
    videoPlayerPlaceholder: {
        width: '100%',
        height: screenWidth * 9 / 16,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    videoPlayerText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    videoPlayerSubtext: {
        color: COLORS.lightGray,
        fontSize: 14,
        textAlign: 'center',
    },
    closeVideoButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        borderRadius: 20,
        overflow: 'hidden',
    },
    closeButtonGradient: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Empty State
    emptyStateCard: {
        padding: 40,
        alignItems: 'center',
    },
    emptyStateContent: {
        alignItems: 'center',
        maxWidth: 280,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: COLORS.darkGray,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    refreshButton: {
        marginTop: 10,
    },
    
    // Legacy styles for compatibility
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.offWhite,
        padding: 20,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    
    // News Detail Screen
    newsDetailModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.white,
        zIndex: 1000,
    },
    newsDetailScrollView: {
        flex: 1,
    },
    newsDetailHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: Platform.OS === 'ios' ? 50 : 25,
        paddingHorizontal: 20,
        paddingBottom: 10,
        backgroundColor: COLORS.primary,
    },
    closeDetailButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    newsDetailCard: {
        marginBottom: 20,
        marginHorizontal: 16,
        marginTop: 16,
    },
    newsDetailImageContainer: {
        position: 'relative',
        height: 250,
    },
    newsDetailImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    newsDetailOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    newsDetailContent: {
        padding: 24,
    },
    newsDetailTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
        lineHeight: 32,
    },
    newsDetailMeta: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    metaText: {
        marginLeft: 6,
        fontSize: 14,
        color: COLORS.darkGray,
        fontWeight: '500',
    },
    newsDetailText: {
        fontSize: 16,
        color: COLORS.darkGray,
        lineHeight: 24,
    },
    shareCard: {
        marginBottom: 20,
    },
    shareCardGradient: {
        padding: 24,
        alignItems: 'center',
    },
    shareCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 16,
    },
    shareButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    shareButtonStyled: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // About Screen
    aboutHeroCard: {
        marginBottom: 30,
    },
    aboutHeroGradient: {
        paddingVertical: 50,
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    aboutLogoContainer: {
        marginBottom: 20,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: 2,
    },
    aboutHeroTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: 8,
    },
    aboutHeroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },
    aboutSectionCard: {
        marginBottom: 20,
    },
    aboutSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    aboutSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    aboutSectionText: {
        fontSize: 16,
        color: COLORS.darkGray,
        lineHeight: 24,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    socialMediaCard: {
        marginBottom: 20,
    },
    socialMediaGradient: {
        padding: 30,
        alignItems: 'center',
    },
    socialMediaTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
        textAlign: 'center',
    },
    socialMediaSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 24,
    },
    socialIconsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    stunningIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    
    // Contact Screen
    contactHeroCard: {
        marginBottom: 30,
    },
    contactHeroGradient: {
        paddingVertical: 50,
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    contactHeroIcon: {
        marginBottom: 20,
    },
    contactHeroTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: 8,
    },
    contactHeroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },
    contactSectionCard: {
        marginBottom: 20,
    },
    contactSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    contactRowEnhanced: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    contactIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactTextContainer: {
        flex: 1,
    },
    contactTextEnhanced: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    contactSubtext: {
        fontSize: 14,
        color: COLORS.darkGray,
    },
    liveBadge: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 25,
        overflow: 'hidden',
    },
    liveBadgeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    liveIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.white,
        marginRight: 8,
        shadowColor: COLORS.white,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 3,
    },
    liveBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: 1,
    },
    quickContactCard: {
        marginBottom: 20,
    },
    quickContactTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    quickContactActions: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    quickActionButton: {
        marginBottom: 0,
    },
    
    // News Bar Styles
    recordedNewsContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    loadMoreContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
    },
    loadMoreButton: {
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        width: '100%',
        maxWidth: 300,
    },
    loadMoreButtonLoading: {
        opacity: 0.7,
    },
    loadMoreGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    loadMoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: 0.5,
    },
    loadMoreBadge: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 8,
    },
    loadMoreBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    newsBarItem: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(220, 20, 60, 0.1)',
    },
    newsBarContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    newsBarInfo: {
        flex: 1,
        marginRight: 12,
    },
    newsBarTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 6,
        lineHeight: 22,
    },
    newsBarSubtitle: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 8,
        lineHeight: 18,
    },
    newsBarMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    newsBarDate: {
        fontSize: 12,
        color: COLORS.gray,
        fontWeight: '500',
    },
    newsBarCategory: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    newsBarImageContainer: {
        position: 'relative',
    },
    newsBarImage: {
        width: 80,
        height: 60,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
    },
    newsBarReadMore: {
        position: 'absolute',
        bottom: -6,
        right: -6,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 4,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    
    // Pagination Styles
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginTop: 10,
    },
    paginationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 6,
        minWidth: 80,
        justifyContent: 'center',
    },
    paginationButtonDisabled: {
        borderColor: COLORS.lightGray,
        backgroundColor: COLORS.lightGray,
    },
    paginationButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    paginationButtonTextDisabled: {
        color: COLORS.gray,
    },
    paginationInfo: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(220, 20, 60, 0.2)',
    },
    paginationText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        textAlign: 'center',
    },
    
    // Simple Tab Styles (not too fancy)
    simpleTabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 2,
    },
    simpleTab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    simpleActiveTab: {
        backgroundColor: COLORS.primary,
    },
    simpleTabText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkGray,
    },
    simpleActiveTabText: {
        color: COLORS.white,
    },
    
    // Podcasts & Videos Styles
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: COLORS.lightGray,
        borderRadius: 25,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    activeTabText: {
        color: COLORS.white,
    },
    mediaCard: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    mediaContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mediaThumbnail: {
        width: 80,
        height: 60,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
    },
    mediaInfo: {
        flex: 1,
        marginLeft: 12,
    },
    mediaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    mediaDescription: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 8,
    },
    mediaMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mediaMetaText: {
        fontSize: 12,
        color: COLORS.mediumGray,
        marginRight: 8,
    },
    
    // Contact Screen Styles
    contactCard: {
        margin: 16,
        padding: 0,
    },
    contactHeader: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: COLORS.offWhite,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    contactTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.black,
        marginTop: 16,
        marginBottom: 8,
    },
    contactSubtitle: {
        fontSize: 16,
        color: COLORS.darkGray,
    },
    contactInfo: {
        padding: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    contactItemText: {
        flex: 1,
        marginLeft: 16,
    },
    contactItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    contactItemValue: {
        fontSize: 14,
        color: COLORS.darkGray,
        lineHeight: 20,
    },
    socialMedia: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    socialTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 16,
        textAlign: 'center',
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    
    // About Screen Styles
    aboutCard: {
        margin: 16,
        padding: 0,
    },
    aboutHeader: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: COLORS.offWhite,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    aboutLogo: {
        width: 200,
        height: 100,
        borderRadius: 10,
        marginBottom: 16,
    },
    aboutTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 8,
    },
    aboutSubtitle: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
    },
    aboutContent: {
        padding: 24,
    },
    aboutText: {
        fontSize: 16,
        color: COLORS.darkGray,
        lineHeight: 24,
        marginBottom: 20,
    },
    aboutSectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 12,
        marginTop: 8,
    },
    featuresList: {
        marginTop: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureText: {
        fontSize: 16,
        color: COLORS.darkGray,
        marginLeft: 12,
    },
    statsCard: {
        margin: 16,
        marginTop: 0,
    },
    statsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 16,
        padding: 16,
        backgroundColor: COLORS.offWhite,
        borderRadius: 12,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.darkGray,
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 25,
        padding: 4,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 20,
        gap: 8,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    activeTabText: {
        color: COLORS.white,
    },
    contentContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    
    // Podcast Styles
    podcastItem: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 12,
    },
    podcastContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    podcastImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: COLORS.lightGray,
    },
    podcastInfo: {
        flex: 1,
        marginLeft: 16,
        marginRight: 12,
    },
    podcastTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 6,
        lineHeight: 22,
    },
    podcastDescription: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 8,
        lineHeight: 18,
    },
    podcastMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    podcastDuration: {
        fontSize: 12,
        color: COLORS.gray,
        fontWeight: '500',
    },
    podcastCategory: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    playButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Video Styles
    videoGrid: {
        paddingHorizontal: 20,
        gap: 20,
    },
    videoItem: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
        marginBottom: 12,
    },
    videoImageContainer: {
        position: 'relative',
        height: 200,
    },
    videoImage: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.lightGray,
    },
    videoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    videoDurationBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    videoDurationText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    videoPlayButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
    },
    videoInfo: {
        padding: 16,
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 6,
        lineHeight: 22,
    },
    videoDescription: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 8,
        lineHeight: 18,
    },
    videoCategory: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    
    // Empty State Styles
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 16,
        color: COLORS.darkGray,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    refreshButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    refreshButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    
    // Embedded Video Player Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    embeddedVideoContainer: {
        width: '90%',
        maxWidth: 600,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    embeddedVideoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    videoTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    closeButtonSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    embeddedVideoPlayerContainer: {
        height: 280,
        backgroundColor: COLORS.black,
    },
    embeddedWebView: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    embeddedWebViewLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.black,
    },
    embeddedLoadingText: {
        color: COLORS.white,
        fontSize: 14,
        marginTop: 8,
        fontWeight: '500',
    },
    
    // --- Life & Culture Styles ---
    lifeCultureContainer: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    lifeCultureSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.black,
        marginLeft: 8,
    },
    lifeCultureCard: {
        margin: 12,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 0,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    bookIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    articleIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.accent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    opinionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.secondary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    cardAuthor: {
        fontSize: 14,
        color: COLORS.primary,
        marginBottom: 4,
        fontWeight: '500',
    },
    cardDescription: {
        fontSize: 14,
        color: COLORS.darkGray,
        lineHeight: 20,
    },
    cardMeta: {
        fontSize: 12,
        color: COLORS.mediumGray,
        marginTop: 4,
        fontStyle: 'italic',
    },
    cardAction: {
        padding: 8,
    },
    tabIcon: {
        marginRight: 6,
    },
    
    // --- Professional Section Headers ---
    professionalSectionHeader: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        marginBottom: 8,
    },
    professionalHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    professionalSectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
        marginLeft: 12,
        flex: 1,
    },
    professionalUnderline: {
        height: 3,
        backgroundColor: COLORS.primary,
        width: 60,
        borderRadius: 2,
    },
    
    // --- Empty State Styles ---
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
        minHeight: 300,
    },
    emptyStateIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: COLORS.mediumGray + '30',
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.darkGray,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateMessage: {
        fontSize: 16,
        color: COLORS.mediumGray,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    emptyStateButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyStateButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
