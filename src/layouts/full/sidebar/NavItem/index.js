/* ------------------------------------------------------
   src/layouts/full/sidebar/NavItem.js
   ------------------------------------------------------ */
   import React, { useState } from "react";
   import PropTypes from "prop-types";
   import { NavLink } from "react-router-dom";
   import {
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Collapse,
     Tooltip,
     Popover,
     useTheme,
     styled,
   } from "@mui/material";
   import { IconChevronRight, IconChevronDown } from "@tabler/icons-react";
   
   /* ---------- original styled rules ---------- */
   const makeStyledItem = (theme, collapsed, level) =>
    styled(ListItem)(({ theme }) => ({
      whiteSpace: "nowrap",
      marginBottom: 2,
      padding: "8px 10px",
      borderRadius: 8,
      paddingLeft: 10,
      justifyContent: collapsed ? "center" : "flex-start",
  
      /* --- DEFAULT BACKGROUND --- */
      backgroundColor:
        level > 1 ? "transparent !important" : "inherit", // keep children transparent until hover
      color: theme.palette.text.secondary,
  
      /* ---------- HOVER ---------- */
      "&:hover": {
        backgroundColor:
          level > 1
            ? theme.palette.primary.main   // child items get primary.main on hover
            : theme.palette.primary.main, // page/parent stay light
        color: "#fff",
      },
  
      /* -------- SELECTED --------- */
      "&.Mui-selected": {
        color: "#fff",
        backgroundColor:
          level === 1
            ? theme.palette.primary.light   // selected *parent* = primary.main
            : theme.palette.primary.main, // selected page/child = primary.light
        "&:hover": {
          backgroundColor: theme.palette.primary.main, // always main on hover-while-selected
        },
      },
    }));
   
   const NavItem = ({
     item,
     pathDirect,
     collapsed,
     level = 0,
     onClick,
   }) => {
     const theme = useTheme();
     const [open, setOpen] = useState(false);
     const [anchorEl, setAnchorEl] = useState(null);
     const Icon = item.icon;
   
     /* active logic */
     const routeSelected = pathDirect === item.href;
     const popoverOpen = Boolean(anchorEl);
     const isActive =
       routeSelected || (item.children && (open || popoverOpen));
   
     const ListItemStyled = makeStyledItem(theme, collapsed, level);
   
     /* handlers */
     const handleClick = () => {
       if (item.children && !collapsed) setOpen(!open);
     };
     const handleEnter = (e) => {
       if (item.children && collapsed) setAnchorEl(e.currentTarget);
     };
     const handleLeave = () => setAnchorEl(null);
   
     /* list-item button */
     const ButtonNode = (
      <ListItemStyled
      component={item.external ? "a" : NavLink}
      to={item.href}
      href={item.external ? item.href : undefined}
      target={item.external ? "_blank" : undefined}
      disabled={item.disabled}
      selected={isActive}        
      onClick={(e) => {
        handleClick();
        onClick?.(e);
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
    
         <ListItemIcon
           sx={{
             minWidth: collapsed ? "36px" : "36px",
             p: "3px 0",
             color: "inherit",
             justifyContent: collapsed ? "center" : "flex-start",
             margin: collapsed ? "0 auto" : "0",
           }}
         >
           <Icon stroke={1.5} size="1.3rem" />
         </ListItemIcon>
   
         {!collapsed && (
           <>
             <ListItemText primary={item.title} />
             {item.children &&
               (open ? (
                 <IconChevronDown size="1rem" />
               ) : (
                 <IconChevronRight size="1rem" />
               ))}
           </>
         )}
       </ListItemStyled>
     );
   
     const Wrapped = collapsed ? (
       <Tooltip title={item.title} placement="right" arrow>
         {ButtonNode}
       </Tooltip>
     ) : (
       ButtonNode
     );
   
     /* render */
     return (
       <>
         <List component="li" disablePadding>
           {Wrapped}
         </List>
   
         {item.children && !collapsed && (
           <Collapse in={open} timeout="auto" unmountOnExit>
             <List component="div" disablePadding>
               {item.children.map((child) => (
                 <NavItem
                   key={child.id}
                   item={child}
                   pathDirect={pathDirect}
                   collapsed={collapsed}
                   level={level + 1}
                 />
               ))}
             </List>
           </Collapse>
         )}
   
         {item.children && collapsed && (
           <Popover
             open={popoverOpen}
             anchorEl={anchorEl}
             onClose={handleLeave}
             anchorOrigin={{ vertical: "center", horizontal: "right" }}
             transformOrigin={{ vertical: "center", horizontal: "left" }}
             disableScrollLock
             PaperProps={{ sx: { p: 1, width: 200 } }}
           >
             <List component="nav" disablePadding>
               {item.children.map((child) => (
                 <NavItem
                   key={child.id}
                   item={child}
                   pathDirect={pathDirect}
                   collapsed={false}
                   level={1}
                 />
               ))}
             </List>
           </Popover>
         )}
       </>
     );
   };
   
   NavItem.propTypes = {
     item: PropTypes.object.isRequired,
     pathDirect: PropTypes.string,
     collapsed: PropTypes.bool,
     level: PropTypes.number,
     onClick: PropTypes.func,
   };
   
   export default NavItem;
   