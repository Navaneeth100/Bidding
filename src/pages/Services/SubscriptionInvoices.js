import { useEffect, useState } from "react"
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Avatar, Typography, TextField, InputAdornment, Button, IconButton, Grid, Menu, MenuItem, Chip, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TablePagination, Divider, CircularProgress, useTheme, alpha, FormControlLabel, } from "@mui/material"
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconEye, IconPencil, IconTrash, IconDots, IconSearch, IconPlus, IconAlertCircleFilled } from '@tabler/icons-react';
import axios from "axios";
import { url } from '../../../mainurl';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FirstPage, LastPage, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { hasPermission } from "../../../hasPermission";
import PermissionDenied from "../PermissionDenied";

const Subscriptioninvoices = () => {

    // AuthTokens

    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    const mode = JSON.parse(localStorage.getItem('mode'));
    let tokenStr = String(authTokens.access);
    const theme = useTheme();
    // Navigate

    const navigate = useNavigate();

    // Function to toggle the modal state

    const [modal, setModal] = useState({ add: false, view: false, edit: false, delete: false });

    const toggleModal = (type) => {
        setModal((prev) => ({ ...prev, [type]: !prev[type] }));
        setAnchorEl(null)
    };

    // Menu Toggle

    const [anchorEl, setAnchorEl] = useState(null)

    const handleMenuClick = (event, id) => {
        setAnchorEl(event.currentTarget)
        setSelectedId(id)
    }

    // Get Subscription

    const [Subscription, setSubscription] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [onsearchText, setonsearchText] = useState("")
    const [selectedId, setSelectedId] = useState(null)

    const fetchPurchasedSubscription = () => {
        setLoading(true);
        axios
            .get(`${url}/auth/subscription-invoices/?search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
            })
            .then((res) => {
                setSubscription(res.data.results);
                setNextPageUrl(res.data.next);
                setPrevPageUrl(res.data.previous);
                setTotalPages(Math.ceil(res.data.count / rowsPerPage));
                setLoading(false);
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
                            .get(`${url}/auth/subscription-invoices/?search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                                headers: {
                                    Authorization: `Bearer ${res.data.access}`,
                                },
                            })
                            .then((res) => {
                                setSubscription(res.data.results);
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
        fetchPurchasedSubscription();
    }, [currentPage, rowsPerPage, onsearchText]);


    const handlePageChange = (page) => {
        setCurrentPage(page);
    };


    const resetForm = () => {
        setFormData([]);
        setEditData([]);
        setDeleteData([]);
        setselectedFile("");
        setPreview(null);
        setAnchorEl(null)
    };


    // File Upload

    const [selectedFile, setselectedFile] = useState("");
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setselectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setPreview(imageUrl);
        }
    };


    // Add Subscription

    const [formData, setFormData] = useState([])

    const handleSubmit = async (event) => {

        event.preventDefault();

        let submitData = {
            plan_name: formData.planname,
            plan_type: formData.plantype,
            days: formData.days,
            price: formData.price,
            description: formData.description,
            start_date: formData.startdate,
            end_date: formData.enddate,
        }

        try {
            const response = await axios.post(`${url}/auth/subscriptions/subscribe/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toast.success("Subscription Added Successfully", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });

            toggleModal('add')
            resetForm()
            fetchPurchasedSubscription()
        } catch (error) {
            toast.error(`${error.response.data.error}`, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
        }
    };

    //  View Subscription

    const [viewData, setViewData] = useState([])

    const fetchPurchasedSubscriptionId = (id) => {
        axios
            .get(`${url}/auth/subscriptions/subscribe/?subscription_id=${id}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {

                setViewData(res.data);
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
                        .get(`${url}/auth/subscriptions/subscribe/?subscription_id=${id}`, { headers: new_headers })
                        .then((res) => {

                            setViewData(res.data);
                        });
                });
            });
    };


    //  Edit Subscription

    const [editData, setEditData] = useState([])


    const handleEdit = async (event) => {

        event.preventDefault();

        let submitData = {
            plan_name: editData.plan_name,
            plan_type: editData.plan_type,
            days: editData.days,
            price: editData.price,
            description: editData.description,
            start_date: editData.start_date,
            end_date: editData.end_date,
        }

        try {
            const response = await axios.put(`${url}/auth/subscriptions/subscribe/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toast.success("Subscription Edited Successfully", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
            toggleModal('edit');
            resetForm()
            fetchPurchasedSubscription()
        } catch (error) {
            toast.error(`${error.response.data.error}`, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
        }
    };


    // Delete Subscription

    const [deleteData, setDeleteData] = useState([])

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`${url}/subscriptions/subscribe/${selectedId}/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toast.success("Subscription Deleted Successfully", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
            toggleModal('delete')
            if (Subscription.length === 1 && currentPage > 0) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchPurchasedSubscription();
            }
        } catch (error) {
            toast.error(`${error.response.data.error}`, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
        }
    };

    const hasAccess = hasPermission("View_Service_Main");

    if (!hasAccess) {
        return <PermissionDenied />;
    }

    return (
        <PageContainer title="Purchased Subscriptions" description="Purchased Subscriptions"  >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: "25px" }}>
                Purchased Subscriptions
            </Typography>
            <DashboardCard>
                <Grid container>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                p: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: `1px solid ${theme.palette.divider}`, // only here
                            }}
                        >
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: "#364a63" }}>

                            </Typography>
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                <TextField
                                    placeholder="Search by Name"
                                    size="small"
                                    value={onsearchText}
                                    onChange={(e) => { setonsearchText(e.target.value), setCurrentPage(0) }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconSearch fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 1 },
                                    }}
                                />
                                {/* <Button
                                    variant="contained"
                                    startIcon={<IconPlus />}
                                    onClick={() => toggleModal("add")}
                                    sx={{ bgcolor: "#519380", "&:hover": { bgcolor: "#7DAA8D" }, borderRadius: 1, boxShadow: "none" }}
                                >
                                    Add
                                </Button> */}
                            </Box>
                        </Box>

                        <TableContainer sx={{ minHeight: '700px' }}>
                            <Table
                                size="medium"
                                sx={{
                                    minWidth: { xs: 650, sm: 750 },
                                    borderCollapse: 'collapse',
                                    '& thead th': {
                                        backgroundColor: '#f5f5f5',
                                        border: '1',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                    },
                                    '& td': {
                                        fontSize: '13px',
                                        fontWeight: 500,
                                    },
                                }}
                            >
