// Real quotes service with authentic historical and inspirational quotes
import axios from 'axios';

// Cache for quotes data
const quotesCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Enhanced quotes database with real historical quotes
// Philosophy-only curated pool
const philosophyQuotes = [
  {
    id: 101,
    text: "The unexamined life is not worth living.",
    author: "Socrates",
    category: "Philosophy",
    year: "4th century BCE",
    context: "Apology",
    verified: true
  },
  {
    id: 102,
    text: "Cogito, ergo sum.",
    author: "René Descartes",
    category: "Philosophy",
    year: "1637",
    context: "Discourse on the Method",
    verified: true
  },
  {
    id: 103,
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "Philosophy",
    year: "2nd century",
    context: "Meditations",
    verified: true
  },
  {
    id: 104,
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    category: "Philosophy",
    year: "1st century",
    context: "Letters to Lucilius",
    verified: true
  },
  {
    id: 105,
    text: "It is not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    category: "Philosophy",
    year: "1st century",
    context: "Enchiridion",
    verified: true
  },
  {
    id: 106,
    text: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    category: "Philosophy",
    year: "6th century BCE",
    context: "Tao Te Ching",
    verified: true
  },
  {
    id: 107,
    text: "Real knowledge is to know the extent of one's ignorance.",
    author: "Confucius",
    category: "Philosophy",
    year: "5th century BCE",
    context: "Analects",
    verified: true
  },
  {
    id: 108,
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    category: "Philosophy",
    year: "1889",
    context: "Twilight of the Idols",
    verified: true
  },
  {
    id: 109,
    text: "Act only according to that maxim whereby you can at the same time will that it should become a universal law.",
    author: "Immanuel Kant",
    category: "Philosophy",
    year: "1785",
    context: "Groundwork of the Metaphysics of Morals",
    verified: true
  },
  {
    id: 110,
    text: "Life can only be understood backwards; but it must be lived forwards.",
    author: "Søren Kierkegaard",
    category: "Philosophy",
    year: "1843",
    context: "Journals",
    verified: true
  },
  {
    id: 111,
    text: "The beginning of wisdom is the definition of terms.",
    author: "Socrates",
    category: "Philosophy",
    year: "4th century BCE",
    context: "Attributed",
    verified: false
  },
  {
    id: 112,
    text: "Happiness is the highest good.",
    author: "Aristotle",
    category: "Philosophy",
    year: "4th century BCE",
    context: "Nicomachean Ethics",
    verified: true
  },
  {
    id: 113,
    text: "The greatest wealth is to live content with little.",
    author: "Plato",
    category: "Philosophy",
    year: "4th century BCE",
    context: "Attributed",
    verified: false
  },
  {
    id: 114,
    text: "There is nothing either good or bad, but thinking makes it so.",
    author: "William Shakespeare",
    category: "Philosophy",
    year: "1600s",
    context: "Hamlet",
    verified: true
  },
  {
    id: 115,
    text: "What we know is a drop, what we don't know is an ocean.",
    author: "Isaac Newton",
    category: "Philosophy",
    year: "1700s",
    context: "Attributed",
    verified: false
  },
  {
    id: 116,
    text: "He who conquers himself is the mightiest warrior.",
    author: "Confucius",
    category: "Philosophy",
    year: "5th century BCE",
    context: "Attributed",
    verified: false
  }
];

// Regional/cultural quotes
const regionalQuotes = {
  punjabi: [
    {
      id: 21,
      text: "Truth is the highest virtue, but higher still is truthful living.",
      author: "Guru Nanak Dev Ji",
      category: "Truth",
      year: "1500s",
      context: "Sikh teachings",
      verified: true
    },
    {
      id: 22,
      text: "Even kings and emperors with heaps of wealth and vast dominion cannot compare with an ant filled with the love of God.",
      author: "Guru Nanak Dev Ji",
      category: "Spirituality",
      year: "1500s",
      context: "Guru Granth Sahib",
      verified: true
    },
    {
      id: 23,
      text: "He who has no faith in himself can never have faith in God.",
      author: "Swami Vivekananda",
      category: "Faith",
      year: "1890s",
      context: "Chicago World Parliament",
      verified: true
    }
  ]
};

export const quotesService = {
  // Get quote of the day based on region and date
  getQuoteOfTheDay: (userLocation, userRegion) => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
  // Philosophy only
  let quotesPool = philosophyQuotes;
    
    // Select quote based on day of year for consistency
    const quoteIndex = dayOfYear % quotesPool.length;
    return quotesPool[quoteIndex];
  },

  // Get quotes by category
  getQuotesByCategory: (category) => {
    return philosophyQuotes.filter(quote => 
      quote.category.toLowerCase() === category.toLowerCase()
    );
  },

  // Get random quote
  getRandomQuote: () => {
    const randomIndex = Math.floor(Math.random() * philosophyQuotes.length);
    return philosophyQuotes[randomIndex];
  },

  // Get all available categories
  getCategories: () => {
    const categories = [...new Set(philosophyQuotes.map(quote => quote.category))];
    return categories.sort();
  },

  // Fetch quote from external API (as backup)
  fetchExternalQuote: async () => {
    try {
      // Using quotable.io as a backup source
    const response = await axios.get('https://api.quotable.io/random', {
        params: {
      minLength: 50,
      maxLength: 200,
      tags: 'philosophy'
        }
      });

      return {
        id: `ext_${Date.now()}`,
        text: response.data.content,
        author: response.data.author,
  category: 'Philosophy',
        year: 'Unknown',
        context: 'External source',
        verified: false
      };
    } catch (error) {
      console.error('Error fetching external quote:', error);
      return quotesService.getRandomQuote();
    }
  },

  // Get enhanced quote with metadata
  getEnhancedQuote: async (userLocation, userRegion) => {
    try {
      const quote = quotesService.getQuoteOfTheDay(userLocation, userRegion);
      
      // Add some enhancement like word count, reading time, etc.
      const wordCount = quote.text.split(' ').length;
      const readingTime = Math.ceil(wordCount / 200); // Average reading speed
      
      return {
        ...quote,
        metadata: {
          wordCount,
          readingTime: readingTime < 1 ? '< 1 minute' : `${readingTime} minute${readingTime > 1 ? 's' : ''}`,
          shareUrl: `https://yoursite.com/quote/${quote.id}`,
          isToday: true
        }
      };
    } catch (error) {
      console.error('Error getting enhanced quote:', error);
      return quotesService.getRandomQuote();
    }
  },

  // Add custom quote (for admin use)
  addCustomQuote: (quote) => {
    const newQuote = {
      ...quote,
      id: Date.now(),
      verified: false
    };
  philosophyQuotes.push(newQuote);
    return newQuote;
  },

  // Search quotes
  searchQuotes: (searchTerm) => {
    const term = searchTerm.toLowerCase();
  return philosophyQuotes.filter(quote => 
      quote.text.toLowerCase().includes(term) ||
      quote.author.toLowerCase().includes(term) ||
      quote.category.toLowerCase().includes(term)
    );
  }
};
