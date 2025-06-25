import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Box, Card, Stack, Typography } from '@mui/material';

// components
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import AuthLogin from './auth/AuthLogin';
import logo from '../../assets/images/logos/stay.png'
import loginbg from '../../assets/images/logos/loginbg.webp'

const Login2 = () => {

  return (
    <PageContainer title="Login" description="this is Login page">
      <Box
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: `url(${loginbg}) no-repeat center center/cover`,
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            item
            xs={12}
            sm={12}
            lg={4}
            xl={3}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '500px' }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                {/* <Logo /> */}
                {/* <Typography color="dark" variant="h1" fontWeight="1000">
                 stay
                </Typography> */}
                <Box component="img" src={logo} alt="" width="170px" height="auto" />
              </Box>
              <AuthLogin
                // subtext={
                //   <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={1} mt={2}>
                //     Book Easy - Pay Less
                //   </Typography>
                // }
                // subtitle={
                //   <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
                //     <Typography color="textSecondary" variant="h6" fontWeight="500">
                //       New to stay?
                //     </Typography>
                //     <Typography
                //       component={Link}
                //       to="/auth/register"
                //       fontWeight="500"
                //       sx={{
                //         textDecoration: 'none',
                //         color: 'primary.main',
                //       }}
                //     >
                //       Create an account
                //     </Typography>
                //   </Stack>
                // }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Login2;
