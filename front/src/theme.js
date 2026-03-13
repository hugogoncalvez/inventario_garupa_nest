import { extendTheme } from '@mui/material/styles';

const theme = extendTheme({
  colorSchemeSelector: 'data',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#2563eb', // Azul moderno (v7 estándar)
          dark: '#1d4ed8',
          light: '#60a5fa',
        },
        secondary: {
          main: '#64748b',
        },
        background: {
          default: '#f8fafc',
          paper: '#ffffff',
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#60a5fa',
        },
        secondary: {
          main: '#94a3b8',
        },
        background: {
          default: '#0f172a',
          paper: '#1e293b',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', 
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'var(--mui-shadows-2)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'var(--mui-shadows-4)',
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'var(--mui-shadows-1)',
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
