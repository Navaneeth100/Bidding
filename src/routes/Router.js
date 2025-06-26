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
const Chatpanel = Loadable(lazy(() => import('../pages/Chat/Chatpanel')));
const Chatuser = Loadable(lazy(() => import('../pages/Chat/ChatPageWithUserList')));
// Bidding

const ServiceCategory = Loadable(lazy(() => import('../pages/Services/ServiceCategory')));
const ServiceSubCategory = Loadable(lazy(() => import('../pages/Services/ServiceSubCategory')));
const Services = Loadable(lazy(() => import('../pages/Services/Services')));
const Vendor = Loadable(lazy(() => import('../pages/Vendor/vendor')));
const Customer = Loadable(lazy(() => import('../pages/Vendor/customer')));
const ServiceJobs = Loadable(lazy(() => import('../pages/Services/ServicesJobs')));
const ServiceBookMarks = Loadable(lazy(() => import('../pages/Services/ServiceBookMarks')));
const Proposals = Loadable(lazy(() => import('../pages/Services/Proposals')));
const UserRole = Loadable(lazy(() => import('../pages/User/Userroles')));
const Employees = Loadable(lazy(() => import('../pages/User/employee')));
const MenuList = Loadable(lazy(() => import('../pages/User/MenuList')));
const Permission = Loadable(lazy(() => import('../pages/User/Permission')));
const Banner = Loadable(lazy(() => import('../pages/Banner/Banner')));
const Order = Loadable(lazy(() => import('../pages/Order/Order')));
const OngoingOrder = Loadable(lazy(() => import('../pages/Order/OngoingOrder')));
const OrderDash = Loadable(lazy(() => import('../pages/Order/OrderDash')));
const Notification = Loadable(lazy(() => import('../pages/Notification/Notification')));
const PaymentSuccess = Loadable(lazy(() => import('../pages/PaymentSuccess')));
const PaymentCancelled = Loadable(lazy(() => import('../pages/PaymentCancelled')));
const Tickets = Loadable(lazy(() => import('../pages/Services/Tickets')));
const TicketChat = Loadable(lazy(() => import('../pages/Services/TicketChat')));

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

      //  Bidding

      { path: '/service_category', exact: true, element: <ServiceCategory /> },
      { path: '/service_Sub_category', exact: true, element: <ServiceSubCategory /> },
      { path: '/services', exact: true, element: <Services /> },
      { path: '/service-Jobs', exact: true, element: <ServiceJobs /> },
      { path: '/service-bookmarks', exact: true, element: <ServiceBookMarks /> },
      { path: '/vendor', exact: true, element: <Vendor /> },
      { path: '/customer', exact: true, element: <Customer /> },
      { path: '/proposals', exact: true, element: <Proposals /> },
      { path: '/user_roles', exact: true, element: <UserRole /> },
      { path: '/employees', exact: true, element: <Employees /> },
      { path: '/menulist', exact: true, element: <MenuList /> },
      { path: '/permission/:id', exact: true, element: <Permission /> },
      { path: '/Banner', exact: true, element: <Banner /> },
      { path: '/order', exact: true, element: <Order /> },
      { path: '/ongoing-order', exact: true, element: <OngoingOrder /> },
      { path: '/order-dash', exact: true, element: <OrderDash /> },
      { path: '/notification', exact: true, element: <Notification /> },
      { path: '/chatuser', exact: true, element: <Chatuser /> },
      { path: '/tickets', exact: true, element: <Tickets /> },
      { path: '/ticket_chat/:id', exact: true, element: <TicketChat /> },
      // { path: '/ui/typography', exact: true, element: <TypographyPage /> },
      // { path: '/ui/shadow', exact: true, element: <Shadow /> },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/success', element: <PaymentSuccess /> },
      { path: '/auth/cancel', element: <PaymentCancelled /> },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
    ],
  },
];

export default Router;
