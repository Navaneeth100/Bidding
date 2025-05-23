import { useEffect, useState } from 'react';
import { uniqueId } from 'lodash';
import React from 'react';

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

  const staticMenu = [{ navlabel: true, subheader: 'Bid App by TriRed' }];

  const settingsMenu = {
    id: uniqueId(),
    title: 'General Settings',
    icon: <i className="fa fa-cog" style={{ marginRight: 8 }}></i>,
    href: '/settings',
  };

  return [...staticMenu, ...menus, settingsMenu];
};

export default useMenuItems;
  