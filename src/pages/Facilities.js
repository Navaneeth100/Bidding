import React, { useEffect, useState } from 'react';
import { Typography, Grid, CardContent, CircularProgress } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import BlankCard from 'src/components/shared/BlankCard';
import ProductPerformance from '../views/dashboard/components/ProductPerformance';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Button, FormControl, InputLabel, MenuItem, Select, TextField, IconButton } from '@mui/material';
import { IconStar, IconEye, IconEdit, IconTrash, IconAlertCircleFilled } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { url } from '../../mainurl';
import axios from 'axios';


const Facilities = () => {

    const [modal, setModal] = useState({ add: false, view: false, edit: false, delete: false });

    // Function to toggle the modal state
    const toggleModal = (type) => {
        setModal((prev) => ({ ...prev, [type]: !prev[type] }));
    };


    // filter toggle

    const [filtersVisible, setFiltersVisible] = useState(false);
    const toggleFilters = () => {
        setFiltersVisible(!filtersVisible);
        setCalendarvisible(false)
    };

    // calendar toggle

    const [calendarvisible, setCalendarvisible] = useState(false)

    const toggleCalenadar = () => {
        setCalendarvisible(!calendarvisible)
        setFiltersVisible(false)
    }

    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    let tokenStr = String(authTokens.access);


    // get facilities

    const [facilitiesList, setfacilitiesList] = useState([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const pageSize = 10;

    const fetchFacilities = (page = 1) => {
        setLoading(true);
        axios
            .get(`${url}/hotel/facilities/?page=${page}&page_size=${pageSize}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {
                setfacilitiesList(res.data.results);
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
                        .get(`${url}/hotel/facilities/?page=${page}&page_size=${pageSize}`, {
                            headers: new_headers,
                        })
                        .then((res) => {
                            setfacilitiesList(res.data.results);
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
        fetchFacilities(currentPage);
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

    // Add Facilities 


    const [formData, setFormData] = useState([])

    const handleSubmit = async (event) => {
        event.preventDefault();
        let submitData = {
            name: formData.name,
        }

        try {
            const response = await axios.post(`${url}/hotel/facilities/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toggleModal('add')
            fetchFacilities()
        } catch (error) {
            console.error('Error:', error);
        } finally {
        }
    };

    //  Edit Facilities

    const [editData, setEditData] = useState([])

    const handleEdit = async (event) => {
        event.preventDefault();
        let submitData = {
            name: editData.name,
        };

        try {
            const response = await axios.put(`${url}/hotel/facilities/${editData.id}/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toggleModal('edit');
            fetchFacilities();
        } catch (error) {
            console.error('Error:', error);
        } finally {
        }
    };


    // Delete Facilities

    const [deleteData, setDeleteData] = useState([])

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${url}/hotel/facilities/${id}/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toggleModal('delete')
            fetchFacilities();
        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
        <PageContainer title="Facilities" description="Facilities">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }} gap={2} mb={2}>
                {/* <Button size="small" variant={calendarvisible ? "contained" : "outlined"} color='primary' onClick={toggleCalenadar}>Calendar</Button> */}
                {/* <Button size="small" variant={filtersVisible ? "contained" : "outlined"} color='primary' onClick={toggleFilters}>Filters</Button> */}
                <Button size="small" variant="outlined" color='success' onClick={() => toggleModal('add')}>Add Facilities</Button>
            </Box>

            {/* Filter Box */}

            {filtersVisible && (
                <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', p: 2, bgcolor: 'background.paper', mb: 3 }}>
                    <Typography variant="h6" mb={2}>Filter By</Typography>
                    <Grid container spacing={3}>
                        {/* Facilities Filter */}
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select label="Category">
                                    <MenuItem value="Luxury">Luxury</MenuItem>
                                    <MenuItem value="Budget">Budget</MenuItem>
                                    <MenuItem value="Business">Business</MenuItem>
                                    <MenuItem value="Resort">Resort</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Rating Filter */}
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Rating</InputLabel>
                                <Select label="Rating">
                                    {[...Array(5)].map((_, index) => (
                                        <MenuItem key={index + 1} value={index + 1}>{index + 1}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Location Filter */}
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Location</InputLabel>
                                <Select label="Location">
                                    <MenuItem value="Abu Dhabi">Abu Dhabi</MenuItem>
                                    <MenuItem value="Dubai">Dubai</MenuItem>
                                    <MenuItem value="Sharjah">Sharjah</MenuItem>
                                    <MenuItem value="Fujairah">Fujairah</MenuItem>
                                    <MenuItem value="Ajman">Ajman</MenuItem>
                                    <MenuItem value="Umm Al Quwain">Umm Al Quwain</MenuItem>
                                    <MenuItem value="Ras Al Khaimah">Ras Al Khaimah</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Facilities Filter */}
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Facilities</InputLabel>
                                <Select label="Facilities">
                                    <MenuItem value="Parking">Parking</MenuItem>
                                    <MenuItem value="Breakfast">Breakfast</MenuItem>
                                    <MenuItem value="Gym">Gym</MenuItem>
                                    <MenuItem value="Breakfast">Breakfast</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {calendarvisible && (
                <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', p: 2, bgcolor: 'background.paper', mb: 3 }}>
                    <Typography variant="h6" mb={2}>Date Filter</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="body1" mb={1}>From Date</Typography>
                            <input
                                type="date"
                                className="form-control"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="body1" mb={1}>To Date</Typography>
                            <input
                                type="date"
                                className="form-control"
                            />
                        </Grid>
                    </Grid>
                </Box>
            )}



            <Grid container spacing={3}>
                <Grid item sm={12}>
                    <DashboardCard title="Our Facilities">

                        <Box sx={{ overflowY: 'auto', width: '100%', height: '765px' }}>
                            <Table
                                aria-label="simple table"
                                sx={{
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell align='center'>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                SN
                                            </Typography>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Facilities
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Action
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <Box
                                                    display="flex"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    sx={{ height: "540px" }}
                                                >
                                                    <CircularProgress color="primary" size={30} />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : facilitiesList && facilitiesList.length > 0 ? (
                                        facilitiesList.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {calculateSN(index, currentPage, pageSize)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {item.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        {/* <IconEye width={30} style={{ marginRight: "15px", cursor: "pointer" }} /> */}
                                                        <Button
                                                            sx={{ border: '1px solid lightgrey', marginRight: "10px" }} onClick={() => { toggleModal('edit'); setEditData(item); }}><IconEdit width={15} /><Typography variant="subtitle2" fontWeight={500} className='ms-1 me-1' > Edit </Typography>
                                                        </Button>
                                                        <Button
                                                            sx={{ border: '1px solid lightgrey' }} onClick={() => { toggleModal('delete'); setDeleteData(item); }}><IconTrash width={15} className='m-0 p-0' />
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    No Data to Display
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                        <Box display="flex" justifyContent="start" mt={2}>
                            <Button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1 || !prevPage}
                                variant="contained"
                                color="primary"
                                size='small'
                                sx={{ marginRight: 1 }}
                            >
                                First
                            </Button>
                            <Button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || !prevPage}
                                variant="contained"
                                color="primary"
                                size='small'
                                sx={{ marginRight: 1 }}
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || !nextPage}
                                variant="contained"
                                color="primary"
                                size='small'
                                sx={{ marginLeft: 1 }}
                            >
                                Next
                            </Button>
                            <Button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages || !nextPage}
                                variant="contained"
                                color="primary"
                                size='small'
                                sx={{ marginLeft: 1 }}
                            >
                                Last
                            </Button>
                        </Box>
                    </DashboardCard>
                </Grid>
            </Grid>

            {/* add modal */}

            <Dialog
                open={modal.add}
                onClose={() => toggleModal('add')}
                maxWidth="sm"
                fullWidth
                sx={{ padding: 4 }}
            >
                <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }} id="customized-dialog-title">
                    Add Facilities
                    <IconButton aria-label="close" onClick={() => toggleModal('add')} sx={{ position: 'absolute', right: 8, top: 8 }}>x</IconButton>
                </DialogTitle>

                <DialogContent sx={{ padding: 3 }}>
                    <form className="row gy-4 mt-2" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item md={12} xs={12}>
                                <TextField
                                    label="Facilities"
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Enter Facilities"
                                    margin="normal"
                                    onChange={(e) => { setFormData({ ...formData, name: e.target.value }) }}
                                />
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: 4 }}
                        >
                            Submit
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>


            {/* edit modal */}

            <Dialog
                open={modal.edit}
                onClose={() => toggleModal('edit')}
                maxWidth="sm"
                fullWidth
                sx={{ padding: 4 }}
            >
                <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }} id="customized-dialog-title">
                    Edit Facilities
                    <IconButton aria-label="close" onClick={() => toggleModal('edit')} sx={{ position: 'absolute', right: 8, top: 8 }}>x</IconButton>
                </DialogTitle>

                <DialogContent sx={{ padding: 3 }}>
                    <form className="row gy-4 mt-2" onSubmit={handleEdit}>
                        <Grid container spacing={3}>
                            <Grid item md={12} xs={12}>
                                <TextField
                                    label="Facilities"
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Enter Facilities"
                                    defaultValue={editData.name}
                                    margin="normal"
                                    onChange={(e) => { setEditData({ ...editData, name: e.target.value }) }}
                                />
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: 4 }}
                        >
                            Submit
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* delete confirmation */}

            <Dialog
                open={modal.delete}
                onClose={() => toggleModal('delete')}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ style: { borderRadius: '15px', padding: '16px', maxWidth: '350px' } }}>
                <DialogTitle id="alert-dialog-title" style={{ fontSize: '1rem', fontWeight: 'bold', textAlign: 'center', paddingBottom: '8px' }}><IconAlertCircleFilled /></DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" style={{ fontSize: '1rem', textAlign: 'center', color: '#333' }}>
                        Are you sure you want to Cancel {deleteData.name}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', padding: '16px' }}>
                    <Button onClick={() => handleDelete(deleteData.id)} style={{ backgroundColor: '#2ecc71', color: 'white', fontSize: '1rem', padding: '6px 24px', margin: '0 8px' }}>
                        Yes
                    </Button>
                    <Button onClick={() => toggleModal('delete')} style={{ backgroundColor: '#e74c3c', color: 'white', fontSize: '1rem', padding: '6px 24px', margin: '0 8px' }}>
                        No
                    </Button>
                </DialogActions>
            </Dialog>

        </PageContainer >
    );
};

export default Facilities;
