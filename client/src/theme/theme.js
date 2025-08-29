import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c2c2c', // Professional dark gray (like The Art Newspaper)
      light: '#4f4f4f',
      dark: '#1c1c1c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c41e3a', // Elegant red accent
      light: '#e57373',
      dark: '#8b0000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff', // Pure white background like The Art Newspaper
      paper: '#ffffff',
    },
    text: {
      primary: '#2c2c2c', // Dark gray for main text
      secondary: '#666666', // Medium gray for secondary text
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#f57c00',
    },
    info: {
      main: '#1976d2',
    },
    success: {
      main: '#388e3c',
    },
    divider: '#e0e0e0', // Light gray for borders
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", "serif"', // Serif font like professional newspapers
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#2c2c2c',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '1.875rem', // Slightly smaller for better hierarchy
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#2c2c2c',
      '@media (max-width:600px)': {
        fontSize: '1.625rem',
      },
    },
    h3: {
      fontSize: '1.5rem', // Better proportioned
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2c2c2c',
      '@media (max-width:600px)': {
        fontSize: '1.375rem',
      },
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600, // Slightly bolder for news headlines
      lineHeight: 1.4,
      color: '#2c2c2c',
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#2c2c2c',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#2c2c2c',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7, // Better readability
      color: '#2c2c2c',
      fontFamily: '"Georgia", "Times New Roman", serif',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#666666',
      fontFamily: '"Georgia", "Times New Roman", serif',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#666666',
      fontFamily: '"Helvetica", "Arial", sans-serif', // Sans-serif for captions
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: '"Helvetica", "Arial", sans-serif', // Sans-serif for UI elements
    },
  },
  shape: {
    borderRadius: 0, // Clean, sharp edges like The Art Newspaper
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2, // Minimal border radius
          padding: '8px 16px',
          boxShadow: 'none',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#2c2c2c',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1c1c1c',
          },
        },
        outlined: {
          borderColor: '#2c2c2c',
          color: '#2c2c2c',
          '&:hover': {
            borderColor: '#1c1c1c',
            backgroundColor: 'rgba(44, 44, 44, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', // Subtle shadow like newspaper cards
          borderRadius: 0, // Sharp edges
          border: '1px solid #e0e0e0', // Light border
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transform: 'none', // No transform, keeping it professional
            transition: 'box-shadow 0.2s ease-in-out',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px', // Consistent padding
          '&:last-child': {
            paddingBottom: '16px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2c2c2c',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2, // Minimal border radius
            backgroundColor: '#ffffff',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2, // Clean edges
          fontWeight: 500,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          backgroundColor: '#f5f5f5',
          color: '#666666',
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#2c2c2c',
            color: '#ffffff',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          marginBottom: '0.5em',
        },
        h2: {
          marginBottom: '0.5em',
        },
        h3: {
          marginBottom: '0.5em',
        },
        h4: {
          marginBottom: '0.5em',
        },
        h5: {
          marginBottom: '0.5em',
        },
        h6: {
          marginBottom: '0.5em',
        },
        body1: {
          marginBottom: '1em',
        },
        body2: {
          marginBottom: '0.75em',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (min-width: 1200px)': {
            maxWidth: '1140px', // Slightly narrower for better readability
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;
