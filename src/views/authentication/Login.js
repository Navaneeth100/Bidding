import React from 'react';
import PageContainer from 'src/components/container/PageContainer';

import AuthLogin from './auth/AuthLogin';

const Login2 = () => {

  return (
    <PageContainer title="Login" description="this is Login page">
  
              <AuthLogin/>
    
    </PageContainer>
  );
};

export default Login2;
