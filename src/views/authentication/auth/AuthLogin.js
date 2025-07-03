import React, { useState } from 'react';
import {
    Box,
    Typography,
    FormGroup,
    FormControlLabel,
    Button,
    Stack,
    Checkbox
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { url } from '../../../../mainurl';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IconEye } from '@tabler/icons-react';
import { IconEyeClosed } from '@tabler/icons-react';
import { registerDevice } from '../../../utils/registerDevice'; // Adjust the relative path
import { auth } from '../../../firebase'; // adjust path to your firebase.js
import { signInWithCustomToken } from "firebase/auth";

const AuthLogin = ({ title, subtitle, subtext }) => {

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle keydown for form submission
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const navigate = useNavigate()

const handleSubmit = async () => {
  try {
    const response = await axios.post(`${url}/auth/admin/login/`, {
      email: formData.email,
      password: formData.password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = response.data;

      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Save tokens to localStorage
      localStorage.setItem('authTokens', JSON.stringify(data));

      // Firebase custom token from backend response
      const firebaseCustomToken = data.firebaseCustomToken; // <-- backend must send this

      if (firebaseCustomToken) {
        // Sign in Firebase Auth with custom token
        await signInWithCustomToken(auth, firebaseCustomToken);
        console.log("Firebase signed in with custom token");
      } else {
        console.warn("No firebase custom token received from backend.");
      }

      // Your existing FCM registration, mode setting, theme sync, etc.
      const tokenStr = data.token || data.access || data.access_token;
      if (tokenStr) {
        await registerDevice(tokenStr);
      }

      const previousMode = localStorage.getItem('mode');
      const loginMode = data.mode !== undefined ? data.mode.toString() : previousMode || '0';
      localStorage.setItem('mode', loginMode);

      const currentTheme = window.__themeMode;
      const targetTheme = loginMode === '1' ? 'dark' : 'light';
      if (currentTheme && currentTheme !== targetTheme) {
        window.__toggleTheme?.();
      }

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
  } catch (err) {
    toast.error(`${err.response?.data?.error || 'Login failed'}`, {
      position: 'top-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};


    return (
        <>
            {title ? (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            ) : null}

            {subtext}

            <Stack>
                <Box>
                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='email' mb="5px">Email</Typography>
                    <CustomTextField id="email" name="email" variant="outlined" placeholder="Enter Email" fullWidth onChange={(e) => { handleChange(e) }} />
                </Box>
                <Box mt="25px">
                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='password' mb="5px">Password</Typography>
                    <CustomTextField id="password" name="password" type={showPassword ? 'text' : 'password'} variant="outlined" placeholder="Enter Password" fullWidth
                        InputProps={{
                            endAdornment: (
                                <Button className='ms-2' onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <IconEyeClosed /> : <IconEye />}
                                </Button>
                            ),
                        }}
                        onChange={(e) => { handleChange(e) }} onKeyDown={handleKeyDown} />
                </Box>
                <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
                    {/* <FormGroup>
                        <FormControlLabel
                            control={<Checkbox defaultChecked />}
                            label="Remeber this Device"
                        />
                    </FormGroup> */}
                    {/* <Typography
                    component={Link}
                    to="/"
                    fontWeight="500"
                    sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                    }}
                >
                    Forgot Password ?
                </Typography> */}
                </Stack>
            </Stack>
            <Box>
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    // component={Link}
                    // to="/"
                    onClick={handleSubmit}
                    type="submit"
                >
                    Sign In
                </Button>
            </Box>
            {subtitle}
        </>
    );
}

export default AuthLogin;
