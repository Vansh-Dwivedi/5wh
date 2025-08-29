// Person of the Day service with regional focus and photo fetching
import axios from 'axios';

// Cache for person data
const personCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Regional person database with enhanced data
const regionalPersons = {
  punjab: [
    {
      id: 1,
      name: "Guru Nanak Dev Ji",
      title: "Founder of Sikhism & Spiritual Leader",
      description: "The first Sikh Guru and founder of Sikhism, known for his teachings of equality, compassion, and devotion to one God. His philosophy emphasized the unity of humanity beyond caste, creed, and religion.",
      achievement: "Founded Sikhism and established the concept of universal brotherhood",
      birthYear: "1469",
      field: "Spirituality & Philosophy",
      region: "Punjab",
      nationality: "Indian",
      photoQuery: "Guru Nanak Dev Ji painting historical",
      wikiUrl: "https://en.wikipedia.org/wiki/Guru_Nanak"
    },
    {
      id: 2,
      name: "Maharaja Ranjit Singh",
      title: "Lion of Punjab & Sikh Empire Founder",
      description: "Known as the 'Lion of Punjab', he was the founder and first maharaja of the Sikh Empire. He united the Sikh confederacy into a powerful empire and was known for his military genius and secular policies.",
      achievement: "Established the powerful Sikh Empire spanning Punjab, Kashmir, and parts of Afghanistan",
      birthYear: "1780",
      field: "Leadership & Military",
      region: "Punjab",
      nationality: "Indian",
      photoQuery: "Maharaja Ranjit Singh portrait historical",
      wikiUrl: "https://en.wikipedia.org/wiki/Ranjit_Singh"
    },
    {
      id: 3,
      name: "Dr. Manmohan Singh",
      title: "Former Prime Minister of India & Economist",
      description: "Renowned economist and former Prime Minister of India, credited with liberalizing India's economy in the 1990s. Known for his quiet dignity and economic expertise.",
      achievement: "Architect of India's economic liberalization as Finance Minister",
      birthYear: "1932",
      field: "Economics & Politics",
      region: "Punjab",
      nationality: "Indian",
      photoQuery: "Dr Manmohan Singh former prime minister India",
      wikiUrl: "https://en.wikipedia.org/wiki/Manmohan_Singh"
    }
  ],
  
  northAmerica: [
    {
      id: 4,
      name: "Steve Jobs",
      title: "Co-founder of Apple Inc. & Technology Visionary",
      description: "Revolutionary entrepreneur who co-founded Apple Inc. and transformed multiple industries including personal computing, music, phones, and digital entertainment.",
      achievement: "Created revolutionary products like iPhone, iPad, and transformed technology industry",
      birthYear: "1955",
      field: "Technology & Innovation",
      region: "North America",
      nationality: "American",
      photoQuery: "Steve Jobs Apple founder CEO",
      wikiUrl: "https://en.wikipedia.org/wiki/Steve_Jobs"
    },
    {
      id: 5,
      name: "Maya Angelou",
      title: "Poet, Author & Civil Rights Activist",
      description: "Acclaimed poet, memoirist, and civil rights activist known for her series of autobiographies, particularly 'I Know Why the Caged Bird Sings'.",
      achievement: "Influential voice in American literature and civil rights movement",
      birthYear: "1928",
      field: "Literature & Civil Rights",
      region: "North America",
      nationality: "American",
      photoQuery: "Maya Angelou poet author civil rights",
      wikiUrl: "https://en.wikipedia.org/wiki/Maya_Angelou"
    }
  ],
  
  global: [
    {
      id: 6,
      name: "Marie Curie",
      title: "Nobel Prize-winning Physicist & Chemist",
      description: "First woman to win a Nobel Prize and the only person to win Nobel Prizes in two different scientific fields (Physics and Chemistry). Pioneer in radioactivity research.",
      achievement: "Discovered radium and polonium, won Nobel Prizes in Physics and Chemistry",
      birthYear: "1867",
      field: "Science & Research",
      region: "Europe",
      nationality: "Polish-French",
      photoQuery: "Marie Curie scientist Nobel Prize winner",
      wikiUrl: "https://en.wikipedia.org/wiki/Marie_Curie"
    },
    {
      id: 7,
      name: "Nelson Mandela",
      title: "Anti-apartheid Leader & Former President",
      description: "Global icon who fought against apartheid and became South Africa's first Black president, promoting reconciliation and human rights worldwide.",
      achievement: "Ended apartheid in South Africa and promoted global peace",
      birthYear: "1918",
      field: "Politics & Human Rights",
      region: "Africa",
      nationality: "South African",
      photoQuery: "Nelson Mandela president South Africa",
      wikiUrl: "https://en.wikipedia.org/wiki/Nelson_Mandela"
    },
    {
      id: 8,
      name: "Albert Einstein",
      title: "Theoretical Physicist & Nobel Laureate",
      description: "One of the most influential physicists of all time, known for the theory of relativity and his contributions to quantum mechanics.",
      achievement: "Developed theory of relativity and revolutionized modern physics",
      birthYear: "1879",
      field: "Physics & Mathematics",
      region: "Europe",
      nationality: "German-American",
      photoQuery: "Albert Einstein physicist theory relativity",
      wikiUrl: "https://en.wikipedia.org/wiki/Albert_Einstein"
    }
  ]
};

