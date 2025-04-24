// theme/CustomThemes.js
import { createTheme } from '@mui/material/styles';
import typography from '../../../theme/Typography';
import { shadows } from '../../../theme/Shadows';
// 🌞 Light Theme
export const baseLightTheme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'light',
    primary: {
      main: '#478774',
      light: '#7DAA8D',
      dark: '#519380',
    },
    secondary: {
      main: '#49BEFF',
      light: '#E8F7FF',
      dark: '#23afdb',
    },
    success: {
      main: '#13DEB9',
      light: '#E6FFFA',
      dark: '#02b3a9',
      contrastText: '#ffffff',
    },
    info: {
      main: '#539BFF',
      light: '#EBF3FE',
      dark: '#1682d4',
      contrastText: '#ffffff',
    },
    error: {
      main: '#FA896B',
      light: '#FDEDE8',
      dark: '#f3704d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFAE1F',
      light: '#FEF5E5',
      dark: '#ae8e59',
      contrastText: '#ffffff',
    },
    purple: {
      A50: '#EBF3FE',
      A100: '#6610f2',
      A200: '#557fb9',
    },
    grey: {
      100: '#F2F6FA',
      200: '#EAEFF4',
      300: '#DFE5EF',
      400: '#7C8FAC',
      500: '#5A6A85',
      600: '#2A3547',
    },
    text: {
      primary: '#2A3547',
      secondary: '#5A6A85',
    },
    action: {
      disabledBackground: 'rgba(73,82,88,0.12)',
      hoverOpacity: 0.02,
      hover: '#f6f9fc',
    },
    divider: '#e5eaef',
  },
  typography,
  shadows,
});

// 🌙 Dark Theme (Dark Blue)////////////////////////////////////////////////////////////////////////////////////////////////
export const darkBlueTheme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'dark',
    primary: {
      main: '#1e3a8a', // Deep navy
      light: '#3f51b5',
      dark: '#1e3a8a',
    },
    secondary: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#2563eb',
    },

    background: {
      default: '#0f172a', // App background
      paper: '#1e293b',   // Cards, tables
    },
    text: {
      primary: '#ffffff',   // General text
      secondary: '#94a3b8', // Muted text
    },
    divider: '#334155',     // Line dividers
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    button: {
      textTransform: 'none',
    },
  },
  shadows: Array(25).fill('none'),
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f172a',
          color: '#ffffff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0c1a35', // Dark top nav
          color: '#ffffff',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b', // Sidebar
          color: '#ffffff',
        },
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        color: '#ffffff', // Bright white
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        color: '#ffffff',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        color: '#ffffff',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        color: '#e2e8f0', // Slightly muted for mid-headers
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        color: '#e2e8f0',
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        color: '#e2e8f0',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 400,
        color: '#cbd5e1', // Slightly lower contrast
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        color: '#94a3b8',
      },
      body1: {
        fontSize: '0.95rem',
        fontWeight: 400,
        color: '#e2e8f0',
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        color: '#cbd5e1',
      },
      caption: {
        fontSize: '0.75rem',
        color: '#94a3b8',
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#64748b',
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#ffffff',
        textTransform: 'none',
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: '0 8px', // Space between rows
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#0c1a35 !important',  // dark navy header background
          color: '#ffffff',            // white header text
          fontWeight: 600,             // bold for visibility
          borderBottom: '1px solid #334155',
        },
        root: {
          backgroundColor: '#1e293b',  // base row bg for body
          color: '#e2e8f0',
          borderBottom: 'none',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b', // Ensure all paper (incl. TableContainer) is dark
          color: '#e2e8f0',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b', // Explicitly force table container background
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#273449', // Subtle blue-gray for hover
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: '#ffffff', // Pagination text
          backgroundColor: '#1e293b',
        },
        toolbar: {
          color: '#ffffff',
        },
        selectIcon: {
          color: '#ffffff',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: '#ffffff',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&:hover': {
            color: '#ffffff',
            backgroundColor: '#273449',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e3a8a',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#2c4995',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
        },
        indicator: {
          backgroundColor: '#60a5fa',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&.Mui-selected': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#273449',
            color: '#ffffff',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#334155',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#334155',
          color: '#ffffff',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#334155',
        },
      },
    },
  },
});
