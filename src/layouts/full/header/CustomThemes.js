import { createTheme } from '@mui/material/styles';
import typography from '../../../theme/Typography';
import { shadows } from '../../../theme/Shadows';

// Shared pagination label variants
const getPaginationTypographyVariants = (textColor, highlightColor) => ([
  {
    props: { variant: 'paginationLabel' },
    style: {
      color: textColor,
      fontSize: '13px',
      fontWeight: 500,
    },
  },
  {
    props: { variant: 'paginationLabelActive' },
    style: {
      color: highlightColor,
      fontSize: '13px',
      fontWeight: 600,
    },
  },
]);

// Shared IconButton styles
const getIconButtonStyles = (defaultColor, hoverColor, hoverBg) => ({
  root: {
    color: defaultColor,
    '&:hover': {
      color: hoverColor,
      backgroundColor: hoverBg,
    },
  },
});

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
  components: {
    MuiTypography: {
      variants: getPaginationTypographyVariants('#2A3547', '#49BEFF'),
    },
    MuiIconButton: {
      styleOverrides: getIconButtonStyles('#5A6A85', '#ffffff', '#7DAA8D'),
    },
  },
});

// 🌙 Dark Theme
export const darkBlueTheme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'dark',
    primary: {
      main: '#478774',
      light: 'rgb(0, 196, 159);',
      dark: '#519380',
    },
    secondary: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#2563eb',
    },

    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#ffffff',
      secondary: '#94a3b8',
    },
    divider: '#334155',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#ffffff',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#e2e8f0',
    },
    body1: {
      fontSize: '0.95rem',
      color: '#e2e8f0',
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
          backgroundColor: '#0c1a35',
          color: '#ffffff',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: '0 8px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#0c1a35 !important',
          color: '#ffffff',
          fontWeight: 600,
          borderBottom: '1px solid #334155',
        },
        root: {
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          borderBottom: 'none',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#273449',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#478774',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#2c4995',
          },
        },
      },
    },
    MuiTypography: {
      variants: getPaginationTypographyVariants('#e2e8f0', '#60a5fa'),
    },
    MuiIconButton: {
      styleOverrides: getIconButtonStyles('#94a3b8', '#ffffff', '#273449'),
    },
  },
});
