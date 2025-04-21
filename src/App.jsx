import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import Router from './routes/Router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { baselightTheme } from "./theme/DefaultColors";
import { GlobalStyles } from '@mui/system';

function App() {
  const routing = useRoutes(Router);
  const theme = baselightTheme;

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
