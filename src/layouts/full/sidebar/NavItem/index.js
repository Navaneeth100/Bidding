/* ------------------------------------------------------
   src/layouts/full/sidebar/NavItem.js
   ------------------------------------------------------ */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  useTheme,
  styled,
} from '@mui/material';
import { IconChevronRight, IconChevronDown } from '@tabler/icons-react';

/* ---------- colour helpers ---------- */
const getColours = (theme) => ({
  highlight: theme.palette.primary.main,          // ZDCO green
  parentBg: theme.palette.action.selected,        // grey pill background
  muted: theme.palette.text.secondary,
});

/* ======================================================
   STYLED LIST-ITEM
   ====================================================== */
const StyledItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'ownerState',
})(({ theme, ownerState }) => {
  const { level, active, collapsed } = ownerState;
  const { highlight, parentBg, muted } = getColours(theme);

  return {
    /* -------- layout spacing -------- */
    whiteSpace: 'nowrap',
    marginBottom: collapsed ? theme.spacing(0.25)        // 16 px gap when collapsed
                            : theme.spacing(0.25),     // 4 px when expanded
    padding: collapsed ? theme.spacing(1)             // icon pill
                       : theme.spacing(1, 1.5),       // full-width row

    /* extra left indent for children (open sidebar) */
    ...(level > 0 && !collapsed && {
      paddingLeft: theme.spacing(3),     
                   // 32 px
    }),
  
    borderRadius: theme.shape.borderRadius * 2,
    justifyContent: collapsed ? 'center' : 'flex-start',

    /* -------- parent row (e.g. “Driver”) -------- */
    ...(level === 0 && {
      backgroundColor: parentBg,
      color: highlight,
      marginTop:"9px"
    }),

    /* -------- child rows -------- */
    ...(level > 0 && {
      backgroundColor: 'transparent',
      color: active ? highlight : muted,
      '& .MuiTypography-root': {
        fontSize: theme.typography.body2.fontSize, 
           // smaller font
      },
    }),

    /* -------- hover -------- */
    '&:hover': {
      backgroundColor: level === 0 ? parentBg : 'transparent',
      color: highlight,
    },

    /* -------- first top-level item margin (collapsed) -------- */
    ...(collapsed &&
      level === 0 && {
        '&:first-of-type': {
          marginTop: theme.spacing(2),  
                        // 32 px space above the first icon
        },
      }),
  };
});

/* ======================================================
   COMPONENT
   ====================================================== */
const NavItem = ({
  item,
  pathDirect,
  collapsed,
  level = 0,
  onClick,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const Icon = item.icon;
  const isActive = pathDirect === item.href;

  const toggleOpen = () => item.children && setOpen((prev) => !prev);

  /* ---------- list-item button ---------- */
  const Button = (
    <StyledItem
      button
      component={item.external ? 'a' : NavLink}
      to={!item.external ? item.href : undefined}
      href={item.external ? item.href : undefined}
      target={item.external ? '_blank' : undefined}
      ownerState={{ level, active: isActive, collapsed }}
      disabled={item.disabled}
      onClick={(e) => {
        toggleOpen();
        onClick?.(e);
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 36,
          color: 'inherit',
          justifyContent: 'center',
        }}
      >
        {React.isValidElement(item.icon) ? item.icon : <item.icon size="1.25rem" stroke={1.5} />}
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
    </StyledItem>
  );

  /* ---------- tooltip when collapsed ---------- */
  const WrappedButton = collapsed ? (
    <Tooltip title={item.title} placement="right" arrow>
      {Button}
    </Tooltip>
  ) : (
    Button
  );

  /* ---------- render ---------- */
  return (
    <>
      <List component="li" disablePadding>
        {WrappedButton}
      </List>

      {/* nested children — only shown when sidebar is open */}
      {item.children && (
        <Collapse in={open && !collapsed} timeout="auto" unmountOnExit>
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
