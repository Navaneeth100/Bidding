import React, { useState } from 'react';
import { Typography, Grid, CardContent } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import BlankCard from 'src/components/shared/BlankCard';
import ProductPerformance from '../views/dashboard/components/ProductPerformance';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, InputLabel, MenuItem, Select, TextField, IconButton } from '@mui/material';
import { IconStar, IconEye, IconEdit, IconTrash, IconStarFilled, IconMapPinFilled, IconPhone, IconMail } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, CardImg, CardText, CardTitle } from 'reactstrap';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';



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

const ecoCard = [
    {
        title: 'Boat Headphone',
        subheader: 'September 14, 2023',
        photo: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/524179649.jpg?k=bec3ef93405efa3dd41a3efd4695b88e0b54200d98c64099e73bd2e80bb50d32&o=&hp=1",
        salesPrice: 375,
        price: 285,
        rating: 4,
    },
    {
        title: 'MacBook Air Pro',
        subheader: 'September 14, 2023',
        photo: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/dc/25/88/swimming-pool.jpg?w=1200&h=-1&s=1",
        salesPrice: 650,
        price: 900,
        rating: 5,
    },
    {
        title: 'Red Valvet Dress',
        subheader: 'September 14, 2023',
        photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHaU_4zeIgqNvq3VcdTndWjlZYmPkZREv2kA&s",
        salesPrice: 150,
        price: 200,
        rating: 3,
    },
    {
        title: 'Cute Soft Teddybear',
        subheader: 'September 14, 2023',
        photo: "https://content.jdmagicbox.com/v2/comp/hyderabad/42/040p9100342/catalogue/food-exchange-novotel-hyderabad--madhapur-hyderabad-restaurants-518wi-250.jpg",
        salesPrice: 285,
        price: 345,
        rating: 2,
    },
];


const HotelPage = () => {

    const [modal, setModal] = useState({ add: false, view: false, edit: false });

    // Function to toggle the modal state
    const toggleModal = (type) => {
        setModal((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    const { id } = useParams();

    // Find the hotel with the matching id
    const hotel = hotels.find(h => h.id === parseInt(id));

    return (
        <PageContainer title="Hotels" description="Hotels">
            <Grid container spacing={3}>
                <Grid item sm={12} lg={12}>
                    <DashboardCard title={`#Hotel ${hotel.id}`}>
                        <Grid container spacing={1} columns={12}>
                            <Grid item xs={4} md={4}>
                                <Box
                                    sx={{
                                        height: "100%",
                                        textAlign: "center",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        padding: 2,
                                        borderRadius: 2,
                                        border: "1px grey"
                                    }}
                                >
                                    <Stack direction="row" spacing={2}>
                                        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 56, height: 56 }} />
                                    </Stack>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                            John Doe
                                        </Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", mt: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                <IconMail fontSize="small" />
                                                <Typography variant="h6">johndoe@gmail.com</Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <IconPhone fontSize="small" />
                                                <Typography variant="h6">+0495 2345678</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                </Box>
                            </Grid>

                            <Grid item xs={8} md={8}>
                                <Box sx={{ overflow: 'auto', width: { xs: '100%', sm: 'auto' } }}>
                                    <Card className="my-2">
                                        {/* <CardImg
                                            alt="Card image cap"
                                            src="https://symphony.cdn.tambourine.com/the-spectator-hotel-redesign/media/spectator-rooms-header-61b8cf9fdf5fe.jpeg"
                                            style={{
                                                height: 200
                                            }}
                                            top
                                            width="100%"
                                        /> */}
                                        <CardBody>
                                            <CardTitle tag="h5">
                                                {hotel.name}
                                            </CardTitle>
                                            <CardText>
                                                {hotel.location} &nbsp; | &nbsp; {hotel.rating}  ( 52,427 Ratings )
                                            </CardText>
                                            <CardText>
                                                A luxurious palace resort on the banks of Lake Pichola, offering breathtaking views, world-class service, and a blend of traditional Rajasthani architecture with modern amenities.
                                            </CardText>
                                            {/* <CardText>
                                        <small className="text-muted">
                                            Last updated 3 mins ago
                                        </small>
                                    </CardText> */}
                                        </CardBody>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                overflowX: "auto", // Enable horizontal scrolling
                                                overflowY: "hidden", // Prevent vertical scrolling
                                                gap: "16px", // Add spacing between items
                                                padding: "16px", // Optional padding
                                            }}
                                        >
                                            {ecoCard.map((product, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        minWidth: "300px", // Set a fixed width for each card
                                                        flexShrink: 0, // Prevent the item from shrinking
                                                    }}
                                                >
                                                    <BlankCard>
                                                        <Typography>
                                                            <img src={product.photo} alt="img" width="100%" height="200px" />
                                                        </Typography>
                                                    </BlankCard>
                                                </Box>
                                            ))}
                                        </Box>

                                    </Card>
                                </Box>
                            </Grid>
                        </Grid>
                        <Typography className='mb-3 mt-2' variant="h4">More Images</Typography>
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
