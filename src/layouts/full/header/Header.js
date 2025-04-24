import React from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, useTheme, } from '@mui/material';
import PropTypes from 'prop-types';
import {
  IconBell, IconMenu, IconSun, IconMoon
} from '@tabler/icons-react';
import Profile from './Profile';
const Header = (props) => {
  const theme = useTheme();
  const { mode, toggleTheme } = props;

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

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* Optional sidebar toggle icon */}
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
              color: theme.palette.text.primary,
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
  toggleTheme: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
};

export default Header;
