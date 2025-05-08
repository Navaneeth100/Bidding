import { useEffect, useState } from "react"
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Avatar, Typography, TextField, InputAdornment, Button, IconButton, Grid, Menu, MenuItem, Chip, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TablePagination, Divider, CircularProgress, useTheme, alpha, } from "@mui/material"
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconEye, IconPencil, IconTrash, IconDots, IconSearch, IconPlus, IconAlertCircleFilled } from '@tabler/icons-react';
import axios from "axios";
import { imgurl, url } from "../../../mainurl";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FirstPage, LastPage, ChevronLeft, ChevronRight } from "@mui/icons-material";
const ServiceSubCategory = () => {

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

    const [SubcategoryList, setSubCategoryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [onsearchText, setonsearchText] = useState("")
    const [selectedId, setSelectedId] = useState(null)

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
                            .get(`${url}/auth/service-categories/?data=sub&?search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
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

    useEffect(() => {
        fetchSubServiceCategory();
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

    // get  category

    const MenuProps = { PaperProps: { style: { maxHeight: 200, overflowY: 'auto' } } };

    const [categoryList, setcategoryList] = useState([])

    const fetchCategory = () => {
        axios
            .get(`${url}/auth/service-categories/?data=list`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {

                setcategoryList(res.data);
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
                        .get(`${url}/auth/service-categories/?data=list`, { headers: new_headers })
                        .then((res) => {

                            setcategoryList(res.data);
                        });
                });
            });
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


    // Add Service Sub Category

    const [formData, setFormData] = useState([])

    const handleSubmit = async (event) => {

        event.preventDefault();

        let submitData = {
            name: formData.sub_category,
            parent: formData.category_id,
            image: selectedFile
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

    //  Edit Service Sub Category

    const [editData, setEditData] = useState([])


    const handleEdit = async (event) => {

        event.preventDefault();

        let submitData = {
            name: editData.sub_category || editData.name,
            parent: editData.category_id || editData?.parent?.id,
            image: selectedFile || preview
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


    return (
        <PageContainer title="Service Sub Category" description="Service Sub Category">
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: "25px" }}>
                Service Sub Category
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
                                <Button
                                    variant="contained"
                                    startIcon={<IconPlus />}
                                    onClick={() => toggleModal("add")}
                                    sx={{ bgcolor: "#519380", "&:hover": { bgcolor: "#7DAA8D" }, borderRadius: 1, boxShadow: "none" }}
                                >
                                    Add
                                </Button>
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
                                        <TableCell align="center">
                                            SN
                                        </TableCell>
                                        <TableCell align="center">
                                            Icon
                                        </TableCell>
                                        <TableCell align="center">
                                            Category
                                        </TableCell>
                                        <TableCell align="center">
                                            Sub Category
                                        </TableCell>
                                        <TableCell align="right">
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
                                                    sx={{ height: "540px", fontWeight: "bolder", fontSize: "15px" }}
                                                >
                                                    <CircularProgress className="me-2" color="primary" size={25} /> Loading Details
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : SubcategoryList && SubcategoryList.length > 0 ? (
                                        SubcategoryList.map((item, index) => (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                                key={item.id}
                                                sx={{
                                                    "& td, & th": { borderBottom: mode == 0 ? "1px solid #e0e0e0" : "1px solid rgb(85, 83, 83)" },
                                                    backgroundColor: mode === 0 ? (index % 2 ? "#f9f9f9" : "white") : (index % 2 ? "#2a2a2a" : "#1e1e1e"),
                                                }}
                                            >
                                                <TableCell align="center">
                                                    {currentPage * rowsPerPage + index + 1}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Avatar src={item.image ? `${imgurl}${item.image}` : null} alt="icon" sx={{ width: 50, height: 50, m: "auto", borderRadius: 2, boxShadow: 1, bgcolor: "#fafafa" }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.parent.name}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.name}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { handleMenuClick(e, item.id) }}
                                                        sx={{
                                                            color: 'text.secondary', // or 'text.primary' if you want white
                                                            '&:hover': {
                                                                color: 'text.primary',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.08)', // subtle hover
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
                                                            {/* <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { setViewData(item); toggleModal("view") }}>
                                                                <IconEye fontSize="small" className="me-2" /> View
                                                            </MenuItem> */}
                                                            <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { setEditData(item); fetchCategory(); toggleModal("edit") }}>
                                                                <IconPencil fontSize="small" className="me-2" /> Edit
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
                                            <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
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
                    Setup Service Sub Category
                </DialogTitle>



                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3} alignItems="flex-end">

                            {/* File Upload */}

                            <Grid item xs={12} md={12}>
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
                            </Grid>

                            {/* Category Select */}

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={formData.category_id || ""}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                                        onOpen={fetchCategory}
                                        label="Category"
                                        MenuProps={MenuProps}>
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
                                    value={formData.sub_category || ''}
                                    placeholder="Enter Category Name"
                                    onChange={(e) => { setFormData({ ...formData, sub_category: e.target.value }) }}
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
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary }}>
                    Edit Service Sub Category
                </DialogTitle>
                <form onSubmit={handleEdit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>

                            {/* File Upload */}

                            <Grid item xs={12} md={12}>
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <Avatar
                                        src={preview ? preview : `${imgurl}${editData.image}`}
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
                            </Grid>

                            {/* Category Select */}

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={editData.category_id || editData?.parent?.id}
                                        onChange={(e) => setEditData((prev) => ({ ...prev, category_id: e.target.value }))}
                                        onOpen={fetchCategory}
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
                onClose={() => toggleModal("view")}
                maxWidth="md"
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
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, display: "flex", alignItems: "center", gap: 2, color: theme.palette.text.primary }}>
                </DialogTitle>
                <DialogContent sx={{ p: 3, mt: 2 }}>
                    <Grid container spacing={3}>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2" }}>
                    <Button
                        onClick={() => toggleModal("view")}
                        variant="contained"
                        sx={{ bgcolor: "#7f54fb", "&:hover": { bgcolor: "#6a3ee8" } }}
                    >
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
                        sx={{ borderColor: "#e5e9f2", color: "#364a63", "&:hover": { borderColor: "#6e82a5", bgcolor: "#f5f6fa" } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDelete()}
                        variant="contained"
                        sx={{ bgcolor: "#519380", "&:hover": { bgcolor: "#7DAA8D" } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer >
    );
};

export default ServiceSubCategory;