export const personOfTheDayService = {
  // Get person based on user's region
  getRegionalPerson: (userLocation, userRegion) => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    
    let personPool = regionalPersons.global; // default
    
    // Determine regional preference
    if (userRegion && userRegion.toLowerCase().includes('punjab')) {
      personPool = [...regionalPersons.punjab, ...regionalPersons.global];
    } else if (userLocation) {
      const { latitude, longitude } = userLocation;
      
      // Punjab/India region
      if (latitude >= 28 && latitude <= 32 && longitude >= 74 && longitude <= 77) {
        personPool = [...regionalPersons.punjab, ...regionalPersons.global];
      }
      // North America region
      else if (latitude >= 25 && latitude <= 70 && longitude >= -140 && longitude <= -50) {
        personPool = [...regionalPersons.northAmerica, ...regionalPersons.global];
      }
    }
    
    // Select person based on day of year to ensure consistency
    const personIndex = dayOfYear % personPool.length;
    return personPool[personIndex];
  },

  // Fetch photo from Unsplash or Wikipedia
  fetchPersonPhoto: async (person) => {
    const cacheKey = `photo_${person.id}`;
    const cachedPhoto = personCache.get(cacheKey);
    
    if (cachedPhoto && Date.now() - cachedPhoto.timestamp < CACHE_DURATION) {
      return cachedPhoto.url;
    }

    try {
      // First try Unsplash for historical figures or public domain images
      const unsplashResponse = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: person.photoQuery,
          per_page: 1,
          orientation: 'portrait'
        },
        headers: {
          'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY' // You'll need to get this
        }
      }).catch(() => null);

      let photoUrl = null;

      if (unsplashResponse && unsplashResponse.data.results.length > 0) {
        photoUrl = unsplashResponse.data.results[0].urls.regular;
      } else {
        // Fallback to a generated avatar or placeholder
        photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=200&background=c41e3a&color=fff&bold=true`;
      }

      // Cache the photo URL
      personCache.set(cacheKey, {
        url: photoUrl,
        timestamp: Date.now()
      });

      return photoUrl;
    } catch (error) {
      console.error('Error fetching person photo:', error);
      // Return fallback avatar
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=200&background=c41e3a&color=fff&bold=true`;
    }
  },

  // Get complete person data with photo
  getPersonOfTheDay: async (userLocation, userRegion) => {
    try {
      const person = personOfTheDayService.getRegionalPerson(userLocation, userRegion);
      const photoUrl = await personOfTheDayService.fetchPersonPhoto(person);
      
      return {
        ...person,
        image: photoUrl
      };
    } catch (error) {
      console.error('Error getting person of the day:', error);
      // Return fallback person
      return {
        id: 999,
        name: "Inspirational Figure",
        title: "Daily Inspiration",
        description: "Every day is an opportunity to learn about remarkable people who have shaped our world.",
        achievement: "Inspiring others through their life and work",
        birthYear: "Unknown",
        field: "Inspiration",
        image: "https://ui-avatars.com/api/?name=Inspiration&size=200&background=c41e3a&color=fff&bold=true"
      };
    }
  },

  // Add custom person to regional database (for admin use)
  addCustomPerson: (person, region = 'global') => {
    if (!regionalPersons[region]) {
      regionalPersons[region] = [];
    }
    regionalPersons[region].push({
      ...person,
      id: Date.now() // Simple ID generation
    });
  },

  // Get all available regions
  getAvailableRegions: () => {
    return Object.keys(regionalPersons);
  },

  // Get all persons from a specific region
  getPersonsByRegion: (region) => {
    return regionalPersons[region] || [];
  }
};