<TableHead>
  <TableRow>
    <TableCell align="center">SN</TableCell>
    <TableCell align="center">Plan</TableCell>
    <TableCell align="center">Plan Type</TableCell>
    {/* <TableCell align="center">Invoice ID</TableCell> */}
    <TableCell align="center">Amount Due ($)</TableCell>
    <TableCell align="center">Start Date</TableCell>
    <TableCell align="center">End Date</TableCell>
    <TableCell align="center">Vendor</TableCell>
    <TableCell align="center">Status</TableCell>
    <TableCell align="right">Actions</TableCell>
  </TableRow>
</TableHead>


                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center">
                                                <Box
                                                    display="flex"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    sx={{ height: '540px', fontWeight: 'bolder', fontSize: '15px' }}
                                                >
                                                    <CircularProgress className="me-2" color="primary" size={25} /> Loading Details
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : Subscription && Subscription.length > 0 ? (
                                        Subscription.map((item, index) => (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                                key={item.id}
                                                sx={{
                                                    '& td, & th': {
                                                        borderBottom: mode == 0 ? '1px solid #e0e0e0' : '1px solid rgb(85, 83, 83)',
                                                    },
                                                    backgroundColor:
                                                        mode === 0 ? (index % 2 ? '#f9f9f9' : 'white') : index % 2 ? '#2a2a2a' : '#1e1e1e',
                                                }}
                                            >
                                                <TableCell align="center">{currentPage * rowsPerPage + index + 1}</TableCell>
                                                <TableCell align="center">{item.plan || 'N/A'}</TableCell>
                                                <TableCell align="center">Subscription</TableCell>
                                                {/* <TableCell align="center">{item.stripe_invoice_id || 'N/A'}</TableCell> */}
                                                <TableCell align="center">${item.amount_due || '0.00'}</TableCell>
                                                <TableCell align="center">
                                                    {item.created_at
                                                        ? new Date(item.created_at).toLocaleDateString('en-GB')
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell align="center">N/A</TableCell>
                                                <TableCell align="center">{item.vendor || 'N/A'}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={item.status === 'succeeded' ? 'Active' : 'Inactive'}
                                                        style={{
                                                            backgroundColor: item.status === 'succeeded' ? 'green' : 'red',
                                                            color: '#fff',
                                                            fontSize: '0.75rem',
                                                            height: '24px',
                                                            padding: '0 8px',
                                                            borderRadius: '16px',
                                                            textTransform: 'capitalize',
                                                            fontWeight: 700,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuClick(e, item.id)}
                                                        sx={{
                                                            color: 'text.secondary',
                                                            '&:hover': {
                                                                color: 'text.primary',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                            },
                                                        }}
                                                    >
                                                        <IconDots fontSize="small" />
                                                    </IconButton>
                                                    {selectedId === item.id && (
                                                        <Menu
                                                            anchorEl={anchorEl}
                                                            open={Boolean(anchorEl)}
                                                            onClose={() => setSelectedId(null)}
                                                            anchorOrigin={{
                                                                vertical: 'bottom',
                                                                horizontal: 'right',
                                                            }}
                                                            transformOrigin={{
                                                                vertical: 'top',
                                                                horizontal: 'right',
                                                            }}
                                                            PaperProps={{ sx: { px: 1 } }}
                                                        >
                                                            <MenuItem
                                                                sx={{ py: 1.7, px: 2 }}
                                                                onClick={() => {
                                                                    fetchPurchasedSubscriptionId(item.id);
                                                                    toggleModal('view');
                                                                }}
                                                            >
                                                                <IconEye fontSize="small" className="me-2" /> View
                                                            </MenuItem>
                                                        </Menu>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 10 }}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    No Data to Display
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>

                            </Table>
                        </TableContainer>


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
                                <IconButton onClick={() => handlePageChange(1)} aria-label="first page">
                                    <FirstPage />
                                </IconButton>
                            )}

                            {prevPageUrl && (
                                <IconButton
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    aria-label="previous page"
                                >
                                    <ChevronLeft />
                                </IconButton>
                            )}

                            <Typography
                                variant="body2"
                                sx={{
                                    minWidth: 30,
                                    textAlign: "center",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    padding: "8px",
                                    px: 1,
                                    color: theme.palette.text.primary,
                                }}
                            >
                                {currentPage + 1}
                            </Typography>

                            {nextPageUrl && (
                                <IconButton
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    aria-label="next page"
                                >
                                    <ChevronRight />
                                </IconButton>
                            )}

                            {currentPage !== totalPages - 1 && (
                                <IconButton
                                    onClick={() => handlePageChange(totalPages - 1)}
                                    aria-label="last page"
                                >
                                    <LastPage />
                                </IconButton>
                            )}
                        </Box>
                        {/* <Box sx={{ flexShrink: 0, ml: 2.5, mt: 3, display: "flex", alignItems: "center", gap: 1 }}>

                            {currentPage > 1 && (
                                <IconButton onClick={() => handlePageChange(1)} aria-label="first page">
                                    <Typography variant="paginationLabel" >First</Typography>
                                </IconButton>
                            )}

                            {prevPageUrl && (
                                <IconButton onClick={() => handlePageChange(currentPage - 1)} aria-label="previous page">
                                    <Typography variant="paginationLabel" >Prev</Typography>
                                </IconButton>
                            )}

                            <Typography
                                variant="paginationLabel"
                                sx={{ minWidth: 60, textAlign: "center", color: "black", fontWeight: "500", fontSize: "13px" }}>
                                {currentPage + 1}
                            </Typography>

                            {nextPageUrl && (
                                <IconButton onClick={() => handlePageChange(currentPage + 1)} aria-label="next page">
                                    <Typography variant="paginationLabel" >Next</Typography>
                                </IconButton>
                            )}

                            {currentPage !== totalPages - 1 && (
                                <IconButton onClick={() => handlePageChange(totalPages - 1)} aria-label="last page">
                                    <Typography variant="paginationLabel" >Last</Typography>
                                </IconButton>
                            )}
                        </Box> */}
                    </Grid>
                </Grid>
            </DashboardCard>

            {/* Add Modal */}

            <Dialog
                open={modal.add}
                onClose={() => toggleModal("add")}
                maxWidth="xl"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 0,
                        backdropFilter: 'blur(8px)',
                        boxShadow: 24
                    }
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(4px)',
                        bgcolor: alpha(theme.palette.background.default, 0.8)
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary, }}>
                    Setup Subscription
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            {/* <Grid item xs={12} md={12}>
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <Avatar
                                        src={preview ? preview : ""}
                                        alt=""
                                        sx={{ width: 100, height: 100, margin: "0 auto" }}
                                    />
                                </Box>
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <input
                                        accept="image/*"
                                        id="file-upload"
                                        type="file"
                                        style={{ display: "none" }}
                                        onChange={(e) => { handleFileChange(e) }}
                                    />
                                    <label htmlFor="file-upload">
                                        <Button variant="contained" component="span">
                                            Choose File
                                        </Button>
                                    </label>
                                </Box>
                            </Grid> */}
                            <Grid item xs={6} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="name"
                                    label="Plan Name"
                                    type="text"
                                    placeholder="Enter Plan Name"
                                    onChange={(e) => { setFormData({ ...formData, planname: e.target.value }) }}
                                    sx={{ mt: 5 }}
                                />
                            </Grid>

                            <Grid item xs={3} md={3}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.plantype === 'monthly'}
                                            onChange={(e) => { setFormData({ ...formData, plantype: e.target.checked ? 'monthly' : '' }); }}
                                        />
                                    }
                                    label="Monthly"
                                    sx={{ mt: 5 }}
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.plantype === 'yearly'}
                                            onChange={(e) => { setFormData({ ...formData, plantype: e.target.checked ? 'yearly' : '' }) }}
                                        />
                                    }
                                    label="Yearly"
                                    sx={{ mt: 5 }}
                                />
                            </Grid>

                            {formData.plantype === 'monthly' && <>
                                <Grid item xs={3} md={3}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="days"
                                        label="No of Days"
                                        type="number"
                                        placeholder="Enter No of Days"
                                        onChange={(e) => { setFormData({ ...formData, days: e.target.value }) }}
                                        sx={{ mt: 5 }}
                                    />
                                </Grid>
                            </>}

                            <Grid item xs={12} md={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Description"
                                    onChange={(e) => { setFormData({ ...formData, description: e.target.value }) }}
                                />
                            </Grid>
                            <Grid item xs={6} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="price"
                                    label="Price"
                                    type="number"
                                    placeholder="Enter Price"
                                    onChange={(e) => { setFormData({ ...formData, price: e.target.value }) }}
                                    sx={{ mt: 5 }}
                                />
                            </Grid>
                            <Grid item xs={6} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="date"
                                    label="Start Date"
                                    type="date"
                                    onChange={(e) => { setFormData({ ...formData, startdate: e.target.value }) }}
                                    sx={{ mt: 5 }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="date"
                                    label="End Date"
                                    type="date"
                                    onChange={(e) => { setFormData({ ...formData, enddate: e.target.value }) }}
                                    sx={{ mt: 5 }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                        <Button
                            onClick={() => toggleModal("add")}
                            variant="outlined"
                            sx={{
                                borderColor: "#e5e9f2",
                                color: "#364a63",
                                "&:hover": { borderColor: "#6e82a5", backgroundColor: "#f5f6fa" },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ bgcolor: "#519380", "&:hover": { bgcolor: "#7DAA8D" } }}>
                            Submit
                        </Button>

                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit Modal */}

            <Dialog
                open={modal.edit}
                onClose={() => toggleModal("edit")}
                maxWidth="xl"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 0,
                        backdropFilter: 'blur(8px)',
                        boxShadow: 24
                    }
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(4px)',
                        bgcolor: alpha(theme.palette.background.default, 0.8)
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary, }}>
                    Edit Subscription
                </DialogTitle>
                <form onSubmit={handleEdit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            {/* <Grid item xs={12} md={12}>
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <Avatar
                                        src={preview ? preview : editData.image}
                                        alt=""
                                        sx={{ width: 100, height: 100, margin: "0 auto" }}
                                    />
                                </Box>
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <input
                                        accept="image/*"
                                        id="file-upload"
                                        type="file"
                                        style={{ display: "none" }}
                                        onChange={(e) => { handleFileChange(e) }}
                                    />
                                    <label htmlFor="file-upload">
                                        <Button variant="contained" component="span">
                                            Choose File
                                        </Button>
                                    </label>
                                </Box>
                            </Grid> */}
                            <Grid item xs={6} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="name"
                                    label="Plan Name"
                                    type="text"
                                    placeholder="Enter Plan Name"
                                    defaultValue={editData.plan_name}
                                    onChange={(e) => { setEditData({ ...editData, planname: e.target.value }) }}
                                    sx={{ mt: 5 }}
                                />
                            </Grid>
                            <Grid item xs={3} md={3}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={editData.plan_type === 'monthly'}
                                            onChange={(e) => { setEditData({ ...editData, plan_type: e.target.checked ? 'monthly' : '' }) }}
                                        />
                                    }
                                    label="Monthly"
                                    sx={{ mt: 5 }}
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={editData.plan_type === 'yearly'}
                                            onChange={(e) => { setEditData({ ...editData, plan_type: e.target.checked ? 'yearly' : '' }) }}
                                        />
                                    }
                                    label="Yearly"
                                    sx={{ mt: 5 }}
                                />
                            </Grid>

                            {editData.plan_type === 'monthly' && <>
                                <Grid item xs={3} md={3}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="days"
                                        label="No of Days"
                                        type="number"
                                        placeholder="Enter No of Days"
                                        onChange={(e) => { setEditData({ ...editData, days: e.target.value }) }}
                                        sx={{ mt: 5 }}
                                    />
                                </Grid>
                            </>}

                            <Grid item xs={12} md={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Description"
                                    defaultValue={editData.description}
                                    onChange={(e) => { setEditData({ ...editData, description: e.target.value }) }}
                                />
                            </Grid>
                            <Grid item xs={6} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="price"
                                    label="Price"
                                    type="number"
                                    placeholder="Enter Price"
                                    defaultValue={editData.price}
                                    onChange={(e) => { setEditData({ ...editData, price: e.target.value }) }}
                                    sx={{ mt: 5 }}
                                />
                            </Grid>
                            <Grid item xs={6} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="date"
                                    label="Start Date"
                                    type="date"
                                    defaultValue={editData.start_date ? editData.start_date.slice(0, 10) : ''}
                                    onChange={(e) => { setEditData({ ...editData, start_date: e.target.value }) }}
                                    sx={{ mt: 5 }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="date"
                                    label="End Date"
                                    type="date"
                                    defaultValue={editData.end_date ? editData.end_date.slice(0, 10) : ''}
                                    onChange={(e) => { setEditData({ ...editData, end_date: e.target.value }) }}
                                    sx={{ mt: 5 }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                        <Button
                            onClick={() => toggleModal("edit")}
                            variant="outlined"
                            sx={{
                                borderColor: "#e5e9f2",
                                color: "#364a63",
                                "&:hover": { borderColor: "#6e82a5", backgroundColor: "#f5f6fa" },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ bgcolor: "#519380", "&:hover": { bgcolor: "#7DAA8D" } }}>
                            Submit
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* View Modal */}

            <Dialog
                open={modal.view}
                onClose={() => toggleModal('view')}
                maxWidth="md"
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
                <DialogTitle
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 4,
                        py: 3,
                        fontSize: '1.5rem',
                    }}
                >
                    Purchased Plan Information
                </DialogTitle>

                <DialogContent
                    sx={{
                        p: { xs: 2, sm: 4, md: 6 },
                        backgroundColor: 'background.default',
                    }}
                >
                    <Grid container spacing={4} mt={1}>

                        {/* Left Column */}

                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    boxShadow: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                <Typography variant="subtitle2" color="text.secondary">Plan Name</Typography>
                                <Typography>{viewData?.plan_name || 'N/A'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary">Plan Type</Typography>
                                <Typography>{viewData?.plan_type || 'N/A'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                <Typography>{viewData?.description || 'N/A'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                                <Typography>
                                    {viewData?.price !== undefined ? viewData.price : 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Right Column */}

                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    boxShadow: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                                <Typography>
                                    {viewData?.start_date
                                        ? new Date(viewData.start_date).toLocaleDateString('en-GB')
                                        : 'N/A'}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                                <Typography>
                                    {viewData?.end_date
                                        ? new Date(viewData.end_date).toLocaleDateString('en-GB')
                                        : 'N/A'}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary">Is Active</Typography>
                                <Typography>{viewData?.is_active ? 'Yes' : 'No'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary">Vendor</Typography>
                                <Typography>{viewData?.vendor || 'N/A'}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>


            {/* Delete Modal */}

            <Dialog
                open={modal.delete}
                onClose={() => toggleModal("delete")}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 0,
                        backdropFilter: 'blur(8px)',
                        boxShadow: 24
                    }
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(4px)',
                        bgcolor: alpha(theme.palette.background.default, 0.8)
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: theme.palette.text.primary, }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Delete Subscription
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, p: 2, borderRadius: 1, mt: 2, color: theme.palette.text.primary, }}>
                        <IconAlertCircleFilled size={50} style={{ color: "red" }} />
                        <Typography variant="h6" sx={{ textAlign: "center", color: theme.palette.text.primary }}>
                            Are you sure you want to Delete the Subscription:{" "}
                            <Box component="span" sx={{ color: "red", fontWeight: 600 }}>
                                {deleteData.plan_name}&nbsp;
                            </Box>
                            ?
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                    <Button
                        onClick={() => toggleModal("delete")}
                        variant="outlined"
                        sx={{ borderColor: "#e5e9f2", color: "#ffff", bgcolor: "#3f7b69", "&:hover": { borderColor: "#6e82a5", bgcolor: "#369e7f" } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDelete()}
                        variant="contained"
                        sx={{ bgcolor: "#c33b3b", "&:hover": { bgcolor: "#ff0707" } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer >
    );
};

export default Subscriptioninvoices;
