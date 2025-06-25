import React from 'react';
import Menuitems from './MenuItems';
import { useLocation } from 'react-router';
import { Box, List } from '@mui/material';
import NavItem from './NavItem';
import NavGroup from './NavGroup/NavGroup';
import useMenuItems from './MenuItems';

const SidebarItems = ({ collapsed }) => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const Menuitems = useMenuItems();

  return (
    <Box sx={{ px: collapsed ? 1 : 3, width: '100%' }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {Menuitems.map((item) => {
          // SubHeader
          if (item.subheader) {
            return collapsed ? null : <NavGroup item={item} key={item.subheader} />;
          } else {
            // Regular menu item
            return (
              <NavItem 
                item={item} 
                key={item.id} 
                pathDirect={pathDirect} 
                collapsed={collapsed}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;
