import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Box,
  Typography,
  Menu,
  Button,
  IconButton,
  useTheme
} from '@mui/material';
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from '../../../../mainurl';
import ProfileImg from 'src/assets/images/profile/user-1.jpg';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [userData, setUserData] = useState({
    email: '',
    userId: '',
  });
  // console.log("userData",userData);
  
  const [employeeData, setEmployeeData] = useState({
    username: '',
     email: '',
  });
  // console.log("employeeData",employeeData);
  
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const authTokens = JSON.parse(localStorage.getItem('authTokens'));
  const tokenStr = String(authTokens?.access || '');

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const fetchServiceIDById = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/auth/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${tokenStr}`,
          "Content-Type": "application/json",
        },
      });

      // console.log("🟢 Employee details:", res.data);
      setEmployeeData(res.data);

    } catch (error) {
      // console.error("🔴 Failed to fetch employee data:", error);
      // toast.error("Failed to fetch employee details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const access = localStorage.getItem('authTokens');

    if (access) {
      try {
        const decoded = jwtDecode(access);
        const userId = decoded.user_id;

        setUserData({
          email: decoded.email || 'admin@gmail.com',
          userId: userId || '',
        });

        fetchServiceIDById(userId);

      } catch (error) {
        // console.error("Token decoding failed:", error);
      }
    } else {
      // console.warn("No access token found in localStorage.");
    }
  }, []);

  const handleLogout = async () => {
    localStorage.clear();
    await signOut(auth);
  };

  return (
    <Box>
      <IconButton
        size="large"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        onClick={handleClick2}
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
          '&:hover': {
            backgroundColor: 'transparent',
            color: 'inherit',
          }
        }}
      >
        <Avatar
          src={ProfileImg}
          alt="Profile"
          sx={{ width: 35, height: 35, marginRight: 1 }}
        />
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Typography variant="body1" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
            {employeeData.username || 'Admin'}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
            {employeeData.email}
          </Typography>
        </Box>
      </IconButton>

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
            alt="Profile"
            sx={{ width: 40, height: 40, marginRight: 1 }}
          />
          <Box>
            <Typography fontWeight="bold" variant="body1">
              {employeeData.username || 'Admin'}
            </Typography>
            <Typography variant="caption">
              {employeeData.email}
            </Typography>
          </Box>
        </Box>

        <Box mt={1} py={1} px={2}>
          <Button
            to="/auth/login"
            variant="outlined"
            color="primary"
            component={Link}
            fullWidth
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
