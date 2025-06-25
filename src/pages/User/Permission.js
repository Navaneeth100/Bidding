import { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, TextField, Checkbox, FormControlLabel, IconButton, Grid, Paper, Collapse, Fab, CircularProgress, InputAdornment, Divider, Container, AppBar, Toolbar, useTheme, useMediaQuery } from "@mui/material";
import { Search as SearchIcon, ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, Add as AddIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles"
import { toast, ToastContainer } from "react-toastify"
import { useParams, useLocation } from "react-router-dom"
import axios from "axios"
import { url } from "../../../mainurl"

// Styled components for better UI

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
    },
}))

const PermissionCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    minHeight: 150,
    display: "flex",
    flexDirection: "column",
    transition: "all 0.2s ease",
    "&:hover": {
        boxShadow: theme.shadows[4],
    },
}))

const FloatingButton = styled(Fab)(({ theme }) => ({
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 1000,
}))

const Permission2 = () => {

    const { state } = useLocation();
    const role = state?.role;
    const { id } = useParams()
    const [onSearchText, setSearchText] = useState("")

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))

    // AuthTokens

    const authTokens = JSON.parse(localStorage.getItem("authTokens"))
    const mode = JSON.parse(localStorage.getItem("mode"))
    const tokenStr = String(authTokens.access)

    const [menus, setMenus] = useState([])
    const [loading, setLoading] = useState(true)
    const [visibleMenus, setVisibleMenus] = useState({})
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([])

    const onFilterChange = (e) => {
        setSearchText(e.target.value)
    }

    // Add Permission

    const handleSubmit = async (event) => {
        event.preventDefault()

        const combinedArray = [...selectedCheckboxes]
        const permissionSet = new Set()

        menus.forEach((menuItem) => {
            const permissions = menuItem.permissions || []
            const permissionIds = permissions.map((permission) => permission.id)

            const hasMatchingChild = (menuItem.children || []).some((child) => {
                const childPermissions = child.permissions || []
                const childPermissionIds = childPermissions.map((permission) => permission.id)
                return childPermissionIds.some((id) => selectedCheckboxes.includes(id))
            })

            if (hasMatchingChild) {
                combinedArray.push(...permissionIds)
            }
        })

        combinedArray.forEach((permissionId) => permissionSet.add(permissionId))
        const uniqueCombinedArray = Array.from(permissionSet)

        const postPermissions = async (accessToken) => {
            return axios.post(
                `${url}/auth/userroles/${id}/permissions/add/`,
                { permission_ids: uniqueCombinedArray },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                },
            )
        }

        try {
            await postPermissions(tokenStr)
            toast.success("Permissions added successfully!", {
                position: "top-right",
                autoClose: true,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            })

            fetchPermissions(id)
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error("At least one permission must be added", {
                    position: toast.POSITION.TOP_RIGHT,
                })
                return
            }

            if (error.response?.status === 401) {
                try {
                    const refresh = String(authTokens.refresh)
                    const res = await axios.post(`${url}/api/token/refresh/`, { refresh })
                    localStorage.setItem("authTokens", JSON.stringify(res.data))

                    await postPermissions(res.data.access)

                    toast.success("Permissions added successfully after token refresh!", {
                        position: "top-right",
                        autoClose: true,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    })

                    fetchPermissions(id)
                } catch (refreshError) {
                    console.error("Token refresh failed", refreshError)
                    window.location.reload()
                }
            } else {
                console.error("Error submitting permissions:", error)
            }
        }
    }

    // Fetch MenuList

    const fetchMenuList = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${url}/auth/menulist/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })

            setMenus(response.data.results)
        } catch (error) {
            // Attempt to refresh token if expired
            const refresh = String(authTokens.refresh)
            try {
                const res = await axios.post(`${url}/api/token/refresh/`, { refresh })
                localStorage.setItem("authTokens", JSON.stringify(res.data))

                const newHeaders = {
                    Authorization: `Bearer ${res.data.access}`,
                }

                // Retry menu fetch with new token
                const response = await axios.get(`${url}/auth/menulist/`, {
                    headers: newHeaders,
                })

                setMenus(response.data.results)
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMenuList()
    }, [])

    // Fetch User Role Permission

    const fetchPermissions = async (id) => {
        try {
            const headers = {
                Authorization: `Bearer ${tokenStr}`,
                "Content-Type": "application/json",
            }

            const res = await axios.get(`${url}/auth/menus/role/${id}/`, { headers })

            const permissionIds = []

            // Flatten and collect all permission IDs where has_permission is true
            const extractPermissions = (menuList) => {
                menuList.forEach((menu) => {
                    if (menu.permissions) {
                        menu.permissions.forEach((perm) => {
                            if (perm.has_permission) {
                                permissionIds.push(perm.id)
                            }
                        })
                    }
                    if (menu.children && menu.children.length > 0) {
                        extractPermissions(menu.children)
                    }
                })
            }

            extractPermissions(res.data) // go through all levels

            setSelectedCheckboxes(permissionIds)

            // Auto-expand visible menus based on has_permission
            const newVisibleMenus = {}
            const checkMenuForPermissions = (menuList) => {
                menuList.forEach((menu) => {
                    let hasActivePermissions = false

                    // Check if this menu has any permissions with has_permission: true
                    if (menu.permissions) {
                        hasActivePermissions = menu.permissions.some((perm) => perm.has_permission)
                    }

                    // Check children recursively
                    if (menu.children && menu.children.length > 0) {
                        const childHasPermissions = menu.children.some((child) => {
                            // Check child permissions
                            if (child.permissions) {
                                return child.permissions.some((perm) => perm.has_permission)
                            }
                            // Check nested children
                            if (child.children) {
                                return checkChildrenForPermissions(child.children)
                            }
                            return false
                        })
                        hasActivePermissions = hasActivePermissions || childHasPermissions
                    }

                    if (hasActivePermissions) {
                        newVisibleMenus[menu.id] = true
                    }
                })
            }

            const checkChildrenForPermissions = (children) => {
                return children.some((child) => {
                    if (child.permissions && child.permissions.some((perm) => perm.has_permission)) {
                        return true
                    }
                    if (child.children) {
                        return checkChildrenForPermissions(child.children)
                    }
                    return false
                })
            }

            checkMenuForPermissions(res.data)
            setVisibleMenus(newVisibleMenus)

            // Update the menus state with the permission data
            setMenus(res.data)
        } catch (error) {
            const refresh = String(authTokens.refresh)
            try {
                const res = await axios.post(`${url}/api/token/refresh/`, { refresh })
                localStorage.setItem("authTokens", JSON.stringify(res.data))

                const newHeaders = {
                    Authorization: `Bearer ${res.data.access}`,
                }

                const res2 = await axios.get(`${url}/auth/menus/role/${id}/`, { headers: newHeaders })

                const permissionIds = []
                const extractPermissions = (menuList) => {
                    menuList.forEach((menu) => {
                        if (menu.permissions) {
                            menu.permissions.forEach((perm) => {
                                if (perm.has_permission) {
                                    permissionIds.push(perm.id)
                                }
                            })
                        }
                        if (menu.children && menu.children.length > 0) {
                            extractPermissions(menu.children)
                        }
                    })
                }

                extractPermissions(res2.data)
                setSelectedCheckboxes(permissionIds)

                // Auto-expand logic for refreshed data
                const newVisibleMenus = {}
                const checkMenuForPermissions = (menuList) => {
                    menuList.forEach((menu) => {
                        let hasActivePermissions = false

                        if (menu.permissions) {
                            hasActivePermissions = menu.permissions.some((perm) => perm.has_permission)
                        }

                        if (menu.children && menu.children.length > 0) {
                            const childHasPermissions = menu.children.some((child) => {
                                if (child.permissions) {
                                    return child.permissions.some((perm) => perm.has_permission)
                                }
                                if (child.children) {
                                    return checkChildrenForPermissions(child.children)
                                }
                                return false
                            })
                            hasActivePermissions = hasActivePermissions || childHasPermissions
                        }

                        if (hasActivePermissions) {
                            newVisibleMenus[menu.id] = true
                        }
                    })
                }

                const checkChildrenForPermissions = (children) => {
                    return children.some((child) => {
                        if (child.permissions && child.permissions.some((perm) => perm.has_permission)) {
                            return true
                        }
                        if (child.children) {
                            return checkChildrenForPermissions(child.children)
                        }
                        return false
                    })
                }

                checkMenuForPermissions(res2.data)
                setVisibleMenus(newVisibleMenus)
                setMenus(res2.data)
            } catch (refreshError) {
                console.error("Token refresh failed inside permission fetch")
            }
        }
    }

    useEffect(() => {
        if (id) {
            fetchPermissions(id)
        }
    }, [id])

    const toggleMenuVisibility = (menuId) => {
        setVisibleMenus((prev) => ({
            ...prev,
            [menuId]: !prev[menuId],
        }))
    }

    const handleCheckboxChange = (e) => {
        const value = Number.parseInt(e.target.value)
        setSelectedCheckboxes((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
    }

    const getAllPermissionIds = (menu) => {
        let ids = (menu.permissions || []).map((p) => p.id)
        if (menu.children) {
            menu.children.forEach((child) => {
                ids = [...ids, ...getAllPermissionIds(child)]
            })
        }
        return ids
    }

    const handleSelectAll = (menu) => {
        const allPermissionIds = getAllPermissionIds(menu)
        const allSelected = allPermissionIds.every((id) => selectedCheckboxes.includes(id))

        setSelectedCheckboxes((prev) =>
            allSelected ? prev.filter((id) => !allPermissionIds.includes(id)) : [...new Set([...prev, ...allPermissionIds])],
        )
    }

    const filterMenus = (menus, search) => {
        if (!search) return menus
        const searchLower = search.toLowerCase()
        return menus.filter((menu) => (menu.name || "").toLowerCase().includes(searchLower))
    }

    const renderPermissionCard = (menu, isSubmenu = false) => {
        const flattenPermissions = (menu) => {
            const result = []

            if ((menu.permissions || []).length > 0) {
                result.push({ name: menu.name, permissions: menu.permissions })
            }
            // Use children instead of submenus
            ; (menu.children || []).forEach((child) => {
                if ((child.permissions || []).length > 0) {
                    result.push({ name: child.name, permissions: child.permissions })
                }
                // Handle nested children
                ; (child.children || []).forEach((nestedChild) => {
                    if ((nestedChild.permissions || []).length > 0) {
                        result.push({ name: nestedChild.name, permissions: nestedChild.permissions })
                    }
                })
            })

            return result
        }

        const permissionIds = (menu.permissions || []).map((p) => p.id)
        const allSelected = permissionIds.length > 0 && permissionIds.every((id) => selectedCheckboxes.includes(id))
        const isVisible = visibleMenus[menu.id]

        return (
            <StyledCard key={menu.id} elevation={3}>
                {!isSubmenu && (
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center">
                                <FormControlLabel
                                    control={<Checkbox checked={allSelected} onChange={() => handleSelectAll(menu)} color="primary" />}
                                    label={
                                        <Typography variant="h6" color="primary" fontWeight="bold">
                                            {menu.name}
                                        </Typography>
                                    }
                                />
                            </Box>
                            <IconButton
                                onClick={() => toggleMenuVisibility(menu.id)}
                                sx={{
                                    transform: isVisible ? "rotate(90deg)" : "rotate(0deg)",
                                    transition: "transform 0.3s ease",
                                }}
                            >
                                {isVisible ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                            </IconButton>
                        </Box>
                    </CardContent>
                )}

                <Collapse in={isVisible || isSubmenu}>
                    <CardContent sx={{ pt: 0 }}>
                        <Grid container spacing={2}>
                            {flattenPermissions(menu).map((block, idx) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={`${block.name}-${idx}`}>
                                    <PermissionCard elevation={5}>
                                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                            {block.name}
                                        </Typography>
                                        <Divider sx={{ mb: 1 }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            {(block.permissions || []).map((perm) => (
                                                <FormControlLabel
                                                    key={perm.id}
                                                    control={
                                                        <Checkbox
                                                            value={perm.id}
                                                            onChange={handleCheckboxChange}
                                                            checked={selectedCheckboxes.includes(perm.id)}
                                                            size="small"
                                                            color="primary"
                                                        />
                                                    }
                                                    label={<Typography variant="body2">{perm.name || perm.label || "Unnamed"}</Typography>}
                                                    sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                    </PermissionCard>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Collapse>
            </StyledCard>
        )
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
            <ToastContainer />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: "25px" }}>
                {`Permissions for ${role}`}
            </Typography>

            <Container>
                <Box display="flex" justifyContent="flex-end" gap={5}>
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={onSearchText}
                        onChange={onFilterChange}
                        placeholder="Search by Menu"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ maxWidth: 300 }}
                    />
                </Box>
            </Container>

            {/* Main Content */}

            <Container maxWidth="lg" sx={{ py: 3 }}>
                <form onSubmit={handleSubmit}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                            <CircularProgress size={60} />
                        </Box>
                    ) : (
                        <Box>{filterMenus(menus, onSearchText).map((menu) => renderPermissionCard(menu))}</Box>
                    )}
                </form>
            </Container>

            {/* Floating Action Button */}

            <FloatingButton color="primary" variant="extended" onClick={handleSubmit} disabled={loading}>
                <AddIcon sx={{ mr: 1 }} />
                Add Permission
            </FloatingButton>
        </Box>
    )
}

export default Permission2
