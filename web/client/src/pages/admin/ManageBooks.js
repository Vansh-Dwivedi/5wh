import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Alert,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  MenuBook,
  Star
} from '@mui/icons-material';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    amazonLink: '',
    source: 'Amazon',
    price: '',
    isbn: '',
    rating: 0,
    publishedYear: new Date().getFullYear().toString()
  });

  const categories = [
    'History & Culture',
    'Philosophy & Religion', 
    'Cooking & Lifestyle',
    'Photography',
    'Spirituality & Wellness',
    'Biography',
    'Fiction',
    'Non-Fiction',
    'General'
  ];

  useEffect(() => {
    fetchBooks();
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    // Add sample data if localStorage is empty
    const storedBooks = localStorage.getItem('adminBookRecommendations');
    if (!storedBooks || JSON.parse(storedBooks).length === 0) {
      const sampleBooks = [
        {
          id: 1,
          title: "The Power of Now",
          author: "Eckhart Tolle",
          description: "A guide to spiritual enlightenment and present moment awareness that has transformed millions of lives.",
          category: "Spirituality & Wellness",
          amazonLink: "https://amazon.com/dp/1577314808",
          source: "Admin Sample",
          rating: 4.5,
          publishedYear: "1997",
          isbn: "978-1577314806",
          price: "$15.99",
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('adminBookRecommendations', JSON.stringify(sampleBooks));
      setBooks(sampleBooks);
    }
  };

  const fetchBooks = () => {
    try {
      setLoading(true);
      const storedBooks = localStorage.getItem('adminBookRecommendations');
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to fetch books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    try {
      if (!formData.title || !formData.author || !formData.description || !formData.amazonLink) {
        setError('Please fill in all required fields');
        return;
      }

      let updatedBooks;
      if (editingBook) {
        // Update existing book
        updatedBooks = books.map(book => 
          book.id === editingBook.id 
            ? { ...formData, id: editingBook.id, updatedAt: new Date().toISOString() }
            : book
        );
        setSuccess('Book updated successfully');
      } else {
        // Create new book
        const newBook = {
          ...formData,
          id: Date.now(), // Simple ID generation
          createdAt: new Date().toISOString()
        };
        updatedBooks = [...books, newBook];
        setSuccess('Book added successfully');
      }
      
      // Save to localStorage
      localStorage.setItem('adminBookRecommendations', JSON.stringify(updatedBooks));
      setBooks(updatedBooks);
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving book:', error);
      setError('Failed to save book');
    }
  };

  const handleDelete = (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const updatedBooks = books.filter(book => book.id !== bookId);
        localStorage.setItem('adminBookRecommendations', JSON.stringify(updatedBooks));
        setBooks(updatedBooks);
        setSuccess('Book deleted successfully');
      } catch (error) {
        console.error('Error deleting book:', error);
        setError('Failed to delete book');
      }
    }
  };

  const handleOpenDialog = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title || '',
        author: book.author || '',
        description: book.description || '',
        category: book.category || '',
        amazonLink: book.amazonLink || '',
        source: book.source || 'Amazon',
        price: book.price || '',
        isbn: book.isbn || '',
        rating: book.rating || 0,
        publishedYear: book.publishedYear || new Date().getFullYear().toString()
      });
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        description: '',
        category: '',
        amazonLink: '',
        source: 'Amazon',
        price: '',
        isbn: '',
        rating: 0,
        publishedYear: new Date().getFullYear().toString()
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBook(null);
    setError('');
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading books...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MenuBook sx={{ fontSize: '2rem', color: '#c41e3a', mr: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Manage Book Recommendations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#c41e3a', '&:hover': { backgroundColor: '#a01729' } }}
        >
          Add New Book
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={12} md={6} lg={4} key={book.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip 
                    label={book.category} 
                    size="small" 
                    sx={{ backgroundColor: '#f0f8ff', color: '#1976d2' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {book.source}
                  </Typography>
                </Box>
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {book.title}
                </Typography>
                
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                  by {book.author}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4 }}>
                  {book.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Published {book.publishedYear}
                  </Typography>
                  {book.rating > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ fontSize: '1rem', color: '#ff9800', mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                        {book.rating}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {book.price && (
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    {book.price}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<LaunchIcon />}
                    onClick={() => window.open(book.amazonLink, '_blank')}
                  >
                    View on Amazon
                  </Button>
                  
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(book)}
                      sx={{ color: '#1976d2' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(book.id)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {books.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <MenuBook sx={{ fontSize: '4rem', color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No books added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by adding your first book recommendation
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ backgroundColor: '#c41e3a', '&:hover': { backgroundColor: '#a01729' } }}
          >
            Add First Book
          </Button>
        </Paper>
      )}

      {/* Add/Edit Book Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBook ? 'Edit Book' : 'Add New Book'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title *"
                value={formData.title}
                onChange={handleChange('title')}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Author *"
                value={formData.author}
                onChange={handleChange('author')}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleChange('category')}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                value={formData.description}
                onChange={handleChange('description')}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amazon Link *"
                value={formData.amazonLink}
                onChange={handleChange('amazonLink')}
                variant="outlined"
                placeholder="https://amazon.com/dp/..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                value={formData.price}
                onChange={handleChange('price')}
                variant="outlined"
                placeholder="$19.99"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Published Year"
                value={formData.publishedYear}
                onChange={handleChange('publishedYear')}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ISBN"
                value={formData.isbn}
                onChange={handleChange('isbn')}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Source"
                value={formData.source}
                onChange={handleChange('source')}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography component="legend" sx={{ mb: 1 }}>Rating</Typography>
                <Rating
                  value={formData.rating}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({ ...prev, rating: newValue || 0 }));
                  }}
                  precision={0.1}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ backgroundColor: '#c41e3a', '&:hover': { backgroundColor: '#a01729' } }}
          >
            {editingBook ? 'Update' : 'Add'} Book
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageBooks;
