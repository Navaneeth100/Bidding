import React, { useEffect, useState } from 'react';
import { Typography, Grid, CardContent, CircularProgress, DialogContentText } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import BlankCard from 'src/components/shared/BlankCard';
import ProductPerformance from '../views/dashboard/components/ProductPerformance';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, InputLabel, MenuItem, Select, TextField, IconButton } from '@mui/material';
import { IconStar, IconEye, IconEdit, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url } from '../../mainurl';
import { toast } from 'react-toastify';


const HotelPage = () => {

    const [modal, setModal] = useState({ add: false, view: false, edit: false });

    // Function to toggle the modal state
    const toggleModal = (type) => {
        setModal((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    const navigate = useNavigate();

    const handleNavigateToViewHotel = (id) => {
        navigate(`/hotels/${id}`);
    }

    const addHotel = () => {
        navigate(`/addhotel`);
    }

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


    // get Hotels

    const [HotelList, setHotelList] = useState([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const pageSize = 10;

    const fetchHotels = (page = 1) => {
        setLoading(true);
        axios
            .get(`${url}/hotel/createhotels/?page=${page}&page_size=${pageSize}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {
                setHotelList(res.data.results);
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
                        .get(`${url}/hotel/createhotels/?page=${page}&page_size=${pageSize}`, {
                            headers: new_headers,
                        })
                        .then((res) => {
                            setHotelList(res.data.results);
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
        fetchHotels(currentPage);
    }, [currentPage]);

    // SN Handler

    const calculateSN = (index, page, pageSize) => {
        return (page - 1) * pageSize + (index + 1);
    };

    //  page change

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            fetchHotels(page);
        }
    };

    // Delete Hotel

    const [deleteData, setDeleteData] = useState([])

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${url}/hotel/updatehotels/${id}/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toggleModal('delete')
            toast.success("Hotel Deleted Successfully...", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
            });
            fetchHotels();
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
        <PageContainer title="Hotels" description="Hotels">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }} gap={2} mb={2}>
                <Button size="small" variant={calendarvisible ? "contained" : "outlined"} color='primary' onClick={toggleCalenadar}>Calendar</Button>
                <Button size="small" variant={filtersVisible ? "contained" : "outlined"} color='primary' onClick={toggleFilters}>Filters</Button>
                <Button size="small" variant="outlined" color='success' onClick={() => addHotel()}>Add Hotel</Button>
            </Box>

            {/* Filter Box */}

            {filtersVisible && (
                <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', p: 2, bgcolor: 'background.paper', mb: 3 }}>
                    <Typography variant="h6" mb={2}>Filter By</Typography>
                    <Grid container spacing={3}>
                        {/* Category Filter */}
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

                        {/* Category Filter */}
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Facilities</InputLabel>
                                <Select label="Category">
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
                <Grid item sm={12} lg={12}>
                    <DashboardCard title="Our Hotels">

                        <Box sx={{ overflowY: 'auto', width: '100%', minHeight: '820px' }}>
                            <Table
                                aria-label="simple table"
                                sx={{
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                SN
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Image
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Name
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Location
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Ratings
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Owner Name
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Owner Contact
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
                                            <TableCell colSpan={8} align="center">
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
                                    ) : HotelList && HotelList.length > 0 ? (
                                        HotelList.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell align="center">
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {calculateSN(index, currentPage, pageSize)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box component="img" src={`${url}${item?.hotelimgs[0]?.file}`} alt="Hotel Image" width="100px" height="auto" onClick={() => { handleNavigateToViewHotel(item.id) }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {item.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        }}
                                                    >
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                {item.location}
                                                            </Typography>
                                                            <Typography
                                                                color="textSecondary"
                                                                sx={{
                                                                    fontSize: "13px",
                                                                }}
                                                            >
                                                                {item.locationName}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        {/* <IconStar width={15} style={{ marginRight: "5px" }} /> */}
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {item.rating} Star
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {item.owner_name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="subtitle2" fontWeight={600}>{item.owner_contact_number}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        {/* <IconEye width={20} style={{ marginRight: "15px" }} /> */}
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
                maxWidth="lg"
                fullWidth
                sx={{ padding: 2 }}
            >
                <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }} id="customized-dialog-title">
                    Modal title
                    <IconButton
                        onClick={() => toggleModal('add')} sx={{ position: 'absolute', right: 8, top: 8 }}>x</IconButton>
                </DialogTitle>

                <DialogContent sx={{ padding: 3 }}>
                    <form className="row gy-4">
                        <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Account Header</InputLabel>
                                    <Select
                                        value=""
                                        onChange={() => { }}
                                        label="Account Header"
                                    >
                                        <MenuItem value={1}>Header 1</MenuItem>
                                        <MenuItem value={2}>Header 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item md={6} xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Account Group</InputLabel>
                                    <Select
                                        value=""
                                        onChange={() => { }}
                                        label="Account Group"
                                    >
                                        <MenuItem value={1}>Group 1</MenuItem>
                                        <MenuItem value={2}>Group 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item md={6} xs={12}>
                                <TextField
                                    label="Account Name"
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Enter Account Name"
                                />
                            </Grid>

                            <Grid item md={6} xs={12}>
                                <TextField
                                    label="Account ID"
                                    variant="outlined"
                                    type="number"
                                    fullWidth
                                    placeholder="Enter Account ID"
                                />
                            </Grid>

                            <Grid item md={6} xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>User</InputLabel>
                                    <Select
                                        value=""
                                        onChange={() => { }}
                                        label="User"
                                    >
                                        <MenuItem value={1}>User 1</MenuItem>
                                        <MenuItem value={2}>User 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: 2 }}
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
                <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center', paddingBottom: '8px' }}><IconAlertCircle /></DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" style={{ fontSize: '1rem', textAlign: 'center', color: '#333' }}>
                        Are you sure you want to Delete {deleteData.name}?
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

        </PageContainer>
    );
};

export default HotelPage;
