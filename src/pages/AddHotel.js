import React, { useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import BlankCard from 'src/components/shared/BlankCard';
import ProductPerformance from '../views/dashboard/components/ProductPerformance';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, InputLabel, MenuItem, Select, TextField, IconButton, Badge, Paper, CircularProgress, List, ListItem, ListItemText, Chip } from '@mui/material';
import { IconStar, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Typography,
    Checkbox,
    FormControlLabel, Rating
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { Card, CardMedia } from "@mui/material";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import axios from 'axios';
import { url } from '../../mainurl';
import { toast } from 'react-toastify';



const AddHotel = () => {

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        photos: [],
        profilepicture: null,
        rating: "1",
        category: [],
        facilities: [],
        location: "",
        hotelRating: "",
        bookingPrice: "",
        discount: "",
        availableRooms: "",
    });


    const handleChange = (field, value) => { setFormData((prev) => ({ ...prev, [field]: value })) };
    const [profilepicture, setprofilepicture] = useState('https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg')

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setprofilepicture(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // multiple file uploads

    const [files, setFiles] = useState([]);

    const onDrop = (acceptedFiles) => {
        const updatedFiles = acceptedFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file), // Create a preview URL for each file
            })
        );
        setFiles((prevFiles) => [...prevFiles, ...updatedFiles]);
    };

    const handleRemoveFile = (fileToRemove) => {
        setFiles(files.filter((file) => file !== fileToRemove));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: "image/*,application/pdf", // Accept images and PDFs
        multiple: true, // Allow multiple files
    });


    const [categories, setCategories] = useState([]);
    const [facilities, setfacilities] = useState([]);
    const [tags, settags] = useState([])
    const [roomList, setRoomList] = useState([{}])

    // stepper

    const steps = ['Hotel Details', 'Room Details', 'Owner and Support Details', 'Hotel Details Preview'];

    const [activeStep, setActiveStep] = React.useState(0);
    const [completed, setCompleted] = useState(Array(steps.length).fill(false));

    const totalSteps = () => {
        return steps.length;
    };

    const completedSteps = () => {
        return completed.filter(Boolean).length;
    };

    const isLastStep = () => {
        return activeStep === totalSteps() - 1;
    };

    const allStepsCompleted = () => {
        return completedSteps() === totalSteps();
    };

    const handleNext = async (e) => {
        let responseSuccess = false;
        if (activeStep === 0) {
            responseSuccess = await handleHotelSubmit(e);
        }
        // else if (activeStep === 1) {
        //     responseSuccess = await handleRoomSubmit(e);
        // }
        else if (activeStep === 2) {
            responseSuccess = await handleOwnerDetailSubmit(e);
        }

        if (responseSuccess) {
            const newCompleted = [...completed];
            newCompleted[activeStep] = true;
            setCompleted(newCompleted);

            const newActiveStep =
                isLastStep() && !allStepsCompleted()
                    ? completed.findIndex((step, i) => !step)
                    : activeStep + 1;

            setActiveStep(newActiveStep);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
    };

    const handleStep = (step) => () => {
        setActiveStep(step);
    };

    const handleReset = () => {
        setActiveStep(0);
        setCompleted(Array(steps.length).fill(false));
    };


    const MenuProps = { PaperProps: { style: { maxHeight: 200, overflowY: 'auto' } } };


    // get category

    const [categoryList, setcategoryList] = useState([])

    const fetchCategory = () => {
        axios
            .get(`${url}/hotel/room-categories/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {
                setcategoryList(res.data.results);
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
                        .get(`${url}/hotel/room-categories/`, { headers: new_headers })
                        .then((res) => {
                            setcategoryList(res.data.results);
                        });
                });
            });
    };

    // get category

    const [facilitiesList, setfacilitiesList] = useState([])

    const fetchFacilities = () => {
        axios
            .get(`${url}/hotel/facilities/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {
                setfacilitiesList(res.data.results);
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
                        .get(`${url}/hotel/facilities/`, { headers: new_headers })
                        .then((res) => {
                            setfacilitiesList(res.data.results);
                        });
                });
            });
    };


    // Add Hotel 

    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    let tokenStr = String(authTokens.access);

    const [roomId, setroomId] = useState(null)

    const handleHotelSubmit = async (event) => {
        if (formData.name && formData.description && formData.rating && formData.location) {
            event.preventDefault();
            let submitData = {
                name: formData.name,
                description: formData.description,
                pro_img: profilepicture,
                rating: `${formData.rating}`,
                locationName: formData.location,
                location: formData.location,
                booking_price: formData.bookingPrice,
                discount: formData.discount,
                available_rooms: formData.availableRooms,
                // hotel_room_categories: categories.map(name => parseInt(categoryList.find(item => item.category_name === name)?.id)),
                tags: tagsList,
                // facilities: facilities.map(name => parseInt(facilitiesList.find(item => item.name === name)?.id)),
                images: files,
                // owner_name: "null",
                // owner_contact_number: "null",
                // owner_email: "stayhotel@gmail.com",
            }

            try {
                const response = await axios.post(`${url}/hotel/createhotels/`, submitData, {
                    headers: {
                        Authorization: `Bearer ${tokenStr}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: false,
                });
                setroomId(response.data.id)
                toast.success(`${response.data.message}`, {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                });
                if (response.status === 201) {
                    return true;
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
            }
        }
        else {
            toast.error('Please Fill the Fields Completely...', {
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

    // Add Rooms

    const [roomData, setRoomData] = useState([{ room_category: '', area: '', floors: '', beds: '', bathrooms: '', guests: '', booking_price: '' }]);

    const handleRoomChange = (index, field, value) => {
        const updatedRoomData = [...roomData];
        updatedRoomData[index][field] = value;
        setRoomData(updatedRoomData);
    };

    const handleRoomSubmit = async (event) => {
        const isRoomDataValid = roomData.every((room) => Object.values(room).every((value) => String(value).trim() !== ''));
        if (roomId && isRoomDataValid) {
            event.preventDefault();
            const updatedRoomData = roomData.map((room) => ({ ...room, room_category: categoryList.find((category) => category.category_name === room.room_category)?.id }));
            setRoomData(updatedRoomData);

            try {
                const response = await axios.post(`${url}/hotel/hotels/${roomId}/room-categories/`, updatedRoomData, {
                    headers: {
                        Authorization: `Bearer ${tokenStr}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: false,
                });
                toast.success(`${response.data.message}`, {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                });
                if (response.status === 200) {
                    // return true;
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
            }
        }
        else {
            toast.error('Please Fill the Fields Completely...', {
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


    //  Add Owner Details

    const [ownerData, setOwnerData] = useState([])

    const handleOwnerDataChange = (field, value) => { setOwnerData((prev) => ({ ...prev, [field]: value })) };

    const handleOwnerDetailSubmit = async (event) => {
        if (ownerData.ownername && ownerData.ownercontact && ownerData.owneremail) {
            event.preventDefault();
            let submitData = {
                owner_name: ownerData.ownername,
                owner_contact_number: ownerData.ownercontact,
                owner_email: ownerData.owneremail,
            }

            try {
                const response = await axios.put(`${url}/hotel/updatehotels/${roomId}/`, submitData, {
                    headers: {
                        Authorization: `Bearer ${tokenStr}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: false,
                });
                if (response.data.message) {
                    toast.success(`${response.data.message}`, {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: 'colored',
                    });
                    return true;
                }
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
        }
        else {
            toast.error('Please Fill the Fields Completely...', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
            });
        }

    }

    // Hotel Preview

    const [hotelPreview, sethotelPreview] = useState([])
    const [isLoading, setisLoading] = useState(false)

    const fetchHotelPreview = () => {
        setisLoading(true)
        axios
            .get(`${url}/hotel/updatehotels/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {
                sethotelPreview(res.data);
                setisLoading(false)
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
                        .get(`${url}/hotel/updatehotels/${roomId}`, { headers: new_headers })
                        .then((res) => {
                            sethotelPreview(res.data);
                            setisLoading(false)
                        });
                });
            });
    };

    useEffect(() => {
        if (activeStep === 3) {
            fetchHotelPreview()
        }
    }, [activeStep])


    //  navigate to List

    const navigate = useNavigate();

    const handleNavigateToHotelList = () => {
        setTimeout(() => {
            navigate('/hotels/');
        }, 2000);
    }

    // Tag Adds

    const [tagInput, settagInput] = useState("");
    const [tagsList, setTagList] = useState([]);

    const handleAddTag = () => {
        if (tagInput.trim() !== "") {
            setTagList((prevItems) => [...prevItems, tagInput]);
            settagInput("");
        }
    };

    const handleRemoveItem = (indexToRemove) => {
        setTagList((prevItems) => prevItems.filter((_, index) => index !== indexToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };



    // Google Location

    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleSearchLocation = async (location) => {
        if (!location || location === "") {
            setLocations([]);
            setSelectedLocation(null);
            return;
        }

        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`,
                {
                    params: {
                        input: location,
                        key: "AIzaSyAVPUw1ZmigH0aqgcAjTbYY2IE72Gu4HOY",
                    }
                }, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
            });
            setLocations(response.data || []);
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
            setLocations([]);
        }
    };

    const handleSelectLocation = (location) => {
        setSelectedLocation(location);
        setLocations([]);
    };

    return (
        <PageContainer title="Hotels" description="Hotels">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <DashboardCard title="Add Hotel">
                        <Grid container spacing={2} sx={{ p: 3 }}>
                            <Box sx={{ width: '100%' }}>
                                <Stepper nonLinear activeStep={activeStep}>
                                    {steps.map((label, index) => (
                                        <Step key={label} completed={completed[index]}>
                                            <StepButton color="inherit" onClick={handleStep(index)}>
                                                {label}
                                            </StepButton>
                                        </Step>
                                    ))}
                                </Stepper>
                                <div>
                                    {allStepsCompleted() ? (
                                        <React.Fragment>
                                            <Typography sx={{ mt: 2, mb: 1 }}>
                                                All steps completed - you&apos;re finished
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                                <Box sx={{ flex: '1 1 auto' }} />
                                                <Button onClick={handleReset}>Reset</Button>
                                            </Box>
                                        </React.Fragment>
                                    ) : (
                                        <React.Fragment>

                                            {activeStep === 0 && (<React.Fragment>

                                                {/* Hotel Image Upload Section */}

                                                <Grid container spacing={2} sx={{ p: 3 }}>
                                                    <Grid item xs={12} sm={3} className="relative aspect-video" sx={{ textAlign: 'center' }}>
                                                        <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                            <img
                                                                src={profilepicture}
                                                                width="100%"
                                                                height="100%"
                                                                alt="file"
                                                                className="object-cover w-full h-full rounded-lg"
                                                            />
                                                        </label>
                                                        <input id="file-upload" type="file" onChange={handleFileChange} hidden />
                                                    </Grid>


                                                    {/* Hotel Name and Description Section */}

                                                    <Grid item xs={12} sm={9}>
                                                        <TextField
                                                            label="Hotel Name"
                                                            required
                                                            variant="outlined"
                                                            fullWidth
                                                            sx={{ mb: 2 }}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        />
                                                        <TextField
                                                            label="Description"
                                                            variant="outlined"
                                                            fullWidth
                                                            multiline
                                                            rows={3}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        />
                                                        <Typography variant="body2" color="textSecondary" fontWeight="bold" className='mt-3'>
                                                            Rating :
                                                        </Typography>
                                                        <Rating
                                                            className='m-2'
                                                            name="simple-uncontrolled"
                                                            onChange={(event, newValue) => { setFormData({ ...formData, rating: newValue }) }}
                                                            defaultValue={1}
                                                        />
                                                    </Grid>
                                                </Grid>


                                                {/* Hotel Image Upload Section */}

                                                <Grid container spacing={1} sx={{ mt: 2 }}>
                                                    <Grid item xs={12} sm={12}>
                                                        <Typography variant="h6" gutterBottom>
                                                            Upload Multiple Images
                                                        </Typography>
                                                        <Box
                                                            {...getRootProps()}
                                                            sx={{
                                                                border: "2px dashed #ccc",
                                                                borderRadius: "4px",
                                                                padding: "20px",
                                                                textAlign: "center",
                                                                cursor: "pointer",
                                                                backgroundColor: isDragActive ? "#f0f0f0" : "transparent",
                                                                marginTop: "10px"
                                                            }}
                                                        >
                                                            <input {...getInputProps()} />
                                                            <Typography variant="body1" color="textSecondary">
                                                                {isDragActive ? "Drop files here..." : "Drag and drop files here or click to upload"}
                                                            </Typography>
                                                            <Button variant="contained" sx={{ mt: 2 }}>
                                                                Select Files
                                                            </Button>
                                                        </Box>
                                                        <Grid container spacing={2} style={{ marginTop: "15px", textAlign: "center" }}>
                                                            {files.map((file, index) => (
                                                                <Grid item key={index} xs={12} sm={2} md={2}>
                                                                    <Card>
                                                                        <CardMedia
                                                                            component="img"
                                                                            width="100%"
                                                                            height="100"
                                                                            image={file.preview}
                                                                            alt={file.name}
                                                                        />
                                                                        <Button
                                                                            size="small"
                                                                            style={{ color: "red" }}
                                                                            onClick={() => handleRemoveFile(file)}
                                                                        >
                                                                            Remove
                                                                        </Button>
                                                                    </Card>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    </Grid>
                                                </Grid>


                                                {/* Hotel Details Form */}

                                                <Box sx={{ mt: 4 }}>
                                                    <form>
                                                        <Typography variant="h5" className='mb-3' gutterBottom>
                                                            Hotel Details
                                                        </Typography>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={12}>
                                                                <TextField
                                                                    label="Location"
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    sx={{ mb: 2 }}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        handleSearchLocation(value);
                                                                        setFormData({ ...formData, location: value })
                                                                    }}
                                                                />
                                                                {locations.length > 0 && (
                                                                    <div style={{ position: "relative", zIndex: 10 }}>
                                                                        {locations.map((location, index) => (
                                                                            <MenuItem
                                                                                key={index}
                                                                                onClick={() => handleSelectLocation(location)}
                                                                                style={{ cursor: "pointer" }}
                                                                            >
                                                                                {location.description}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </Grid>
                                                            {[
                                                                { label: 'Booking Price', key: 'bookingPrice' },
                                                                { label: 'Discount', key: 'discount' },
                                                                { label: 'Available Rooms', key: 'availableRooms' },
                                                            ].map((field, index) => (
                                                                <Grid item xs={12} sm={6} key={index}>
                                                                    <TextField
                                                                        label={field.label}
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        onChange={(e) =>
                                                                            handleChange(field.key, e.target.value)
                                                                        }
                                                                    />
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    </form>
                                                </Box>

                                                {/* Category Details Form */}

                                                <Box sx={{ mt: 4 }}>
                                                    <form>
                                                        {/* <Typography variant="h5" className='mb-3' gutterBottom>
                                                            Category and Facilities
                                                        </Typography> */}
                                                        <Grid container spacing={2}>
                                                            {/* <Grid item xs={12} sm={6}>
                                                                <FormControl fullWidth>
                                                                    <InputLabel>Category</InputLabel>
                                                                    <Select
                                                                        multiple
                                                                        value={categories}
                                                                        onChange={(e) => { setCategories(e.target.value) }}
                                                                        onOpen={fetchCategory}
                                                                        renderValue={(selected) => selected.join(', ')}
                                                                        label="Category"
                                                                        MenuProps={MenuProps}>
                                                                        {categoryList.map((item) => (
                                                                            <MenuItem value={item.category_name}>{item.category_name}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid> */}

                                                            {/* <Grid item xs={12} sm={6}>
                                                                <FormControl fullWidth>
                                                                    <InputLabel>Facilities</InputLabel>
                                                                    <Select
                                                                        multiple
                                                                        value={facilities}
                                                                        onChange={(e) => { setfacilities(e.target.value) }}
                                                                        onOpen={fetchFacilities}
                                                                        renderValue={(selected) => selected.join(', ')}
                                                                        label="Facilities"
                                                                        MenuProps={MenuProps}>
                                                                        {facilitiesList.map((item) => (
                                                                            <MenuItem value={item.name}>{item.name}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid> */}

                                                            <Grid item xs={12} sm={12}>
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
                                                                    <TextField
                                                                        label="Enter Tags"
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        value={tagInput}
                                                                        onChange={(e) => settagInput(e.target.value)}
                                                                        onKeyDown={handleKeyDown}
                                                                    />
                                                                    <Button
                                                                        variant="contained"
                                                                        color="primary"
                                                                        onClick={handleAddTag}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </Box>
                                                                <Box>
                                                                    {tagsList.map((item, index) => (
                                                                        <span key={index}>
                                                                            <Chip className='me-2 mb-2' label={item} variant="outlined" onDelete={() => handleRemoveItem(index)} />
                                                                        </span>
                                                                    ))}
                                                                </Box>
                                                            </Grid>

                                                        </Grid>
                                                    </form>
                                                </Box>
                                            </React.Fragment>)}

                                            {activeStep === 1 && (
                                                <React.Fragment>
                                                    <Grid container spacing={2} sx={{ p: 3 }}>
                                                        {/* Add Room Form */}

                                                        <Box sx={{ mt: 4 }}>
                                                            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                                                <Typography variant="h5" gutterBottom>
                                                                    Room Details
                                                                </Typography>
                                                                <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    onClick={() => { setRoomList([...roomList, {}]), setRoomData([...roomData, { room_category: '', area: '', floor: '', rooms: '', beds: '', bathrooms: '', guests: '', booking_price: '' }]) }}
                                                                >
                                                                    Add Rooms
                                                                </Button>
                                                            </Grid>

                                                            <Paper elevation={2} sx={{ p: 2 }}>
                                                                <Grid container spacing={2}>
                                                                    {roomList.map((_, index) => (
                                                                        <Grid key={index} item xs={12} sm={6} md={4}>
                                                                            {/* Room Details Card */}
                                                                            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                                                                                <Typography variant="subtitle1" className='mb-3' gutterBottom>
                                                                                    Room {index + 1}
                                                                                </Typography>

                                                                                <Grid container spacing={2}>
                                                                                    <Grid item xs={12} sm={12}>
                                                                                        <FormControl fullWidth>
                                                                                            <InputLabel>Category</InputLabel>
                                                                                            <Select
                                                                                                // multiple
                                                                                                value={roomData[index].room_category || ""}
                                                                                                onOpen={fetchCategory}
                                                                                                onChange={(e) => handleRoomChange(index, 'room_category', e.target.value)}
                                                                                                // renderValue={(selected) => selected.join(', ')}
                                                                                                label="Category"
                                                                                                MenuProps={MenuProps}>
                                                                                                {categoryList.map((item) => (
                                                                                                    <MenuItem value={item.category_name}>{item.category_name}</MenuItem>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </FormControl>
                                                                                    </Grid>

                                                                                    <Grid item xs={12} sm={12}>
                                                                                        <FormControl fullWidth>
                                                                                            <InputLabel>Facilities</InputLabel>
                                                                                            <Select
                                                                                                // multiple
                                                                                                value={roomData[index].facilities || ""}
                                                                                                onOpen={fetchFacilities}
                                                                                                onChange={(e) => handleRoomChange(index, 'facilities', e.target.value)}
                                                                                                // renderValue={(selected) => selected.join(', ')}
                                                                                                label="Facilities"
                                                                                                MenuProps={MenuProps}>
                                                                                                {facilitiesList.map((item) => (
                                                                                                    <MenuItem value={item.name}>{item.name}</MenuItem>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </FormControl>
                                                                                    </Grid>

                                                                                    {/* <Grid item xs={12} sm={12}>
                                                                                        <FormControl fullWidth>
                                                                                            <InputLabel>Tags</InputLabel>
                                                                                            <Select
                                                                                                // multiple
                                                                                                value={roomData[index].tags || ""}
                                                                                                onChange={(e) => handleRoomChange(index, 'tags', e.target.value)}
                                                                                                // renderValue={(selected) => selected.join(', ')}
                                                                                                label="Tags">
                                                                                                <MenuItem value="">Breakfast</MenuItem>
                                                                                                <MenuItem value="Parking">Parking</MenuItem>
                                                                                                <MenuItem value="Pool">Pool</MenuItem>
                                                                                                <MenuItem value="Spa">Spa</MenuItem>
                                                                                            </Select>
                                                                                        </FormControl>
                                                                                    </Grid> */}
                                                                                    <Grid item sm={12}>
                                                                                        {/* <Typography variant="h6" gutterBottom>
                                                                                            Room Images
                                                                                        </Typography> */}
                                                                                        <Box
                                                                                            {...getRootProps()}
                                                                                            sx={{
                                                                                                border: "2px dashed #ccc",
                                                                                                borderRadius: "4px",
                                                                                                padding: "20px",
                                                                                                textAlign: "center",
                                                                                                cursor: "pointer",
                                                                                                backgroundColor: isDragActive ? "#f0f0f0" : "transparent",
                                                                                                marginTop: "10px"
                                                                                            }}
                                                                                        >
                                                                                            <input {...getInputProps()} />
                                                                                            <Typography variant="body1" color="textSecondary">
                                                                                                {isDragActive ? "Drop files here..." : "Drag and drop files here or click to upload"}
                                                                                            </Typography>
                                                                                            <Button variant="contained" sx={{ mt: 2 }}>
                                                                                                Select Files
                                                                                            </Button>
                                                                                        </Box>
                                                                                        <Grid container spacing={2} style={{ marginTop: "15px", textAlign: "center" }}>
                                                                                            {files.map((file, index) => (
                                                                                                <Grid item key={index} xs={12} sm={3} md={3}>
                                                                                                    <Card>
                                                                                                        <CardMedia
                                                                                                            component="img"
                                                                                                            width="100%"
                                                                                                            height="100"
                                                                                                            image={file.preview}
                                                                                                            alt={file.name}
                                                                                                        />
                                                                                                        <Button
                                                                                                            size="small"
                                                                                                            style={{ color: "red" }}
                                                                                                            onClick={() => handleRemoveFile(file)}
                                                                                                        >
                                                                                                            Remove
                                                                                                        </Button>
                                                                                                    </Card>
                                                                                                </Grid>
                                                                                            ))}
                                                                                        </Grid>
                                                                                    </Grid>
                                                                                    <Grid item xs={4}>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            label="Room No"
                                                                                            placeholder='eg: 123'
                                                                                            variant="outlined"
                                                                                            margin="normal"
                                                                                            name={`room_no_${index}`}
                                                                                            onChange={(e) => handleRoomChange(index, 'room_no', e.target.value)}
                                                                                        />
                                                                                    </Grid>

                                                                                    <Grid item xs={4}>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            label="Room Area"
                                                                                            placeholder='eg: in sq ft'
                                                                                            variant="outlined"
                                                                                            margin="normal"
                                                                                            name={`room_area_${index}`}
                                                                                            onChange={(e) => handleRoomChange(index, 'area', e.target.value)}
                                                                                        />
                                                                                    </Grid>

                                                                                    <Grid item xs={4}>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            label="Floor"
                                                                                            placeholder='eg: 1'
                                                                                            variant="outlined"
                                                                                            margin="normal"
                                                                                            name={`floor_${index}`}
                                                                                            onChange={(e) => handleRoomChange(index, 'floors', e.target.value)}
                                                                                        />
                                                                                    </Grid>

                                                                                    <Grid item xs={4}>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            label="Beds"
                                                                                            placeholder='eg: 2'
                                                                                            variant="outlined"
                                                                                            margin="normal"
                                                                                            name={`beds_${index}`}
                                                                                            onChange={(e) => handleRoomChange(index, 'beds', e.target.value)}
                                                                                        />
                                                                                    </Grid>

                                                                                    <Grid item xs={4}>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            label="Bathrooms"
                                                                                            placeholder='eg: 2'
                                                                                            variant="outlined"
                                                                                            margin="normal"
                                                                                            name={`bathrooms_${index}`}
                                                                                            onChange={(e) => handleRoomChange(index, 'bathrooms', e.target.value)}
                                                                                        />
                                                                                    </Grid>

                                                                                    <Grid item xs={4}>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            label="Guests"
                                                                                            variant="outlined"
                                                                                            placeholder='eg: 1 - 5'
                                                                                            margin="normal"
                                                                                            name={`guests_${index}`}
                                                                                            onChange={(e) => handleRoomChange(index, 'guests', e.target.value)}
                                                                                        />
                                                                                    </Grid>

                                                                                    <Grid item xs={4}>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            label="Room Price"
                                                                                            placeholder='eg: $$$'
                                                                                            variant="outlined"
                                                                                            margin="normal"
                                                                                            name={`room_price_${index}`}
                                                                                            onChange={(e) => handleRoomChange(index, 'booking_price', e.target.value)}
                                                                                        />
                                                                                    </Grid>
                                                                                    <Grid item xs={12}>
                                                                                        <Button
                                                                                            fullWidth
                                                                                            variant="contained"
                                                                                            onClick={(e) => handleRoomSubmit(e)}
                                                                                        >Save</Button>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </Box>
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                            </Paper>
                                                        </Box>
                                                    </Grid>
                                                </React.Fragment>
                                            )}

                                            {/* Third Step: Completed */}
                                            {activeStep === 2 && (
                                                <React.Fragment>
                                                    <Grid container spacing={2} sx={{ p: 3 }}>
                                                        <Box sx={{ mt: 4, width: '100%' }}>
                                                            <form>
                                                                <Typography variant="h5" className='mb-3' gutterBottom>
                                                                    Owner and Support Details
                                                                </Typography>
                                                                <Grid container spacing={2}>
                                                                    {[
                                                                        { label: 'Owner Name', key: 'ownername', group: 'owner' },
                                                                        { label: 'Owner Contact', key: 'ownercontact', group: 'owner' },
                                                                        { label: 'Owner Email', key: 'owneremail', group: 'owner' },
                                                                    ].map((field, index) => (
                                                                        <Grid item xs={12} sm={6} key={index}>
                                                                            <TextField
                                                                                label={field.label}
                                                                                variant="outlined"
                                                                                fullWidth
                                                                                onChange={(e) =>
                                                                                    handleOwnerDataChange(field.key, e.target.value)
                                                                                }
                                                                            />
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                                <Grid container spacing={2} className='mt-3'>
                                                                    {[
                                                                        { label: 'Support Contact', key: 'supportcontac', group: 'support' },
                                                                        { label: 'Support Email', key: 'supportemail', group: 'support' },
                                                                    ].map((field, index) => (
                                                                        <Grid item xs={12} sm={6} key={index}>
                                                                            <TextField
                                                                                label={field.label}
                                                                                variant="outlined"
                                                                                fullWidth
                                                                                onChange={(e) =>
                                                                                    handleOwnerDataChange(field.key, e.target.value)
                                                                                }
                                                                            />
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                            </form>
                                                        </Box>
                                                    </Grid>
                                                </React.Fragment>
                                            )}

                                            {/* Fourth Step: Preview */}
                                            {activeStep === 3 && (
                                                <React.Fragment>
                                                    <Grid container spacing={2} sx={{ p: 3 }}>
                                                        {/* English */}
                                                        <Grid item xs={12} sm={6}>
                                                            <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', height: '100%' }}>
                                                                {isLoading ? (<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress size={25} /> <Typography sx={{ ml: 2 }}>Fetching Details...</Typography> </Box>) : (
                                                                    <Paper elevation={2} sx={{ p: 3 }}>
                                                                        <Typography variant="h4" component="h2" sx={{ color: 'black', mb: 2 }}>
                                                                            {hotelPreview.name}
                                                                            <Typography variant="h4" component="span" sx={{ float: 'right', color: '#2196f3' }}>
                                                                                {hotelPreview.id}
                                                                            </Typography>
                                                                        </Typography>
                                                                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                                                            {hotelPreview.location},{hotelPreview.locationName}
                                                                        </Typography>

                                                                        <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                                                                            <Grid item xs={4}>
                                                                                <Typography variant="body2">4 beds</Typography>
                                                                            </Grid>
                                                                            <Grid item xs={4}>
                                                                                <Typography variant="body2">3 baths</Typography>
                                                                            </Grid>
                                                                            <Grid item xs={4}>
                                                                                <Typography variant="body2">4,460 sq. ft.</Typography>
                                                                            </Grid>
                                                                        </Grid>

                                                                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Description</Typography>
                                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                                            {hotelPreview.description}
                                                                        </Typography>
                                                                    </Paper>)}
                                                            </Box>
                                                        </Grid>

                                                        {/* Arabic */}
                                                        <Grid item xs={12} sm={6}>
                                                            <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', height: '100%' }}>
                                                                {isLoading ? (<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress size={25} /> <Typography sx={{ ml: 2 }}>Fetching Details...</Typography> </Box>) : (
                                                                    <Paper elevation={2} sx={{ p: 3 }}>
                                                                        <Typography variant="h4" component="h2" sx={{ color: 'black', mb: 2 }}>
                                                                            {hotelPreview.name}
                                                                            <Typography variant="h4" component="span" sx={{ float: 'right', color: '#2196f3' }}>
                                                                                {hotelPreview.id}
                                                                            </Typography>
                                                                        </Typography>
                                                                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                                                            {hotelPreview.location},{hotelPreview.locationName}
                                                                        </Typography>

                                                                        <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                                                                            <Grid item xs={4}>
                                                                                <Typography variant="body2">4 beds</Typography>
                                                                            </Grid>
                                                                            <Grid item xs={4}>
                                                                                <Typography variant="body2">3 baths</Typography>
                                                                            </Grid>
                                                                            <Grid item xs={4}>
                                                                                <Typography variant="body2">4,460 sq. ft.</Typography>
                                                                            </Grid>
                                                                        </Grid>

                                                                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Description</Typography>
                                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                                            {hotelPreview.description}
                                                                        </Typography>
                                                                    </Paper>)}
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </React.Fragment>
                                            )}

                                            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                                <Button
                                                    color="inherit"
                                                    disabled={activeStep === 0}
                                                    onClick={handleBack}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Back
                                                </Button>
                                                <Box sx={{ flex: '1 1 auto' }} />
                                                <Button
                                                    onClick={(e) => { if (activeStep === 3) { handleNavigateToHotelList() } else { handleNext(e) } }} sx={{ mr: 1 }}>
                                                    {activeStep == 3 ? "Back To List" : "Next"}
                                                </Button>
                                            </Box>
                                        </React.Fragment>
                                    )}
                                </div>
                            </Box>
                        </Grid>

                    </DashboardCard>
                </Grid>
            </Grid >
        </PageContainer >

    );
};

export default AddHotel;
