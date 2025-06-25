import { useEffect, useState } from "react";
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, List, ListItem, ListItemText, TableRow, Paper, Checkbox,
    Avatar, Typography, TextField, InputAdornment, Button, IconButton, Grid, Menu, MenuItem, Chip, Select, FormControl, InputLabel,
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, TablePagination, Divider, CircularProgress, useTheme, alpha
} from "@mui/material";
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconEye, IconPencil, IconTrash, IconDots, IconSearch, IconPlus, IconAlertCircleFilled, IconH6, IconBan, IconUserCheck } from '@tabler/icons-react';
import axios from "axios";
import { url } from "../../../mainurl";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { FirstPage, LastPage, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { format } from 'date-fns';
import Swal from "sweetalert2";

const Employees = () => {
    // Auth & Theme
    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    const mode = JSON.parse(localStorage.getItem('mode'));
    const tokenStr = String(authTokens.access);
    const theme = useTheme();
    const MenuProps = { PaperProps: { style: { maxHeight: 200, overflowY: 'auto' } } };

    // Navigation
    const navigate = useNavigate();

    // States
    const [mainImgIdx, setMainImgIdx] = useState(0);
    const [modal, setModal] = useState({ add: false, view: false, edit: false, delete: false });
    const [anchorEl, setAnchorEl] = useState(null);
    const [employeeList, setEmployeeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [onsearchText, setonsearchText] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [deleteData, setDeleteData] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [eitdata, setEitData] = useState({});
    const [ServiceID, SetServiceID] = useState(null);
    const [openService, setService] = useState(false);
    console.log("eitdata", eitdata);
    const [roleList, setroleList] = useState([]);
    // Add/Edit States


    // Edit
    const [editData, setEditData] = useState({
        email: "", username: "", password: "", first_name: "", last_name: "",
        phone_number: "", employee_role: "", desig: "", languages: "", dob: "", experience: ""
    });
    console.log(editData);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch employees (with pagination, search)
    const fetchService = () => {
        setLoading(true);
        axios.get(`${url}/auth/employees/?search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
            headers: { Authorization: `Bearer ${tokenStr}`, "Content-Type": "application/json" },
        })
            .then(res => {
                setEmployeeList(res.data.results);
                setNextPageUrl(res.data.next);
                setPrevPageUrl(res.data.previous);
                setTotalPages(Math.ceil(res.data.count / rowsPerPage));
                setLoading(false);
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    localStorage.clear();
                    navigate("/auth/login");
                } else {
                    const refresh = String(authTokens.refresh);
                    axios.post(`${url}/api/token/refresh/`, { refresh }).then((res) => {
                        localStorage.setItem("authTokens", JSON.stringify(res.data));
                        axios
                            .get(`${url}/auth/employees/?search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                                headers: { Authorization: `Bearer ${res.data.access}` },
                            })
                            .then((res) => {
                                setEmployeeList(res.data.results);
                                setNextPageUrl(res.data.next);
                                setPrevPageUrl(res.data.previous);
                                setTotalPages(Math.ceil(res.data.count / rowsPerPage));
                                setLoading(false);
                            });
                    });
                }
            });
    };

    useEffect(() => {
        fetchService();
        // eslint-disable-next-line
    }, [currentPage, rowsPerPage, onsearchText]);

    const handlePageChange = (page) => setCurrentPage(page);

    // Get single employee for details (for ServiceID dialog & edit)
    const fetchServiceIDById = async (id, forEdit = false) => {
        setLoading(true);
        try {
            const res = await axios.get(`${url}/auth/employees/${id}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
            });
            SetServiceID(res.data);
            setLoading(false);

            if (forEdit) {
                setEditData({
                    email: res.data.email || "",
                    username: res.data.username || "",
                    password: "", // Leave blank for security
                    first_name: res.data.first_name || "",
                    last_name: res.data.last_name || "",
                    phone_number: res.data.phone_number || "",
                    employee_role: res.data.employee_role || "",
                    desig: res.data.profile.desig || "",
                    languages: res.data.profile.languages || "",
                    dob: res.data.profile.dob ? res.data.profile.dob.split("T")[0] : "",
                    experience: res.data.profile.experience || "",
                });
                setSelectedId(res.data.id);
                setIsEditModalOpen(true);
            }

        } catch (error) {
            setLoading(false);
            toast.error("Failed to fetch details.");
        }
    };

    // Add Employee
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        employeeRole: "",
        desig: "",
        languages: "",
        dob: "",
        experience: "",
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));
        try {
            await axios.post(`${url}/auth/employees/`, data, {
                headers: { Authorization: `Bearer ${tokenStr}`, "Content-Type": "multipart/form-data" },
            });
            toast.success("Request Submitted Successfully");
            setModal((prev) => ({ ...prev, add: false }));
            setFormData({
                email: "",
                username: "",
                password: "",
                first_name: "",
                last_name: "",
                phone_number: "",
                employeeRole: "",
                desig: "",
                languages: "",
                dob: "",
                experience: "",
            });
            fetchService();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to submit request");
        }
    };
    const fetchUserrole = () => {
        axios
            .get(`${url}/auth/employee-roles/?data=list`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
            })
            .then((res) => {
                setroleList(res.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.clear();
                    navigate("/auth/login");
                } else {
                    const refresh = String(authTokens.refresh);
                    axios.post(`${url}/api/token/refresh/`, { refresh }).then((res) => {
                        localStorage.setItem("authTokens", JSON.stringify(res.data));
                        axios
                            .get(`${url}/auth/employee-roles/?data=list`, {
                                headers: {
                                    Authorization: `Bearer ${res.data.access}`,
                                },
                            })
                            .then((res) => {
                                setroleList(res.data);
                            });
                    });
                }
            });
    };
    // Edit Employee (PUT)
    const handleEdit = async (event) => {
        event.preventDefault();

        // Build the exact payload your API expects
        const submitData = {
            email: editData.email,
            username: editData.username,
            password: editData.password,
            first_name: editData.first_name,
            last_name: editData.last_name,
            phone_number: editData.phone_number,
            employeeRole: roleList.find(item => item.name === editData.employee_role)?.id,
            desig: editData.desig,
            languages: editData.languages,
            dob: editData.dob,
            experience: editData.experience,

        };

        try {
            await axios.put(
                `${url}/auth/employees/${eitdata}/`,
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${tokenStr}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: false,
                }
            );

            toast.success("Employee Edited Successfully", {
                position: "top-right",
                autoClose: 3000,
            });
            fetchService()

            // close & reset
            setIsEditModalOpen(false);
            setEditData({
                email: "", username: "", password: "",
                first_name: "", last_name: "",
                phone_number: "", employee_role: "",
                desig: "", languages: "",
                dob: "", experience: ""
            });

        } catch (err) {
            toast.error(
                err.response?.data?.error,
                { position: "top-right", autoClose: 3000 }
            );
        }
    };




    // Delete Employee
    const handleDelete = async () => {
        try {
            await axios.delete(`${url}/auth/employees/${selectedId}/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
            });
            toast.success("Employee Deleted Successfully", { position: 'top-right', autoClose: 3000 });
            setModal(prev => ({ ...prev, delete: false }));
            fetchService();
        } catch (error) {
            toast.error(error?.response?.data?.error || "Delete failed", { position: 'top-right', autoClose: 3000 });
        }
    };

    // Details Modal
    const handleNameClick = (item) => {
        setSelectedItem(item);
        setOpenDetailsModal(true);
    };
    const handleDetailsClose = () => {
        setOpenDetailsModal(false);
        setSelectedItem(null);
    };

    // Menu Handlers
    const handleMenusClick = (e, id) => {
        setAnchorEl(e.currentTarget);
        setSelectedId(id);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedId(null);
    };

    // Block or Unblock Employee

    const BlockorUnlock = async (id, name, action) => {
        const result = await Swal.fire({
            title: `Are you sure you want to ${action} ${name}?`,
            icon: action === "block" ? "warning" : "info",
            iconColor: action === "block" ? "#e53e3e" : "#519380",
            showCancelButton: true,
            confirmButtonColor: action === "block" ? "#d33" : "#519380",
            cancelButtonColor: action === "block" ? "#519380" : "#d33",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
        });
        if (result.isConfirmed) {
            try {
                const headers = {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                };

                const submittedData = {
                    user_id: id,
                    data: "Employee",
                    action: action
                };

                const response = await axios.post(`${url}/auth/block-unblock-user/`, submittedData, { headers });
                toast.success(response.data.message || `User ${action}ed successfully`);
                fetchService()

            } catch (error) {
                const errorMessage = error?.response?.data?.error;
                toast.error(errorMessage);
            }
        }
    };

    // Styled for Details
    const DetailsGrid = styled(Box)(({ theme }) => ({
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
    }));
    const Label = styled(Typography)(({ theme }) => ({
        ...theme.typography.subtitle2,
        color: theme.palette.text.primary,
        marginBottom: theme.spacing(0.5),
    }));
    const Value = styled(Typography)(({ theme }) => ({
        ...theme.typography.body2,
        color: theme.palette.text.secondary,
    }));

    return (
        <PageContainer title="Employees" description="Employees">
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: "25px" }}>
                Employees
            </Typography>
            <DashboardCard>
                <Grid container spacing={3}>
                    <Grid item sm={12} lg={12}>
                        <Box sx={{
                            p: 2, display: "flex", justifyContent: "space-between", alignItems: "center",
                            borderBottom: "1px solid #e5e9f2",
                        }}>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: "#364a63" }} />
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                <TextField
                                    placeholder="Search by Name"
                                    size="small"
                                    value={onsearchText}
                                    onChange={(e) => { setonsearchText(e.target.value); setCurrentPage(0); }}
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start"><IconSearch fontSize="small" /></InputAdornment>),
                                        sx: { borderRadius: 1 },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<IconPlus />}
                                    onClick={() => {
                                        setModal((prev) => ({ ...prev, add: true }));
                                        fetchUserrole();
                                    }}
                                    sx={{
                                        bgcolor: "#519380",
                                        "&:hover": { bgcolor: "#7DAA8D" },
                                        borderRadius: 1,
                                        boxShadow: "none"
                                    }}
                                >
                                    Add
                                </Button>

                            </Box>
                        </Box>
                        <TableContainer sx={{ minHeight: '700px' }}>
                            <Table size="medium" sx={{
                                minWidth: { xs: 650, sm: 750 },
                                borderCollapse: 'collapse',
                                '& thead th': { backgroundColor: '#f5f5f5', fontSize: '14px', fontWeight: 700, },
                                '& td': { fontSize: '13px', fontWeight: 500, },
                            }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">SN</TableCell>
                                        <TableCell align="center">Name</TableCell>
                                        <TableCell align="center">User Name</TableCell>
                                        <TableCell align="center">User Role</TableCell>
                                        <TableCell align="center">Email</TableCell>
                                        <TableCell align="center">Mobile No</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '540px', fontWeight: 'bolder', fontSize: '15px' }}>
                                                    <CircularProgress color="primary" size={25} /> Loading Details
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : employeeList && employeeList.length > 0 ? (
                                        employeeList.map((item, index) => (
                                            <TableRow key={item.id} hover role="checkbox" tabIndex={-1}
                                                sx={{
                                                    '& td, & th': {
                                                        borderBottom: mode === 0 ? '1px solid #e0e0e0' : '1px solid rgb(85,83,83)',
                                                    },
                                                    backgroundColor:
                                                        mode === 0
                                                            ? index % 2 ? '#f9f9f9' : 'white'
                                                            : index % 2 ? '#2a2a2a' : '#1e1e1e',
                                                }}>
                                                <TableCell align="center">{currentPage * rowsPerPage + index + 1}</TableCell>
                                                <TableCell align="center"
                                                    onClick={() => handleNameClick(item)}
                                                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                                                >
                                                    {`${item.first_name} ${item.last_name}`}
                                                </TableCell>
                                                <TableCell align="center">{item.username}</TableCell>
                                                <TableCell align="center">{item.employee_role?.name}</TableCell>
                                                <TableCell align="center">{item.email}</TableCell>
                                                <TableCell align="center">{item.phone_number}</TableCell>
                                                <TableCell align="center">
                                                    {item.is_active
                                                        ? <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span>
                                                        : <span style={{ color: 'red', fontWeight: 'bold' }}>Inactive</span>}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenusClick(e, item.id)}
                                                        sx={{
                                                            color: 'text.secondary',
                                                            '&:hover': { color: 'text.primary', backgroundColor: 'rgba(255,255,255,0.08)' },
                                                        }}>
                                                        <IconDots fontSize="small" />
                                                    </IconButton>
                                                    {selectedId === item.id && (
                                                        <Menu
                                                            anchorEl={anchorEl}
                                                            open={Boolean(anchorEl)}
                                                            onClose={handleMenuClose}
                                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
                                                            transformOrigin={{ vertical: 'top', horizontal: 'right', }}
                                                            PaperProps={{ sx: { px: 1, } }}
                                                        >
                                                            <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => {
                                                                fetchServiceIDById(item.id, false);  // view
                                                                setService(true);
                                                                handleMenuClose();
                                                            }}>
                                                                <IconEye fontSize="small" className="me-2" /> View
                                                            </MenuItem>
                                                            <MenuItem sx={{ py: 1.7, px: 2 }} onClick={async () => {
                                                                await fetchServiceIDById(item.id, true);
                                                                setSelectedId(item.id);
                                                                setEitData(item.id);
                                                                handleMenuClose();
                                                                // Call fetchUserrole after all other actions are completed
                                                                fetchUserrole();
                                                            }}>
                                                                <IconPencil fontSize="small" className="me-2" /> Edit
                                                            </MenuItem>

                                                            {item.is_active && <>
                                                                <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { BlockorUnlock(item.id, `${item.first_name} ${item.last_name}`, "block"), handleMenuClose() }}>
                                                                    <IconBan fontSize="small" className="me-2" /> Block
                                                                </MenuItem>
                                                            </>}
                                                            {!item.is_active && <>
                                                                <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { BlockorUnlock(item.id, `${item.first_name} ${item.last_name}`, "unblock"), handleMenuClose() }}>
                                                                    <IconUserCheck fontSize="small" className="me-2" /> Unblock
                                                                </MenuItem>
                                                            </>}
                                                            <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => {
                                                                setDeleteData(item); setModal(prev => ({ ...prev, delete: true }));
                                                                setSelectedId(item.id); setAnchorEl(null);
                                                            }}>
                                                                <IconTrash fontSize="small" className="me-2" /> Delete
                                                            </MenuItem>
                                                        </Menu>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                                <Typography variant="subtitle2" fontWeight={600}>No Data to Display</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Service Details Dialog */}
                        <Dialog
                            open={openService}
                            onClose={() => setService(false)}
                            maxWidth="lg"
                            fullWidth
                            PaperProps={{
                                sx: {
                                    borderRadius: 4,
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: 24,
                                    overflow: 'hidden',
                                    bgcolor: 'background.default'
                                }
                            }}
                            BackdropProps={{
                                sx: {
                                    backdropFilter: 'blur(4px)',
                                    bgcolor: alpha(theme.palette.background.default, 0.8)
                                }
                            }}
                        >
                            <DialogTitle sx={{
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                px: 4, py: 3, fontSize: theme.typography.h5.fontSize,
                            }}>Employee Information</DialogTitle>
                            <DialogContent sx={{
                                position: 'relative', p: 6, backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                backgroundColor: alpha(theme.palette.background.default, 0.25),
                            }}>
                                {!ServiceID ? (
                                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ height: 200 }}>
                                        <CircularProgress color="primary" />
                                        <Typography variant="body1" mt={2} color="text.secondary">Loading service details...</Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={6} sx={{ marginTop: 1 }}>
                                        
                                        <Grid item xs={12} md={6}>
                                            {/* Vendor Information */}
                                            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 4, mb: 3, boxShadow: 1, minWidth: 350 }}>
                                                <Typography fontWeight={600} fontSize={18} mb={3}>Profile Details</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar
                                                            src={ServiceID.user?.profile?.profile_picture ? ServiceID.user.profile.profile_picture : ''}
                                                            alt="Profile"
                                                            sx={{ width: 70, height: 70 }}
                                                        />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Profile Picture</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">First Name</Typography>
                                                        <Typography variant="body1">{ServiceID?.first_name || '—'}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">Last Name</Typography>
                                                        <Typography variant="body1">{ServiceID?.last_name || '—'}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                                        <Typography variant="body1">{ServiceID?.email || '—'}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                                                        <Typography variant="body1">{ServiceID.phone_number || ServiceID.user?.phone_number || '—'}</Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="caption" color="text.secondary">User name</Typography>
                                                        <Typography variant="body1">
                                                            {ServiceID?.username}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                            {/* <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 4, boxShadow: 1, minWidth: 350 }}>
                                                <Typography fontWeight={600} fontSize={18} mb={3}>Location</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">Location</Typography>
                                                        <Typography variant="body1">{ServiceID.location || '—'}</Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="caption" color="text.secondary">Coordinates</Typography>
                                                        <Typography variant="body1">{ServiceID.location_name || '—'}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box> */}
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            
                                            <Box sx={{
                                               bgcolor: 'background.paper', borderRadius: 3, p: 4, mb: 3, boxShadow: 1, minWidth: 350, height:350,
                                            }}>
                                                <Typography fontWeight={600} fontSize={18} mb={3}>Employee Information</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="caption" color="text.secondary">Designation</Typography>
                                                        <Typography variant="body1">{ServiceID?.profile?.desig}</Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Languages</Typography>
                                                        <Typography variant="body1">{ServiceID?.profile?.languages}</Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="caption" color="text.secondary">experience</Typography>
                                                        <Typography variant="body1">{ServiceID?.profile?.experience  || '—'} years</Typography>
                                                    </Grid>
                                                    {ServiceID.service_subcategories?.length > 0 && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">Subcategories</Typography>
                                                            {ServiceID.service_subcategories.map(sc => (
                                                                <Typography key={sc.id} variant="body2">{sc.name}</Typography>
                                                            ))}
                                                        </Grid>
                                                    )}
                                                    <Grid item xs={12}>
                                                        <Typography variant="caption" color="text.secondary">DOB</Typography>
                                                        <Typography variant="body1">{ServiceID?.profile?.dob  || '—'} </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                )}
                            </DialogContent>
                            <DialogActions sx={{ p: 3 }}>
                                <Button variant="contained" size="large" onClick={() => setService(false)}>
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Details Modal */}
                        <Dialog
                            PaperProps={{
                                sx: { borderRadius: 4, p: 0, backdropFilter: 'blur(8px)', boxShadow: 24, }
                            }}
                            BackdropProps={{
                                sx: {
                                    backdropFilter: 'blur(4px)',
                                    bgcolor: alpha(theme.palette.background.default, 0.8)
                                }
                            }}
                            open={openDetailsModal} onClose={handleDetailsClose} fullWidth maxWidth="sm"
                        >
                            <DialogTitle>Service Details</DialogTitle>
                            <DialogContent dividers>
                                {selectedItem && (
                                    <DetailsGrid>
                                        <Box><Label>First Name</Label><Value>{selectedItem.user?.first_name}</Value></Box>
                                        <Box><Label>Last Name</Label><Value>{selectedItem.user?.last_name}</Value></Box>
                                        <Box><Label>Email</Label><Value>{selectedItem.user?.email}</Value></Box>
                                        <Box><Label>Title</Label><Value>{selectedItem.title}</Value></Box>
                                        <Box><Label>Location Name</Label><Value>{selectedItem.location_name}</Value></Box>
                                        <Box><Label>Created At</Label>
                                            <Value>{selectedItem.created_at ? format(new Date(selectedItem.created_at), 'HH:mm dd MMMM yyyy') : ''}</Value></Box>
                                    </DetailsGrid>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleDetailsClose}>Close</Button>
                            </DialogActions>
                        </Dialog>

                        {/* Pagination */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                border: "1px solid #e0e0e0",
                                maxWidth: "220px",
                                borderRadius: 2,
                                marginTop: "20px",
                                marginLeft: "auto",
                                p: 0.5,
                                gap: 0.5,
                            }}
                        >
                            {currentPage > 1 && (
                                <IconButton onClick={() => handlePageChange(1)} aria-label="first page"><FirstPage /></IconButton>
                            )}
                            {prevPageUrl && (
                                <IconButton onClick={() => handlePageChange(currentPage - 1)} aria-label="previous page">
                                    <ChevronLeft />
                                </IconButton>
                            )}
                            <Typography variant="body2" sx={{
                                minWidth: 30, textAlign: "center", fontWeight: "500",
                                fontSize: "14px", padding: "8px", px: 1, color: theme.palette.text.primary,
                            }}>
                                {currentPage + 1}
                            </Typography>
                            {nextPageUrl && (
                                <IconButton onClick={() => handlePageChange(currentPage + 1)} aria-label="next page"><ChevronRight /></IconButton>
                            )}
                            {currentPage !== totalPages - 1 && (
                                <IconButton onClick={() => handlePageChange(totalPages - 1)} aria-label="last page"><LastPage /></IconButton>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DashboardCard>

            {/* Add Modal */}
            <Dialog
                open={modal.add}
                onClose={() => setModal(prev => ({ ...prev, add: false }))}
                maxWidth="xl"
                PaperProps={{ sx: { width: { xs: "95%", sm: "80%", md: "50%" }, maxHeight: "90vh", borderRadius: 2 } }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary, }}>
                    Add Employees        </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={6}><TextField required fullWidth label="Username" value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))} /></Grid>
                            <Grid item xs={6}><TextField required fullWidth label="Password" type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} /></Grid>
                            <Grid item xs={6}><TextField required fullWidth label="First Name" value={formData.first_name} onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))} /></Grid>
                            <Grid item xs={6}><TextField required fullWidth label="Last Name" value={formData.last_name} onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))} /></Grid>
                            <Grid item xs={6}><TextField required fullWidth label="Phone Number" value={formData.phone_number} onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))} /></Grid>
                            <Grid item xs={6}><TextField required fullWidth label="Email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></Grid>
                            <Grid item xs={6}>
                                <TextField
                                    select
                                    required
                                    fullWidth
                                    label="Employee Role"
                                    value={formData.employeeRole}
                                    onChange={e => setFormData(p => ({ ...p, employeeRole: e.target.value }))}
                                >
                                    {/* Optional placeholder item */}
                                    <MenuItem value="" disabled>
                                        Select Role
                                    </MenuItem>

                                    {/* Map roles from roleList */}
                                    {roleList.map(item => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={6}><TextField required fullWidth label="Designation" value={formData.desig} onChange={e => setFormData(p => ({ ...p, desig: e.target.value }))} /></Grid>
                            <Grid item xs={6}><TextField required fullWidth label="Languages" value={formData.languages} onChange={e => setFormData(p => ({ ...p, languages: e.target.value }))} /></Grid>
                            <Grid item xs={6}><TextField required fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={formData.dob} onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))} /></Grid>
                            <Grid item xs={6}><TextField required fullWidth label="Experience" value={formData.experience} onChange={e => setFormData(p => ({ ...p, experience: e.target.value }))} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                        <Button onClick={() => setModal(prev => ({ ...prev, add: false }))} variant="outlined">Cancel</Button>
                        <Button type="submit" variant="contained">Submit</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary, }}>
                    Edit Employees        </DialogTitle>
                <form onSubmit={handleEdit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    required
                                    value={editData.password}
                                    onChange={e => setEditData(p => ({ ...p, password: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Email"
                                    fullWidth
                                    required
                                    value={editData.email}
                                    onChange={e => setEditData(p => ({ ...p, email: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Username"
                                    fullWidth
                                    required
                                    value={editData.username}
                                    onChange={e => setEditData(p => ({ ...p, username: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="First Name"
                                    fullWidth
                                    required
                                    value={editData.first_name}
                                    onChange={e => setEditData(p => ({ ...p, first_name: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Last Name"
                                    fullWidth
                                    required
                                    value={editData.last_name}
                                    onChange={e => setEditData(p => ({ ...p, last_name: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Phone Number"
                                    fullWidth
                                    required
                                    value={editData.phone_number}
                                    onChange={e => setEditData(p => ({ ...p, phone_number: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Employee Role</InputLabel>
                                <Select
                                    value={editData.employee_role || ''}
                                    onChange={(e) => setEditData((p) => ({ ...p, employee_role: e.target.value }))}
                                    label="Employee Role"
                                    MenuProps={MenuProps}
                                >
                                {roleList.map((item) => (
                                    <MenuItem key={item.id} value={item.name}>
                                    {item.name}
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Designation"
                                    fullWidth
                                    required
                                    value={editData.desig}
                                    onChange={e => setEditData(p => ({ ...p, desig: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Languages"
                                    fullWidth
                                    required
                                    value={editData.languages}
                                    onChange={e => setEditData(p => ({ ...p, languages: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Date of Birth"
                                    type="date"
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    value={editData.dob}
                                    onChange={e => setEditData(p => ({ ...p, dob: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Experience"
                                    fullWidth
                                    required
                                    value={editData.experience}
                                    onChange={e => setEditData(p => ({ ...p, experience: e.target.value }))}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                        <Button onClick={() => setIsEditModalOpen(false)} variant="outlined">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained">
                            Save Changes
                        </Button>
                    </DialogActions>
                </form>

            </Dialog>

            {/* Delete Modal */}
            <Dialog
                open={modal.delete}
                onClose={() => setModal(prev => ({ ...prev, delete: false }))}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: theme.palette.text.primary }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Delete Employee
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, p: 2, borderRadius: 1, mt: 2 }}>
                        <IconAlertCircleFilled size={50} style={{ color: "red" }} />
                        <Typography variant="h6" sx={{ color: theme.palette.text.primary, textAlign: "center" }}>
                            Are you sure you want to Delete this employee:&nbsp;
                            <Box component="span" sx={{ color: "red", fontWeight: 600 }}>
                                {deleteData.username}&nbsp;
                            </Box>
                            ?
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                    <Button
                        onClick={() => setModal(prev => ({ ...prev, delete: false }))}
                        variant="outlined"
                        sx={{ borderColor: "#e5e9f2", color: "#ffff",bgcolor: "#3f7b69", "&:hover": { borderColor: "#6e82a5", bgcolor: "#369e7f" } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        sx={{ bgcolor: "#c33b3b", "&:hover": { bgcolor: "#ff0707" } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default Employees;
