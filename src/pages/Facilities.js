import { useEffect, useState } from "react"
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Avatar, Typography, TextField, InputAdornment, Button, IconButton, Grid, Menu, MenuItem, Chip, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TablePagination, Divider, CircularProgress } from "@mui/material"
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import { IconEye, IconPencil, IconTrash, IconDots, IconSearch, IconPlus, IconAlertCircleFilled } from '@tabler/icons-react';
import axios from "axios";
import { url } from "../../mainurl";



const getStatusColor = (status) => {
    switch (status) {
        case "Active":
            return { color: "#1ee0ac", backgroundColor: "#e6fcf6" }
        case "Pending":
            return { color: "#f4bd0e", backgroundColor: "#fef6e0" }
        case "Suspend":
            return { color: "#e85347", backgroundColor: "#fce9e7" }
        case "Inactive":
            return { color: "#8094ae", backgroundColor: "#eef2f7" }
        default:
            return { color: "#8094ae", backgroundColor: "#eef2f7" }
    }
}

const Customers = () => {

    const [customers, setCustomers] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [selected, setSelected] = useState([])
    const [anchorEl, setAnchorEl] = useState(null)
    const [currentCustomer, setCurrentCustomer] = useState(null)
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [newStatus, setNewStatus] = useState("Active")
    const [addModalOpen, setAddModalOpen] = useState(false)


    // AuthTokens

    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    let tokenStr = String(authTokens.access);


    // Function to toggle the modal state

    const [modal, setModal] = useState({ add: false, view: false, edit: false, delete: false });

    const toggleModal = (type) => {
        setModal((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    // Menu Toggle

    const handleMenuClick = (event, customer) => {
        setAnchorEl(event.currentTarget)
        setViewData(customer)
        setEditData(customer)
        setDeleteData(customer)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setViewData([])
        setEditData([])
        setDeleteData([])
    }

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Handle pagination changes
    const handleChangePage = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Get Customer


    const [categoryList, setcategoryList] = useState([])
    const [loading, setLoading] = useState(false);
    const [viewData, setViewData] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const pageSize = 10;

    const fetchCategory = (page = 1) => {
        setLoading(true);
        axios
            .get(`${url}/hotel/room-categories/?page=${page}&page_size=${pageSize}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {
                setcategoryList(res.data.results);
                setCurrentPage(page);
                setTotalPages(Math.ceil(res.data.count / pageSize));
                setNextPage(res.data.next);
                setPrevPage(res.data.previous);
                setLoading(false);
            })
            .catch((error) => {
                let refresh = String(authTokens.refresh);
                axios.post(`${url}/api/token/refresh/`, { refresh: refresh }).then((res) => {
                    localStorage.setItem("authTokens", JSON.stringify(res.data));
                    //   setNewAuthTokens(JSON.stringify(res.data));

                    const new_headers = {
                        Authorization: `Bearer ${res.data.access}`,
                    };
                    axios
                        .get(`${url}/hotel/room-categories/?page=${page}&page_size=${pageSize}`, { headers: new_headers })
                        .then((res) => {
                            setcategoryList(res.data.results);
                            setCurrentPage(page);
                            setTotalPages(Math.ceil(res.data.count / pageSize));
                            setNextPage(res.data.next);
                            setPrevPage(res.data.previous);
                            setLoading(false)
                        });
                });
            });
    };

    // pagination

    useEffect(() => {
        fetchCategory(currentPage);
    }, [currentPage]);

    // SN Handler

    const calculateSN = (index, page, pageSize) => {
        return (page - 1) * pageSize + (index + 1);
    };

    //  page change

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            fetchFacilities(page);
        }
    };


    // Add Customer

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (formData.category_id && selectedFile) {
            let submitData = {
                icon: selectedFile,
                category_name: formData.category_name,
                category_name_ar: translatedCategoryName,
                description: formData.description,
            }

            try {
                const response = await axios.post(`${url}/hotel/room-categories/`, submitData, {
                    headers: {
                        Authorization: `Bearer ${tokenStr}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: false,
                });
                if (response.data.message) {
                    toast.success(`${response.data.message}`, {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: 'colored',
                    });
                }
                toggleModal('add')
                resetForm()
                fetchCategory()
            } catch (error) {
                toast.error(`${error.response.data.error}`, {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                });
            }
        } else {
            toast.error('Please fill all required fields and select a file.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
            });
        }

    };

    //  Edit Customer

    const [editData, setEditData] = useState([])

    const handleEdit = async (event) => {
        event.preventDefault();
        if (editData.category_name && selectedFile || editData.icon) {
            const translatedCategoryName = await translateCategory(editData.category_name);
            let submitData = {
                icon: selectedFile ? selectedFile : previewUrl,
                category_name: editData.category_name,
                category_name_ar: translatedCategoryName,
                description: editData.description,
            };

            try {
                const response = await axios.put(`${url}/hotel/room-categories/${editData.id}/`, submitData, {
                    headers: {
                        Authorization: `Bearer ${tokenStr}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: false,
                });
                if (response.data.message) {
                    toast.success(`${response.data.message}`, {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: 'colored',
                    });
                }
                toggleModal('edit');
                resetForm()
                fetchCategory();
            } catch (error) {
                toast.error(`${error.response.data.error}`, {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                });
            }
        } else {
            toast.error('Please fill all required fields and select a file.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
            });
        }
    };


    // Delete Customer

    const [deleteData, setDeleteData] = useState([])

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${url}/hotel/room-categories/${id}/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            if (response.data.message) {
                toast.success(`${response.data.message}`, {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                });
            }
            toggleModal('delete')
            fetchCategory();
        } catch (error) {
            toast.error(`${error.response.data.error}`, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
            });
        }
    };

    console.log(deleteData);


    return (
        <PageContainer title="Category" description="Category">
            <DashboardCard>
                <Grid container spacing={3}>
                    <Grid item sm={12} lg={12}>
                        {/* <Paper sx={{ width: "100%", mb: 2, borderRadius: 2, overflow: "hidden" }}> */}
                        <Box
                            sx={{
                                p: 3,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderBottom: "1px solid #e5e9f2",
                            }}
                        >
                            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: "#364a63" }}>
                                Customers
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <TextField
                                    placeholder="Search by name"
                                    size="small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconSearch fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 1 },
                                    }}
                                />
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel id="status-filter-label">Status</InputLabel>
                                    <Select
                                        labelId="status-filter-label"
                                        id="status-filter"
                                        value={statusFilter}
                                        label="Status"
                                    // onChange={handleStatusChange}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Suspend">Suspend</MenuItem>
                                        <MenuItem value="Inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    startIcon={<IconPlus />}
                                    onClick={() => toggleModal("add")}
                                    sx={{
                                        bgcolor: "#7f54fb",
                                        "&:hover": { bgcolor: "#6a3ee8" },
                                        borderRadius: 1,
                                        boxShadow: "none",
                                    }}
                                >
                                    Add
                                </Button>
                            </Box>
                        </Box>
                        <TableContainer>
                            <Table sx={{ minWidth: 750 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selected.length > 0 && selected.length < customers.length}
                                                checked={customers.length > 0 && selected.length === customers.length}
                                                // onChange={handleSelectAllClick}
                                                inputProps={{ "aria-label": "select all customers" }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: "#8094ae", fontWeight: 500 }}>User</TableCell>
                                        <TableCell sx={{ color: "#8094ae", fontWeight: 500 }}>Ordered</TableCell>
                                        <TableCell sx={{ color: "#8094ae", fontWeight: 500 }}>Phone</TableCell>
                                        <TableCell sx={{ color: "#8094ae", fontWeight: 500 }}>Country</TableCell>
                                        <TableCell sx={{ color: "#8094ae", fontWeight: 500 }}>Last Order</TableCell>
                                        <TableCell sx={{ color: "#8094ae", fontWeight: 500 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ color: "#8094ae", fontWeight: 500 }}>
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Box
                                                    display="flex"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    sx={{ height: "540px" , fontWeight:"bolder" , fontSize:"15px"}}
                                                >
                                                    <CircularProgress className="me-2" color="primary" size={25} /> Loading Details
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : categoryList && categoryList.length > 0 ? (
                                        categoryList.map((customer, index) => (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                // aria-checked={isItemSelected}
                                                tabIndex={- 1}
                                                key={customer.id}
                                                // selected={isItemSelected}
                                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        // checked={isItemSelected}
                                                        onClick={() => handleClick(customer.id)}
                                                        inputProps={{ "aria-labelledby": `enhanced-table-checkbox-${customer.id}` }}
                                                    />
                                                </TableCell>
                                                <TableCell component="th" scope="row" padding="none" sx={{ pl: 2 }}>
                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                        <Avatar
                                                            sx={{
                                                                bgcolor:
                                                                    customer.initials === "AB"
                                                                        ? "#7f54fb"
                                                                        : customer.initials === "AL"
                                                                            ? "#1ee0ac"
                                                                            : customer.initials === "JL"
                                                                                ? "#09c2de"
                                                                                : customer.initials === "JM"
                                                                                    ? "#e85347"
                                                                                    : customer.initials === "FB"
                                                                                        ? "#6576ff"
                                                                                        : "#f4bd0e",
                                                                width: 36,
                                                                height: 36,
                                                                mr: 2,
                                                            }}
                                                        >
                                                            {customer.initials}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: "#364a63" }}>
                                                                {customer.name}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: "#8094ae" }}>
                                                                {customer.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ color: "#364a63" }}>{customer.ordered}</TableCell>
                                                <TableCell sx={{ color: "#364a63" }}>{customer.phone}</TableCell>
                                                <TableCell sx={{ color: "#364a63" }}>{customer.country}</TableCell>
                                                <TableCell sx={{ color: "#364a63" }}>{customer.lastOrder}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={customer.status}
                                                        sx={{
                                                            // color: statusStyle.color,
                                                            // bgcolor: statusStyle.backgroundColor,
                                                            borderRadius: "4px",
                                                            fontSize: "12px",
                                                            fontWeight: 500,
                                                            height: "24px",
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(event) => handleMenuClick(event, customer)}
                                                        aria-label="more options"
                                                    >
                                                        <IconDots fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ paddingTop: "300px" }}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    No Data to Display
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ borderTop: "1px solid #e5e9f2" }}>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 100]}
                                component="div"
                                count={categoryList.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{
                                    ".MuiTablePagination-toolbar": {
                                        height: "50px",
                                        minHeight: "50px",
                                        alignItems: "center",
                                    },
                                    ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                                        color: "#8094ae",
                                        m: 0,
                                    },
                                    ".MuiTablePagination-select": {
                                        color: "#364a63",
                                    },
                                    ".MuiTablePagination-actions": {
                                        ml: 2,
                                        ".MuiIconButton-root": {
                                            padding: "4px",
                                            "&.Mui-disabled": {
                                                opacity: 0.5,
                                            },
                                        },
                                    },
                                }}
                            />
                        </Box>
                        {/* </Paper> */}
                    </Grid>
                </Grid>
            </DashboardCard>


            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <MenuItem onClick={() => toggleModal('view')}>
                    <IconEye fontSize="small" className="me-2" />
                    View
                </MenuItem>
                <MenuItem onClick={() => toggleModal('edit')}>
                    <IconPencil fontSize="small" className="me-2" />
                    Edit
                </MenuItem>
                <MenuItem onClick={() => toggleModal('delete')}>
                    <IconTrash fontSize="small" className="me-2" />
                    Delete
                </MenuItem>
            </Menu>

            {/*  Add Modal  */}

            <Dialog
                open={modal.add}
                onClose={() => toggleModal('add')}
                maxWidth="xl"
                PaperProps={{
                    sx: {
                        width: "50%",
                        maxHeight: "90vh",
                        borderRadius: 2,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: "1px solid #e5e9f2",
                        p: 3,
                        color: "#364a63",
                        fontWeight: 600,
                    }}
                >
                    Add New Customer
                </DialogTitle>
                <form
                //   onSubmit={handleSubmit}
                >
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            {/* Personal Information */}
                            <Grid item xs={12}>
                                <h3
                                    style={{
                                        color: "#364a63",
                                        fontSize: "1.05rem",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    Personal Information
                                </h3>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField required fullWidth name="name" label="Full Name" placeholder="Enter customer's full name" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="Enter customer's email"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField required fullWidth name="phone" label="Phone Number" placeholder="Enter phone number" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Country</InputLabel>
                                    <Select name="country" label="Country" defaultValue="">
                                        <MenuItem value="United State">United States</MenuItem>
                                        <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                                        <MenuItem value="Canada">Canada</MenuItem>
                                        <MenuItem value="India">India</MenuItem>
                                        <MenuItem value="Australia">Australia</MenuItem>
                                        <MenuItem value="Germany">Germany</MenuItem>
                                        <MenuItem value="France">France</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Order Information */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <h3
                                    style={{
                                        color: "#364a63",
                                        fontSize: "1.05rem",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    Order Information
                                </h3>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="ordered"
                                    label="Order Amount"
                                    type="number"
                                    placeholder="Enter order amount"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Status</InputLabel>
                                    <Select name="status" label="Status" defaultValue="Active">
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Suspend">Suspend</MenuItem>
                                        <MenuItem value="Inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Additional Information */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <h3
                                    style={{
                                        color: "#364a63",
                                        fontSize: "1.05rem",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    Additional Information
                                </h3>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="notes"
                                    label="Notes"
                                    multiline
                                    rows={4}
                                    placeholder="Enter any additional notes about the customer"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            p: 3,
                            borderTop: "1px solid #e5e9f2",
                            gap: 1,
                        }}
                    >
                        <Button
                            onClick={() => { toggleModal('add') }}
                            variant="outlined"
                            sx={{
                                borderColor: "#e5e9f2",
                                color: "#364a63",
                                "&:hover": {
                                    borderColor: "#6e82a5",
                                    backgroundColor: "#f5f6fa",
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                bgcolor: "#7f54fb",
                                "&:hover": { bgcolor: "#6a3ee8" },
                            }}
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/*  Edit Modal  */}

            <Dialog
                open={modal.edit}
                onClose={() => toggleModal('edit')}
                maxWidth="xl"
                PaperProps={{
                    sx: {
                        width: "50%",
                        maxHeight: "90vh",
                        borderRadius: 2,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: "1px solid #e5e9f2",
                        p: 3,
                        color: "#364a63",
                        fontWeight: 600,
                    }}
                >
                    Edit Customer
                </DialogTitle>
                <form
                //   onSubmit={handleSubmit}
                >
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            {/* Personal Information */}
                            <Grid item xs={12}>
                                <h3
                                    style={{
                                        color: "#364a63",
                                        fontSize: "1.05rem",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    Personal Information
                                </h3>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField required fullWidth name="name" label="Full Name" placeholder="Enter customer's full name" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="Enter customer's email"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField required fullWidth name="phone" label="Phone Number" placeholder="Enter phone number" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Country</InputLabel>
                                    <Select name="country" label="Country" defaultValue="">
                                        <MenuItem value="United State">United States</MenuItem>
                                        <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                                        <MenuItem value="Canada">Canada</MenuItem>
                                        <MenuItem value="India">India</MenuItem>
                                        <MenuItem value="Australia">Australia</MenuItem>
                                        <MenuItem value="Germany">Germany</MenuItem>
                                        <MenuItem value="France">France</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Order Information */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <h3
                                    style={{
                                        color: "#364a63",
                                        fontSize: "1.05rem",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    Order Information
                                </h3>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="ordered"
                                    label="Order Amount"
                                    type="number"
                                    placeholder="Enter order amount"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Status</InputLabel>
                                    <Select name="status" label="Status" defaultValue="Active">
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Suspend">Suspend</MenuItem>
                                        <MenuItem value="Inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Additional Information */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <h3
                                    style={{
                                        color: "#364a63",
                                        fontSize: "1.05rem",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    Additional Information
                                </h3>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="notes"
                                    label="Notes"
                                    multiline
                                    rows={4}
                                    placeholder="Enter any additional notes about the customer"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            p: 3,
                            borderTop: "1px solid #e5e9f2",
                            gap: 1,
                        }}
                    >
                        <Button
                            onClick={() => { toggleModal('edit') }}
                            variant="outlined"
                            sx={{
                                borderColor: "#e5e9f2",
                                color: "#364a63",
                                "&:hover": {
                                    borderColor: "#6e82a5",
                                    backgroundColor: "#f5f6fa",
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                bgcolor: "#7f54fb",
                                "&:hover": { bgcolor: "#6a3ee8" },
                            }}
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* View Modal */}

            <Dialog
                open={modal.view}
                onClose={() => { toggleModal('view') }}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid #e5e9f2',
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Avatar
                        sx={{
                            bgcolor: '#7f54fb',
                            width: 48,
                            height: 48
                        }}
                    >
                        {viewData.initials}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ color: '#364a63', fontWeight: 600, mb: 1 }}>
                            Customer Details
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8094ae' }}>
                            Customer ID: #{viewData.id}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3, mt: 2 }}>
                    <Grid container spacing={3}>
                        {/* Personal Information */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ color: '#364a63', fontWeight: 600, mb: 2 }}>
                                Personal Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ color: '#8094ae' }}>Full Name</Typography>
                                    <Typography variant="body1" sx={{ color: '#364a63' }}>{viewData.name}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ color: '#8094ae' }}>Email Address</Typography>
                                    <Typography variant="body1" sx={{ color: '#364a63' }}>{viewData.email}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ color: '#8094ae' }}>Phone Number</Typography>
                                    <Typography variant="body1" sx={{ color: '#364a63' }}>{viewData.phone}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ color: '#8094ae' }}>Country</Typography>
                                    <Typography variant="body1" sx={{ color: '#364a63' }}>{viewData.country}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        {/* Order Information */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ color: '#364a63', fontWeight: 600, mb: 2 }}>
                                Order Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ color: '#8094ae' }}>Total Orders</Typography>
                                    <Typography variant="body1" sx={{ color: '#364a63' }}>{viewData.ordered}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ color: '#8094ae' }}>Last Order</Typography>
                                    <Typography variant="body1" sx={{ color: '#364a63' }}>{viewData.lastOrder}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ color: '#8094ae' }}>Status</Typography>
                                    <Chip
                                        label={viewData.status}
                                        size="small"
                                        sx={{
                                            mt: 0.5,
                                            ...getStatusColor(viewData.status),
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e9f2' }}>
                    <Button
                        onClick={() => { toggleModal('view') }}
                        variant="contained"
                        sx={{
                            bgcolor: '#7f54fb',
                            '&:hover': { bgcolor: '#6a3ee8' }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Modal */}

            <Dialog
                open={modal.delete}
                onClose={() => { toggleModal('delete') }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: "1px solid #e5e9f2",
                        p: 3,
                    }}
                >
                    <Typography variant="h6" sx={{ color: "#364a63", fontWeight: 600 }}>
                        Delete Customer
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, mt: 3 }}>
                        <Avatar
                            sx={{
                                bgcolor: "#7f54fb",
                                width: 40,
                                height: 40,
                            }}
                        >
                            {deleteData?.id}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" sx={{ color: "#364a63", fontWeight: 500 }}>
                                {deleteData?.id}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#8094ae" }}>
                                {deleteData?.id}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, bgcolor: "#fff8f8", p: 2, borderRadius: 1 }}>
                        <IconAlertCircleFilled sx={{ color: "#e85347" }} />
                        <Typography variant="body2" sx={{ color: "#364a63" }}>
                            Warning: This action cannot be undone. All associated data will be permanently removed.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                    <Button
                        onClick={() => { toggleModal('delete') }}
                        variant="outlined"
                        sx={{
                            borderColor: "#e5e9f2",
                            color: "#364a63",
                            "&:hover": {
                                borderColor: "#6e82a5",
                                bgcolor: "#f5f6fa",
                            },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => { handleDelete(deleteData.id) }}
                        variant="contained"
                        sx={{
                            bgcolor: "#e85347",
                            "&:hover": { bgcolor: "#e42a1d" },
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </PageContainer >
    );
};

export default Customers;
