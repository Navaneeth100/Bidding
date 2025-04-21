import PropTypes from "prop-types"
import { NavLink } from "react-router-dom"
// mui imports
import { ListItemIcon, ListItem, List, styled, ListItemText, useTheme, Tooltip } from "@mui/material"

const NavItem = ({ item, level, pathDirect, collapsed, onClick }) => {
  const Icon = item.icon
  const theme = useTheme()
  const itemIcon = <Icon stroke={1.5} size="1.3rem" />

  const ListItemStyled = styled(ListItem)(() => ({
    whiteSpace: "nowrap",
    marginBottom: "2px",
    padding: "8px 10px",
    borderRadius: "8px",
    backgroundColor: level > 1 ? "transparent !important" : "inherit",
    color: theme.palette.text.secondary,
    paddingLeft: "10px",
    justifyContent: collapsed ? "center" : "flex-start",
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: "white",
    },
    "&.Mui-selected": {
      color: "white",
      backgroundColor: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
        color: "white",
      },
    },
  }))

  // Fix the button prop issue by using component prop correctly
  const menuItem = (
    <List component="li" disablePadding key={item.id}>
      <ListItemStyled
        component={item.external ? "a" : NavLink}
        to={item.href}
        href={item.external ? item.href : ""}
        disabled={item.disabled}
        selected={pathDirect === item.href}
        target={item.external ? "_blank" : ""}
        onClick={onClick}
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
          {itemIcon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText>
            <>{item.title}</>
          </ListItemText>
        )}
      </ListItemStyled>
    </List>
  )

  // Wrap with Tooltip when collapsed
  return collapsed ? (
    <Tooltip title={item.title} placement="right" arrow>
      {menuItem}
    </Tooltip>
  ) : (
    menuItem
  )
}

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
  pathDirect: PropTypes.any,
  collapsed: PropTypes.bool,
  onClick: PropTypes.func,
}

export default NavItem

