import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import Router from './routes/Router';
import { ToastContainer } from 'react-toastify';
import { messaging } from './firebase'; // adjust the import path as needed
import { onMessage } from 'firebase/messaging';
import 'react-toastify/dist/ReactToastify.css';
import { baseLightTheme, darkBlueTheme } from './layouts/full/header/CustomThemes'; // ✅ updated theme imports
import { GlobalStyles } from '@mui/system';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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

    useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('🔔 FCM Message Received (Foreground):', payload);

      const { title, body } = payload.notification;

      // Show toast
      toast.info(<div><strong>{title}</strong><div>{body}</div></div>, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

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
