import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Box, Typography, Menu, Button, IconButton, MenuItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';

import { IconListCheck, IconMail, IconUser } from '@tabler/icons-react';

import ProfileImg from 'src/assets/images/profile/user-1.jpg';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };
  const theme = useTheme();
  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
          '&:hover': {
            backgroundColor: 'transparent',
            color: 'inherit',
          }
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={ProfileImg}
          alt={ProfileImg}
          sx={{
            width: 35,
            height: 35,
            marginRight: 1
          }}
        />
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Typography variant="body1" fontWeight="bold" sx={{ color: theme.palette.text.primary, }} >
            Admin
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.primary, }}>
            admin@gmail.com
          </Typography>
        </Box>
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '200px',
          },
        }}
      >
        <Box display="flex" alignItems="center" p={2} pb={1}>
          <Avatar
            src={ProfileImg}
            alt={ProfileImg}
            sx={{ width: 40, height: 40, marginRight: 1 }}
          />
          <Box>
            <Typography fontWeight="bold" variant="body1">
              admin@gmail.com
            </Typography>
          </Box>
        </Box>
        {/* <MenuItem>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem> */}
        {/* <MenuItem>
          <ListItemIcon>
            <IconMail width={20} />
          </ListItemIcon>
          <ListItemText>My Account</ListItemText>
        </MenuItem> */}
        {/* <MenuItem>
          <ListItemIcon>
            <IconListCheck width={20} />
          </ListItemIcon>
          <ListItemText>My Tasks</ListItemText>
        </MenuItem> */}
        <Box mt={1} py={1} px={2}>
        <Box mt={1} py={1} px={2}>
          <Button to="/auth/login" variant="outlined" color="primary" component={Link} fullWidth onClick={() => { localStorage.clear() }}>
            Logout
          </Button>
          </Box>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
