// Weather API service using weatherapi.com
import axios from 'axios';

const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.weatherapi.com/v1';

// Cache for weather data to avoid too many API calls
const weatherCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const weatherService = {
  // Get user's location using geolocation API
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          // Fallback to IP-based location or default cities
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000 // 5 minutes
        }
      );
    });
  },

  // Get weather data from cache or API
  getWeatherData: async (location) => {
    const cacheKey = typeof location === 'string' ? location : `${location.latitude},${location.longitude}`;
    const cachedData = weatherCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    try {
      const query = typeof location === 'string' ? location : `${location.latitude},${location.longitude}`;
      const response = await axios.get(`${WEATHER_BASE_URL}/current.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: query,
          aqi: 'no'
        }
      });

      const weatherData = {
        location: response.data.location.name,
        region: response.data.location.region,
        country: response.data.location.country,
        temperature: Math.round(response.data.current.temp_c),
        condition: response.data.current.condition.text.toLowerCase(),
        icon: response.data.current.condition.icon,
        humidity: response.data.current.humidity,
        windSpeed: response.data.current.wind_kph,
        windDirection: response.data.current.wind_dir,
        feelsLike: Math.round(response.data.current.feelslike_c),
        visibility: response.data.current.vis_km,
        uvIndex: response.data.current.uv,
        lastUpdated: response.data.current.last_updated
      };

      // Cache the data
      weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('Weather API error:', error);
      throw new Error('Failed to fetch weather data');
    }
  },

  // Get weather for multiple cities
  getMultipleCitiesWeather: async (cities) => {
    const weatherPromises = cities.map(city => 
      weatherService.getWeatherData(city).catch(error => {
        console.error(`Failed to fetch weather for ${city}:`, error);
        return null;
      })
    );

    const results = await Promise.all(weatherPromises);
    return results.filter(result => result !== null);
  },

  // Get regional cities based on user location
  getRegionalCities: (userLocation) => {
    // Fixed cities as specified by user
    const fixedCities = [
      'Jalandhar',
      'Amritsar', 
      'Los Angeles',
      'Toronto',
      'Chicago',
      'Surrey',
      'Montreal',
      'New York',
      'Vancouver'
    ];
    
    // Always return the same fixed cities regardless of location
    return fixedCities;
  },

  // Map weather condition to icon type
  getConditionType: (condition) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return 'sunny';
    }
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
      return 'cloudy';
    }
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return 'rainy';
    }
    if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard')) {
      return 'snowy';
    }
    if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
      return 'stormy';
    }
    
    return 'sunny'; // default
  }
};
