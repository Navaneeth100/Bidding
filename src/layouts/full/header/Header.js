import React, { useState } from 'react';
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
import { IconBell, IconMenu, IconSun, IconMoon } from '@tabler/icons-react';
import Profile from './Profile';

const Header = (props) => {
  const theme = useTheme();
  const [mode, setMode] = useState('light');

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    document.body.setAttribute('data-theme', newMode); // Optional: depends on your theme logic
  };

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: 'white',
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

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* <IconButton
          color="inherit"
          aria-label="menu"
          onClick={props.toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton> */}


        {/* <IconButton
          size="large"
          aria-label="show 11 new notifications"
          color="inherit"
          aria-controls="msgs-menu"
          aria-haspopup="true"
          sx={{
            ...(typeof anchorEl2 === 'object' && {
              color: 'primary.main',
            }),
          }}
        >
          <Badge variant="dot" color="primary">
            <IconBellRinging size="21" stroke="1.5" />
          </Badge>

        </IconButton> */}
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          {/* Theme Toggle Button */}
          <IconButton
            size="large"
            aria-label="toggle theme"
            onClick={toggleTheme}
            sx={{
              backgroundColor: mode === 'light' ? '#fff' : '#000',
              border: '1px solid #ccc',
              '&:hover': {
                backgroundColor: mode === 'light' ? '#f5f5f5' : '#222',
              },
            }}
          >
            {mode === 'light' ? (
              <IconSun size="22" stroke="1.5" color="orange" />
            ) : (
              <IconMoon size="22" stroke="1.5" color="#fff" />
            )}
          </IconButton>

          {/* Notifications */}
          <IconButton
            size="large"
            aria-label="notifications"
            color="inherit"
            sx={{
              color: 'black',
              border: '1px solid #ccc',
            }}
          >
            <Badge variant="dot" color="primary">
              <IconBell size="23" stroke="1.5" />
            </Badge>
          </IconButton>

          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
