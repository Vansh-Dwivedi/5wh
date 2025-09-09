// Person of the Day service with online API fetching
import axios from 'axios';

// Cache for person data
const personCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const personOfTheDayService = {
  // Fetch person from Wikipedia API - completely online
  getPersonOfTheDay: async (userLocation, userRegion) => {
    const cacheKey = `person_${new Date().toDateString()}`;
    const cachedPerson = personCache.get(cacheKey);

    if (cachedPerson && Date.now() - cachedPerson.timestamp < CACHE_DURATION) {
      return cachedPerson.data;
    }

    try {
      // Get today's featured article from Wikipedia
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      // Try to get today's featured article
      let response;
      try {
        response = await axios.get(`https://en.wikipedia.org/api/rest_v1/feed/featured/${year}/${month}/${day}`);
      } catch (error) {
        // Fallback to random article if today's featured isn't available
        response = await axios.get('https://en.wikipedia.org/api/rest_v1/page/random/summary');
      }

      let articleTitle;
      if (response.data.tfa) {
        articleTitle = response.data.tfa.title;
      } else if (response.data.title) {
        articleTitle = response.data.title;
      } else {
        // Last resort - get a random biographical article
        return await personOfTheDayService.getRandomBiographicalPerson();
      }

      // Get detailed info about the article
      const detailResponse = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleTitle)}`);
      const data = detailResponse.data;

      // Check if it's about a person using improved detection
      if (personOfTheDayService.isPersonArticle(data)) {
        const person = personOfTheDayService.formatPersonData(data);

        // Cache the person
        personCache.set(cacheKey, {
          data: person,
          timestamp: Date.now()
        });

        return person;
      } else {
        // If not a person, get a random biographical person
        return await personOfTheDayService.getRandomBiographicalPerson();
      }

    } catch (error) {
      console.error('Error fetching person of the day:', error);
      return await personOfTheDayService.getRandomBiographicalPerson();
    }
  },

  // Get a random biographical person from Wikipedia
  getRandomBiographicalPerson: async () => {
    try {
      // Use Wikipedia's category system to find biographical articles
      const bioCategories = [
        'Category:20th-century_American_politicians',
        'Category:Nobel_Prize_laureates_in_Physics',
        'Category:Nobel_Prize_laureates_in_Chemistry',
        'Category:American_writers',
        'Category:American_artists',
        'Category:American_musicians',
        'Category:American_actors',
        'Category:British_scientists',
        'Category:French_philosophers',
        'Category:Civil_rights_activists'
      ];

      // Pick a random category for today
      const today = new Date();
      const categoryIndex = today.getDate() % bioCategories.length;
      const selectedCategory = bioCategories[categoryIndex];

      // Get articles from biographical category
      const categoryResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          format: 'json',
          list: 'categorymembers',
          cmtitle: selectedCategory,
          cmlimit: 50,
          cmnamespace: 0,
          origin: '*'
        }
      });

      if (categoryResponse.data.query && categoryResponse.data.query.categorymembers.length > 0) {
        const members = categoryResponse.data.query.categorymembers;
        const randomIndex = Math.floor(Math.random() * members.length);
        const selectedMember = members[randomIndex];

        // Get detailed info about the selected person
        const detailResponse = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(selectedMember.title)}`);
        return personOfTheDayService.formatPersonData(detailResponse.data);
      }

      // Fallback: Try searching for "biography" articles
      const searchResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: 'biography born died',
          srlimit: 20,
          srnamespace: 0,
          origin: '*'
        }
      });

      if (searchResponse.data.query && searchResponse.data.query.search.length > 0) {
        const results = searchResponse.data.query.search;
        const randomIndex = Math.floor(Math.random() * results.length);
        const selectedResult = results[randomIndex];

        const detailResponse = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(selectedResult.title)}`);
        const data = detailResponse.data;

        // Verify it's about a person
        if (personOfTheDayService.isPersonArticle(data)) {
          return personOfTheDayService.formatPersonData(data);
        }
      }

      const knownBiographies = [
        // Existing ones
        'Albert Einstein', 'Marie Curie', 'Leonardo da Vinci', 'William Shakespeare',
        'Isaac Newton', 'Charles Darwin', 'Galileo Galilei', 'Aristotle',
        'Cleopatra', 'Napoleon Bonaparte', 'Winston Churchill', 'Martin Luther King Jr.',
        'Mahatma Gandhi', 'Nelson Mandela', 'Abraham Lincoln', 'George Washington',
        'Thomas Jefferson', 'Benjamin Franklin', 'Theodore Roosevelt', 'John F. Kennedy',
        'Maya Angelou', 'Eleanor Roosevelt', 'Rosa Parks', 'Frederick Douglass',
        'Nikola Tesla', 'Thomas Edison', 'Alexander Graham Bell', 'Steve Jobs',
        'Bill Gates', 'Walt Disney', 'Pablo Picasso', 'Vincent van Gogh',

        // Additional notable figures
        'Plato', 'Socrates', 'Confucius', 'Sun Tzu',
        'Julius Caesar', 'Alexander the Great', 'Genghis Khan',
        'Florence Nightingale', 'Mother Teresa', 'Jane Austen',
        'Frida Kahlo', 'Georgia O’Keeffe', 'Emily Dickinson',
        'Mark Twain', 'Ernest Hemingway', 'F. Scott Fitzgerald',
        'Charles Dickens', 'Victor Hugo', 'Fyodor Dostoevsky',
        'Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach',
        'Sigmund Freud', 'Carl Jung', 'Stephen Hawking',
        'Malcolm X', 'Desmond Tutu', 'Dalai Lama',
        'Barack Obama', 'Franklin D. Roosevelt', 'Margaret Thatcher',
        'Indira Gandhi', 'Jawaharlal Nehru', 'Subhas Chandra Bose',
        'Bhagat Singh', 'Chanakya', 'Swami Vivekananda',
        'Rabindranath Tagore', 'Sardar Vallabhbhai Patel', 'Rani Lakshmibai',
        'Chhatrapati Shivaji Maharaj', 'Tipu Sultan',
        'Sergey Brin', 'Larry Page', 'Elon Musk', 'Mark Zuckerberg',
        'Oprah Winfrey', 'Malala Yousafzai', 'Greta Thunberg'
      ];


      const todayIndex = new Date().getDate() % knownBiographies.length;
      const selectedBio = knownBiographies[todayIndex];

      const bioResponse = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(selectedBio)}`);
      return personOfTheDayService.formatPersonData(bioResponse.data);

    } catch (error) {
      console.error('Error fetching random person:', error);
      // Return error indicating online fetch failed
      return {
        id: 'error',
        name: "Wikipedia API Error",
        title: "Unable to fetch biographical data",
        description: "Sorry, we couldn't fetch today's person from Wikipedia. The service may be temporarily unavailable. Please try refreshing the page.",
        achievement: "Online biographical data unavailable",
        birthYear: "Unknown",
        field: "Error",
        image: "https://ui-avatars.com/api/?name=Wikipedia+Error&size=200&background=c41e3a&color=fff&bold=true",
        wikiUrl: "https://en.wikipedia.org"
      };
    }
  },

  // Check if Wikipedia article is about a person
  isPersonArticle: (data) => {
    const extract = (data.extract || '').toLowerCase();
    const description = (data.description || '').toLowerCase();
    const title = (data.title || '').toLowerCase();

    // Exclude general concept articles (these are NOT individual people)
    const generalConcepts = [
      'scientist', 'politician', 'writer', 'artist', 'musician', 'actor',
      'philosophy', 'science', 'politics', 'literature', 'art', 'music',
      'film', 'movie', 'album', 'song', 'book', 'novel', 'television',
      'tv series', 'video game', 'software', 'company', 'corporation',
      'building', 'monument', 'city', 'country', 'planet', 'species',
      'concept', 'theory', 'principle', 'method', 'technique', 'style'
    ];

    // If title matches a general concept, it's not a person
    for (const concept of generalConcepts) {
      if (title === concept || title.includes(`${concept} (`) || title.includes(`${concept}s`)) {
        return false;
      }
    }

    // Strong indicators it's about a specific person
    const personIndicators = [
      'born', 'died', 'was born', 'birth', 'death',
      'born in', 'died in', 'lived from', 'life span',
      'early life', 'childhood', 'education', 'career', 'married',
      'family', 'children', 'parents', 'mother', 'father'
    ];

    // Must have clear biographical indicators
    let hasPersonIndicator = false;
    for (const indicator of personIndicators) {
      if (extract.includes(indicator)) {
        hasPersonIndicator = true;
        break;
      }
    }

    // Additional check: description should suggest it's about a person
    const personDescriptions = [
      'born', 'died', 'politician', 'scientist', 'writer', 'author',
      'artist', 'musician', 'actor', 'actress', 'philosopher', 'inventor',
      'activist', 'leader', 'president', 'prime minister', 'king', 'queen',
      'emperor', 'founder', 'ceo', 'director', 'producer', 'singer',
      'composer', 'painter', 'sculptor', 'poet', 'novelist'
    ];

    let hasPersonDescription = false;
    for (const desc of personDescriptions) {
      if (description.includes(desc)) {
        hasPersonDescription = true;
        break;
      }
    }

    return hasPersonIndicator && hasPersonDescription;
  },

  // Format person data from Wikipedia API response
  formatPersonData: (data) => {
    const extract = data.extract || '';
    const description = data.description || '';

    // Enhanced birth year extraction with multiple patterns
    let birthYear = 'Unknown';
    console.log('Extracting birth year from:', extract.substring(0, 200)); // Debug log
    
    const birthPatterns = [
      /\((\d{4})[–\-]\d{4}\)/,                  // "(1853–1890)"
      /\((\d{4})[–\-]\d{2}\)/,                  // "(1853–90)"
      /born.*?(\d{4})/i,                        // "born 30 March 1853"
      /\b(\d{4})[–\-]\d{4}\b/,                 // "1853–1890"
      /\(.*?(\d{4}).*?\)/,                      // "(30 March 1853)"
      /(\d{1,2})\s+\w+\s+(\d{4})/,            // "30 March 1853"
      /\w+\s+(\d{1,2}),?\s+(\d{4})/,          // "March 30, 1853"
      /(\d{4})\s*[–\-]/                        // "1853 –" or "1853-"
    ];
    
    for (let i = 0; i < birthPatterns.length; i++) {
      const pattern = birthPatterns[i];
      const match = extract.match(pattern);
      if (match) {
        console.log(`Pattern ${i} matched:`, match); // Debug log
        let year;
        
        // Handle different capture groups
        if (i === 5) { // "30 March 1853" - year is in group 2
          year = match[2];
        } else if (i === 6) { // "March 30, 1853" - year is in group 2  
          year = match[2];
        } else {
          year = match[1]; // Most patterns have year in group 1
        }
        
        // Validate year (must be reasonable)
        const yearNum = parseInt(year);
        if (yearNum >= 1000 && yearNum <= new Date().getFullYear()) {
          birthYear = year;
          console.log('Found birth year:', birthYear); // Debug log
          break;
        }
      }
    }
    
    if (birthYear === 'Unknown') {
      console.log('No birth year found'); // Debug log
    }

    // Enhanced achievement extraction - keep it SHORT and specific
    let achievement = 'Notable historical figure';
    
    // Look for specific short achievements first
    const specificAchievements = [
      { pattern: /won.*?Nobel Prize.*?(?:in|for)\s+([^.]{1,30})/i, template: 'Nobel Prize winner' },
      { pattern: /president of ([^.]{1,25})/i, template: 'Former President' },
      { pattern: /prime minister of ([^.]{1,25})/i, template: 'Former Prime Minister' },
      { pattern: /founded ([^.]{1,30})/i, template: 'Founded $1' },
      { pattern: /invented ([^.]{1,30})/i, template: 'Invented $1' },
      { pattern: /discovered ([^.]{1,30})/i, template: 'Discovered $1' },
      { pattern: /wrote ([^.]{1,30})/i, template: 'Author of $1' },
      { pattern: /painted ([^.]{1,30})/i, template: 'Painted $1' },
      { pattern: /composed ([^.]{1,30})/i, template: 'Composed $1' }
    ];
    
    for (const item of specificAchievements) {
      const match = extract.match(item.pattern);
      if (match) {
        if (item.template.includes('$1') && match[1]) {
          achievement = item.template.replace('$1', match[1].trim());
        } else {
          achievement = item.template;
        }
        break;
      }
    }
    
    // If no specific achievement, extract from description (much shorter)
    if (achievement === 'Notable historical figure' && description) {
      const desc = description.trim();
      if (desc.length > 0 && desc.length <= 60) {
        achievement = desc;
      } else if (desc.length > 60) {
        // Find a good break point
        const shortened = desc.substring(0, 50);
        const lastSpace = shortened.lastIndexOf(' ');
        achievement = (lastSpace > 20 ? shortened.substring(0, lastSpace) : shortened) + '...';
      }
    }
    
    // Final fallback: extract key role from first part of extract
    if (achievement === 'Notable historical figure') {
      const rolePatterns = [
        /was an? ([^.]{10,40})/i,
        /was a ([^.]{10,40})/i,
        /is an? ([^.]{10,40})/i,
        /is a ([^.]{10,40})/i
      ];
      
      for (const pattern of rolePatterns) {
        const match = extract.match(pattern);
        if (match && match[1]) {
          achievement = match[1].trim();
          if (achievement.length > 50) {
            achievement = achievement.substring(0, 47) + '...';
          }
          break;
        }
      }
    }

    // Enhanced field determination
    let field = 'Notable Figure';
    const descLower = description.toLowerCase();
    const extractLower = extract.toLowerCase();

    if (descLower.includes('politician') || extractLower.includes('president') ||
      extractLower.includes('minister') || extractLower.includes('senator') ||
      extractLower.includes('governor') || extractLower.includes('mayor')) {
      field = 'Politics & Government';
    } else if (descLower.includes('scientist') || extractLower.includes('physicist') ||
      extractLower.includes('chemist') || extractLower.includes('biologist') ||
      extractLower.includes('researcher') || extractLower.includes('nobel prize')) {
      field = 'Science & Research';
    } else if (descLower.includes('writer') || descLower.includes('author') ||
      extractLower.includes('novel') || extractLower.includes('poetry') ||
      extractLower.includes('wrote') || extractLower.includes('books')) {
      field = 'Literature & Writing';
    } else if (descLower.includes('artist') || descLower.includes('painter') ||
      extractLower.includes('painting') || extractLower.includes('sculpture')) {
      field = 'Arts & Culture';
    } else if (descLower.includes('actor') || descLower.includes('actress') ||
      extractLower.includes('film') || extractLower.includes('movie')) {
      field = 'Entertainment';
    } else if (descLower.includes('musician') || descLower.includes('composer') ||
      extractLower.includes('music') || extractLower.includes('orchestra')) {
      field = 'Music';
    } else if (descLower.includes('inventor') || extractLower.includes('invention') ||
      extractLower.includes('patent') || extractLower.includes('technology')) {
      field = 'Innovation & Technology';
    } else if (extractLower.includes('activist') || extractLower.includes('rights') ||
      extractLower.includes('movement') || extractLower.includes('reform')) {
      field = 'Activism & Social Change';
    }

    return {
      id: data.pageid,
      name: data.title,
      title: data.description || 'Historical Figure',
      description: data.extract.substring(0, 300) + (data.extract.length > 300 ? '...' : ''),
      achievement: achievement,
      birthYear: birthYear,
      field: field,
      image: data.thumbnail?.source || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.title)}&size=200&background=c41e3a&color=fff&bold=true`,
      wikiUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`
    };
  }
};
