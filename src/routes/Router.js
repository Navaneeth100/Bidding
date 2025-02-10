// import React, { lazy } from 'react';
// import { Navigate } from 'react-router-dom';
// import Loadable from '../layouts/full/shared/loadable/Loadable';

// /* ***Layouts**** */
// const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
// const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// /* ****Pages***** */
// const Dashboard = Loadable(lazy(() => import('../views/dashboard/Dashboard')))
// const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')))
// const Icons = Loadable(lazy(() => import('../views/icons/Icons')))
// const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')))
// const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')))
// const Error = Loadable(lazy(() => import('../views/authentication/Error')));
// const Register = Loadable(lazy(() => import('../views/authentication/Register')));
// const Login = Loadable(lazy(() => import('../views/authentication/Login')));
// const Hotels = Loadable(lazy(() => import('../pages/Hotels')));
// const HotelView = Loadable(lazy(() => import('../pages/HotelView')));
// const HotelAdd = Loadable(lazy(() => import('../pages/AddHotel')));
// const Booking = Loadable(lazy(() => import('../pages/Bookings')));
// const Settings = Loadable(lazy(() => import('../pages/Settings')));
// const Category = Loadable(lazy(() => import('../pages/Category')));
// const Facilities = Loadable(lazy(() => import('../pages/Facilities')));

// const user = JSON.parse(localStorage.getItem('authTokens'));
// const Router = [
//   {
//     path: '/',
//     element: <FullLayout />,
//     children: [
//       { path: '/', element: <Navigate to={user ? '/dashboard' : '/auth/login'} /> },
//       { path: '/dashboard', exact: true, element: <Dashboard /> },
//       // { path: '/sample-page', exact: true, element: <SamplePage /> },
//       { path: '/hotels', exact: true, element: <Hotels /> },
//       { path: '/addhotel', exact: true, element: <HotelAdd /> },
//       { path: '/hotels/:id', exact: true, element: <HotelView /> },
//       { path: '/bookings', exact: true, element: <Booking /> },
//       { path: '/settings', exact: true, element: <Settings /> },
//       { path: '/category', exact: true, element: <Category /> },
//       { path: '/facilities', exact: true, element: <Facilities /> },
//       // { path: '/icons', exact: true, element: <Icons /> },
//       // { path: '/ui/typography', exact: true, element: <TypographyPage /> },
//       // { path: '/ui/shadow', exact: true, element: <Shadow /> },
//       // { path: '*', element: <Navigate to="/auth/404" /> },
//     ],
//   },
//   {
//     path: '/auth',
//     element: <BlankLayout />,
//     children: [
//       { path: '404', element: <Error /> },
//       { path: '/auth/register', element: <Register /> },
//       { path: '/auth/login', element: <Login /> },
//       // { path: '*', element: <Navigate to="/auth/404" /> },
//     ],
//   },
// ];

// export default Router;


import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

/* ***Layouts**** */
import FullLayout from '../layouts/full/FullLayout';
import BlankLayout from '../layouts/blank/BlankLayout';

/* ****Pages***** */
import Dashboard from '../views/dashboard/Dashboard';
import SamplePage from '../views/sample-page/SamplePage';
import Icons from '../views/icons/Icons';
import TypographyPage from '../views/utilities/TypographyPage';
import Shadow from '../views/utilities/Shadow';
import Error from '../views/authentication/Error';
import Register from '../views/authentication/Register';
import Login from '../views/authentication/Login';
import Hotels from '../pages/Hotels';
import HotelView from '../pages/HotelView';
import HotelAdd from '../pages/AddHotel';
import Booking from '../pages/Bookings';
import Settings from '../pages/Settings';
import Category from '../pages/Category';
import Facilities from '../pages/Facilities';

const user = JSON.parse(localStorage.getItem('authTokens'));

const ProtectedRoute = () => {
  return user ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

const Router = () => {
  return (
    <Routes>
      {/* Full Layout Routes */}
      <Route path="/" element={<FullLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="addhotel" element={<HotelAdd />} />
          <Route path="hotels/:id" element={<HotelView />} />
          <Route path="bookings" element={<Booking />} />
          <Route path="settings" element={<Settings />} />
          <Route path="category" element={<Category />} />
          <Route path="facilities" element={<Facilities />} />
        </Route>
      </Route>
      
      {/* Authentication Routes */}
      <Route path="/auth" element={<BlankLayout />}>
        <Route path="404" element={<Error />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Catch-All Route */}
      <Route path="*" element={<Navigate to="/auth/404" />} />
    </Routes>
  );
};

export default Router;
