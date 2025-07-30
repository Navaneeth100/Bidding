import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { registerDevice } from '../../../utils/registerDevice';
import { auth } from '../../../firebase';
import { signInWithCustomToken } from 'firebase/auth';

import lottieAnimation from '../../../assets/images/animations/Login.json';
import stayImg from './stay.png';
import { url } from '../../../../mainurl';

// AnimatedLinesBackground component remains unchanged, same as your original code
function AnimatedLinesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let animationFrameId;
    const lines = [];
    const maxLines = 20;

    function resize() {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    }
    resize();

    class Line {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.length = 50 + Math.random() * 100;
        this.speed = 0.5 + Math.random();
        this.width = 2 + Math.random() * 3;
        this.color = `rgba(64, 156, 255, ${0.2 + Math.random() * 0.6})`;
      }
      update() {
        this.x += this.speed;
        if (this.x - this.length > width) {
          this.x = -this.length;
          this.y = Math.random() * height;
        }
      }
      draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.shadowColor = '#40a5ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.length, this.y);
        ctx.stroke();
      }
    }

    for (let i = 0; i < maxLines; i++) {
      lines.push(new Line());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      lines.forEach((line) => {
        line.update();
        line.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        borderRadius: '0 10px 10px 0',
        backgroundColor: '#0d1b2a',
      }}
    />
  );
}

