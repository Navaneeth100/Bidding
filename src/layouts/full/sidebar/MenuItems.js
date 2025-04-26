import {
  IconAperture, IconCopy, IconLayoutDashboard, IconLogin, IconMoodHappy, IconTypography, IconUserPlus, IconBuildingSkyscraper, IconSettings,
  IconList, IconBuilding, IconLiveView, IconListCheck
} from '@tabler/icons-react';

import { uniqueId } from 'lodash';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  // {
  //   navlabel: true,
  //   subheader: 'Our Hotels',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Hotels',
  //   icon: IconBuildingSkyscraper,
  //   href: '/hotels',
  // },
  // {
  //   navlabel: true,
  //   subheader: 'Our Bookings',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Bookings',
  //   icon: IconCopy,
  //   href: '/bookings',
  // },
  {
    navlabel: true,
    subheader: 'Services',
  },
  {
    id: uniqueId(),
    title: 'Service Category',
    icon: IconList,
    href: '/service_category',
  },
  {
    id: uniqueId(),
    title: 'Service Sub Category',
    icon: IconListCheck,
    href: '/service_Sub_category',
  },
  {
    navlabel: true,
    subheader: 'Vendor-Customer',
  },
  {
    id: uniqueId(),
    title: 'Vendor',
    icon: IconList,
    href: '/Vendor',
  },
  {
    id: uniqueId(),
    title: 'Customer',
    icon: IconList,
    href: '/customer',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Facilities',
  //   icon: IconBuilding,
  //   href: '/facilities',
  // },
  {
    id: uniqueId(),
    title: 'Settings',
    icon: IconSettings,
    href: '/settings',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Register',
  //   icon: IconUserPlus,
  //   href: '/auth/register',
  // },
  // {
  //   navlabel: true,
  //   subheader: 'Extra',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Icons',
  //   icon: IconMoodHappy,
  //   href: '/icons',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Sample Page',
  //   icon: IconAperture,
  //   href: '/sample-page',
  // },
];

export default Menuitems;
