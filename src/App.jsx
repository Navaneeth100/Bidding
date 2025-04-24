import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import Router from './routes/Router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { baseLightTheme, darkBlueTheme } from './layouts/full/header/CustomThemes'; // ✅ updated theme imports
import { GlobalStyles } from '@mui/system';
import { useEffect, useState } from 'react';

function App() {
  const routing = useRoutes(Router);

  // ✅ Load initial theme mode from localStorage (persisted)
  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem('mode');
    return stored === '1' ? 'dark' : 'light';
  });

  // ✅ Theme toggler — updates state + localStorage
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('mode', newMode === 'dark' ? '1' : '0');
  };

  // ✅ Expose toggle function globally (optional, but useful for Header or elsewhere)
  useEffect(() => {
    window.__toggleTheme = toggleTheme;
  }, [mode]);

  // ✅ Choose correct theme object
  const theme = mode === 'light' ? baseLightTheme : darkBlueTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Global style override */}
      <GlobalStyles
        styles={{
          '@media (min-width:1200px)': {
            '.MuiContainer-root': {
              maxWidth: 'none !important',
            },
          },
        }}
      />

      {routing}
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;
