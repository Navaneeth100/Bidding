// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

import { CssBaseline, ThemeProvider } from '@mui/material';
// import { useRoutes } from 'react-router-dom';
import Router from './routes/Router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { baselightTheme } from "./theme/DefaultColors";

function App() {

  // const routing = useRoutes(Router);
  const theme = baselightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App