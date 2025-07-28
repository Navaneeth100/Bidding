import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  keyframes,
} from '@mui/material';
import { LoginOutlined, HelpOutline, Close } from '@mui/icons-material';
import Lottie from 'lottie-react';
import lottieAnimation from '../../../assets/images/animations/Login.json';
import stayImg from './stay.png';
import { url } from '../../../../mainurl';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { registerDevice } from '../../../utils/registerDevice';
import { auth } from '../../../firebase';
import { signInWithCustomToken } from "firebase/auth";

const backgroundMotion = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AuthLogin = ({ title, subtitle, subtext }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotPassword = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${url}/auth/admin/login/`, {
        email: formData.email,
        password: formData.password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        const data = response.data;
        toast.success('Login successful!', {
          position: 'top-right',
          autoClose: 1500,
        });

        localStorage.setItem('authTokens', JSON.stringify(data));
        const firebaseCustomToken = data.firebaseCustomToken;

        if (firebaseCustomToken) {
          await signInWithCustomToken(auth, firebaseCustomToken);
        }
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
      });
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        background: 'linear-gradient(120deg, #f3c98b, #cda48f, #9baec8)',
        backgroundSize: '200% 200%',
        animation: `${backgroundMotion} 20s ease infinite`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Card
        elevation={12}
        sx={{
          borderRadius: 4,
          maxWidth: 900,
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          backgroundColor: '#fff',
        }}
      >
        {/* Left Panel with Logo + Name + Lottie */}
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            p: 4,
            // background: 'linear-gradient(135deg, #fbe9d7, #f5f0e3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative', // Make positioning relative for children
            minHeight: 300, // Set a height if needed for demo purposes
          }}
        >
          {/* Main Content (centered animation, etc.) */}
          <Lottie
            animationData={lottieAnimation}
            loop
            autoplay
            style={{ width: 400, height: 400 }}
          />

          {/* Logo Card (Bottom Left) */}
          <Box
            sx={{
              position: 'absolute',
              left: 24,
              bottom: 24,
              background: '#f6f8fa', // Soft surface color
              borderRadius: 3.5,
              p: 0,
              boxShadow:
                '0 2px 16px 0 rgba(36, 71, 92, 0.10), 0 1.5px 8px 0 rgba(72, 135, 116, 0.06)',
              minWidth: 160,
              maxWidth: 260,
              zIndex: 2,
              border: '1.5px solid #e0ece6', // Gentle border for surface contrast
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2.5,
                py: 1.5,
                width: '100%',
              }}
            >
              <Box
                component="img"
                src={stayImg}
                alt="TahadiOne"
                sx={{
                  width: 40,
                  height: 36,
                  borderRadius: 2.5,
                  boxShadow:
                    '0 2px 12px 0 rgba(71, 135, 116, 0.10), 0 1.5px 4px 0 rgba(72, 135, 116, 0.05)',
                  // background: '#e7f8ef',
                  p: 0.8,
                  // objectFit: 'contain',
                  border: '1px solid #e0ece6',
                }}
              />
              <Typography
                variant="subtitle2"
                fontWeight={600}
                letterSpacing={0.1}
                sx={{
                  color: '#42786d',
                  fontSize: '0.98rem',
                  fontFamily:
                    '"Inter", "Roboto", "Arial Rounded MT Bold", "Arial", sans-serif',
                  textWrap: 'nowrap',
                  ml: 0.5,
                }}
              >
                TahadiOne
              </Typography>
            </Box>
          </Box>

        </Box>


        {/* Right Panel with Login Form */}
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            p: { xs: 4, md: 6 },
          }}
        >
          <Typography
            variant="h4"
            fontWeight={600}
            mb={1}
            sx={{ color: '#3b4d61' }}
          >
            {/* Pin */}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            {/* Get access to the recipes now, become a member today */}
          </Typography>

          <form>
            <TextField
              fullWidth
              label="E-mail"
              margin="normal"
              variant="outlined"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  borderRadius: 2,
                  background: "#f8fafb",
                },
                "& .MuiInputLabel-root": {
                  color: "#4b7c73",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4b7c7322",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4b7c73",
                },
              }}
            />
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              margin="normal"
              variant="outlined"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  borderRadius: 2,
                  background: "#f8fafb",
                },
                "& .MuiInputLabel-root": {
                  color: "#4b7c73",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4b7c7322",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4b7c73",
                },
              }}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword((v) => !v)}
                    sx={{
                      minWidth: 0,
                      color: "#4b7c73",
                      fontSize: "1.2rem",
                      px: 1,
                      "&:hover": { color: "#3f6a62", background: "none" },
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </Button>
                ),
              }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Remember Me"
              sx={{ mt: 1 }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<LoginOutlined />}
              sx={{
                mt: 3,
                backgroundColor: '#4b7c73',
                '&:hover': {
                  backgroundColor: '#3f6a62',
                },
              }}
              onClick={handleSubmit}
              type="button"
            >
              Sign In
            </Button>

            <Button
              startIcon={<HelpOutline />}
              sx={{
                mt: 2,
                color: '#4b7c73',
                textTransform: 'none',
              }}
              onClick={handleForgotPassword}
            >
              Forgot Password
            </Button>
          </form>
        </Box>
      </Card>

      {/* Forgot Password Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #fffbe6, #f3f3f3)',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.2)',
            px: 3,
            py: 2,
            minWidth: 360,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            fontSize: '1.4rem',
            color: '#333',
            mb: 1,
          }}
        >
          Contact Admin
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, color: '#555' }}>
            Please contact the administrator to reset your password:
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              📧 Email:
            </Typography>
            <a
              href="mailto:admin@yourdomain.com"
              style={{
                color: '#3b4d61',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              admin@yourdomain.com
            </a>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              📞 Phone:
            </Typography>
            <a
              href="tel:+966123456789"
              style={{
                color: '#3b4d61',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              +966 123 456 789
            </a>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'flex-end', pr: 2 }}>
          <Button
            onClick={handleClose}
            startIcon={<Close />}
            sx={{
              backgroundColor: '#4b7c73',
              color: 'white',
              borderRadius: 2,
              px: 2,
              py: 1,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#3f6a62',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuthLogin;
