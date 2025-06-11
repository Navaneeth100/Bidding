import { useEffect, useState, useCallback } from "react"

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Avatar, Typography, TextField, InputAdornment, Button, IconButton, Grid, Menu, MenuItem, Chip, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TablePagination, Divider, CircularProgress, useTheme, Modal, alpha } from "@mui/material"
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconEye, IconPencil, IconTrash, IconDots, IconSearch, IconPlus, IconAlertCircleFilled, IconCheck, IconX, IconBan, IconUserCheck } from '@tabler/icons-react';
import axios from "axios";
import { imgurl, url } from "../../../mainurl";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FirstPage, LastPage, ChevronLeft, ChevronRight } from "@mui/icons-material";
import Swal from "sweetalert2";

const OngoingOrder = () => {

    // AuthTokens

    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    const mode = JSON.parse(localStorage.getItem('mode'));
    let tokenStr = String(authTokens.access);
    const inputHeight = '56px'; // or your desired height
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

    // Get  Service Sub Category

    const [Vendor, setVendor] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [onsearchText, setonsearchText] = useState("")
    const [selectedId, setSelectedId] = useState(null)

    const fetchSubVendor = () => {
        setLoading(true);
        axios
            .get(`${url}/proposal/orders/?status_search=ongoing&search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
            })
            .then((res) => {
                setVendor(res.data.results);
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
                            .get(`${url}/proposal/orders/?status_search=ongoing&search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                                headers: {
                                    Authorization: `Bearer ${res.data.access}`,
                                },
                            })
                            .then((res) => {
                                setVendor(res.data.results);
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
        fetchSubVendor();
    }, [currentPage, rowsPerPage, onsearchText]);


    const handlePageChange = (page) => {
        setCurrentPage(page);
    };


    const resetForm = () => {
        setFormData([]);
        setEditData([]);
        setDeleteData([]);
        setAnchorEl(null)
    };

    // get  category

    const MenuProps = { PaperProps: { style: { maxHeight: 200, overflowY: 'auto' } } };
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [categoryList, setcategoryList] = useState([])
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState(null);
    const [categoryId, setCategoryId] = useState('');
const images = category?.proposal?.related_post?.images || [];
const [selectedImg, setSelectedImg] = useState(0);
    const fetchCategoryById = useCallback(
        async (id) => {
            try {
                const { data } = await axios.get(
                    `${url}/proposal/orders/${id}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${tokenStr}`,
                            'Content-Type': 'application/json',
                        },
                        withCredentials: false,
                    }
                );
                setCategory(data);
            } catch (error) {
                handleAxiosError(error);
            }
        },
        [url, tokenStr] // re-create only if url or tokenStr change
    );

    const handleAxiosError = (error) => {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const { status, data } = error.response;
                const msg =
                    data?.detail ||
                    data?.message ||
                    'An unexpected error occurred';
                toast.error(`Error ${status}: ${msg}`);
            } else if (error.request) {
                toast.error(
                    'No response from server. Please check your connection.'
                );
            } else {
                toast.error('Request setup error: ' + error.message);
            }
        } else {
            toast.error('An unexpected non-Axios error occurred.');
        }
    };

    const handleFetch = () => {
        if (categoryId) {
            fetchCategoryById(categoryId);
        }
    };

    // Add Service Sub Category

    const [formData, setFormData] = useState([])

    const handleSubmit = async (event) => {

        event.preventDefault();

        let submitData = {
            name: formData.sub_category,
            parent: formData.category_id
        }

        try {
            const response = await axios.post(`${url}/auth/service-categories/?data=sub`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: false,
            });
            toast.success("Service Sub Category Added Successfully", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });

            toggleModal('add')
            resetForm()
            fetchSubVendor()
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

    //  Edit Service Sub Category

    const [editData, setEditData] = useState([])


    const handleEdit = async (event) => {

        event.preventDefault();

        let submitData = {
            name: editData.sub_category || editData.name,
            parent: editData.category_id || editData?.parent?.id
        };

        try {
            const response = await axios.put(`${url}/auth/service-categories/${selectedId}/?data=sub`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: false,
            });
            toast.success("Service Category Edited Successfully", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
            toggleModal('edit');
            resetForm()
            fetchSubVendor()
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


    // Delete Service Sub Category

    const [deleteData, setDeleteData] = useState([])

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`${url}/auth/service-categories/${selectedId}/?data=sub`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toast.success("Service Category Deleted Successfully", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
            toggleModal('delete')
            if (Vendor.length === 1 && currentPage > 0) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchSubVendor();
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
                    data: "Vendor",
                    action: action
                };

                const response = await axios.post(`${url}/auth/block-unblock-user/`, submittedData, { headers });
                toast.success(response.data.message || `User ${action}ed successfully`);
                fetchSubVendor()

            } catch (error) {
                const errorMessage = error?.response?.data?.error;
                toast.error(errorMessage);
            }
        }
    };

    return (
        <PageContainer title="Vendor List" description="Vendor List">
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: "25px" }}>
                Ongoing List            </Typography>
            <DashboardCard>
                <Grid container spacing={3}>
                    <Grid item sm={12} lg={12}>
                        <Box
                            sx={{
                                p: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderBottom: "1px solid #e5e9f2",
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
                            <Table size="medium"
                                sx={{
                                    minWidth: { xs: 650, sm: 750 },
                                    borderCollapse: 'collapse',
                                    '& thead th': {
                                        backgroundColor: '#f5f5f5',
                                        border: "1",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                    },
                                    '& td': {
                                        fontSize: "13px",
                                        fontWeight: 500,
                                    },
                                }}
                            >
                                <TableHead>
                                    <TableRow>

                                        <TableCell align="center">Order ID</TableCell>
                                        <TableCell align="center">Vendor Name</TableCell>
                                        <TableCell align="center">Customer Name</TableCell>
                                        <TableCell align="center">Service</TableCell>
                                        <TableCell align="center">Start Date</TableCell>
                                        <TableCell align="center">Deadline</TableCell>
                                        <TableCell align="center">Amount</TableCell>
                                        <TableCell align="center">Pricing</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={12} align="center">
                                                <Box
                                                    display="flex"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    sx={{ height: "540px", fontWeight: "bolder", fontSize: "15px" }}
                                                >
                                                    <CircularProgress className="me-2" color="primary" size={25} /> Loading Details
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : Vendor && Vendor.length > 0 ? (
                                        Vendor.map((order, index) => (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                                key={order.id}
                                                sx={{
                                                    "& td, & th": { borderBottom: mode == 0 ? "1px solid #e0e0e0" : "1px solid rgb(85, 83, 83)" },
                                                    backgroundColor: mode === 0 ? (index % 2 ? "#f9f9f9" : "white") : (index % 2 ? "#2a2a2a" : "#1e1e1e"),
                                                }}
                                            >
                                                <TableCell align="center">{currentPage * rowsPerPage + index + 1}</TableCell>
                                                {/* <TableCell align="center">{order.id}</TableCell> */}
                                                <TableCell align="center">{order.vendor.first_name} {order.vendor?.last_name} </TableCell>
                                                <TableCell align="center">{order.customer?.first_name} {order.customer?.last_name}</TableCell>
                                                <TableCell align="center">{order.related_post.title}</TableCell>
                                                <TableCell align="center">{new Date(order.start_date).toLocaleDateString()}</TableCell>
                                                <TableCell align="center">{new Date(order.deadline).toLocaleDateString()}</TableCell>
                                                <TableCell align="center">{order.final_amount} {order.related_post.currency}</TableCell>
                                                <TableCell align="center">{order.pricing_method}</TableCell>

                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { handleMenuClick(e, order.id) }}
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
                                                    {selectedId === order.id && (
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
                                                            {/* <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { setEditData(item); fetchCategory(); toggleModal("edit") }}>
                                                                <IconPencil fontSize="small" className="me-2" /> Edit
                                                            </MenuItem> */}
                                                            <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => {
                                                                fetchCategoryById(order.id);
                                                                toggleModal("view");
                                                            }}
                                                            >
                                                                <IconEye fontSize="small" className="me-2" /> View
                                                            </MenuItem>
                                                            {order.is_active && <>
                                                                <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { BlockorUnlock(order.id, `${order.first_name} ${order.last_name}`, "block"), setSelectedId(null) }}>
                                                                    <IconBan fontSize="small" className="me-2" /> Block
                                                                </MenuItem>
                                                            </>}
                                                            {/* {!order.is_active && <>
                                                                <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { BlockorUnlock(order.id, `${order.first_name} ${order.last_name}`, "unblock"), setSelectedId(null) }}>
                                                                    <IconUserCheck fontSize="small" className="me-2" /> Unblock
                                                                </MenuItem>
                                                            </>} */}
                                                            {/* <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { setDeleteData(order); toggleModal("delete") }}>
                                                                <IconTrash fontSize="small" className="me-2" /> Delete
                                                            </MenuItem> */}
                                                        </Menu>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={12} align="center" sx={{ py: 10 }}>
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




            {/* Edit Modal */}

            <Dialog
                open={modal.edit}
                onClose={() => toggleModal("edit")}
                maxWidth="xl"
                PaperProps={{ sx: { width: { xs: "95%", sm: "80%", md: "50%" }, maxHeight: "90vh", borderRadius: 2 } }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary }}>
                    Edit Service Sub Category
                </DialogTitle>
                <form onSubmit={handleEdit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>

                            {/* Category Select */}

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={editData.category_id || editData?.parent?.id}
                                        onChange={(e) => setEditData((prev) => ({ ...prev, category_id: e.target.value }))}
                                        // onOpen={fetchCategory}
                                        label="Category"
                                        MenuProps={MenuProps}
                                    >
                                        {categoryList.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>


                            {/* Sub Category TextField */}

                            <Grid item xs={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="category"
                                    label="Sub Category Name"
                                    type="text"
                                    placeholder="Enter Category Name"
                                    defaultValue={editData.name || ''}
                                    onChange={(e) => { setEditData({ ...editData, sub_category: e.target.value }) }}
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
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    px: 4,
                    py: 3,
                    fontSize: '1.5rem',
                }}>
                    Order Information
                </DialogTitle>
                <DialogContent sx={{
                    p: { xs: 2, sm: 4, md: 6 },
                    backgroundColor: 'background.default',

                }}>
                    <Grid container spacing={4} sx={{

                        marginTop: "20px",
                    }}>
                        {/* SERVICE INFO */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                p: 3, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 2,
                                height: '100%', display: 'flex', flexDirection: 'column', gap: 2
                            }}>
                                <Typography variant="h6">Service Information</Typography>
                                <Typography variant="subtitle2" color="text.secondary" mt={1}>Title</Typography>
                                <Typography>{category?.proposal?.related_post?.title || '—'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary" mt={1}>Category</Typography>
                                <Typography>{category?.proposal?.related_post?.service_category?.name || '—'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary" mt={1}>Subcategories</Typography>
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {category?.proposal?.related_post?.service_subcategories?.length > 0
                                        ? category.proposal.related_post.service_subcategories.map(sc =>
                                            <Chip key={sc.id} label={sc.name} size="small" variant="outlined" />
                                        )
                                        : '—'}
                                </Box>

                                <Typography variant="subtitle2" color="text.secondary" mt={1}>Description</Typography>
                                <Typography>{category?.proposal?.related_post?.description || '—'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary" mt={1}>Additional Note</Typography>
                                <Typography>{category?.proposal?.related_post?.additional_note || '—'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary" mt={1}>Cost</Typography>
                                <Typography>
                                    {category?.proposal?.related_post?.base_price
                                        ? `USD ${category.proposal.related_post.base_price}`
                                        : '—'}
                                </Typography>

                                {/* Thumbnails Gallery */}


<Box sx={{ mt: 2 }}>
  <Typography variant="subtitle2" color="text.secondary">
    Images
  </Typography>
  <Grid
    container
    spacing={2}
    mt={1}
    alignItems="flex-start"
  >
    {/* Thumbnails - responsive width */}
    <Grid item xs={12} md={4}>
      <Grid container spacing={1}>
        {images.length > 0 ? images.map((img, i) => (
          <Grid item xs={6} key={img.id}>
            <Box
              component="img"
              src={img.image}
              alt="Service Thumbnail"
              sx={{
                width: '100%',
                height: 80,
                objectFit: 'cover',
                borderRadius: 2,
                border: selectedImg === i ? '2px solid #1976d2' : '1px solid #eee',
                cursor: 'pointer',
                transition: 'border 0.2s',
                boxSizing: 'border-box',
                display: 'block',
              }}
              onClick={() => setSelectedImg(i)}
            />
          </Grid>
        )) : (
          <Grid item xs={12}>
            <Box sx={{
              width: '100%',
              height: 80,
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              color: 'text.disabled',
              fontWeight: 500
            }}>No Image</Box>
          </Grid>
        )}
      </Grid>
    </Grid>

    {/* Main Image Preview */}
    <Grid item xs={12} md={8}>
      <Paper elevation={2} sx={{
        // width: '100%',
        maxWidth: 400,
        minHeight: 200,
        aspectRatio: '1 / 1', // For a square preview
        display: 'flex',
        alignItems: 'center',
         padding:"10px",
        justifyContent: 'center',
        borderRadius: 2,
        mx: 'auto',
      }}>
        {images[selectedImg]
          ? (
            <img
              src={images[selectedImg].image}
              alt="Selected"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
               
                borderRadius: 8,
                display: 'block',
                objectFit: 'contain',
              }}
            />
          ) : (
            <Typography color="text.disabled">No Image </Typography>
          )
        }
      </Paper>
    </Grid>
  </Grid>
</Box>

                            </Box>
                        </Grid>

                        {/* Right Panel: Vendor, Customer, Location, Pricing */}
                        <Grid item xs={12} md={6} container direction="column" spacing={3}>
                            {/* VENDOR */}
                            <Grid item>
                                <Box sx={{
                                    p: 3, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 2,
                                    mb: 2, display: 'flex', flexDirection: 'column', gap: 2
                                }}>
                                    <Typography variant="h6">Vendor Information</Typography>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar src={category?.vendor?.profile_picture} alt="Vendor" sx={{ width: 56, height: 56 }}>
                                            {category?.vendor?.first_name?.[0] || 'V'}
                                        </Avatar>
                                        <Box>
                                            <Typography fontWeight="bold">
                                                {category?.vendor?.first_name} {category?.vendor?.last_name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box sx={{
                                    p: 3, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 2,
                                    mb: 2, display: 'flex', flexDirection: 'column', gap: 2
                                }}>
                                    <Typography variant="h6">Customer Information</Typography>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar src={category?.customer?.profile_picture} alt="Customer" sx={{ width: 56, height: 56 }}>
                                            {category?.customer?.first_name?.[0] || 'C'}
                                        </Avatar>
                                        <Box>
                                            <Typography fontWeight="bold">
                                                {category?.customer?.first_name} {category?.customer?.last_name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                            {/* CUSTOMER */}

                            <Grid item>
                                <Box sx={{
                                    p: 3, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 2,
                                    mb: 2, display: 'flex', flexDirection: 'column', gap: 1
                                }}>
                                    <Typography variant="h6">Location</Typography>
                                    <Typography variant="body2" color="text.secondary">Location Name:</Typography>
                                    <Typography>{category?.proposal?.related_post?.location_name || '—'}</Typography>
                                    <Typography variant="body2" color="text.secondary">Coordinates:</Typography>
                                    <Typography>{category?.proposal?.related_post?.location || '—'}</Typography>
                                </Box>
                            </Grid>
                            {/* PRICING & STATUS */}
                           <Grid item >
  <Box
    sx={{
      p: 4,
      borderRadius: 4,
      bgcolor: 'background.paper',
      boxShadow: 3,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
  
      mx: 'auto',
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontWeight: 700,
        letterSpacing: 1,
        mb: 1,
        color: 'primary.main',
      }}
    >
      Pricing & Status
    </Typography>

    <Divider sx={{ mb: 1 }} />

    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Pricing Method
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {category?.negotiation?.pricing_method || '—'}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Final Amount
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {category?.negotiation?.final_amount ? `USD ${category.negotiation.final_amount}` : '—'}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Negotiation Status
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {category?.negotiation?.status || '—'}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Start
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {category?.negotiation?.start_date?.slice(0, 10) || '—'}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          End
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {category?.negotiation?.end_date?.slice(0, 10) || '—'}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Order Status
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {category?.status || '—'}
        </Typography>
      </Stack>
    </Stack>
  </Box>
</Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={() => toggleModal("view")}>
                        Close
                    </Button>
                </DialogActions>
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
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: theme.palette.text.primary }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Delete Service Category
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, p: 2, borderRadius: 1, mt: 2 }}>
                        <IconAlertCircleFilled size={50} style={{ color: "red" }} />
                        <Typography variant="h6" sx={{ color: theme.palette.text.primary, textAlign: "center" }}>
                            Are you sure you want to Delete the service category:{" "}
                            <Box component="span" sx={{ color: "red", fontWeight: 600 }}>
                                {deleteData.name}&nbsp;
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
            <Modal open={open} onClose={handleClose}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography variant="h6" component="h2">
                        Enter Category ID
                    </Typography>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Category ID"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleFetch}>
                        Fetch
                    </Button>

                    {category && (
                        <Box mt={2}>
                            <Typography variant="body1">Fetched Data:</Typography>
                            <pre>{JSON.stringify(category, null, 2)}</pre>
                        </Box>
                    )}
                </Box>
            </Modal>
        </PageContainer >
    );
};

export default OngoingOrder;
