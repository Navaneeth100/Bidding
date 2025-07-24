import { useEffect, useState } from 'react';
import { uniqueId } from 'lodash';
import React from 'react';
import { Typography } from '@mui/material';
const useMenuItems = () => {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    const menuData = authTokens?.menus || [];

    const transformedMenus = mapMenuItems(menuData);
    setMenus(transformedMenus);
  }, []);

  // Recursive submenu mapping
  const mapMenuItems = (menuData) => {
    return menuData.map(item => ({
      id: uniqueId(),
      title: item.name,
      href: item.url === '/' ? undefined : item.url,
      icon: <i className={item.icon} style={{ marginRight: 8 }}></i>,
      children: item.children && item.children.length > 0
        ? mapMenuItems(item.children)
        : undefined,
    }));
  };

const staticMenu = [
  {
    navlabel: true,
    subheader: (
      <Typography
  variant="h5"
  sx={(theme) => ({
    fontWeight: 900,
    paddingLeft: 2,
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    background: 'linear-gradient(90deg, #00bfa5, #00796b, #004d40)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    letterSpacing: 2,
    userSelect: 'none',
    fontSize:"10px",

    fontSize: theme.palette.mode === 'dark' ? '1rem' : '1rem',

  })}
>
  Tahadi-group
</Typography>
    ),
    // Remove color here because color is now inside style
  }
];




  const settingsMenu = {
    id: uniqueId(),
    title: 'General Settings',
    icon: <i className="fa fa-cog" style={{ marginRight: 8 }}></i>,
    href: '/settings',
  };

  return [...staticMenu, ...menus, settingsMenu];
};

export default useMenuItems;
