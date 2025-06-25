import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  useTheme,
  Typography,
  Button,
  Popover,
  Divider,
  List,
  Chip,
  ListItem,
  ListItemText
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
import Loader from './Loader';

const Header = ({ mode, toggleTheme }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const authTokens = JSON.parse(localStorage.getItem('authTokens'));
  const tokenStr = String(authTokens?.access || '');

  useEffect(() => {
    const storedMode = localStorage.getItem('mode');

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

  const handleToggleTheme = async () => {
    const newMode = mode === 'light' ? 1 : 0;

    setLoading(true); // ✅ Show loader

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

      if (typeof toggleTheme === 'function') {
        toggleTheme();
      } else {
        window.__toggleTheme?.();
      }
    } catch (error) {
      toast.error(`Failed to update mode: ${error.response?.data?.error || error.message}`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false); // ✅ Hide loader
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const bellRef = useRef(null);

  const handleClick = () => {
    setAnchorEl(bellRef.current);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${url}/auth/notifications/?page=1`, {
        headers: { Authorization: `Bearer ${tokenStr}` }
      });

      setNotifications(response.data.results || []);
      setUnreadCount(response.data.unread || 0);
      setTotalCount(response.data.count || 0);
    } catch (err) {
      console.error("Notification fetch error", err);
    }
  };


  return (
    <>
      {loading && <Loader />} {/* ✅ Loader displayed when loading */}
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
            ref={bellRef}
              size="large"
              aria-label="notifications"
              color="inherit"
              sx={{ color: theme.palette.text.primary, border: '1px solid #ccc' }}
              onClick={handleClick}>
              <Badge badgeContent={unreadCount > 0 ? unreadCount : "0"} color="primary">
                <IconBell size="23" stroke="1.5" />
              </Badge>
            </IconButton>

            {/* 👤 User Profile */}
            <Profile />
          </Stack>
        </ToolbarStyled>
      </AppBarStyled>

      {/* Notification Popover */}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: {
            width: 300,
            borderRadius: 2,
            boxShadow: 3,
            mt: 1, // 👈 this works properly in sx
          }
        }}
      >
        {/* Header */}

        <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1}>
          <Typography fontWeight="bold">Notifications</Typography>
          <Chip
            label={totalCount}
            size="small"
            sx={{ fontWeight: 500, fontSize: '12px' }}
          />
        </Box>
        <Divider />

        {/* Notification List */}

        <Box maxHeight={250} overflow="auto">
          <List dense>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText primary="No notifications" />
              </ListItem>
            ) : (
              notifications.slice(0, 5).map((item, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '0.8rem', mt: 0.3 }}
                        >
                          {item.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', color: '#999', fontSize: '0.7rem', mt: 0.5 }}
                        >
                          {item.notification_type} • {new Date(item.sent_at).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>

              ))
            )}
          </List>
        </Box>

        {/* Footer */}

        <Divider />
        <Box textAlign="center" py={1}>
          <Button size="small" onClick={() => window.location.href = '/notification'}>
            View All
          </Button>
        </Box>
      </Popover>

    </>
  );
};

Header.propTypes = {
  toggleTheme: PropTypes.func,
  mode: PropTypes.string.isRequired,
};

export default Header;
