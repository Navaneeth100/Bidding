import React, { useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  useTheme,
} from '@mui/material';
import PropTypes from 'prop-types';
import {
  IconBell,
  IconSun,
  IconMoon,
  IconCloud,
} from '@tabler/icons-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Profile from './Profile';
import { url } from '../header/mainurl';

const Header = ({ mode, toggleTheme }) => {
  const theme = useTheme();

  const authTokens = JSON.parse(localStorage.getItem('authTokens'));
  const tokenStr = String(authTokens?.access || '');

  /**
   * 🔄 Sync the theme with what's stored in localStorage
   * This runs once when the component mounts.
   * It ensures the UI theme (light/dark) reflects the saved mode.
   */
  useEffect(() => {
    const storedMode = localStorage.getItem('mode'); // Get saved mode (0 or 1)

    const applyTheme = () => {
      if (typeof toggleTheme === 'function') {
        toggleTheme();
      } else {
        window.__toggleTheme?.();
      }
    };

    if (storedMode === '1' && mode === 'light') {
      applyTheme();
    }

    if (storedMode === '0' && mode === 'dark') {
      applyTheme();
    }

    if (!storedMode) {
      localStorage.setItem('mode', '0');
    }
  }, [mode, toggleTheme]);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  /**
   * 🌗 Theme Toggle Handler
   * 1. Updates mode in backend via API
   * 2. Updates localStorage values
   * 3. Triggers theme switch using toggleTheme()
   */
  const handleToggleTheme = async () => {
    const newMode = mode === 'light' ? 1 : 0;

    try {
      await axios.put(
        `${url}/auth/update-mode/`,
        { mode: newMode },
        {
          headers: {
            Authorization: `Bearer ${tokenStr}`,
            'Content-Type': 'application/json',
          },
        }
      );

      localStorage.setItem('authTokens', JSON.stringify({
        ...authTokens,
        mode: newMode,
      }));

      localStorage.setItem('mode', newMode.toString());

      toast.success(`Mode updated to ${newMode === 1 ? 'Dark' : 'Light'}`, {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });

      // Use passed toggleTheme or fallback to global toggle
      if (typeof toggleTheme === 'function') {
        toggleTheme();
      } else {
        window.__toggleTheme?.();
      }
    } catch (error) {
      toast.error(`Failed to update mode: ${error.response?.data?.error || error.message}`, {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });
    }
  };

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <Box flexGrow={1} />

        <Stack spacing={1} direction="row" alignItems="center">
          {/* 🌗 Theme Toggle Switch UI */}
          <Box
            onClick={handleToggleTheme}
            sx={{
              width: 100,
              height: 50,
              borderRadius: 30,
              backgroundColor: mode === 'light' ? '#e0f2fe' : '#0f172a',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'background-color 0.4s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              px: 1,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: mode === 'light' ? 1 : 0,
                transition: 'opacity 0.4s ease',
                zIndex: 1,
              }}
            >
              <IconMoon size={20} stroke={1.5} color="#38bdf8" />
            </Box>

            <Box
              sx={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: mode === 'light' ? 0 : 1,
                transition: 'opacity 0.4s ease',
                zIndex: 1,
              }}
            >
              <IconSun size={20} stroke={1.5} color="#facc15" />
            </Box>

            <Box
              sx={{
                position: 'absolute',
                top: 5,
                left: 5,
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: mode === 'light' ? 'black' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: mode === 'light' ? 'translateX(0px)' : 'translateX(50px)',
                transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.4s ease',
                zIndex: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {mode === 'light' ? (
                <>
                  <IconMoon size={24} stroke={1.5} color="white" />
                  <Box sx={{ position: 'absolute', top: 8, left: 8, width: 4, height: 4, borderRadius: '50%', backgroundColor: 'white' }} />
                  <Box sx={{ position: 'absolute', top: 12, right: 10, width: 3, height: 3, borderRadius: '50%', backgroundColor: 'white' }} />
                  <Box sx={{ position: 'absolute', bottom: 8, left: 14, width: 2, height: 2, borderRadius: '50%', backgroundColor: 'white' }} />
                </>
              ) : (
                <>
                  <IconSun size={24} stroke={1.5} color="#facc15" />
                  <IconCloud size={8} stroke={2} color="#60a5fa" style={{ position: 'absolute', bottom: 6, right: 6 }} />
                  <IconCloud size={6} stroke={1.5} color="#60a5fa" style={{ position: 'absolute', top: 6, left: 8 }} />
                </>
              )}
            </Box>
          </Box>

          {/* 🔔 Notifications icon */}
          <IconButton
            size="large"
            aria-label="notifications"
            color="inherit"
            sx={{ color: theme.palette.text.primary, border: '1px solid #ccc' }}
          >
            <Badge variant="dot" color="primary">
              <IconBell size="23" stroke="1.5" />
            </Badge>
          </IconButton>

          {/* 👤 User Profile */}
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  toggleTheme: PropTypes.func,
  mode: PropTypes.string.isRequired,
};

export default Header;
