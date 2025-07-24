import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { Box, List } from '@mui/material';
import NavItem from './NavItem';
import NavGroup from './NavGroup/NavGroup';
import useMenuItems from './MenuItems';

const SidebarItems = ({ collapsed }) => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const Menuitems = useMenuItems();

  const [openId, setOpenId] = useState(null);

  return (
    <Box
      sx={{
        px: collapsed ? 1 : 3,
        width: '100%',
        height: '100%', // Make sure parent Box takes full height
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <List
        sx={{
          pt: 0,
          flexGrow: 1, // take all vertical space inside Box
          overflowY: 'auto', // enable scrolling
          scrollbarWidth: 'none', // Firefox
          '-ms-overflow-style': 'none', // IE 10+
          '&::-webkit-scrollbar': {
            display: 'none', // Chrome, Safari, Opera
          },
        }}
        className="sidebarNav"
      >
        {Menuitems.map((item) => {
          if (item.subheader) {
            return collapsed ? null : <NavGroup item={item} key={item.subheader} />;
          }
          return (
            <NavItem
              key={item.id}
              item={item}
              pathDirect={pathDirect}
              collapsed={collapsed}
              openId={openId}
              setOpenId={setOpenId}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;
