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
    const [fileuploadmode, setfileuploadmode] = useState(null)

    const onDrop = (acceptedFiles) => {
        const updatedFiles = acceptedFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file), // Create a preview URL for each file
            })
        );
        fileuploadmode == "hotel" ? setFiles((prevFiles) => [...prevFiles, ...updatedFiles]) : setFiles1((prevFiles) => [...prevFiles, ...updatedFiles]);
    };

    const handleRemoveFile = (fileToRemove) => {
        setFiles(files.filter((file) => file !== fileToRemove));
    };

    const handleRemoveRoomFile = (fileToRemove) => {
        setFiles1(files1.filter((file) => file !== fileToRemove));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: "image/*,application/pdf", // Accept images and PDFs
        multiple: true, // Allow multiple files
    });


    const [categories, setCategories] = useState([]);
    const [facilities, setfacilities] = useState([]);
    const [propertytype, setpropertytype] = useState([])
    const [emirates, setemirates] = useState([])
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

            if (activeStep === 1 && addedRoom.length === 0) {
                toast.error("Please Add at least One Room to Proceed.", {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                });
                return;
            }

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

    // get facilites

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
                location: `${markerPosition.lat},${markerPosition.lng}`,
                booking_price: formData.bookingPrice,
                discount: formData.discount,
                available_rooms: formData.availableRooms,
                h_category: categories.map(name => parseInt(categoryList.find(item => item.category_name === name)?.id)),
                tags: tagsList,
                propertytype: propertytype,
                others: propertytype == "Others" ? formData.others : null,
                emirates: emirates,
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
                        "Content-Type": "multipart/form-data",
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

    const [roomData, setRoomData] = useState([]);

    const handleRoomChange = (field, value) => { setRoomData((prev) => ({ ...prev, [field]: value })) };

    const [addedRoom, setaddedRoom] = useState([])

    const fetchAddedRooms = (id) => {
        axios
            .get(`${url}/hotel/hotels/${id}/room-categories/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {
                setaddedRoom(res.data);
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
                        .get(`${url}/hotel/hotels/${id}/room-categories/`, { headers: new_headers })
                        .then((res) => {
                            setaddedRoom(res.data);
                        });
                });
            });
    };

    // Translate Room Name

    const translateRoomName = async (text) => {
        if (!text) return;
        try {
            const response = await axios.post(
                `https://translation.googleapis.com/language/translate/v2`,
                null,
                {
                    params: {
                        q: text,
                        target: "ar",
                        key: apiKey,
                    },
                }
            );
            const translatedText = response.data.data.translations[0].translatedText;
            return translatedText;
        } catch (error) {
            console.error("Translation Error:", error);
        }
    };

    const handleRoomSubmit = async (event) => {
        // const isRoomDataValid = roomData.every((room) => Object.values(room).every((value) => String(value).trim() !== ''));
        if (roomId) {
            event.preventDefault();
            const translatedRoomName = await translateRoomName(roomData.room_name);
            let submitData = {
                // room_category: categoryList.find((category) => category.category_name === roomData.room_category)?.id,
                room_name: roomData.room_name,
                room_name_ar: translatedRoomName,
                // area: roomData.area,
                // floors: roomData.floors,
                // beds: roomData.beds,
                // bathrooms: roomData.bathrooms,
                // guests: roomData.guests,
                booking_price: roomData.booking_price,
                // rooms: roomData.room_no,
                // available_rooms: roomData.room_no,
                excluded_days: formattedDates,
                bf: roomData.withbreakfast,
                hotelroomimgs: files1
            }

            try {
                const response = await axios.post(`${url}/hotel/hotels/${roomId}/room-categories/`, submitData, {
                    headers: {
                        Authorization: `Bearer ${tokenStr}`,
                        "Content-Type": "multipart/form-data",
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
                setRoomData([])
                setSelectedDates([])
                setFiles1([])
                fetchAddedRooms(roomId)
                if (response.status === 200) {
                    // return true;
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error(`${error?.response?.data?.error}`, {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                });
            } finally {
            }
        }
        // else {
        //     toast.error('Please Fill the Fields Completely...', {
        //         position: 'top-right',
        //         autoClose: 3000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         theme: 'colored',
        //     });
        // }

    };


    //  Add Owner Details

    const [ownerData, setOwnerData] = useState([])

    const handleOwnerDataChange = (field, value) => { setOwnerData((prev) => ({ ...prev, [field]: value })) };

    const handleOwnerDetailSubmit = async (event) => {
        if (ownerData.ownername && ownerData.supportcontact && ownerData.owneremail) {
            event.preventDefault();
            let submitData = {
                owner_name: ownerData.ownername,
                owner_contact_number: contactsList,
                owner_whatsapp_number: whatsappcontactsList,
                owner_email: ownerData.owneremail,
                support_email: ownerData.supportemail,
                support_contact_number: ownerData.supportcontact,
                support_whatsapp_number: ownerData.supportwhatsapp,
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


    useEffect(() => {
        if (activeStep == 0) {
            setfileuploadmode("hotel")
        }
        else if (activeStep == 1) {
            setfileuploadmode("room")
        }
        else {
            setfileuploadmode(null)
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

    // Contact Adds

    const [contactinput, setcontactInput] = useState("");
    const [contactsList, setcontactList] = useState([]);

    const handleAddContact = () => {
        if (contactinput.trim() !== "") {
            setcontactList((prevItems) => [...prevItems, contactinput]);
            setcontactInput("");
        }
    };

    const handleRemoveContact = (indexToRemove) => {
        setcontactList((prevItems) => prevItems.filter((_, index) => index !== indexToRemove));
    };

    const handleContactKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddContact();
        }
    };

    // WhatsApp Contact Adds

    const [whatsappcontactinput, setwhatsappcontactInput] = useState("");
    const [whatsappcontactsList, setwhatsappcontactList] = useState([]);

    const handleAddWhatsappContact = () => {
        if (whatsappcontactinput.trim() !== "") {
            setwhatsappcontactList((prevItems) => [...prevItems, whatsappcontactinput]);
            setwhatsappcontactInput("");
        }
    };

    const handleRemoveWhatsappContact = (indexToRemove) => {
        setwhatsappcontactList((prevItems) => prevItems.filter((_, index) => index !== indexToRemove));
    };

    const handlewhatsappContactKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddWhatsappContact();
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

        if (!tags || tags.length === 0) return [];

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
        const translatedTags = await translateTags(translatedHotelPreview.tags);
        let submitData = {
            name_ar: translatedHotelPreview.name,
            description_ar: translatedHotelPreview.description,
            locationName_ar: translatedHotelPreview.locationName,
            owner_name_ar: translatedHotelPreview.owner_name,
            tags_ar: translatedTags
        };
        try {
            const response = await axios.put(`${url}/hotel/updatehotels/${roomId}/?data=ar`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
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
                                            <StepButton color="inherit"
                                            // onClick={handleStep(index)}
                                            >
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

                                                <Grid container spacing={2} sx={{ p: 3, mt: 1 }}>
                                                    {/* <Grid item xs={12} sm={3} className="relative aspect-video" sx={{ textAlign: 'center' }}>
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
                                                    </Grid> */}


                                                    {/* Hotel Name and Description Section */}

                                                    <Grid item xs={12} sm={12}>
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
                                                            size='large'
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
                                                                    <LoadScript googleMapsApiKey="AIzaSyBWbDIh2SzBRw_RuV_UHwDAZb6DhEyB-3g" libraries={['places']}>
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
                                                                <Grid item xs={6} sm={6} key={index}>
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
                                                            <Grid item xs={6}>
                                                                <FormControl fullWidth>
                                                                    <InputLabel>Property Type</InputLabel>
                                                                    <Select
                                                                        value={propertytype}
                                                                        onChange={(e) => { setpropertytype(e.target.value) }}
                                                                        // renderValue={(selected) => selected.join(', ')}
                                                                        label="Property Type"
                                                                        MenuProps={MenuProps}>
                                                                        <MenuItem value="Hotels">Hotels</MenuItem>
                                                                        <MenuItem value="Apartments">Apartments</MenuItem>
                                                                        <MenuItem value="Resorts">Resorts</MenuItem>
                                                                        <MenuItem value="Villas">Villas</MenuItem>
                                                                        <MenuItem value="Others">Others</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
                                                            {propertytype == "Others" && <>
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Others"
                                                                        placeholder='Others'
                                                                        variant="outlined"
                                                                        type='text'
                                                                        name="others"
                                                                        onChange={(e) => handleChange('others', e.target.value)}
                                                                    />
                                                                </Grid></>}
                                                            <Grid item xs={6}>
                                                                <FormControl fullWidth>
                                                                    <InputLabel>Emirates</InputLabel>
                                                                    <Select
                                                                        value={emirates}
                                                                        onChange={(e) => { setemirates(e.target.value) }}
                                                                        // renderValue={(selected) => selected.join(', ')}
                                                                        label="Emirates"
                                                                        MenuProps={MenuProps}>
                                                                        <MenuItem value="Dubai">Dubai</MenuItem>
                                                                        <MenuItem value="Abu Dhabi">Abu Dhabi</MenuItem>
                                                                        <MenuItem value="Sharjah">Sharjah</MenuItem>
                                                                        <MenuItem value="Ajman">Ajman</MenuItem>
                                                                        <MenuItem value="Fujeirah">Fujeirah</MenuItem>
                                                                        <MenuItem value="RAK">RAK</MenuItem>
                                                                        <MenuItem value="UAQ">UAQ</MenuItem>
                                                                        <MenuItem value="Al Ain">Al Ain</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
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
                                                            <Grid item xs={12} sm={12}>
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
                                                            </Grid>

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
                                                    <Grid container spacing={2} sx={{ p: 3, mt: 1 }}>
                                                        {/* Add Room Form */}

                                                        <Box sx={{ mt: 4 }}>
                                                            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                                                <Typography variant="h5" gutterBottom>
                                                                    Room Details
                                                                </Typography>
                                                                {/* <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    onClick={() => { setRoomList([...roomList, {}]), setRoomData([]), setSelectedDates([]) }}
                                                                >
                                                                    Add Rooms
                                                                </Button> */}
                                                            </Grid>

                                                            <Paper elevation={2} sx={{ p: 2 }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item sm={6} >
                                                                        {/* Room Details Card */}
                                                                        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                                                                            <Typography variant="subtitle1" className='mb-3' gutterBottom>
                                                                                Add Room Details
                                                                            </Typography>

                                                                            <Grid container spacing={2}>
                                                                                {/* <Grid item xs={12} sm={12}>
                                                                                    <FormControl fullWidth>
                                                                                        <InputLabel>Category</InputLabel>
                                                                                        <Select
                                                                                            // multiple
                                                                                            value={roomData.room_category || ""}
                                                                                            onOpen={fetchCategory}
                                                                                            onChange={(e) => handleRoomChange('room_category', e.target.value)}
                                                                                            // renderValue={(selected) => selected.join(', ')}
                                                                                            label="Category"
                                                                                            MenuProps={MenuProps}>
                                                                                            {categoryList.map((item) => (
                                                                                                <MenuItem value={item.category_name}>{item.category_name}</MenuItem>
                                                                                            ))}
                                                                                        </Select>
                                                                                    </FormControl>
                                                                                </Grid> */}

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

                                                                                <Grid item xs={12}>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        label="Room Name"
                                                                                        placeholder='Room Name'
                                                                                        variant="outlined"
                                                                                        type='text'
                                                                                        margin="normal"
                                                                                        value={roomData.room_name ? roomData.room_name : ''}
                                                                                        name="room_name"
                                                                                        onChange={(e) => handleRoomChange('room_name', e.target.value)}
                                                                                    />
                                                                                </Grid>
                                                                                {/* <Grid item xs={12}>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    label="Room Name in Arabic"
                                                                                    placeholder='Room Name in Arabic'
                                                                                    variant="outlined"
                                                                                    type='text'
                                                                                    margin="normal"
                                                                                    value={roomData.room_name_ar ? roomData.room_name_ar : ''}
                                                                                    name="room_name_ar"
                                                                                    onChange={(e) => handleRoomChange('room_name_ar', e.target.value)}
                                                                                />
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
                                                                                                        onClick={() => handleRemoveRoomFile(file)}
                                                                                                    >
                                                                                                        Remove
                                                                                                    </Button>
                                                                                                </Card>
                                                                                            </Grid>
                                                                                        ))}
                                                                                    </Grid>
                                                                                </Grid>
                                                                                {/* <Grid item xs={4}>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        label="Room No"
                                                                                        placeholder='eg: 123'
                                                                                        variant="outlined"
                                                                                        type='text'
                                                                                        margin="normal"
                                                                                        value={roomData.room_no ? roomData.room_no : ''}
                                                                                        name="room_no"
                                                                                        onChange={(e) => handleRoomChange('room_no', e.target.value)}
                                                                                    />
                                                                                </Grid>

                                                                                <Grid item xs={4}>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        label="Room Area"
                                                                                        placeholder='eg: in sq ft'
                                                                                        variant="outlined"
                                                                                        type='number'
                                                                                        value={roomData.area ? roomData.area : ''}
                                                                                        margin="normal"
                                                                                        name="room_area"
                                                                                        onChange={(e) => handleRoomChange('area', e.target.value)}
                                                                                    />
                                                                                </Grid>

                                                                                <Grid item xs={4}>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        label="Floor"
                                                                                        placeholder='eg: 1'
                                                                                        variant="outlined"
                                                                                        type='number'
                                                                                        value={roomData.floors ? roomData.floors : ''}
                                                                                        margin="normal"
                                                                                        name="floor"
                                                                                        onChange={(e) => handleRoomChange('floors', e.target.value)}
                                                                                    />
                                                                                </Grid>

                                                                                <Grid item xs={4}>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        label="Beds"
                                                                                        placeholder='eg: 2'
                                                                                        variant="outlined"
                                                                                        type='number'
                                                                                        value={roomData.beds ? roomData.beds : ''}
                                                                                        margin="normal"
                                                                                        name="beds"
                                                                                        onChange={(e) => handleRoomChange('beds', e.target.value)}
                                                                                    />
                                                                                </Grid>

                                                                                <Grid item xs={4}>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        label="Bathrooms"
                                                                                        placeholder='eg: 2'
                                                                                        variant="outlined"
                                                                                        type='number'
                                                                                        value={roomData.bathrooms ? roomData.bathrooms : ''}
                                                                                        margin="normal"
                                                                                        name="bathrooms"
                                                                                        onChange={(e) => handleRoomChange('bathrooms', e.target.value)}
                                                                                    />
                                                                                </Grid>

                                                                                <Grid item xs={4}>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        label="Guests"
                                                                                        variant="outlined"
                                                                                        placeholder='eg: 1 - 5'
                                                                                        margin="normal"
                                                                                        type='number'
                                                                                        value={roomData.guests ? roomData.guests : ''}
                                                                                        name="guests"
                                                                                        onChange={(e) => handleRoomChange('guests', e.target.value)}
                                                                                    />
                                                                                </Grid> */}

                                                                                <Grid item xs={4}>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        label="Room Price"
                                                                                        placeholder='eg: $$$'
                                                                                        variant="outlined"
                                                                                        type='number'
                                                                                        value={roomData.booking_price ? roomData.booking_price : ''}
                                                                                        margin="normal"
                                                                                        name="booking_price"
                                                                                        onChange={(e) => handleRoomChange('booking_price', e.target.value)}
                                                                                    />
                                                                                </Grid>
                                                                                <Grid item xs={4}>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        label="With Breakfast"
                                                                                        type='number'
                                                                                        variant="outlined"
                                                                                        placeholder='eg: 1 - 5'
                                                                                        value={roomData.withbreakfast ? roomData.withbreakfast : ''}
                                                                                        margin="normal"
                                                                                        name="withbreakfast"
                                                                                        onChange={(e) => handleRoomChange('withbreakfast', e.target.value)}
                                                                                    />
                                                                                </Grid>
                                                                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                                                                    <Grid item sm={6}>
                                                                        <Grid item xs={12} sm={12}>
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: '900px', maxHeight: '900px', border: '1px solid #ccc', borderRadius: '8px', padding: 2 }}>
                                                                                {addedRoom.length > 0 ? (
                                                                                    addedRoom.map((detail, index) => (
                                                                                        <Paper elevation={3} key={index} sx={{ padding: 2, marginBottom: "10px" }}>
                                                                                            {/* <Typography variant="h5">Room No: {detail.rooms}</Typography> */}
                                                                                            <Typography variant="h5">Room Name: {detail.room_name}</Typography>
                                                                                            {/* <Typography variant="body1">Area: {detail.area} sq.ft.</Typography> */}
                                                                                            {/* <Typography variant="body1">Room Category: {detail.room_category?.category_name}</Typography> */}
                                                                                            {/* <Typography variant="body1">Floors: {detail.floors}</Typography>
                                                                                            <Typography variant="body1">Beds: {detail.beds}</Typography>
                                                                                            <Typography variant="body1">Bathrooms: {detail.bathrooms}</Typography>
                                                                                            <Typography variant="body1">Guests: {detail.guests}</Typography>
                                                                                            <Typography variant="body1">Available Rooms: {detail.available_rooms}</Typography> */}
                                                                                            <Typography variant="body1">Booking Price: {detail.booking_price}</Typography>
                                                                                            <Typography variant="body1">Discount Price: {detail.discount}</Typography>
                                                                                            <Typography variant="body1">Booking Price (with Breakfast): {detail.bf}</Typography><Typography variant="body1"></Typography>
                                                                                            <Typography variant="h6" className='mt-1 mb-2'>Excluded Days:</Typography>
                                                                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                                                                {detail?.exclusions.map((exclusion) =>
                                                                                                    exclusion.excluded_days.map((day, index) => {
                                                                                                        const date = new Date(day);
                                                                                                        const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(
                                                                                                            date.getMonth() + 1
                                                                                                        ).padStart(2, "0")}-${date.getFullYear()}`;
                                                                                                        return <Chip key={`${exclusion.id}-${index}`} label={formattedDate} />;
                                                                                                    })
                                                                                                )}
                                                                                            </Box>
                                                                                        </Paper>
                                                                                    ))
                                                                                ) : (
                                                                                    <Paper elevation={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: 200, }}>
                                                                                        <Typography variant="h6" color="textSecondary">
                                                                                            No Rooms Added
                                                                                        </Typography>
                                                                                    </Paper>
                                                                                )}
                                                                            </Box>
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                            </Paper>
                                                        </Box>
                                                    </Grid>
                                                </React.Fragment>
                                            )}

                                            {/* Third Step: Completed */}
                                            {activeStep === 2 && (
                                                <React.Fragment>
                                                    <Grid container spacing={2} sx={{ p: 3, mt: 1 }}>
                                                        <Box sx={{ mt: 4, width: '100%' }}>
                                                            <form>
                                                                <Typography variant="h5" className='mb-3' gutterBottom>
                                                                    Owner and Support Details
                                                                </Typography>
                                                                <Grid container spacing={2}>
                                                                    {[
                                                                        { label: 'Owner Name', key: 'ownername', group: 'owner', type: "text" },
                                                                        // { label: 'Owner Contact No.', key: 'ownercontact', group: 'owner', type: "text" },
                                                                        { label: 'Owner Email', key: 'owneremail', group: 'owner', type: "email" },
                                                                    ].map((field, index) => (
                                                                        <Grid item xs={12} sm={6} key={index}>
                                                                            <TextField
                                                                                label={field.label}
                                                                                type={field.type}
                                                                                variant="outlined"
                                                                                fullWidth
                                                                                onChange={(e) =>
                                                                                    handleOwnerDataChange(field.key, e.target.value)
                                                                                }
                                                                            />
                                                                        </Grid>
                                                                    ))}
                                                                    <Grid item xs={12} sm={12}>
                                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
                                                                            <TextField
                                                                                label="Enter Contact No"
                                                                                variant="outlined"
                                                                                type="number"
                                                                                fullWidth
                                                                                value={contactinput}
                                                                                onChange={(e) => setcontactInput(e.target.value)}
                                                                                onKeyDown={handleContactKeyDown}
                                                                            />
                                                                            <Button
                                                                                variant="contained"
                                                                                color="primary"
                                                                                onClick={handleAddContact}
                                                                            >
                                                                                Add
                                                                            </Button>
                                                                        </Box>
                                                                        <Box>
                                                                            {contactsList.map((item, index) => (
                                                                                <span key={index}>
                                                                                    <Chip className='me-2 mb-2' label={item} variant="outlined" onDelete={() => handleRemoveContact(index)} />
                                                                                </span>
                                                                            ))}
                                                                        </Box>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={12}>
                                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
                                                                            <TextField
                                                                                label="Enter WhatAapp No"
                                                                                variant="outlined"
                                                                                fullWidth
                                                                                type="number"
                                                                                value={whatsappcontactinput}
                                                                                onChange={(e) => setwhatsappcontactInput(e.target.value)}
                                                                                onKeyDown={handlewhatsappContactKeyDown}
                                                                            />
                                                                            <Button
                                                                                variant="contained"
                                                                                color="primary"
                                                                                onClick={handleAddWhatsappContact}
                                                                            >
                                                                                Add
                                                                            </Button>
                                                                        </Box>
                                                                        <Box>
                                                                            {whatsappcontactsList.map((item, index) => (
                                                                                <span key={index}>
                                                                                    <Chip className='me-2 mb-2' label={item} variant="outlined" onDelete={() => handleRemoveWhatsappContact(index)} />
                                                                                </span>
                                                                            ))}
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid container spacing={2} className='mt-3'>
                                                                    {[
                                                                        { label: 'Support Contact No', key: 'supportcontact', group: 'support', type: 'number' },
                                                                        { label: 'Support WhatsApp No', key: 'supportwhatsapp', group: 'support', type: 'number' },
                                                                        { label: 'Support Email', key: 'supportemail', group: 'support', type: 'email' },
                                                                    ].map((field, index) => (
                                                                        <Grid item xs={12} sm={6} key={index}>
                                                                            <TextField
                                                                                label={field.label}
                                                                                type={field.type}
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
                                                    <Grid container spacing={2} sx={{ p: 3, mt: 1 }}>
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
                                                                            {hotelPreview.owner_contact_number?.join(', ')}
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
                                                                            {translatedHotelPreview.owner_contact_number?.join(', ')}
                                                                        </Typography>
                                                                    </Paper>)}
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </React.Fragment>
                                            )}

                                            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                                {/* <Button
                                                    color="inherit"
                                                    disabled={activeStep === 0 || activeStep === 3}
                                                    onClick={handleBack}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Back
                                                </Button> */}
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
                </Grid >
            </Grid >
        </PageContainer >

    );
};

export default AddHotel;
