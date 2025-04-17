import { useEffect, useState } from "react"
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Avatar, Typography, TextField, InputAdornment, Button, IconButton, Grid, Menu, MenuItem, Chip, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TablePagination, Divider, CircularProgress } from "@mui/material"
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconEye, IconPencil, IconTrash, IconDots, IconSearch, IconPlus, IconAlertCircleFilled } from '@tabler/icons-react';
import axios from "axios";
import { url } from "../../../mainurl";
import { toast } from "react-toastify";


const ServiceCategory = () => {

    // AuthTokens

    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    let tokenStr = String(authTokens.access);


    // Function to toggle the modal state

    const [modal, setModal] = useState({ add: false, view: false, edit: false, delete: false });

    const toggleModal = (type) => {
        setModal((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    // Menu Toggle

    const [anchorEl, setAnchorEl] = useState(null)

    const handleMenuClick = (event, id) => {
        setAnchorEl(event.currentTarget)
        setSelectedId(id)
    }

    // Get Service Category

    const [categoryList, setCategoryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [onsearchText, setonsearchText] = useState("")
    const [selectedId, setSelectedId] = useState(null)

    const fetchServiceCategory = () => {
        setLoading(true);
        axios
            .get(`${url}/auth/service-categories/?search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
            })
            .then((res) => {
                setCategoryList(res.data.results);
                setTotalCount(res.data.count);
                setLoading(false);
            })
            .catch((error) => {
                const refresh = String(authTokens.refresh);
                axios.post(`${url}/api/token/refresh/`, { refresh }).then((res) => {
                    localStorage.setItem("authTokens", JSON.stringify(res.data));
                    axios
                        .get(`${url}/auth/service-categories/?search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                            headers: {
                                Authorization: `Bearer ${res.data.access}`,
                            },
                        })
                        .then((res) => {
                            setCategoryList(res.data.results);
                            setTotalCount(res.data.count);
                            setLoading(false);
                        });
                });
            });
    };

    useEffect(() => {
        fetchServiceCategory();
    }, [currentPage, rowsPerPage, onsearchText]);


    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const resetForm = () => {
        setFormData([]);
        setEditData([]);
        setDeleteData([]);
        setAnchorEl(null)
    };


    // Add Service Category

    const [formData, setFormData] = useState([])

    const handleSubmit = async (event) => {

        event.preventDefault();

        let submitData = {
            name: formData.category,
        }

        try {
            const response = await axios.post(`${url}/auth/service-categories/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: false,
            });
            toast.success("Service Category Added Successfully", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
            });

            toggleModal('add')
            resetForm()
            fetchServiceCategory()
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

    //  Edit Service Category

    const [editData, setEditData] = useState([])


    const handleEdit = async (event) => {

        event.preventDefault();

        let submitData = {
            name: editData.category,
        };

        try {
            const response = await axios.put(`${url}/auth/service-categories/${selectedId}/`, submitData, {
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
                    theme: 'colored',
                });
            toggleModal('edit');
            resetForm()
            fetchServiceCategory()
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


    // Delete Service Category

    const [deleteData, setDeleteData] = useState([])

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`${url}/auth/service-categories/${selectedId}/`, {
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
                    theme: 'colored',
                });
            toggleModal('delete')
            fetchServiceCategory()
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


    return (
        <PageContainer title="Service Category" description="Service Category">
            <DashboardCard>
                <Grid container spacing={3}>
                    <Grid item sm={12} lg={12}>
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
                                Service Category
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                <TextField
                                    placeholder="Search by name"
                                    size="small"
                                    value={onsearchText}
                                    onChange={(e) => setonsearchText(e.target.value)}
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
                                    sx={{ bgcolor: "#7f54fb", "&:hover": { bgcolor: "#6a3ee8" }, borderRadius: 1, boxShadow: "none" }}
                                >
                                    Add
                                </Button>
                            </Box>
                        </Box>

                        <TableContainer sx={{ minHeight: '700px' }}>
                            <Table sx={{ minWidth: { xs: 650, sm: 750 } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">
                                            SN
                                        </TableCell>
                                        <TableCell align="center">
                                            Category
                                        </TableCell>
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
                                                    sx={{ height: "540px", fontWeight: "bolder", fontSize: "15px" }}
                                                >
                                                    <CircularProgress className="me-2" color="primary" size={25} /> Loading Details
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : categoryList && categoryList.length > 0 ? (
                                        categoryList.map((item, index) => (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                                key={item.id}
                                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                            >
                                                <TableCell align="center">
                                                    {currentPage * rowsPerPage + index + 1}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.name}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { handleMenuClick(e, item.id) }}
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
                                                        >
                                                            <MenuItem onClick={() => { setViewData(item); toggleModal("view") }}>
                                                                <IconEye fontSize="small" className="me-2" /> View
                                                            </MenuItem>
                                                            <MenuItem onClick={() => { setEditData(item); toggleModal("edit") }}>
                                                                <IconPencil fontSize="small" className="me-2" /> Edit
                                                            </MenuItem>
                                                            <MenuItem onClick={() => { setDeleteData(item); toggleModal("delete") }}>
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

                        <Box sx={{ borderTop: "1px solid #e5e9f2" }}>
                            <TablePagination
                                rowsPerPageOptions={[10, 50, 100]}
                                component="div"
                                count={totalCount}
                                rowsPerPage={rowsPerPage}
                                page={currentPage}
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
                                    ".MuiTablePagination-select": { color: "#364a63" },
                                    ".MuiTablePagination-actions": {
                                        ml: 2,
                                        ".MuiIconButton-root": {
                                            padding: "4px",
                                            "&.Mui-disabled": { opacity: 0.5 },
                                        },
                                    },
                                }}
                            />
                        </Box>
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
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600 }}>
                    Setup Service Category
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="category"
                                    label="Category Name"
                                    type="text"
                                    placeholder="Enter Category Name"
                                    onChange={(e) => { setFormData({ ...formData, category: e.target.value }) }}
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
                        <Button type="submit" variant="contained" sx={{ bgcolor: "#7f54fb", "&:hover": { bgcolor: "#6a3ee8" } }}>
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
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600 }}>
                    Edit Service Category
                </DialogTitle>
                <form onSubmit={handleEdit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="category"
                                    label="Category Name"
                                    type="text"
                                    placeholder="Enter Category Name"
                                    defaultValue={editData.name}
                                    onChange={(e) => { setEditData({ ...editData, category: e.target.value }) }}
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
                        <Button type="submit" variant="contained" sx={{ bgcolor: "#7f54fb", "&:hover": { bgcolor: "#6a3ee8" } }}>
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
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, display: "flex", alignItems: "center", gap: 2 }}>
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
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3 }}>
                    <Typography variant="h6" sx={{ color: "#364a63", fontWeight: 600 }}>
                        Delete Service Category
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, p: 2, borderRadius: 1, mt: 2 }}>
                        <IconAlertCircleFilled sx={{ color: "red", fontSize: 30 }} />
                        <Typography variant="h6" sx={{ color: "#364a63", textAlign: "center" }}>
                            {`Are you sure you want to Delete the service category: ${deleteData.name}?`}
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
                        sx={{ bgcolor: "#e85347", "&:hover": { bgcolor: "#e42a1d" } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer >
    );
};

export default ServiceCategory;
