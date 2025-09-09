const express = require('express');
const router = express.Router();
const { auth, editorAuth, adminAuth } = require('../middleware/auth');

// Book recommendations storage - only real data from admin
let bookRecommendations = [];

// Cultural events storage - only real data from admin  
let culturalEvents = [];

// ID counters for new entries
let nextBookId = 1;
let nextEventId = 1;

// GET /api/lifeculture/books - Get book recommendations
router.get('/books', async (req, res) => {
  try {
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
    const bookId = parseInt(req.params.id);
    const book = bookRecommendations.find(b => b.id === bookId);
    
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
    const eventId = parseInt(req.params.id);
    const event = culturalEvents.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Cultural event not found'
      });
    }
    
    res.json({
      success: true,
      data: event,
      message: 'Cultural event details fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching cultural event details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cultural event details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/lifeculture/books - Add new book recommendation (Admin only)
router.post('/books', adminAuth, async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      category,
      rating,
      publishedYear,
      isbn,
      amazonLink,
      source,
      price
    } = req.body;

    // Basic validation
    if (!title || !author || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and description are required'
      });
    }

    const newBook = {
      id: nextBookId++,
      title,
      author,
      description,
      category: category || 'General',
      rating: rating ? parseFloat(rating) : null,
      publishedYear,
      isbn,
      amazonLink,
      source: source || 'Admin',
      price,
      createdAt: new Date(),
      createdBy: req.user.username
    };

    bookRecommendations.push(newBook);

    res.status(201).json({
      success: true,
      data: newBook,
      message: 'Book recommendation added successfully'
    });
  } catch (error) {
    console.error('Error adding book recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add book recommendation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/lifeculture/books/:id - Update book recommendation (Admin only)
router.put('/books/:id', adminAuth, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const bookIndex = bookRecommendations.findIndex(b => b.id === bookId);
    
    if (bookIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const {
      title,
      author,
      description,
      category,
      rating,
      publishedYear,
      isbn,
      amazonLink,
      source,
      price
    } = req.body;

    // Update the book
    const updatedBook = {
      ...bookRecommendations[bookIndex],
      title: title || bookRecommendations[bookIndex].title,
      author: author || bookRecommendations[bookIndex].author,
      description: description || bookRecommendations[bookIndex].description,
      category: category || bookRecommendations[bookIndex].category,
      rating: rating ? parseFloat(rating) : bookRecommendations[bookIndex].rating,
      publishedYear: publishedYear || bookRecommendations[bookIndex].publishedYear,
      isbn: isbn || bookRecommendations[bookIndex].isbn,
      amazonLink: amazonLink || bookRecommendations[bookIndex].amazonLink,
      source: source || bookRecommendations[bookIndex].source,
      price: price || bookRecommendations[bookIndex].price,
      updatedAt: new Date(),
      updatedBy: req.user.username
    };

    bookRecommendations[bookIndex] = updatedBook;

    res.json({
      success: true,
      data: updatedBook,
      message: 'Book recommendation updated successfully'
    });
  } catch (error) {
    console.error('Error updating book recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update book recommendation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE /api/lifeculture/books/:id - Delete book recommendation (Admin only)
router.delete('/books/:id', adminAuth, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const bookIndex = bookRecommendations.findIndex(b => b.id === bookId);
    
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
      message: 'Book recommendation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book recommendation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/lifeculture/cultural-events - Add new cultural event (Admin only)
router.post('/cultural-events', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      date,
      location,
      image,
      organizer,
      ticketPrice
    } = req.body;

    // Basic validation
    if (!title || !description || !date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date, and location are required'
      });
    }

    const newEvent = {
      id: nextEventId++,
      title,
      description,
      type: type || 'Event',
      date,
      location,
      image,
      organizer,
      ticketPrice,
      createdAt: new Date(),
      createdBy: req.user.username
    };

    culturalEvents.push(newEvent);

    res.status(201).json({
      success: true,
      data: newEvent,
      message: 'Cultural event added successfully'
    });
  } catch (error) {
    console.error('Error adding cultural event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add cultural event',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/lifeculture/cultural-events/:id - Update cultural event (Admin only)
router.put('/cultural-events/:id', adminAuth, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const eventIndex = culturalEvents.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cultural event not found'
      });
    }

    const {
      title,
      description,
      type,
      date,
      location,
      image,
      organizer,
      ticketPrice
    } = req.body;

    // Update the event
    const updatedEvent = {
      ...culturalEvents[eventIndex],
      title: title || culturalEvents[eventIndex].title,
      description: description || culturalEvents[eventIndex].description,
      type: type || culturalEvents[eventIndex].type,
      date: date || culturalEvents[eventIndex].date,
      location: location || culturalEvents[eventIndex].location,
      image: image || culturalEvents[eventIndex].image,
      organizer: organizer || culturalEvents[eventIndex].organizer,
      ticketPrice: ticketPrice || culturalEvents[eventIndex].ticketPrice,
      updatedAt: new Date(),
      updatedBy: req.user.username
    };

    culturalEvents[eventIndex] = updatedEvent;

    res.json({
      success: true,
      data: updatedEvent,
      message: 'Cultural event updated successfully'
    });
  } catch (error) {
    console.error('Error updating cultural event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cultural event',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE /api/lifeculture/cultural-events/:id - Delete cultural event (Admin only)
router.delete('/cultural-events/:id', adminAuth, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const eventIndex = culturalEvents.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cultural event not found'
      });
    }

    const deletedEvent = culturalEvents.splice(eventIndex, 1)[0];

    res.json({
      success: true,
      data: deletedEvent,
      message: 'Cultural event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cultural event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cultural event',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
