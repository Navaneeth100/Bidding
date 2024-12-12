import React, { useState } from 'react';
import { Typography, Grid, CardContent } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import BlankCard from 'src/components/shared/BlankCard';
import ProductPerformance from '../views/dashboard/components/ProductPerformance';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, InputLabel, MenuItem, Select, TextField, IconButton } from '@mui/material';
import { IconStar, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const hotels = [
    {
        "id": 1,
        "name": "TIME Moonstone Hotel Apartments",
        "location": "Fujairah, United Arab Emirates",
        "address": "Fujairah City Center",
        "rating": 4.9,
        "contact": "+971 9 203 0000",
        "image": "https://lh5.googleusercontent.com/p/AF1QipO-lrkTfA84I-9wAch-6shsZN_ya_pWVwdCBwbM=w255-h174-n-k-no"
    },
    {
        "id": 2,
        "name": "TIME Onyx Hotel Apartments",
        "location": "Dubai, United Arab Emirates",
        "address": "Al Qusais Industrial Area 5",
        "rating": 4.8,
        "contact": "+971 4 604 2999",
        "image": "https://lh3.googleusercontent.com/proxy/fRmAhI1AexkpJd2S0xadJC1-LUAqp03Xn-iNTmWQ9F4-DbI2VWS7dguTHtp_2e8DGjFVbaYmFUzP3moJVp20mv9rYTmqLKjhI1PSxIs_Q-1LubN7LKhYp4EqpPxYaYKRo2X-82ETINajS5gUqHgDkYnVf14I-Bo=s680-w680-h510"
    },
    {
        "id": 3,
        "name": "TIME Moonstone Hotel Apartments",
        "location": "Fujairah, United Arab Emirates",
        "address": "Fujairah City Center",
        "rating": 4.9,
        "contact": "+971 9 203 0000",
        "image": "https://lh5.googleusercontent.com/p/AF1QipO-lrkTfA84I-9wAch-6shsZN_ya_pWVwdCBwbM=w255-h174-n-k-no"
    },
    {
        "id": 4,
        "name": "TIME Onyx Hotel Apartments",
        "location": "Dubai, United Arab Emirates",
        "address": "Al Qusais Industrial Area 5",
        "rating": 4.8,
        "contact": "+971 4 604 2999",
        "image": "https://lh3.googleusercontent.com/proxy/fRmAhI1AexkpJd2S0xadJC1-LUAqp03Xn-iNTmWQ9F4-DbI2VWS7dguTHtp_2e8DGjFVbaYmFUzP3moJVp20mv9rYTmqLKjhI1PSxIs_Q-1LubN7LKhYp4EqpPxYaYKRo2X-82ETINajS5gUqHgDkYnVf14I-Bo=s680-w680-h510"
    },
    {
        "id": 5,
        "name": "TIME Moonstone Hotel Apartments",
        "location": "Fujairah, United Arab Emirates",
        "address": "Fujairah City Center",
        "rating": 4.9,
        "contact": "+971 9 203 0000",
        "image": "https://lh5.googleusercontent.com/p/AF1QipO-lrkTfA84I-9wAch-6shsZN_ya_pWVwdCBwbM=w255-h174-n-k-no"
    }
]


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

                        <Box sx={{ overflow: 'auto', width: { xs: '300px', sm: 'auto' } }}>
                            <Table
                                aria-label="simple table"
                                sx={{
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                SN
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Image
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Name
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Location
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Ratings
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={600} align='center'>
                                                Contact
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
                                    {hotels.map((hotels) => (
                                        <TableRow key={hotels.id}>
                                            <TableCell>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {hotels.id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box component="img" src={hotels.image} alt="Hotel Image" width="100px" height="auto" onClick={() => { handleNavigateToViewHotel(hotels.id) }} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {hotels.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {hotels.address}
                                                        </Typography>
                                                        <Typography
                                                            color="textSecondary"
                                                            sx={{
                                                                fontSize: "13px",
                                                            }}
                                                        >
                                                            {hotels.location}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <IconStar width={15} style={{ marginRight: "5px" }} />
                                                    <Typography variant="subtitle2" fontWeight={600} fontSize={18}>
                                                        {hotels.rating}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6">{hotels.contact}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box display="flex" alignItems="center" justifyContent="flex-end">
                                                    <IconEye width={20} style={{ marginRight: "15px" }} />
                                                    <IconEdit width={20} style={{ marginRight: "15px" }} />
                                                    <IconTrash width={20} />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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


        </PageContainer>
    );
};

export default HotelPage;