export default function AuthLogin() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

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

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${url}/auth/admin/login/`,
        { email: formData.email, password: formData.password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        const data = response.data;
        toast.success('Login successful!', { position: 'top-right', autoClose: 1500 });

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
        const loginMode =
          data.mode !== undefined ? data.mode.toString() : previousMode || '0';
        localStorage.setItem('mode', loginMode);

        const currentTheme = window.__themeMode;
        const targetTheme = loginMode === '1' ? 'dark' : 'light';
        if (currentTheme && currentTheme !== targetTheme) {
          window.__toggleTheme?.();
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      toast.error(`${err.response?.data?.error || 'Login failed'}`, {
        position: 'top-right',
        autoClose: 1500,
      });
    }
  };

  const handleSignUpClick = () => {
    toast.info('This feature is not available', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Inter, Roboto, Arial, sans-serif',
        color: '#333',
      }}
    >
      {/* Left Panel */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          px: { xs: 4, md: 8 },
          py: { xs: 6, md: 10 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          background: `linear-gradient(135deg, #22347dff, #203b9cff, #0d1b2a)`,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 20s ease infinite',
          textAlign: 'center',
          userSelect: 'none',
          position: 'relative',
        }}
      >
        {/* Gradient animation keyframes */}
        <style>
          {`
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}
        </style>

        {/* Logo top-left */}
        <Box
          component="img"
          src={stayImg}
          alt="Logo"
          sx={{
            width: 80,
            height: 80,
            objectFit: 'contain',
            position: 'absolute',
            top: 32,
            left: 32,
            filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.4))',
            borderRadius: 2,
            backgroundColor: 'rgba(255 255 255 / 0.15)',
            p: 1,
          }}
        />

        {/* Decorative Circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            filter: 'blur(80px)',
          }}
        />

        {/* Lottie Animation Container */}
        <Box
          sx={{ maxWidth: 320, width: '100%', mb: 5, position: 'relative', zIndex: 10 }}
        >
          <Lottie animationData={lottieAnimation} loop autoplay />
        </Box>

        {/* Welcome Text */}
        <Typography
          variant="h3"
          fontWeight="bold"
          mb={1}
          sx={{ letterSpacing: 1.5, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          Hello, <br />
          <Box component="span" sx={{ fontWeight: 900 }}>
            welcome!
          </Box>
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 320,
            mt: 1,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 500,
            textShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
        >
          Access your dashboard and stay connected with ease.
        </Typography>
      </Box>

      {/* Right Panel - Login Form with animated background */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          px: { xs: 6, md: 10 },
          py: { xs: 8, md: 10 },
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: '0 10px 10px 0',
          boxShadow: '-5px 0 15px rgba(0,0,0,0.05)',
        }}
      >
        {/* Animated background */}
        <AnimatedLinesBackground />

        {/* Form container above animation */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            px: 4,
            py: 5,
            maxWidth: 420,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              mb={4}
              sx={{ color: '#3b4d61', letterSpacing: 1.2, textAlign: 'center' }}
            >
              Sign In
            </Typography>

            <TextField
              label="Email address"
              variant="outlined"
              fullWidth
              margin="normal"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#f5f7fb',
                  '&.Mui-focused fieldset': {
                    borderColor: '#4c6ef5',
                    boxShadow: '0 0 8px #4c6ef5aa',
                  },
                },
                '& label.Mui-focused': {
                  color: '#4c6ef5',
                },
              }}
            />

            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#f5f7fb',
                  '&.Mui-focused fieldset': {
                    borderColor: '#4c6ef5',
                    boxShadow: '0 0 8px #4c6ef5aa',
                  },
                },
                '& label.Mui-focused': {
                  color: '#4c6ef5',
                },
              }}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword((v) => !v)}
                    sx={{
                      minWidth: 0,
                      color: '#4c6ef5',
                      fontSize: '1.3rem',
                      px: 1,
                      '&:hover': { color: '#3b57c1', background: 'none' },
                    }}
                    tabIndex={-1}
                    type="button"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </Button>
                ),
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <FormControlLabel
                control={<Checkbox />}
                label="Remember me"
                sx={{
                  userSelect: 'none',
                  '& .MuiTypography-root': {
                    fontWeight: 600,
                    color: '#4c6ef5',
                  },
                }}
              />
              <Link
                component="button"
                variant="body2"
                onClick={handleForgotPassword}
                sx={{
                  textDecoration: 'none',
                  color: '#4c6ef5',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                backgroundColor: '#4c6ef5',
                py: 1.8,
                borderRadius: 3,
                fontWeight: 700,
                letterSpacing: 1.1,
                transition: 'background-color 0.3s ease',
                '&:hover': { backgroundColor: '#3b57c1' },
                userSelect: 'none',
              }}
            >
              Login
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="primary"
              sx={{
                mt: 3,
                py: 1.8,
                borderRadius: 3,
                fontWeight: 700,
                letterSpacing: 1.1,
                textTransform: 'none',
                userSelect: 'none',
                borderColor: '#4c6ef5',
                color: '#4c6ef5',
                '&:hover': {
                  backgroundColor: '#e7f0ff',
                  borderColor: '#3b57c1',
                  color: '#3b57c1',
                },
              }}
              onClick={() =>
                toast.info('This feature is not available', {
                  position: 'top-right',
                  autoClose: 2000,
                })
              }
              type="button"
            >
              Sign up
            </Button>

            {/* Social Icons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
                mt: 5,
                color: '#4c6ef5',
              }}
            >
              <Facebook sx={{ cursor: 'pointer', fontSize: 30 }} />
              <Twitter sx={{ cursor: 'pointer', fontSize: 30 }} />
              <Instagram sx={{ cursor: 'pointer', fontSize: 30 }} />
            </Box>
          </form>
        </Box>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.25)',
            px: 5,
            py: 4,
            minWidth: 380,
            maxWidth: 420,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: '700',
            fontSize: '1.8rem',
            color: '#1a237e',
            mb: 2,
            letterSpacing: 0.5,
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          }}
        >
          Contact Admin
        </DialogTitle>
        <DialogContent sx={{ px: 0 }}>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: '#3949ab',
              fontWeight: 700,
              fontSize: '1.15rem',
              lineHeight: 1.5,
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            }}
          >
            Please contact the administrator to reset your password:
          </Typography>

          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                color: '#1a237e',
                minWidth: 70,
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              }}
            >
              📧 Email:
            </Typography>
            <a
              href="mailto:admin@yourdomain.com"
              style={{
                color: '#3b4d61',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              }}
            >
              admin@yourdomain.com
            </a>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                color: '#1a237e',
                minWidth: 70,
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              }}
            >
              📞 Phone:
            </Typography>
            <a
              href="tel:+966123456789"
              style={{
                color: '#3b4d61',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              }}
            >
              +966 123 456 789
            </a>
          </Box>
        </DialogContent>
        <Divider sx={{ my: 3 }} />
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={handleClose}
            sx={{
              color: '#1a237e',
              fontWeight: '700',
              px: 4,
              py: 1.25,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              letterSpacing: 0.5,
              '&:hover': { backgroundColor: '#c5cae9' },
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
}
