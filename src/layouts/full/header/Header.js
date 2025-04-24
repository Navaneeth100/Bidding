import React from 'react';
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
  IconMenu,
  IconSun,
  IconMoon,
  IconCloud
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
          {/* Theme Toggle Button with animation */}
          <Box
  onClick={toggleTheme}
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
  {/* Static background moon icon (left) */}
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

  {/* Static background sun icon (right) */}
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

  {/* Sliding Knob with Icon */}
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
      transition:
        'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.4s ease',
      zIndex: 2,
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    }}
  >
    {/* Moon mode: IconMoon + dots */}
    {mode === 'light' ? (
      <>
        <IconMoon size={24} stroke={1.5} color="white" backgroundColor="white" />
        {/* White dots on moon */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: 'white',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 10,
            width: 3,
            height: 3,
            borderRadius: '50%',
            backgroundColor: 'white',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 14,
            width: 2,
            height: 2,
            borderRadius: '50%',
            backgroundColor: 'white',
          }}
        />
      </>
    ) : (
      <>
        <IconSun size={24} stroke={1.5} color="#facc15" />
        {/* Primary cloud */}
        <IconCloud
          size={8}
          stroke={2}
          color="#60a5fa"
          style={{
            position: 'absolute',
            bottom: 6,
            right: 6,
          }}
        />
        {/* Tiny decorative cloud */}
        <IconCloud
          size={6}
          stroke={1.5}
          color="#60a5fa"
          style={{
            position: 'absolute',
            top: 6,
            left: 8,
          }}
        />
      </>
    )}
  </Box>
</Box>



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
