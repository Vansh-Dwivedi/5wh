// Azurecast radio stream service
import axios from 'axios';

// Configuration for Azurecast streams
const AZURECAST_CONFIG = {
  // Example Azurecast station - replace with actual Punjabi news station
  baseUrl: 'https://radio.example.com', // Replace with actual Azurecast URL
  stationId: 'punjabi-news', // Replace with actual station ID
  streamUrl: 'https://radio.example.com/radio/8000/radio.mp3', // Replace with actual stream URL
};

// Cache for stream data
const streamCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const azurecastService = {
  // Get current stream information
  getStreamInfo: async () => {
    const cacheKey = 'stream_info';
    const cached = streamCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      // For now, return static stream info - replace with actual Azurecast API calls
      const streamInfo = {
        stationName: 'Punjabi News Live',
        streamUrl: 'https://listen.radioking.com/radio/10239/stream/44672', // Example stream
        isLive: true,
        currentTrack: 'Live Punjabi News',
        description: 'Latest news and updates in Punjabi language',
        listeners: 0,
        bitrate: '128 kbps',
        format: 'MP3'
      };

      // In a real implementation, you would make API calls like:
      // const response = await axios.get(`${AZURECAST_CONFIG.baseUrl}/api/nowplaying/${AZURECAST_CONFIG.stationId}`);
      // const streamInfo = response.data;

      streamCache.set(cacheKey, {
        data: streamInfo,
        timestamp: Date.now()
      });

      return streamInfo;
    } catch (error) {
      console.error('Error fetching stream info:', error);
      
      // Fallback stream info
      return {
        stationName: 'Punjabi News Radio',
        streamUrl: 'https://listen.radioking.com/radio/10239/stream/44672',
        isLive: false,
        currentTrack: 'Punjabi News Stream',
        description: 'Punjabi news and music',
        listeners: 0,
        bitrate: '128 kbps',
        format: 'MP3'
      };
    }
  },

  // Get now playing information
  getNowPlaying: async () => {
    try {
      // In a real implementation:
      // const response = await axios.get(`${AZURECAST_CONFIG.baseUrl}/api/nowplaying/${AZURECAST_CONFIG.stationId}`);
      // return response.data.now_playing;

      return {
        song: {
          title: 'Live Punjabi News',
          artist: 'News Anchor',
          album: 'Daily News',
        },
        elapsed: 0,
        duration: 0,
        is_live: true
      };
    } catch (error) {
      console.error('Error fetching now playing:', error);
      return null;
    }
  },

  // Get listener statistics
  getListenerStats: async () => {
    try {
      // In a real implementation:
      // const response = await axios.get(`${AZURECAST_CONFIG.baseUrl}/api/station/${AZURECAST_CONFIG.stationId}/status`);
      // return response.data.listeners;

      return {
        current: Math.floor(Math.random() * 100) + 50, // Mock data
        unique: Math.floor(Math.random() * 50) + 25,
        total: Math.floor(Math.random() * 500) + 200
      };
    } catch (error) {
      console.error('Error fetching listener stats:', error);
      return { current: 0, unique: 0, total: 0 };
    }
  },

  // Test stream URL
  testStreamUrl: async (url) => {
    try {
      const response = await axios.head(url, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Stream URL test failed:', error);
      return false;
    }
  },

  // Get available Punjabi news streams (for admin configuration)
  getAvailableStreams: () => {
    return [
      {
        id: 'punjabi-news-1',
        name: 'Punjabi News Live',
        url: 'https://listen.radioking.com/radio/10239/stream/44672',
        description: 'Primary Punjabi news stream',
        bitrate: '128 kbps'
      },
      {
        id: 'punjabi-music',
        name: 'Punjabi Music Radio',
        url: 'https://stream.example.com/punjabi-music',
        description: 'Punjabi music and cultural programs',
        bitrate: '192 kbps'
      },
      {
        id: 'live-events',
        name: 'Live Events Stream',
        url: 'https://stream.example.com/live-events',
        description: 'Special events and live coverage',
        bitrate: '256 kbps'
      }
    ];
  },

  // Configuration for real Azurecast integration
  configureAzurecast: (config) => {
    AZURECAST_CONFIG.baseUrl = config.baseUrl;
    AZURECAST_CONFIG.stationId = config.stationId;
    AZURECAST_CONFIG.streamUrl = config.streamUrl;
  }
};

export default azurecastService;
