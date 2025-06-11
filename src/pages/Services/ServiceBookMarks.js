import { useEffect, useState } from "react"
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, List, ListItem, ListItemText, TableRow, Paper, Checkbox, Avatar, Typography, TextField, InputAdornment, Button, IconButton, Grid, Menu, MenuItem, Chip, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TablePagination, Divider, CircularProgress, useTheme, alpha } from "@mui/material"
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconEye, IconPencil, IconTrash, IconDots, IconSearch, IconPlus, IconAlertCircleFilled } from '@tabler/icons-react';
import axios from "axios";
import { url } from '../../../mainurl';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { FirstPage, LastPage, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { format } from 'date-fns';

const ServiceBookMarks = () => {

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

    // Get  Services

    const [serviceList, setserviceList] = useState([]);
    const [SubcategoryList, setSubCategoryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [onsearchText, setonsearchText] = useState("")
    const [selectedId, setSelectedId] = useState(null)

    const fetchServiceBookmark = () => {
        setLoading(true);

        axios.get(`${url}/service/bookmark/`, {
            params: {
                search: onsearchText,
                page: currentPage + 1,
                page_size: rowsPerPage,
            },
            headers: {
                Authorization: `Bearer ${tokenStr}`,
                'Content-Type': 'application/json',
            },
        })
            .then((res) => {
                setserviceList(res.data.results);
                setNextPageUrl(res.data.next);
                setPrevPageUrl(res.data.previous);
                setTotalPages(Math.ceil(res.data.count / rowsPerPage));
                setLoading(false);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.clear();
                    navigate('/auth/login');
                } else {
                    const refresh = String(authTokens.refresh);
                    axios
                        .post(`${url}/api/token/refresh/`, { refresh })
                        .then((res) => {
                            localStorage.setItem('authTokens', JSON.stringify(res.data));
                            const newToken = res.data.access; // grab the refreshed access token
                            axios.get(`${url}/service/bookmark/`, {
                                params: {
                                    search: onsearchText,
                                    page: currentPage + 1,
                                    page_size: rowsPerPage,
                                },
                                headers: {
                                    Authorization: `Bearer ${newToken}`,
                                    'Content-Type': 'application/json',
                                },
                            })
                                .then((res) => {
                                    setSubCategoryList(res.data.results);
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
        fetchServiceBookmark();
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

    const [editData, seteditData] = useState([])
    const [viewData, setViewData] = useState([])
    const [categoryList, setcategoryList] = useState([])
    const [ServiceID, SetServiceID] = useState([]);
    const [openService, setService] = useState(false);

    const fetchServiceIDById = (id) => {

        axios
            .get(`${url}/service/jobpost/${id}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {
                SetServiceID(res.data);
            })
            .catch((error) => {
                let refresh = String(JSON.parse(localStorage.getItem("authTokens")).refresh);
                axios.post(`${url}/api/token/refresh/`, { refresh }).then((res) => {
                    localStorage.setItem("authTokens", JSON.stringify(res.data));
                    const new_headers = {
                        Authorization: `Bearer ${res.data.access}`,
                    };
                    axios
                        .get(`${url}/auth/service/jobpost/?data=list`, { headers: new_headers })
                        .then((res) => {
                            SetServiceID(res.data);
                        });
                });
            });
    };


    const fetchSubServiceCategory = () => {
        setLoading(true);
        axios
            .get(`${url}/auth/service-categories/?data=sub&search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
            })
            .then((res) => {
                setSubCategoryList(res.data.results);
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
                            .get(`${url}/auth/service-categories/?data=sub&search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                                headers: {
                                    Authorization: `Bearer ${res.data.access}`,
                                },
                            })
                            .then((res) => {
                                setSubCategoryList(res.data.results);
                                setNextPageUrl(res.data.next);
                                setPrevPageUrl(res.data.previous);
                                setTotalPages(Math.ceil(res.data.count / rowsPerPage));
                                setLoading(false);
                            });
                    });
                }
            });
    };





    // Add Services

    const [formData, setFormData] = useState({
        title: "",                     // ← Title
        description: "",               // ← Description
        service_category: "",          // ← Category
        service_subcategories: [],     // ← Subcategories
        location_name: "",             // ← Location Name
        location: "",                  // ← Coordinates
        additional_note: "",           // ← Note
        base_price: "",                // ← Base Price
        currency: "",                  // ← Currency
        files: [],                     // ← Uploaded files
    });

    // handler for file input
    const onFileChange = (e) =>
        setFormData(p => ({ ...p, files: Array.from(e.target.files) }));

    // submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        // append simple fields
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("service_category", formData.service_category);
        data.append("location_name", formData.location_name);
        data.append("location", formData.location);
        data.append("additional_note", formData.additional_note);
        data.append("base_price", formData.base_price);
        data.append("currency", formData.currency);

        // append subcategories array
        formData.service_subcategories.forEach(id =>
            data.append("service_subcategories", id)
        );

        // append files
        formData.files.forEach(file =>
            data.append("files[]", file)
        );

        try {
            await axios.post(`${url}/auth/service/services/`, data, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Service Request Submitted Successfully");
            toggleModal("add");
            // reset form
            setFormData({
                title: "",
                description: "",
                service_category: "",
                service_subcategories: [],
                location_name: "",
                location: "",
                additional_note: "",
                base_price: "",
                currency: "",
                files: [],
            });
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to submit service request");
        }
    };
    //  Edit Services

    const [GetData, SetGetData] = useState([])


    const handleEdit = async (event) => {

        event.preventDefault();

        let submitData = {
            name: editData.sub_category || editData.name,
            parent: editData.category_id || editData?.parent?.id
        };

        try {
            const response = await axios.put(`${url}/service/services/${selectedId}/`, submitData, {
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
            fetchSubServiceCategory()
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


    // Delete Services

    const [deleteData, setDeleteData] = useState([])

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`${url}/service/services/${selectedId}/`, {
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
            if (SubcategoryList.length === 1 && currentPage > 0) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchSubServiceCategory();
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

    const [selectedItem, setSelectedItem] = useState(null);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const handleNameClick = (item) => {
        setSelectedItem(item);
        setOpenDetailsModal(true);
    };

    const handleDetailsClose = () => {
        setOpenDetailsModal(false);
        setSelectedItem(null);
    };

    const handleMenusClick = (e, id) => {
        setAnchorEl(e.currentTarget);
        setSelectedId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedId(null);
    };

    const StyledList = styled(List)(({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
        // zero out default padding
        padding: 0,
        // you can even set a maxHeight + scroll if you want:
        // maxHeight: 400,
        // overflow: 'auto',
    }));

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
        <PageContainer title="Service Bookmarks" description="Service Bookmarks">
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: "25px" }}>
                Service Bookmarks
            </Typography>
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
                            <Table
                                size="medium"
                                sx={{
                                    minWidth: { xs: 650, sm: 750 },
                                    borderCollapse: 'collapse',
                                    '& thead th': {
                                        backgroundColor: '#f5f5f5',
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
                                        <TableCell align="center">Icon</TableCell>
                                        <TableCell align="center">Bookmark id</TableCell>
                                        <TableCell align="center">Category</TableCell>
                                        <TableCell align="center">Sub Category</TableCell>
                                        <TableCell align="center">User</TableCell>
                                        <TableCell align="center">Type</TableCell>
                                        <TableCell align="center">Created At</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
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
                                    ) : serviceList && serviceList.length > 0 ? (
                                        serviceList.map((item, index) => (
                                            <TableRow
                                                key={item.id}
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                                sx={{
                                                    '& td, & th': {
                                                        borderBottom:
                                                            mode === 0
                                                                ? '1px solid #e0e0e0'
                                                                : '1px solid rgb(85,83,83)',
                                                    },
                                                    backgroundColor:
                                                        mode === 0
                                                            ? index % 2
                                                                ? '#f9f9f9'
                                                                : 'white'
                                                            : index % 2
                                                                ? '#2a2a2a'
                                                                : '#1e1e1e',
                                                }}
                                            >
                                                <TableCell align="center">
                                                    {currentPage * rowsPerPage + index + 1}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Avatar src={item.bookmark && item?.bookmark?.images.length > 0 ? item?.bookmark?.images[0]?.image : null} alt="icon" sx={{ width: 50, height: 50, m: "auto", borderRadius: 2, boxShadow: 1, bgcolor: "#fafafa" }} />
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    onClick={() => { setViewData(item); toggleModal("view") }}
                                                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                                                >
                                                    {item?.bookmark?.id}
                                                </TableCell>
                                                <TableCell align="center">{item.bookmark?.service_category?.name}</TableCell>
                                                <TableCell align="center">{item.bookmark?.service_subcategories?.name}</TableCell>
                                                <TableCell align="center">{item.user}</TableCell>
                                                <TableCell align="center">{item.type}</TableCell>
                                                <TableCell align="center">{new Date(item.created_at).toLocaleString()}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenusClick(e, item.id)}
                                                        sx={{
                                                            color: 'text.secondary',
                                                            '&:hover': {
                                                                color: 'text.primary',
                                                                backgroundColor: 'rgba(255,255,255,0.08)',
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
                                                            PaperProps={{ sx: { px: 1, } }}
                                                        >
                                                            <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { setViewData(item); toggleModal("view") }}>
                                                                <IconEye fontSize="small" className="me-2" /> View
                                                            </MenuItem>
                                                            <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { setDeleteData(item); toggleModal("delete") }}>
                                                                <IconTrash fontSize="small" className="me-2" /> Delete
                                                            </MenuItem>
                                                        </Menu>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
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
                PaperProps={{ sx: { width: { xs: "95%", sm: "80%", md: "50%" }, maxHeight: "90vh", borderRadius: 2 } }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary, }}>
                    Setup Services
                </DialogTitle>



                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>

                            {/* Title */}
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Title"
                                    value={formData.title}                                  // ← reading title state
                                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}  // ← updating title
                                />
                            </Grid>

                            {/* Description */}
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Description"
                                    value={formData.description}                            // ← reading description
                                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} // ← updating description
                                />
                            </Grid>

                            {/* Service Category */}
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Service Category</InputLabel>
                                    <Select
                                        required
                                        label="Service Category"
                                        value={formData.service_category}                      // ← reading category
                                        onChange={e => setFormData(p => ({
                                            ...p,
                                            service_category: e.target.value,                   // ← updating category
                                            service_subcategories: [],                          // reset subs
                                        }))}
                                    >
                                        {categoryList.map(cat => (
                                            <MenuItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Service Subcategories */}
                            <Grid item xs={6}>
                                <FormControl fullWidth disabled={!formData.service_category}>
                                    <InputLabel>Subcategories</InputLabel>
                                    <Select
                                        multiple
                                        label="Subcategories"
                                        value={formData.service_subcategories}                 // ← reading subcategories
                                        onChange={e => setFormData(p => ({
                                            ...p,
                                            service_subcategories: e.target.value,             // ← updating subcategories
                                        }))}
                                    >
                                        {SubcategoryList.map(sub => (
                                            <MenuItem key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Location Name */}
                            <Grid item xs={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Location Name"
                                    value={formData.location_name}                         // ← reading location_name
                                    onChange={e => setFormData(p => ({ ...p, location_name: e.target.value }))} // ← updating
                                />
                            </Grid>

                            {/* Coordinates */}
                            <Grid item xs={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Coordinates (lat,lng)"
                                    placeholder="24.7136,46.6753"
                                    value={formData.location}                              // ← reading location
                                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} // ← updating
                                />
                            </Grid>

                            {/* Additional Note */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Additional Note"
                                    value={formData.additional_note}                       // ← reading additional_note
                                    onChange={e => setFormData(p => ({ ...p, additional_note: e.target.value }))} // ← updating
                                />
                            </Grid>

                            {/* Base Price */}
                            <Grid item xs={6}>
                                <TextField
                                    required
                                    fullWidth
                                    type="number"
                                    label="Base Price"
                                    value={formData.base_price}                            // ← reading base_price
                                    onChange={e => setFormData(p => ({
                                        ...p,
                                        base_price: parseFloat(e.target.value) || "",
                                    }))}                                                   // ← updating base_price
                                />
                            </Grid>

                            {/* Currency */}
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Currency</InputLabel>
                                    <Select
                                        required
                                        label="Currency"
                                        value={formData.currency}                             // ← reading currency
                                        onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))} // ← updating currency
                                    >
                                        {/* {currencyList.map(cur => (
                  <MenuItem key={cur} value={cur}>
                    {cur}
                  </MenuItem>
                ))} */}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* File Upload */}
                            <Grid item xs={12}>
                                <Button variant="outlined" component="label">
                                    Upload Files
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        accept="image/*"
                                        onChange={onFileChange}                           // ← handling files into state
                                    />
                                </Button>
                            </Grid>

                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                        <Button onClick={() => toggleModal("add")} variant="outlined">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained">
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
                PaperProps={{ sx: { width: { xs: "95%", sm: "80%", md: "50%" }, maxHeight: "90vh", borderRadius: 2 } }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary }}>
                    Edit Services
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
                                            <MenuItem key={item.id} value={item.id}>{item?.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>


                            {/*s TextField */}

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
                open={modal.view}
                onClose={() => toggleModal("view")}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Service Bookmarks</DialogTitle>
                <DialogContent sx={{ p: 3, mt: 2 }}>
                    <Grid container spacing={4} sx={{ marginTop: "20px" }}>
                        {/* Left Column */}
                        <Grid item xs={12} md={4}>
                            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                <Avatar
                                    src={viewData.bookmark?.images?.[0]?.image}
                                    alt="Profile"
                                    sx={{ width: 120, height: 120 }}
                                />
                                <Typography variant="h6">
                                    {viewData.bookmark?.user?.first_name} {viewData.bookmark?.user?.last_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {viewData.bookmark?.user?.email}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 4 }} />

                            <Box mb={2}>
                                <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                                <Box sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.default'
                                }}>
                                    <Typography variant="body2">{viewData.bookmark?.phone_number || '—'}</Typography>
                                </Box>
                            </Box>

                            <Box mb={2}>
                                <Typography variant="caption" color="text.secondary">Location</Typography>
                                <Box sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.default'
                                }}>
                                    <Typography variant="body2">{viewData.bookmark?.location_name || '—'}</Typography>
                                </Box>
                            </Box>

                            <Box mb={2}>
                                <Typography variant="caption" color="text.secondary">Coordinates</Typography>
                                <Box sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.default'
                                }}>
                                    <Typography variant="body2">{viewData.bookmark?.location || '—'}</Typography>
                                </Box>
                            </Box>

                            <Box mb={2}>
                                <Typography variant="caption" color="text.secondary">Created At</Typography>
                                <Box sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.default'
                                }}>
                                    <Typography variant="body2">
                                        {new Date(viewData.bookmark?.created_at).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Right Column */}
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box mb={2}>
                                        <Typography variant="caption" color="text.secondary">Title</Typography>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.default'
                                        }}>
                                            <Typography variant="body2">{viewData.bookmark?.title || '—'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box mb={2}>
                                        <Typography variant="caption" color="text.secondary">Category</Typography>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.default'
                                        }}>
                                            <Typography variant="body2">{viewData.bookmark?.service_category?.name || '—'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box mb={2}>
                                        <Typography variant="caption" color="text.secondary">Description</Typography>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.default'
                                        }}>
                                            <Typography variant="body2">{viewData.bookmark?.description || '—'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box mb={2}>
                                        <Typography variant="caption" color="text.secondary">Payment Type</Typography>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.default'
                                        }}>
                                            <Typography variant="body2">{viewData.bookmark?.payment_type || '—'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                {viewData.bookmark?.base_price && (
                                    <Grid item xs={6}>
                                        <Box mb={2}>
                                            <Typography variant="caption" color="text.secondary">Fixed Amount</Typography>
                                            <Box sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: 'background.default'
                                            }}>
                                                <Typography variant="body2">
                                                    {`${viewData.bookmark?.currency || ''} ${viewData.bookmark?.base_price}`}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Box mb={2}>
                                        <Typography variant="caption" color="text.secondary">Additional Note</Typography>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.default'
                                        }}>
                                            <Typography variant="body2">{viewData.bookmark?.additional_note || '—'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Subcategories */}
                            {viewData.bookmark?.service_subcategories?.length > 0 && (
                                <Box mt={3}>
                                    <Typography variant="subtitle2" gutterBottom>Subcategories</Typography>
                                    {viewData.bookmark.service_subcategories.map((sc) => (
                                        <Box key={sc.id} mb={1} sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.default'
                                        }}>
                                            <Typography variant="body2">{sc.name}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Milestones */}
                            {viewData.bookmark?.milestones?.length > 0 && (
                                <Box mt={3}>
                                    <Typography variant="subtitle2" gutterBottom>Milestones</Typography>
                                    {viewData.bookmark.milestones.map((m) => (
                                        <Box key={m.id} mb={1} sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.default'
                                        }}>
                                            <Typography variant="body2">
                                                {m.title} – {m.currency} {m.amount} — {m.is_completed ? 'Completed' : 'Pending'}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button variant="contained" size="large" onClick={() => toggleModal("view")}>
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
                        sx={{ borderColor: "#e5e9f2", color: "#ffff",bgcolor: "#3f7b69", "&:hover": { borderColor: "#6e82a5", bgcolor: "#369e7f" } }}
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

export default ServiceBookMarks;
