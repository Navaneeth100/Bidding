import React from 'react';
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

const getColours = (theme) => ({
  highlight: theme.palette.primary.main,
  parentBg: theme.palette.action.selected,
  muted: theme.palette.text.secondary,
});

const StyledItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'ownerState',
})(({ theme, ownerState }) => {
  const { level, active, collapsed } = ownerState;
  const { highlight, parentBg, muted } = getColours(theme);

  return {
    transition: 'none !important',
    whiteSpace: 'nowrap',
    marginBottom: theme.spacing(0.25),
    padding: collapsed ? theme.spacing(1) : theme.spacing(1, 1.5),

    ...(level > 0 && !collapsed && {
      paddingLeft: theme.spacing(3),
    }),

    borderRadius: theme.shape.borderRadius * 2,
    justifyContent: collapsed ? 'center' : 'flex-start',

    ...(level === 0 && {
      backgroundColor: parentBg,
      color: highlight,
      marginTop: '9px',
    }),

    ...(level > 0 && {
      backgroundColor: 'transparent',
      color: active ? highlight : muted,
      '& .MuiTypography-root': {
        fontSize: theme.typography.body2.fontSize,
      },
    }),

    '&:hover': {
      backgroundColor: level === 0 ? parentBg : 'transparent',
      color: highlight,
    },

    ...(collapsed &&
      level === 0 && {
        '&:first-of-type': {
          marginTop: theme.spacing(2),
        },
      }),
  };
});

const NavItem = ({
  item,
  pathDirect,
  collapsed,
  level = 0,
  onClick,
  openId,
  setOpenId,
}) => {
  const theme = useTheme();

  // Determine if this item is open
  const isOpen = openId === item.id;

  const toggleOpen = () => {
    if (item.children) {
      setOpenId(isOpen ? null : item.id);
    }
  };

  const isActive = pathDirect === item.href;

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
      aria-expanded={item.children ? isOpen : undefined}
      aria-controls={item.children ? `submenu-${item.id}` : undefined}
    >
      <ListItemIcon
        sx={{
          minWidth: 36,
          color: 'inherit',
          justifyContent: 'center',
        }}
      >
        {React.isValidElement(item.icon) ? (
          item.icon
        ) : item.icon ? (
          <item.icon size="1.25rem" stroke={1.5} />
        ) : null}
      </ListItemIcon>

      {!collapsed && (
        <>
          <ListItemText primary={item.title} />
          {item.children &&
            (isOpen ? (
              <IconChevronDown size="1rem" />
            ) : (
              <IconChevronRight size="1rem" />
            ))}
        </>
      )}
    </StyledItem>
  );

  const WrappedButton = collapsed ? (
    <Tooltip title={item.title} placement="right" arrow>
      {Button}
    </Tooltip>
  ) : (
    Button
  );

  return (
    <>
      <List component="li" disablePadding>
        {WrappedButton}
      </List>

      {item.children && (
        <Collapse
          in={isOpen && !collapsed}
          timeout="auto"
          unmountOnExit
          id={`submenu-${item.id}`}
        >
          <List component="div" disablePadding>
            {item.children.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                pathDirect={pathDirect}
                collapsed={collapsed}
                level={level + 1}
                onClick={onClick}
                openId={openId}
                setOpenId={setOpenId}
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
  openId: PropTypes.string,
  setOpenId: PropTypes.func,
};

export default NavItem;
