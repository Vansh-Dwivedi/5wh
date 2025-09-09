const express = require('express');
const router = express.Router();
const { auth, editorAuth, adminAuth } = require('../middleware/auth');

// Mock data for book recommendations (in a real app, this would come from a database or external API)
let bookRecommendations = [
  {
    id: 1,
    title: "The Heritage of Punjab: Stories from the Land of Five Rivers",
    author: "Dr. Amarjit Singh",
    description: "A comprehensive exploration of Punjab's rich cultural heritage, traditions, and the stories that shaped its identity through centuries.",
    category: "History & Culture",
    rating: 4.8,
    publishedYear: "2024",
    isbn: "978-0123456789",
    amazonLink: "https://amazon.com/dp/B08XYZ123",
    source: "Amazon",
    price: "$24.99",
    createdAt: new Date(),
    createdBy: "admin"
  },
  {
    id: 2,
    title: "Modern Sikh Philosophy: Bridging Tradition and Contemporary Thought",
    author: "Prof. Jasbir Kaur",
    description: "An insightful analysis of how Sikh philosophy adapts to modern challenges while maintaining its core spiritual values.",
    category: "Philosophy & Religion",
    rating: 4.6,
    publishedYear: "2023",
    isbn: "978-0123456790",
    amazonLink: "https://amazon.com/dp/B08ABC456",
    source: "Amazon",
    price: "$19.99",
    createdAt: new Date(),
    createdBy: "admin"
  },
  {
    id: 3,
    title: "Culinary Journeys: Traditional Punjabi Recipes and Their Stories",
    author: "Chef Manjit Kaur",
    description: "Discover the stories behind traditional Punjabi dishes and learn authentic recipes passed down through generations.",
    category: "Cooking & Lifestyle",
    rating: 4.9,
    publishedYear: "2024",
    isbn: "978-0123456791",
    amazonLink: "https://amazon.com/dp/B08DEF789",
    source: "Amazon",
    price: "$29.99",
    createdAt: new Date(),
    createdBy: "admin"
  }
];

// Mock data for cultural events
const culturalEvents = [
  {
    id: 1,
    type: "Festival",
    title: "Vaisakhi 2025 Global Celebrations",
    description: "Join communities worldwide in celebrating the harvest festival and Sikh New Year with traditional music, dance, and community gatherings.",
    date: "April 13, 2025",
    location: "Global - Multiple Cities",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    organizer: "Global Sikh Community",
    ticketPrice: "Free"
  },
  {
    id: 2,
    type: "Art Exhibition",
    title: "Contemporary Punjabi Art: Tradition Meets Modernity",
    description: "Experience modern interpretations of traditional themes by emerging Punjab artists showcasing the evolution of regional art.",
    date: "September 15-30, 2025",
    location: "Virtual Gallery & Select Physical Locations",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    organizer: "Punjab Arts Council",
    ticketPrice: "$15-25"
  },
  {
    id: 3,
    type: "Workshop",
    title: "Traditional Punjabi Cooking Masterclass",
    description: "Learn authentic Punjabi recipes and cooking techniques from master chefs, including the secrets of perfect rotis and dal.",
    date: "Every Saturday in September",
    location: "Community Centers Worldwide",
    image: "https://images.unsplash.com/photo-1556909114-4e3dd6eb4632?w=400&h=300&fit=crop",
    organizer: "Culinary Heritage Foundation",
    ticketPrice: "$30-40"
  }
];

// GET /api/lifeculture/books - Get book recommendations
router.get('/books', async (req, res) => {
  try {
    // In a real application, you might fetch from:
    // - Google Books API
    // - Goodreads API
    // - Your own database
    // For now, we'll return mock data
    
    res.json({
      success: true,
      data: bookRecommendations,
      message: 'Book recommendations fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching book recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/lifeculture/cultural-events - Get cultural events
router.get('/cultural-events', async (req, res) => {
  try {
    // In a real application, you might fetch from:
    // - Eventbrite API
    // - Facebook Events API
    // - Your own events database
    // For now, we'll return mock data
    
    res.json({
      success: true,
      data: culturalEvents,
      message: 'Cultural events fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching cultural events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cultural events',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/lifeculture/books/:id - Get specific book details
router.get('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = bookRecommendations.find(b => b.id === parseInt(id));
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: book,
      message: 'Book details fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/lifeculture/cultural-events/:id - Get specific event details
router.get('/cultural-events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = culturalEvents.find(e => e.id === parseInt(id));
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: event,
      message: 'Event details fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ===== ADMIN ROUTES FOR BOOK MANAGEMENT =====

// POST /api/lifeculture/books - Add new book (Admin only)
router.post('/books', adminAuth, async (req, res) => {
  try {
    const { title, author, description, category, amazonLink, source, price, isbn, rating, publishedYear } = req.body;
    
    // Validation
    if (!title || !author || !description || !amazonLink) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, description, and Amazon link are required'
      });
    }
    
    const newBook = {
      id: bookRecommendations.length + 1,
      title,
      author,
      description,
      category: category || 'General',
      rating: rating || 0,
      publishedYear: publishedYear || new Date().getFullYear().toString(),
      isbn: isbn || '',
      amazonLink,
      source: source || 'Amazon',
      price: price || '',
      createdAt: new Date(),
      createdBy: req.user.username
    };
    
    bookRecommendations.push(newBook);
    
    res.status(201).json({
      success: true,
      data: newBook,
      message: 'Book added successfully'
    });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add book',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/lifeculture/books/:id - Update book (Admin only)
router.put('/books/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const bookIndex = bookRecommendations.findIndex(b => b.id === parseInt(id));
    
    if (bookIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const { title, author, description, category, amazonLink, source, price, isbn, rating, publishedYear } = req.body;
    
    // Update book
    bookRecommendations[bookIndex] = {
      ...bookRecommendations[bookIndex],
      title: title || bookRecommendations[bookIndex].title,
      author: author || bookRecommendations[bookIndex].author,
      description: description || bookRecommendations[bookIndex].description,
      category: category || bookRecommendations[bookIndex].category,
      amazonLink: amazonLink || bookRecommendations[bookIndex].amazonLink,
      source: source || bookRecommendations[bookIndex].source,
      price: price || bookRecommendations[bookIndex].price,
      isbn: isbn || bookRecommendations[bookIndex].isbn,
      rating: rating !== undefined ? rating : bookRecommendations[bookIndex].rating,
      publishedYear: publishedYear || bookRecommendations[bookIndex].publishedYear,
      updatedAt: new Date(),
      updatedBy: req.user.username
    };
    
    res.json({
      success: true,
      data: bookRecommendations[bookIndex],
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE /api/lifeculture/books/:id - Delete book (Admin only)
router.delete('/books/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const bookIndex = bookRecommendations.findIndex(b => b.id === parseInt(id));
    
    if (bookIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const deletedBook = bookRecommendations.splice(bookIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedBook,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/lifeculture/books/admin - Get all books for admin management
router.get('/books/admin', editorAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: bookRecommendations,
      message: 'Books fetched successfully for admin'
    });
  } catch (error) {
    console.error('Error fetching books for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;