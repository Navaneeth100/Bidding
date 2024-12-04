import {
  IconAperture, IconCopy, IconLayoutDashboard, IconLogin, IconMoodHappy, IconTypography, IconUserPlus, IconBuildingSkyscraper,IconSettings
} from '@tabler/icons-react';

import { uniqueId } from 'lodash';

const Menuitems = [
  // {
  //   navlabel: true,
  //   subheader: 'Home',
  // },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  // {
  //   navlabel: true,
  //   subheader: 'Utilities',
  // },
  {
    id: uniqueId(),
    title: 'Hotels',
    icon: IconBuildingSkyscraper,
    href: '/hotels',
  },
  {
    id: uniqueId(),
    title: 'Bookings',
    icon: IconCopy,
    href: '/ui/shadow',
  },
  // {
  //   navlabel: true,
  //   subheader: 'Auth',
  // },
  {
    id: uniqueId(),
    title: 'Settings',
    icon: IconSettings,
    href: '/auth/login',
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
  {
    id: uniqueId(),
    title: 'Icons',
    icon: IconMoodHappy,
    href: '/icons',
  },
  {
    id: uniqueId(),
    title: 'Sample Page',
    icon: IconAperture,
    href: '/sample-page',
  },
];

export default Menuitems;
