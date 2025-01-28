import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* ****Pages***** */
const Dashboard = Loadable(lazy(() => import('../views/dashboard/Dashboard')))
const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')))
const Icons = Loadable(lazy(() => import('../views/icons/Icons')))
const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')))
const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')))
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Register = Loadable(lazy(() => import('../views/authentication/Register')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const Hotels = Loadable(lazy(() => import('../pages/Hotels')));
const HotelView = Loadable(lazy(() => import('../pages/HotelView')));
const HotelAdd = Loadable(lazy(() => import('../pages/AddHotel')));
const Booking = Loadable(lazy(() => import('../pages/Bookings')));
const Settings = Loadable(lazy(() => import('../pages/Settings')));
const Category = Loadable(lazy(() => import('../pages/Category')));
const Facilities = Loadable(lazy(() => import('../pages/Facilities')));

const user = JSON.parse(localStorage.getItem('authTokens'));
const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to={user ? '/dashboard' : '/auth/login'} /> },
      { path: '/dashboard', exact: true, element: <Dashboard /> },
      // { path: '/sample-page', exact: true, element: <SamplePage /> },
      { path: '/hotels', exact: true, element: <Hotels /> },
      { path: '/addhotel', exact: true, element: <HotelAdd /> },
      { path: '/hotels/:id', exact: true, element: <HotelView /> },
      { path: '/bookings', exact: true, element: <Booking /> },
      { path: '/settings', exact: true, element: <Settings /> },
      { path: '/category', exact: true, element: <Category /> },
      { path: '/facilities', exact: true, element: <Facilities /> },
      // { path: '/icons', exact: true, element: <Icons /> },
      // { path: '/ui/typography', exact: true, element: <TypographyPage /> },
      // { path: '/ui/shadow', exact: true, element: <Shadow /> },
      // { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/login', element: <Login /> },
      // { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default Router;
