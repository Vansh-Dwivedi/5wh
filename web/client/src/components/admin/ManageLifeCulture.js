import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook,
  Event,
  Article,
  Star,
  Person,
  CalendarToday,
  LocationOn,
  Category
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ManageLifeCulture = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'article', 'book', 'event'
  const [editingItem, setEditingItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Data states
  const [articles, setArticles] = useState([]);
  const [books, setBooks] = useState([]);
  const [events, setEvents] = useState([]);
  const [latestStories, setLatestStories] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);

  // Form states
  const [articleForm, setArticleForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    image: '',
    publishedAt: new Date().toISOString().split('T')[0]
  });

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    rating: 0,
    publishedYear: '',
    isbn: '',
    amazonLink: '',
    source: '',
    price: ''
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: '',
    date: '',
    location: '',
    image: '',
    organizer: '',
    ticketPrice: ''
  });

  const [storyForm, setStoryForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    image: '',
    publishedAt: new Date().toISOString().split('T')[0],
    featured: false
  });

  const [featuredEventForm, setFeaturedEventForm] = useState({
    title: '',
    description: '',
    type: '',
    date: '',
    location: '',
    image: '',
    organizer: '',
    ticketPrice: '',
    featured: true
  });

  useEffect(() => {
    loadData();
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    // Add sample data if localStorage is empty
    const storedBooks = localStorage.getItem('adminBookRecommendations');
    if (!storedBooks) {
      const sampleBooks = [
        {
          id: 1,
          title: "The Power of Now",
          author: "Eckhart Tolle",
          description: "A guide to spiritual enlightenment and present moment awareness.",
          category: "Spirituality",
          rating: 4.5,
          publishedYear: "1997",
          isbn: "978-1577314806",
          amazonLink: "https://amazon.com/dp/1577314808",
          source: "Admin Sample",
          price: "$15.99",
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('adminBookRecommendations', JSON.stringify(sampleBooks));
      setBooks(sampleBooks);
    }

    const storedEvents = localStorage.getItem('adminCulturalEvents');
    if (!storedEvents) {
      const sampleEvents = [
        {
          id: 1,
          title: "Punjab Folk Music Festival",
          description: "A celebration of traditional Punjabi folk music and dance.",
          type: "Music Festival",
          date: "2025-10-15",
          location: "Chandigarh, Punjab",
          image: "https://example.com/folk-festival.jpg",
          organizer: "Punjab Cultural Society",
          ticketPrice: "₹500",
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('adminCulturalEvents', JSON.stringify(sampleEvents));
      setEvents(sampleEvents);
    }

    const storedFeaturedEvents = localStorage.getItem('adminFeaturedEvents');
    if (!storedFeaturedEvents) {
      const sampleFeaturedEvents = [
        {
          id: 1,
          title: "Punjabi Literature Festival 2025",
          description: "A grand celebration of Punjabi literature featuring renowned authors and poets.",
          type: "Literature Festival",
          date: "2025-11-20",
          location: "Amritsar, Punjab",
          image: "https://example.com/lit-festival.jpg",
          organizer: "Punjab Literary Society",
          ticketPrice: "₹300",
          featured: true,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('adminFeaturedEvents', JSON.stringify(sampleFeaturedEvents));
      setFeaturedEvents(sampleFeaturedEvents);
    }

    const storedLatestStories = localStorage.getItem('adminLatestStories');
    if (!storedLatestStories) {
      const sampleLatestStories = [
        {
          id: 1,
          title: "The Revival of Traditional Punjabi Crafts",
          excerpt: "How modern artisans are keeping age-old Punjabi handicrafts alive in the digital age.",
          content: "Traditional Punjabi crafts are experiencing a renaissance in today's digital world...",
          author: "Admin",
          category: "Crafts & Heritage",
          image: "https://example.com/punjabi-crafts.jpg",
          publishedAt: new Date().toISOString().split('T')[0],
          featured: false,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('adminLatestStories', JSON.stringify(sampleLatestStories));
      setLatestStories(sampleLatestStories);
    }
  };

  const loadData = () => {
    try {
      // Load from localStorage with correct keys
      const storedArticles = localStorage.getItem('adminLifeCultureContent');
      const storedBooks = localStorage.getItem('adminBookRecommendations');
      const storedEvents = localStorage.getItem('adminCulturalEvents');
      const storedLatestStories = localStorage.getItem('adminLatestStories');
      const storedFeaturedEvents = localStorage.getItem('adminFeaturedEvents');

      if (storedArticles) {
        setArticles(JSON.parse(storedArticles));
      } else {
        setArticles([]);
      }
      
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      } else {
        setBooks([]);
      }
      
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      } else {
        setEvents([]);
      }

      if (storedLatestStories) {
        setLatestStories(JSON.parse(storedLatestStories));
      } else {
        setLatestStories([]);
      }

      if (storedFeaturedEvents) {
        setFeaturedEvents(JSON.parse(storedFeaturedEvents));
      } else {
        setFeaturedEvents([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setArticles([]);
      setBooks([]);
      setEvents([]);
      setLatestStories([]);
      setFeaturedEvents([]);
    }
  };

  const saveData = (type, data) => {
    try {
      localStorage.setItem(type, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openAddDialog = (type) => {
    setDialogType(type);
    setEditingItem(null);
    resetForm(type);
    setOpenDialog(true);
  };

  const openEditDialog = (type, item) => {
    setDialogType(type);
    setEditingItem(item);
    populateForm(type, item);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setDialogType('');
  };

  const resetForm = (type) => {
    if (type === 'article') {
      setArticleForm({
        title: '',
        excerpt: '',
        content: '',
        author: '',
        category: '',
        image: '',
        publishedAt: new Date().toISOString().split('T')[0]
      });
    } else if (type === 'book') {
      setBookForm({
        title: '',
        author: '',
        description: '',
        category: '',
        rating: 0,
        publishedYear: '',
        isbn: '',
        amazonLink: '',
        source: '',
        price: ''
      });
    } else if (type === 'event') {
      setEventForm({
        title: '',
        description: '',
        type: '',
        date: '',
        location: '',
        image: '',
        organizer: '',
        ticketPrice: ''
      });
    } else if (type === 'story') {
      setStoryForm({
        title: '',
        excerpt: '',
        content: '',
        author: '',
        category: '',
        image: '',
        publishedAt: new Date().toISOString().split('T')[0],
        featured: false
      });
    } else if (type === 'featuredEvent') {
      setFeaturedEventForm({
        title: '',
        description: '',
        type: '',
        date: '',
        location: '',
        image: '',
        organizer: '',
        ticketPrice: '',
        featured: true
      });
    }
  };

  const populateForm = (type, item) => {
    if (type === 'article') {
      setArticleForm(item);
    } else if (type === 'book') {
      setBookForm(item);
    } else if (type === 'event') {
      setEventForm(item);
    } else if (type === 'story') {
      setStoryForm(item);
    } else if (type === 'featuredEvent') {
      setFeaturedEventForm(item);
    }
  };

  const handleSave = () => {
    // Basic validation
    if (dialogType === 'article') {
      if (!articleForm.title || !articleForm.author || !articleForm.content) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields (Title, Author, Content)',
          severity: 'error'
        });
        return;
      }
    } else if (dialogType === 'book') {
      if (!bookForm.title || !bookForm.author || !bookForm.description) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields (Title, Author, Description)',
          severity: 'error'
        });
        return;
      }
    } else if (dialogType === 'event') {
      if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.location) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields (Title, Description, Date, Location)',
          severity: 'error'
        });
        return;
      }
    } else if (dialogType === 'story') {
      if (!storyForm.title || !storyForm.author || !storyForm.content) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields (Title, Author, Content)',
          severity: 'error'
        });
        return;
      }
    } else if (dialogType === 'featuredEvent') {
      if (!featuredEventForm.title || !featuredEventForm.description || !featuredEventForm.date || !featuredEventForm.location) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields (Title, Description, Date, Location)',
          severity: 'error'
        });
        return;
      }
    }

    let newItem;
    let updatedData;

    if (dialogType === 'article') {
      newItem = {
        ...articleForm,
        id: editingItem ? editingItem.id : Date.now(),
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
      };

      if (editingItem) {
        updatedData = articles.map(item => item.id === editingItem.id ? newItem : item);
      } else {
        updatedData = [...articles, newItem];
      }
      setArticles(updatedData);
      saveData('adminLifeCultureContent', updatedData);
    } else if (dialogType === 'book') {
      newItem = {
        ...bookForm,
        id: editingItem ? editingItem.id : Date.now(),
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
      };

      if (editingItem) {
        updatedData = books.map(item => item.id === editingItem.id ? newItem : item);
      } else {
        updatedData = [...books, newItem];
      }
      setBooks(updatedData);
      saveData('adminBookRecommendations', updatedData);
    } else if (dialogType === 'event') {
      newItem = {
        ...eventForm,
        id: editingItem ? editingItem.id : Date.now(),
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
      };

      if (editingItem) {
        updatedData = events.map(item => item.id === editingItem.id ? newItem : item);
      } else {
        updatedData = [...events, newItem];
      }
      setEvents(updatedData);
      saveData('adminCulturalEvents', updatedData);
    } else if (dialogType === 'story') {
      newItem = {
        ...storyForm,
        id: editingItem ? editingItem.id : Date.now(),
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
      };

      if (editingItem) {
        updatedData = latestStories.map(item => item.id === editingItem.id ? newItem : item);
      } else {
        updatedData = [...latestStories, newItem];
      }
      setLatestStories(updatedData);
      saveData('adminLatestStories', updatedData);
    } else if (dialogType === 'featuredEvent') {
      newItem = {
        ...featuredEventForm,
        id: editingItem ? editingItem.id : Date.now(),
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
      };

      if (editingItem) {
        updatedData = featuredEvents.map(item => item.id === editingItem.id ? newItem : item);
      } else {
        updatedData = [...featuredEvents, newItem];
      }
      setFeaturedEvents(updatedData);
      saveData('adminFeaturedEvents', updatedData);
    }

    setSnackbar({
      open: true,
      message: `${dialogType} ${editingItem ? 'updated' : 'added'} successfully!`,
      severity: 'success'
    });
    closeDialog();
  };

  const handleDelete = (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    let updatedData;
    if (type === 'article') {
      updatedData = articles.filter(item => item.id !== id);
      setArticles(updatedData);
      saveData('adminLifeCultureContent', updatedData);
    } else if (type === 'book') {
      updatedData = books.filter(item => item.id !== id);
      setBooks(updatedData);
      saveData('adminBookRecommendations', updatedData);
    } else if (type === 'event') {
      updatedData = events.filter(item => item.id !== id);
      setEvents(updatedData);
      saveData('adminCulturalEvents', updatedData);
    } else if (type === 'story') {
      updatedData = latestStories.filter(item => item.id !== id);
      setLatestStories(updatedData);
      saveData('adminLatestStories', updatedData);
    } else if (type === 'featuredEvent') {
      updatedData = featuredEvents.filter(item => item.id !== id);
      setFeaturedEvents(updatedData);
      saveData('adminFeaturedEvents', updatedData);
    }

    setSnackbar({
      open: true,
      message: `${type} deleted successfully!`,
      severity: 'success'
    });
  };

  const renderArticles = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Life & Culture Articles</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openAddDialog('article')}
          sx={{ backgroundColor: '#c41e3a' }}
        >
          Add Article
        </Button>
      </Box>

      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} md={6} lg={4} key={article.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Article sx={{ mr: 1, color: '#c41e3a' }} />
                  <Chip label={article.category} size="small" />
                </Box>
                <Typography variant="h6" gutterBottom>{article.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  By {article.author}
                </Typography>
                <Typography variant="body2" noWrap>
                  {article.excerpt}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => openEditDialog('article', article)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete('article', article.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderBooks = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Book Recommendations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openAddDialog('book')}
          sx={{ backgroundColor: '#c41e3a' }}
        >
          Add Book
        </Button>
      </Box>

      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={12} md={6} lg={4} key={book.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MenuBook sx={{ mr: 1, color: '#c41e3a' }} />
                  <Chip label={book.category} size="small" />
                </Box>
                <Typography variant="h6" gutterBottom>{book.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="body2">by {book.author}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Star sx={{ fontSize: '1rem', color: '#ffb400', mr: 0.5 }} />
                  <Typography variant="body2">{book.rating}/5</Typography>
                </Box>
                <Typography variant="body2" noWrap>
                  {book.description}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => openEditDialog('book', book)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete('book', book.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderEvents = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Cultural Events</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openAddDialog('event')}
          sx={{ backgroundColor: '#c41e3a' }}
        >
          Add Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} md={6} lg={4} key={event.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Event sx={{ mr: 1, color: '#c41e3a' }} />
                  <Chip label={event.type} size="small" />
                </Box>
                <Typography variant="h6" gutterBottom>{event.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="body2">{event.date}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="body2">{event.location}</Typography>
                </Box>
                <Typography variant="body2" noWrap>
                  {event.description}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => openEditDialog('event', event)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete('event', event.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderLatestStories = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Latest Stories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openAddDialog('story')}
          sx={{ backgroundColor: '#c41e3a' }}
        >
          Add Story
        </Button>
      </Box>

      <Grid container spacing={3}>
        {latestStories.map((story) => (
          <Grid item xs={12} md={6} lg={4} key={story.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Article sx={{ mr: 1, color: '#c41e3a' }} />
                  <Chip label={story.category} size="small" />
                </Box>
                <Typography variant="h6" gutterBottom>{story.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  By {story.author}
                </Typography>
                <Typography variant="body2" noWrap>
                  {story.excerpt}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => openEditDialog('story', story)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete('story', story.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderFeaturedEvents = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Featured Cultural Events</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openAddDialog('featuredEvent')}
          sx={{ backgroundColor: '#c41e3a' }}
        >
          Add Featured Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        {featuredEvents.map((event) => (
          <Grid item xs={12} md={6} lg={4} key={event.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Event sx={{ mr: 1, color: '#c41e3a' }} />
                  <Chip label={event.type} size="small" />
                  <Chip label="Featured" size="small" sx={{ ml: 1, backgroundColor: '#ffd700', color: '#000' }} />
                </Box>
                <Typography variant="h6" gutterBottom>{event.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="body2">{event.date}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="body2">{event.location}</Typography>
                </Box>
                <Typography variant="body2" noWrap>
                  {event.description}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => openEditDialog('featuredEvent', event)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete('featuredEvent', event.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderDialog = () => {
    let title, content;

    if (dialogType === 'article') {
      title = editingItem ? 'Edit Article' : 'Add New Article';
      content = (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title *"
              value={articleForm.title}
              onChange={(e) => setArticleForm({...articleForm, title: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Author *"
              value={articleForm.author}
              onChange={(e) => setArticleForm({...articleForm, author: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Category"
              value={articleForm.category}
              onChange={(e) => setArticleForm({...articleForm, category: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Excerpt"
              multiline
              rows={2}
              value={articleForm.excerpt}
              onChange={(e) => setArticleForm({...articleForm, excerpt: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Content *"
              multiline
              rows={4}
              value={articleForm.content}
              onChange={(e) => setArticleForm({...articleForm, content: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Image URL"
              value={articleForm.image}
              onChange={(e) => setArticleForm({...articleForm, image: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Published Date"
              type="date"
              value={articleForm.publishedAt}
              onChange={(e) => setArticleForm({...articleForm, publishedAt: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      );
    } else if (dialogType === 'book') {
      title = editingItem ? 'Edit Book' : 'Add New Book';
      content = (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title *"
              value={bookForm.title}
              onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Author *"
              value={bookForm.author}
              onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Category"
              value={bookForm.category}
              onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description *"
              multiline
              rows={3}
              value={bookForm.description}
              onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography component="legend">Rating</Typography>
            <Rating
              value={bookForm.rating}
              onChange={(event, newValue) => setBookForm({...bookForm, rating: newValue})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Published Year"
              value={bookForm.publishedYear}
              onChange={(e) => setBookForm({...bookForm, publishedYear: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ISBN"
              value={bookForm.isbn}
              onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price"
              value={bookForm.price}
              onChange={(e) => setBookForm({...bookForm, price: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amazon Link"
              value={bookForm.amazonLink}
              onChange={(e) => setBookForm({...bookForm, amazonLink: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Source"
              value={bookForm.source}
              onChange={(e) => setBookForm({...bookForm, source: e.target.value})}
            />
          </Grid>
        </Grid>
      );
    } else if (dialogType === 'event') {
      title = editingItem ? 'Edit Event' : 'Add New Event';
      content = (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title *"
              value={eventForm.title}
              onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Type"
              value={eventForm.type}
              onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date *"
              type="date"
              value={eventForm.date}
              onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description *"
              multiline
              rows={3}
              value={eventForm.description}
              onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location *"
              value={eventForm.location}
              onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Organizer"
              value={eventForm.organizer}
              onChange={(e) => setEventForm({...eventForm, organizer: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Image URL"
              value={eventForm.image}
              onChange={(e) => setEventForm({...eventForm, image: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ticket Price"
              value={eventForm.ticketPrice}
              onChange={(e) => setEventForm({...eventForm, ticketPrice: e.target.value})}
            />
          </Grid>
        </Grid>
      );
    } else if (dialogType === 'story') {
      title = editingItem ? 'Edit Story' : 'Add New Story';
      content = (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title *"
              value={storyForm.title}
              onChange={(e) => setStoryForm({...storyForm, title: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Author *"
              value={storyForm.author}
              onChange={(e) => setStoryForm({...storyForm, author: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Category"
              value={storyForm.category}
              onChange={(e) => setStoryForm({...storyForm, category: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Excerpt *"
              multiline
              rows={3}
              value={storyForm.excerpt}
              onChange={(e) => setStoryForm({...storyForm, excerpt: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Content *"
              multiline
              rows={6}
              value={storyForm.content}
              onChange={(e) => setStoryForm({...storyForm, content: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Image URL"
              value={storyForm.image}
              onChange={(e) => setStoryForm({...storyForm, image: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={storyForm.tags}
              onChange={(e) => setStoryForm({...storyForm, tags: e.target.value})}
            />
          </Grid>
        </Grid>
      );
    } else if (dialogType === 'featuredEvent') {
      title = editingItem ? 'Edit Featured Event' : 'Add New Featured Event';
      content = (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title *"
              value={featuredEventForm.title}
              onChange={(e) => setFeaturedEventForm({...featuredEventForm, title: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Type"
              value={featuredEventForm.type}
              onChange={(e) => setFeaturedEventForm({...featuredEventForm, type: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date *"
              type="date"
              value={featuredEventForm.date}
              onChange={(e) => setFeaturedEventForm({...featuredEventForm, date: e.target.value})}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description *"
              multiline
              rows={4}
              value={featuredEventForm.description}
              onChange={(e) => setFeaturedEventForm({...featuredEventForm, description: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location *"
              value={featuredEventForm.location}
              onChange={(e) => setFeaturedEventForm({...featuredEventForm, location: e.target.value})}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Organizer"
              value={featuredEventForm.organizer}
              onChange={(e) => setFeaturedEventForm({...featuredEventForm, organizer: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Image URL"
              value={featuredEventForm.image}
              onChange={(e) => setFeaturedEventForm({...featuredEventForm, image: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Featured Until"
              type="date"
              value={featuredEventForm.featuredUntil}
              onChange={(e) => setFeaturedEventForm({...featuredEventForm, featuredUntil: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      );
    }

    return (
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#c41e3a' }}>
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#c41e3a', fontWeight: 'bold' }}>
            Manage Life & Culture Content
          </Typography>
          
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label={`Articles (${articles.length})`} />
            <Tab label={`Books (${books.length})`} />
            <Tab label={`Events (${events.length})`} />
            <Tab label={`Latest Stories (${latestStories.length})`} />
            <Tab label={`Featured Events (${featuredEvents.length})`} />
          </Tabs>

          {tabValue === 0 && renderArticles()}
          {tabValue === 1 && renderBooks()}
          {tabValue === 2 && renderEvents()}
          {tabValue === 3 && renderLatestStories()}
          {tabValue === 4 && renderFeaturedEvents()}

          {renderDialog()}

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({...snackbar, open: false})}
          >
            <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ManageLifeCulture;
