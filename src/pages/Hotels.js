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
        "name": "The Oberoi Udaivilas",
        "location": "Udaipur, Rajasthan",
        "address": "Haridasji Ki Magri",
        "rating": 4.9,
        "contact": "+91 294 2433300",
        "image": "https://lh3.googleusercontent.com/p/AF1QipMuXeRSEy6AIfsfaADUJ0WavsP_oJVDRIvrFraH=s680-w680-h510"
    },
    {
        "id": 2,
        "name": "Taj Mahal Palace",
        "location": "Mumbai, Maharashtra",
        "address": "Apollo Bandar, Colaba",
        "rating": 4.8,
        "contact": "+91 22 6665 3366",
        "image": "https://lh3.googleusercontent.com/p/AF1QipPjR_st_vsnuJdZwzWkJ3P1ur1QdjRyNcq4VS--=s680-w680-h510"
    },
    {
        "id": 3,
        "name": "ITC Grand Chola",
        "location": "Chennai, Tamil Nadu",
        "address": "No 63, Mount Road, Guindy",
        "rating": 4.7,
        "contact": "+91 44 2220 0000",
        "image": "https://lh3.googleusercontent.com/proxy/69Ilu49qMjZ042ky0BWyqGfwRT5z-GZ6gdYALkAKUM_-EJzPwMfnVS5npRXGpn_U7Lkz4zrpfIiOCVaJMIeUAxoRmOg8ajNhTcTQejBW_O2-GkowJ8e_NIrprA3GdorM07UqvCtcR7Kl40jM-VsGMPaRaxJdMg=s680-w680-h510"
    },
    {
        "id": 4,
        "name": "Leela Palace",
        "location": "New Delhi, Delhi",
        "address": "Diplomatic Enclave, Chanakyapuri",
        "rating": 4.9,
        "contact": "+91 11 3933 1234",
        "image": "https://lh3.googleusercontent.com/p/AF1QipMyFampnjTQttMvO8BTEgylpimVrAbXg5sAtBuO=s680-w680-h510"
    },
    {
        "id": 5,
        "name": "Radisson Blu",
        "location": "Kochi, Kerala",
        "address": "Sahodaran Ayyappan Road, Elamkulam",
        "rating": 4.5,
        "contact": "+91 484 4129999",
        "image": "https://lh3.googleusercontent.com/p/AF1QipNsP26P4ImwPNap7CoHs_jUO-44JasvVB9w8Dir=w287-h192-n-k-rw-no-v1"
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

    return (
        <PageContainer title="Hotels" description="Hotels">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }} gap={2} mb={2}>
                <Button size="small" variant="text" color='info'>Calendar</Button>
                <Button size="small" variant="text" color='info'>Filters</Button>
                <Button size="small" variant="outlined" color='success' onClick={() => toggleModal('add')}>Add Hotel</Button>
            </Box>
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
