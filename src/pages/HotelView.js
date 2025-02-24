import React, { useEffect, useState } from 'react';
import { Typography, Grid, CardContent, Rating, CircularProgress } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import BlankCard from 'src/components/shared/BlankCard';
import ProductPerformance from '../views/dashboard/components/ProductPerformance';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, InputLabel, MenuItem, Select, TextField, IconButton, Chip } from '@mui/material';
import { IconStar, IconEye, IconEdit, IconTrash, IconStarFilled, IconMapPinFilled, IconPhone, IconMail } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Card, CardBody, CardImg, CardText, CardTitle } from 'reactstrap';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { deepPurple } from '@mui/material/colors';
import axios from 'axios';
import { url } from '../../mainurl';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import defaulthotel from 'src/assets/images/profile/DefaultHotel.jpg';


const HotelPage = () => {

    const [modal, setModal] = useState({ add: false, view: false, edit: false });

    // Function to toggle the modal state
    const toggleModal = (type) => {
        setModal((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    //  Select Images 

    const [selectedIndex, setSelectedIndex] = useState(0);


    const { id } = useParams();

    // get HotelDetails

    const [isLoading, setIsLoading] = useState(true);
    const [hotelDetails, sethotelDetails] = useState([])
    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    let tokenStr = String(authTokens.access);

    const fetchHotelDetials = () => {
        setIsLoading(true)
        axios
            .get(`${url}/hotel/updatehotels/${id}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {
                sethotelDetails(res.data);
                setIsLoading(false)
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
                        .get(`${url}/hotel/updatehotels/${id}`, { headers: new_headers })
                        .then((res) => {
                            sethotelDetails(res.data);
                            setIsLoading(false)
                        });
                });
            });
    };

    useEffect(() => {
        fetchHotelDetials()
    }, [id])

    // Google Map

    const marker = hotelDetails?.location && (() => {
        const [lat, lng] = hotelDetails.location.split(',').map(Number);
        return { lat, lng };
    })();

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }
    return (
        <PageContainer title="Hotels" description="Hotels">
            <Grid container spacing={3}>
                <Grid item sm={12} lg={12}>
                    <DashboardCard title="">
                        <Box sx={{ padding: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={8}>
                                    <Box
                                        component="img"
                                        src={hotelDetails.hotelimgs.length > 0 ? `${url}${hotelDetails.hotelimgs[selectedIndex].file}` : defaulthotel}
                                        alt=""
                                        sx={{
                                            width: '100%',
                                            height: '40vh',
                                            borderRadius: 2,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ height: '40vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                        {hotelDetails.hotelimgs.length > 0 && hotelDetails?.hotelimgs?.map((item, index) => (
                                            <Box
                                                key={index}
                                                component="img"
                                                src={`${url}${item.file}` || defaulthotel}
                                                alt=""
                                                onClick={() => setSelectedIndex(index)}
                                                sx={{
                                                    width: '100%',
                                                    height: '19vh',
                                                    borderRadius: 2,
                                                    marginBottom: 2
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

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
                                        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 56, height: 56, bgcolor: deepPurple[500] }} >{hotelDetails.owner_name?.charAt(0)?.toUpperCase()}</Avatar>
                                    </Stack>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                            {hotelDetails.owner_name || "N/A"}
                                        </Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", mt: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                <IconMail fontSize="small" />
                                                <Typography variant="h6">{hotelDetails.owner_email || "N/A"}</Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <IconPhone fontSize="small" />
                                                <Typography variant="h6">{hotelDetails.owner_contact_number || "N/A"}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                </Box>
                            </Grid>

                            <Grid item xs={8} md={8}>
                                <Box sx={{ overflow: 'auto', width: { xs: '100%', sm: 'auto' } }}>
                                    <Card className="my-2">
                                        <CardBody>
                                            <CardTitle tag="h5" className='fw-bold'>
                                                {hotelDetails.name || "N/A"}
                                            </CardTitle>
                                            <CardText>
                                                {hotelDetails.location || "N/A"}
                                            </CardText>
                                            <CardText>
                                                <Rating name="read-only" value={hotelDetails.rating} readOnly />
                                            </CardText>
                                            <CardText>
                                                {hotelDetails.description || "N/A"}
                                            </CardText>
                                            <CardText>
                                                {hotelDetails.facilities?.map((facilities, index) => (
                                                    <Chip
                                                        avatar={<Avatar alt="" src={`${url}${facilities.icon}`} />}
                                                        label={facilities.name}
                                                        variant="outlined"
                                                        className='me-2'
                                                    />
                                                ))}
                                            </CardText>
                                            <CardText>
                                                {hotelDetails?.tags?.map((item) => (
                                                    <Badge className='text-dark me-2' color="light" pill>
                                                        {item}
                                                    </Badge>
                                                ))}
                                            </CardText>
                                        </CardBody>
                                    </Card>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Images Section */}

                        {/* <Typography className='mb-3 mt-2' variant="h5">Images</Typography>
                        <Box
                            sx={{
                                display: "flex",
                                gap: "16px", // Add spacing between items
                                padding: "16px", // Optional padding
                            }}
                        >
                            {hotelDetails?.hotelimgs.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{ minWidth: "250px" }}
                                >
                                    <BlankCard>
                                        <Typography>
                                            <img src={`${url}${item.file}`} alt="img" width="100%" height="200px" />
                                        </Typography>
                                    </BlankCard>
                                </Box>
                            ))}
                        </Box> */}
                        <Typography className='mb-3 mt-2' variant="h5">
                            Rooms
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item sm={12} lg={12}>
                                <Box sx={{ overflow: 'auto', width: { xs: '300px', sm: 'auto' } }}>
                                    <Table aria-label="rooms table" sx={{ whiteSpace: 'nowrap' }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        SN
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Image
                                                    </Typography>
                                                </TableCell>
                                                {/* <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Category
                                                    </Typography>
                                                </TableCell> */}
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Room Name
                                                    </Typography>
                                                </TableCell>
                                                {/* <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Area
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Floor
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Beds
                                                    </Typography>
                                                </TableCell> */}
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Booking Price
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        With Breakfast
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Available Rooms
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {hotelDetails?.hotel_room_categories?.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell align='center'>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {index + 1}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align='center'>
                                                        <Box
                                                            display="flex"
                                                            justifyContent="center"
                                                            alignItems="center"
                                                            height="100%"
                                                        >
                                                            <Avatar
                                                                src={`${url}${item.hotelroomimgs[0]?.file}` || ""}
                                                                alt=""
                                                                variant="rounded"
                                                                sx={{ width: 50, height: 50 }}
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    {/* <TableCell align='center'>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {item.room_category}
                                                        </Typography>
                                                    </TableCell> */}
                                                    <TableCell align='center'>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {item.room_name}
                                                        </Typography>
                                                    </TableCell>
                                                    {/* <TableCell align='center'>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {item.area}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align='center'>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {item.floors}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align='center'>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {item.beds}
                                                        </Typography>
                                                    </TableCell> */}
                                                    <TableCell align='center'>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {item.booking_price}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align='center'>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {item.bf}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align='center'>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {item.available_rooms}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box>
                            <Typography className='mb-3 mt-4' variant="h5">
                                Location : {hotelDetails.locationName} &nbsp; ( {hotelDetails.location || "N/A"} )
                            </Typography>
                            {/* <LoadScript googleMapsApiKey="AIzaSyBWbDIh2SzBRw_RuV_UHwDAZb6DhEyB-3g" libraries={['places']}> */}
                                <GoogleMap
                                    mapContainerStyle={{ height: '400px', width: '100%' }}
                                    zoom={15}
                                    center={marker}
                                >
                                    <Marker position={marker} />
                                </GoogleMap>
                            {/* </LoadScript> */}
                        </Box>
                    </DashboardCard>
                </Grid>
            </Grid >
        </PageContainer >
    );
};

export default HotelPage;
