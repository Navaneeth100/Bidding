/* ──────────────────────────────────────────────────────────────
   src/layouts/full/sidebar/MenuItems.js
   ────────────────────────────────────────────────────────────── */
   import {
    IconLayoutDashboard,
    IconList,
    IconListCheck,
    IconBrandUpwork,
    IconSettings,
    IconMoodHappy,
    IconCopy,
    IconListDetails,
    IconBookmark,
  } from '@tabler/icons-react';
  import { uniqueId } from 'lodash';
  
  /**
   * ⚠️  ONLY the structure changed (no theme / style edits):
   *  • “Service Category” is now a parent with three children
   *    – Service Sub Category, Services, Service Jobs.
   *  • “Vendor-Customer” is a parent with two children
   *    – Vendor, Customer.
   *  • All other items remain exactly as before.
   */
  const Menuitems = [
    /* ── HOME ─────────────────────────────────────────────── */
    { navlabel: true, subheader: 'Home' },
  
    {
      id: uniqueId(),
      title: 'Dashboard',
      icon: IconLayoutDashboard,
      href: '/dashboard',
    },
  
    /* ── SERVICES ─────────────────────────────────────────── */
    { navlabel: true, subheader: 'Services' },
  
    {
      id: uniqueId(),
      title: 'Services',
      icon: IconList,

      /* ▼ children moved inside Service Category */
      children: [
        {
          id: uniqueId(),
          title: 'Service Category',
          icon: IconListCheck,
          href: '/service_category',
        },
        {
          id: uniqueId(),
          title: 'Service Sub Category',
          icon: IconListDetails ,
          href: '/service_Sub_category',
        },
        {
          id: uniqueId(),
          title: 'Service Posts',
          icon: IconList,
          href: '/services',
        },
        {
          id: uniqueId(),
          title: 'Job Posts',
          icon: IconBrandUpwork,
          href: '/service-jobs',
        },
        {
          id: uniqueId(),
          title: 'Service Bookmarks',
          icon: IconBookmark,
          href: '/service-bookmarks',
        },
      ],
    },
  
    /* ── VENDOR-CUSTOMER ──────────────────────────────────── */
    {
      id: uniqueId(),
      title: 'Vendor-Customer',
      icon: IconList,
     
      /* ▼ Vendor & Customer are now submenu items */
      children: [
        {
          id: uniqueId(),
          title: 'Vendor',
          icon: IconList,
          href: '/vendor',
        },
        {
          id: uniqueId(),
          title: 'Customer',
          icon: IconList,
          href: '/customer',
        },
      ],
    },
  
    /* ── SETTINGS (still a single item) ───────────────────── */
    {
      id: uniqueId(),
      title: 'Settings',
      icon: IconSettings,
      href: '/settings',
    },
  
    /* ── OPTIONAL EXTRAS (commented, unchanged) ───────────── */
    // {
    //   id: uniqueId(),
    //   title: 'Create Category',
    //   icon: IconMoodHappy,
    //   href: '/service_category/create',
    // },
    // {
    //   id: uniqueId(),
    //   title: 'Category Reports',
    //   icon: IconCopy,
    //   href: '/service_category/reports',
    // },
  ];
  
  export default Menuitems;
  