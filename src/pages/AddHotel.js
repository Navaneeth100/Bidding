import React, { useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import BlankCard from 'src/components/shared/BlankCard';
import ProductPerformance from '../views/dashboard/components/ProductPerformance';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, InputLabel, MenuItem, Select, TextField, IconButton, Badge, Paper, CircularProgress, List, ListItem, ListItemText, Chip, ListItemButton, Avatar } from '@mui/material';
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
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import '../App.css'

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
    const [selectedProimg, setselectedProimg] = useState(null)

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        setselectedProimg(file)
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
    const [files1, setFiles1] = useState([]);

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

        if (responseSuccess || activeStep === 1) {
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
        if (formData.name && formData.description && formData.rating && selectedLocation) {
            event.preventDefault();
            let submitData = {
                name: formData.name,
                description: formData.description,
                // pro_img: profilepicture,
                rating: `${formData.rating}`,
                locationName: selectedLocation,
                location: selectedLocation,
                booking_price: formData.bookingPrice,
                discount: formData.discount,
                available_rooms: formData.availableRooms,
                // hotel_room_categories: categories.map(name => parseInt(categoryList.find(item => item.category_name === name)?.id)),
                tags: tagsList,
                facilities: facilities.map(name => parseInt(facilitiesList.find(item => item.name === name)?.id)),
                images: files,
                // owner_name: "null",
                // owner_contact_number: "null",
                // owner_email: "stayhotel@gmail.com",
                loc_gis: markerPosition,
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
        // const isRoomDataValid = roomData.every((room) => Object.values(room).every((value) => String(value).trim() !== ''));
        if (roomId) {
            event.preventDefault();
            // const updatedRoomData = roomData.map((room) => ({
            //     ...room,
            //     room_category: categoryList.find((category) => category.category_name === room.room_category)?.id,
            //     excluded_days: formattedDates,
            // }));
            // setRoomData(updatedRoomData);

            let submitData = {
                room_category: categoryList.find((category) => category.category_name === roomData[0].room_category)?.id,
                area: roomData[0].area,
                floors: roomData[0].floors,
                beds: roomData[0].beds,
                bathrooms: roomData[0].bathrooms,
                guests: roomData[0].guests,
                booking_price: roomData[0].booking_price,
                rooms: roomData[0].room_no,
                available_rooms:roomData[0].room_no,
                excluded_days:formattedDates
            }

            try {
                const response = await axios.post(`${url}/hotel/hotels/${roomId}/room-categories/`, submitData, {
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
            .get(`${url}/hotel/updatehotels/${roomId}/`, {
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
                        .get(`${url}/hotel/updatehotels/${roomId}/`, { headers: new_headers })
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

    useEffect(() => {
        if (hotelPreview != {}) {
            translateText()
        }
    }, [hotelPreview])



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

    const [locationModal, setlocationModal] = useState(false)
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleSearchLocation = (location) => {
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions({ input: location }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setLocations(predictions);
            } else {
                setLocations([]);
            }
        });
    };

    const handleSelectLocation = (location) => {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));

        service.getDetails({ placeId: location.place_id }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const { lat, lng } = place.geometry.location;
                setMarkerPosition({ lat: lat(), lng: lng() });
                setCenter({ lat: lat(), lng: lng() });
                setLocations([]);
            }
            else {
                console.error('Error fetching place details:', status);
            }
        });
    };


    const [markerPosition, setMarkerPosition] = useState({ lat: 25.2048, lng: 55.2708 });

    useEffect(() => {
        const fetchLocation = async () => {
            if (markerPosition.lat && markerPosition.lng && !isNaN(markerPosition.lat) && !isNaN(markerPosition.lng)) {
                try {
                    const geocoderUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${markerPosition.lat},${markerPosition.lng}&key=AIzaSyAVPUw1ZmigH0aqgcAjTbYY2IE72Gu4HOY`; // Replace with your API key
                    const response = await fetch(geocoderUrl);
                    const data = await response.json();

                    if (data.status === 'OK') {
                        setSelectedLocation(data.results[0].formatted_address);
                    } else {
                        // console.error('Failed to get location from geocoder');
                    }
                } catch (err) {
                    // console.error('Error fetching location:', err);
                    // console.error(err.message);
                }
            } else {
                // console.error('Geolocation is not supported by your browser');
            }
        };

        fetchLocation();
    }, [markerPosition]);

    const [center, setCenter] = useState({ lat: 25.2048, lng: 55.2708 });

    const handleMarkerDragEnd = (e) => {
        setMarkerPosition({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        });
    };

    // Google Translation

    const [translatedHotelPreview, setTranslatedHotelPreview] = useState([]);
    const [translateLoading, settranslateLoading] = useState(false)

    const apiKey = "AIzaSyBWbDIh2SzBRw_RuV_UHwDAZb6DhEyB-3g"; // Replace with your API key

    const translateText = async () => {

        const apiUrl = `https://translation.googleapis.com/language/translate/v2`;
        settranslateLoading(true)
        try {
            // Collect all translatable fields (strings and string arrays)
            const translatableTexts = [];
            const keysMap = []; // To track keys and indices for rebuilding the structure

            for (const [key, value] of Object.entries(hotelPreview)) {
                if (typeof value === "string") {
                    translatableTexts.push(value);
                    keysMap.push({ key, type: "string" });
                } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (typeof item === "string") {
                            translatableTexts.push(item);
                            keysMap.push({ key, type: "array", index });
                        }
                    });
                }
            }

            // Make a single API call for all texts
            const response = await axios.post(
                apiUrl,
                {},
                {
                    params: {
                        key: apiKey,
                        q: translatableTexts.join("|||"), // Use a delimiter
                        target: "ar", // Arabic language code
                        source: "en", // English language code
                    },
                }
            );

            // Split the translated response and rebuild the structure
            const translatedTexts = response.data.data.translations[0].translatedText.split("|||");
            const translations = { ...hotelPreview };

            translatedTexts.forEach((translatedText, index) => {
                const { key, type, idx } = keysMap[index];
                if (type === "string") {
                    translations[key] = translatedText;
                } else if (type === "array") {
                    translations[key][idx] = translatedText;
                }
            });

            setTranslatedHotelPreview(translations);
            settranslateLoading(false)
        } catch (error) {
            console.error("Error during translation:", error);
        }
    };

    //  arabic data submit

    const translateTags = async (tags) => {
        try {
            const requests = tags.map((tag) =>
                axios.post(
                    `https://translation.googleapis.com/language/translate/v2`,
                    null,
                    {
                        params: {
                            q: tag,
                            target: "ar", // Arabic language code
                            key: apiKey,
                        },
                    }
                )
            );
            const responses = await Promise.all(requests);
            const translatedTextArray = responses.map(
                (response) => response.data.data.translations[0].translatedText
            );
            console.log(translatedTextArray);

            return translatedTextArray;
        } catch (error) {
            console.error("Error translating:", error);
            return "";
        }
    };

    const handleArabicSubmit = async (event) => {
        event.preventDefault();
        let submitData = {
            name_ar: translatedHotelPreview.name,
            description_ar: translatedHotelPreview.description,
            locationName_ar: translatedHotelPreview.locationName,
            owner_name_ar: translatedHotelPreview.owner_name,
            tags_ar: translateTags(translatedHotelPreview.tags)
        };
        try {
            const response = await axios.put(`${url}/hotel/updatehotels/${roomId}/?data=ar`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: false,
            });
        } catch (error) {

        } finally {
            handleNavigateToHotelList()
        }
    };

    // Dates

    const [selectedDates, setSelectedDates] = useState([]);

    const handleDateChange = (date) => {
        // If the clicked date is already selected, remove it
        if (selectedDates.some((d) => d.getTime() === date.getTime())) {
            setSelectedDates(selectedDates.filter((d) => d.getTime() !== date.getTime()));
        } else {
            // Otherwise, add it to the selected dates array
            setSelectedDates([...selectedDates, date]);
        }
    };

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };

    // Create an array of formatted dates
    const formattedDates = selectedDates.map((date) => formatDate(date));
    

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
                                                                <Box className="mt-3 mb-3" >
                                                                    <TextField
                                                                        label="Location"
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        sx={{ mb: 2 }}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            handleSearchLocation(value);
                                                                            setFormData({ ...formData, locationName: value })
                                                                        }}
                                                                    />
                                                                    {locations.length > 0 && (
                                                                        <List>
                                                                            {locations.map((location) => (
                                                                                <ListItem key={location.place_id}>
                                                                                    <ListItemButton onClick={() => handleSelectLocation(location)}>
                                                                                        <Typography>{location.description}</Typography>
                                                                                    </ListItemButton>
                                                                                </ListItem>
                                                                            ))}
                                                                        </List>
                                                                    )}
                                                                    <Typography variant="h6" className='mb-3' gutterBottom>
                                                                        Selected Location : {selectedLocation}
                                                                    </Typography>
                                                                    <LoadScript googleMapsApiKey="AIzaSyAVPUw1ZmigH0aqgcAjTbYY2IE72Gu4HOY" libraries={['places']}>
                                                                        <GoogleMap
                                                                            mapContainerStyle={{ height: '400px', width: '100%' }}
                                                                            zoom={15}
                                                                            center={center}
                                                                        >
                                                                            <Marker position={markerPosition}
                                                                                draggable={true}
                                                                                onDragEnd={handleMarkerDragEnd}
                                                                            />
                                                                        </GoogleMap>
                                                                    </LoadScript>
                                                                </Box>
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
                                                                        type="number"
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

                                                            <Grid item xs={12} sm={12}>
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
                                                            </Grid>

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
                                                                    onClick={() => { setRoomList([...roomList, {}]), setRoomData([]) , setSelectedDates([]) }}
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

                                                                                    {/* <Grid item xs={12} sm={12}>
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
                                                                                    </Grid> */}

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
                                                                                            {files1.map((file, index) => (
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
                                                                                        <Calendar
                                                                                            onChange={handleDateChange}
                                                                                            value={selectedDates}
                                                                                            selectRange={false}
                                                                                            tileClassName={({ date, view }) => {
                                                                                                // Add inline styles to the selected dates
                                                                                                if (selectedDates.some((d) => d.getTime() === date.getTime())) {
                                                                                                    return 'selected-date';  // Use a class to apply inline styles later
                                                                                                }
                                                                                                return '';
                                                                                            }}
                                                                                            tileContent={({ date, view }) => {
                                                                                                if (selectedDates.some((d) => d.getTime() === date.getTime())) {
                                                                                                    return (
                                                                                                        <div
                                                                                                            style={{
                                                                                                                backgroundColor: 'red',
                                                                                                                color: 'white',
                                                                                                                borderRadius: '50%',
                                                                                                                width: '20px',
                                                                                                                height: '20px',
                                                                                                                textAlign: 'center',
                                                                                                                lineHeight: '20px',
                                                                                                                margin: 'auto',
                                                                                                            }}
                                                                                                        >
                                                                                                           X
                                                                                                        </div>
                                                                                                    );
                                                                                                }
                                                                                                return '';
                                                                                            }}
                                                                                        />
                                                                                        {/* {selectedDates.map((date, index) => (
                                                                                            <li key={index}>{date.toDateString()}</li>
                                                                                        ))} */}
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
                                                            <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', height: '100%', minHeight: "500px" }}>
                                                                {isLoading ? (<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress size={25} /> <Typography sx={{ ml: 2 }}>Fetching Details...</Typography> </Box>) : (
                                                                    <Paper elevation={2} sx={{ p: 3 }}>
                                                                        <Typography variant="h4" component="h2" sx={{ color: 'black', mb: 1 }}>
                                                                            {hotelPreview.name}
                                                                            <Typography variant="h4" component="span" sx={{ float: 'right', color: '#2196f3' }}>
                                                                                {hotelPreview.id}
                                                                            </Typography>
                                                                        </Typography>
                                                                        <Typography className='mb-2'>
                                                                            <Rating name="read-only" value={hotelPreview.rating} readOnly />
                                                                        </Typography>
                                                                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                                                            {hotelPreview.location},{hotelPreview.locationName}
                                                                        </Typography>

                                                                        <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
                                                                            {hotelPreview.facilities?.map((facilities, index) => (
                                                                                <Grid item xs={4} key={index}>
                                                                                    <Chip
                                                                                        avatar={<Avatar alt="" src={`${url}/hotel/media/${facilities[1]}`} />}
                                                                                        label={facilities[0]}
                                                                                        variant="outlined"
                                                                                    />
                                                                                </Grid>
                                                                            ))}
                                                                        </Grid>

                                                                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Description</Typography>
                                                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                                                            {hotelPreview.description}
                                                                        </Typography>

                                                                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Owner Details</Typography>
                                                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                                                            {hotelPreview.owner_name}<br />
                                                                            {hotelPreview.owner_email}<br />
                                                                            {hotelPreview.owner_contact_number}
                                                                        </Typography>
                                                                    </Paper>)}
                                                            </Box>
                                                        </Grid>

                                                        {/* Arabic */}
                                                        <Grid item xs={12} sm={6}>
                                                            <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', height: '100%', minHeight: "500px" }}>
                                                                {translateLoading ? (<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress size={25} /> <Typography sx={{ ml: 2 }}>Fetching Details...</Typography> </Box>) : (
                                                                    <Paper elevation={2} sx={{ p: 3 }}>
                                                                        <Typography variant="h4" component="h2" sx={{ color: 'black', mb: 1 }}>
                                                                            {translatedHotelPreview.name}
                                                                            <Typography variant="h4" component="span" sx={{ float: 'right', color: '#2196f3' }}>
                                                                                {translatedHotelPreview.id}
                                                                            </Typography>
                                                                        </Typography>
                                                                        <Typography className='mb-2'>
                                                                            <Rating name="read-only" value={translatedHotelPreview.rating} readOnly />
                                                                        </Typography>
                                                                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                                                            {translatedHotelPreview.location},{translatedHotelPreview.locationName}
                                                                        </Typography>

                                                                        <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
                                                                            {translatedHotelPreview.facilities?.map((facilities, index) => (
                                                                                <Grid item xs={4} key={index}>
                                                                                    <Chip
                                                                                        avatar={<Avatar alt="" src={`${url}/hotel/media/${facilities[1]}`} />}
                                                                                        label={facilities[0]}
                                                                                        variant="outlined"
                                                                                    />
                                                                                </Grid>
                                                                            ))}
                                                                        </Grid>

                                                                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Description</Typography>
                                                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                                                            {translatedHotelPreview.description}
                                                                        </Typography>

                                                                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Owner Details</Typography>
                                                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                                                            {translatedHotelPreview.owner_name}<br />
                                                                            {translatedHotelPreview.owner_email}<br />
                                                                            {translatedHotelPreview.owner_contact_number}
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
                                                    disabled={activeStep === 0 || activeStep === 3}
                                                    onClick={handleBack}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Back
                                                </Button>
                                                <Box sx={{ flex: '1 1 auto' }} />
                                                <Button
                                                    onClick={(e) => { if (activeStep === 3) { handleArabicSubmit(e) } else { handleNext(e) } }} sx={{ mr: 1 }}>
                                                    {activeStep == 3 ? "Finish" : "Next"}
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

            <Dialog
                open={locationModal}
                onClose={() => setlocationModal(false)}
                maxWidth="sm"
                fullWidth
                sx={{ padding: 4 }}
            >
                <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }} id="customized-dialog-title">
                    Add Location
                    <IconButton aria-label="close" onClick={() => toggleModal('add')} sx={{ position: 'absolute', right: 8, top: 8 }}>x</IconButton>
                </DialogTitle>

                <DialogContent sx={{ padding: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item md={6} xs={6}>
                            <Box className="mt-3 mb-3" >
                                <TextField
                                    label="Location"
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleSearchLocation(value);
                                        setFormData({ ...formData, locationName: value })
                                    }}
                                />
                                <Typography variant="h6" className='mb-3' gutterBottom>
                                    Selected Location : {selectedLocation}
                                </Typography>
                                <LoadScript googleMapsApiKey="AIzaSyAVPUw1ZmigH0aqgcAjTbYY2IE72Gu4HOY" libraries={['places']}>
                                    <GoogleMap
                                        mapContainerStyle={{ height: '400px', width: '100%' }}
                                        zoom={15}
                                        center={center}
                                    >
                                        <Marker position={markerPosition}
                                            draggable={true}
                                            onDragEnd={handleMarkerDragEnd}
                                        />
                                    </GoogleMap>
                                </LoadScript>
                            </Box>
                        </Grid>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: 4 }}
                        >
                            Submit
                        </Button>
                    </Grid>
                </DialogContent>
            </Dialog>
        </PageContainer >

    );
};

export default AddHotel;
