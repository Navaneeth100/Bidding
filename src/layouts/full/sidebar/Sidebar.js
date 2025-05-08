import React, { useState, useEffect } from 'react';
import { useMediaQuery, Box, Drawer, IconButton, useTheme } from '@mui/material';
// import { Menu as MenuIcon } from '@mui/icons-material';
import SidebarItems from './SidebarItems';
import { Logo } from 'react-mui-sidebar';
import logo from '../../../assets/images/logos/stay.jpg';
import { IconMenu2 } from '@tabler/icons-react';

const MSidebar = ({ isSidebarOpen }) => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const [collapsed, setCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Expanded width and collapsed width
  const EXPANDED_WIDTH = '270px';
  const COLLAPSED_WIDTH = '80px';

  // Get the current sidebar width based on state
  const getSidebarWidth = () => {
    if (collapsed) {
      return isHovering ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
    }
    return EXPANDED_WIDTH;
  };

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Handle mouse enter/leave for hover effect
  const handleMouseEnter = () => {
    if (collapsed) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Auto toggle sidebar based on window width

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setCollapsed(false); // Expand if window width >= 1220
      } else {
        setCollapsed(true); // Collapse otherwise
      }
    };

    // Set initial state based on current window size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update main content styles using CSS variables instead of props
  useEffect(() => {
    const mainContent = document.querySelector('.mainContent');
    if (mainContent) {
      mainContent.style.width = collapsed
        ? `calc(100% - ${COLLAPSED_WIDTH})`
        : `calc(100% - ${EXPANDED_WIDTH})`;
      mainContent.style.marginLeft = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
      mainContent.style.transition = 'width 0.3s ease, margin-left 0.3s ease';
    }
  }, [collapsed]);

  return (
    <Box
      sx={{
        width: getSidebarWidth(),
        flexShrink: 0,
        transition: 'width 0.3s ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Drawer
        anchor="left"
        open={isSidebarOpen !== false}
        variant="permanent"
        PaperProps={{
          sx: {
            width: getSidebarWidth(),
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: 'width 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {/* Header with toggle button */}
        <Box sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          {/* Logo - visible when expanded or hovering */}
          <Box
            sx={{
              opacity: collapsed && !isHovering ? 0 : 1,
              transition: 'opacity 0.3s ease',
              width: collapsed && !isHovering ? 0 : '120px',
              overflow: 'hidden'
            }}
          >
            {/* <Logo img={logo} /> */}
          </Box>

          {/* Toggle button */}
          <IconButton
            onClick={toggleSidebar}
            aria-label="toggle sidebar"
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
              },
            }}
          >
            <IconMenu2 />
          </IconButton>
        </Box>

        {/* Sidebar Content */}
        <Box
          sx={{
            flexGrow: 1,
            width: '100%',
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          <SidebarItems
            collapsed={collapsed && !isHovering}
          />
        </Box>
      </Drawer>
    </Box>
  );
};

export default MSidebar;
