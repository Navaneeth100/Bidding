import React, { useEffect, useState } from 'react';
import { Typography, Grid, CardContent, CircularProgress, DialogContentText, Avatar, Rating } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import BlankCard from 'src/components/shared/BlankCard';
import ProductPerformance from '../views/dashboard/components/ProductPerformance';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, InputLabel, MenuItem, Select, TextField, IconButton, List, ListItem, ListItemText, Chip, ListItemButton } from '@mui/material';
import { IconStar, IconEye, IconEdit, IconTrash, IconAlertCircle, IconHotelService, IconBed, IconCalendar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url } from '../../mainurl';
import { toast } from 'react-toastify';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { IconBedFilled } from '@tabler/icons-react';
import { useDropzone } from "react-dropzone";
import { Card, CardMedia } from "@mui/material";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import '../App.css'

const HotelPage = () => {

    const [modal, setModal] = useState({ add: false, view: false, edit: false, roomlist: false, editrooms: false, deleterooms: false, calendar: false });

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
    const [categoryfilter, setcategoryfilter] = useState([])
    const [facilitesfilter, setfacilitesfilter] = useState([])
    const [ratingfilter, setratingfilter] = useState([])
    const [locationfilter, setlocationfilter] = useState([])

    const MenuProps = { PaperProps: { style: { maxHeight: 200, overflowY: 'auto' } } };

    const fetchHotels = (page = 1) => {
        setLoading(true);
        const formattedcategoryfilter = categoryfilter.map(name => parseInt(categoryList.find(item => item.category_name === name)?.id));
        const formattedfacilitiesfilter = facilitesfilter.map(name => parseInt(facilitiesList.find(item => item.name === name)?.id));
        axios
            .get(`${url}/hotel/createhotels/?category_id_search=${formattedcategoryfilter}&rating_search=${ratingfilter}&facility_id_search=${formattedfacilitiesfilter}&emirates_search=${locationfilter}&page=${page}&page_size=${pageSize}`, {
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
                        .get(`${url}/hotel/createhotels/?category_id_search=${formattedcategoryfilter}&rating_search=${ratingfilter}&facility_id_search=${formattedfacilitiesfilter}&emirates_search=${locationfilter}&page=${page}&page_size=${pageSize}`, {
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
    }, [currentPage, categoryfilter, facilitesfilter, ratingfilter, locationfilter]);

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


    // Google Location

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

    // Edit Hotel

    const [editData, setEditData] = useState([])
    const [editfacilities, seteditfacilities] = useState([])
    const [edittags, setedittags] = useState([])

    // Tag Adds

    const [tagInput, settagInput] = useState("");

    const handleAddTag = () => {
        if (tagInput.trim() !== "") {
            setedittags((prevItems) => [...prevItems, tagInput]);
            settagInput("");
        }
    };

    const handleRemoveItem = (indexToRemove) => {
        setedittags((prevItems) => prevItems.filter((_, index) => index !== indexToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleEdit = async (event) => {
        event.preventDefault();
        let submitData = {
            name: editData.name,
            description: editData.description,
            rating: editData.rating,
            location: selectedLocation || editData.location,
            locationName: `${markerPosition.lat} , ${markerPosition.lng}`,
            owner_name: editData.owner_name,
            owner_email: editData.owner_email,
            owner_contact_number: editData.owner_contact_number,
            support_contact_number: editData.support_contact_number,
            support_email: editData.support_email,
            propertytype: editData.propertytype,
            emirates: editData.emirates,
            facilites: editfacilities,
            tags: edittags
        };

        try {
            const response = await axios.put(`${url}/hotel/updatehotels/${editData.id}/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "multipart/form-data",
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
            }
            toggleModal('edit');
            fetchHotels(currentPage);
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
        } finally {
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
            fetchHotels(currentPage);
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

    // Room List

    const [roomList, setroomList] = useState([])
    const [roomLoading, setroomLoading] = useState(false)

    const fetchRooms = (id) => {
        setroomLoading(true)
        axios
            .get(`${url}/hotel/hotels/${id}/room-categories/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {
                setroomList(res.data);
                setroomLoading(false)
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
                            setroomList(res.data);
                            setroomLoading(false)
                        });
                });
            });
    };

    //  Edit Rooms

    const [editId, seteditId] = useState()
    const [roomEditData, setRoomEditData] = useState([])
    const [editroomcategory, seteditroomcategory] = useState()

    const handleRoomEdit = async (event) => {
        event.preventDefault();
        let submitData = {
            area: roomEditData.area,
            available_rooms: roomEditData.available_rooms,
            bathrooms: roomEditData.bathrooms,
            beds: roomEditData.beds,
            bf: roomEditData.withbreakfast,
            booking_price: roomEditData.booking_price,
            floors: roomEditData.floors,
            guests: roomEditData.guests,
            room_category: categoryList.find((category) => category.category_name === editroomcategory)?.id,
            rooms: roomEditData.rooms,
            excluded_days: formattedDates
        };

        try {
            const response = await axios.put(`${url}/hotel/room-category/${roomEditData.id}/`, submitData, {
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
            }
            toggleModal('editrooms');
            setRoomEditData([])
            seteditroomcategory([])
            setSelectedDates([])
            fetchRooms(editId);
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
        } finally {
        }
    };

    // Delete Rooms

    const [roomDeleteData, setRoomDeleteData] = useState([])

    const handleDeleteRooms = async (id) => {
        try {
            const response = await axios.delete(`${url}/hotel/room-category/${id}/`, {
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
            }
            toggleModal('deleterooms')
            fetchRooms(editId);
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


    //  file upload

    const [hotelfiles, sethotelfiles] = useState([])
    const [files, setFiles] = useState([]);
    const [fileuploadmode, setfileuploadmode] = useState(null)

    const onDrop = (acceptedFiles) => {
        const updatedFiles = acceptedFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file), // Create a preview URL for each file
            })
        );
        fileuploadmode == "hotel" ? sethotelfiles((prevFiles) => [...prevFiles, ...updatedFiles]) : setFiles((prevFiles) => [...prevFiles, ...updatedFiles]);
    };

    
    //  file add rooms

    const handleFileSubmit = async (id) => {
        event.preventDefault();
        let submitData = {
            files: files
        }

        try {
            const response = await axios.post(`${url}/hotel/hotel-room-categories/${id}/images/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "multipart/form-data",
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
            }
            setFiles([])
            toggleModal('editrooms')
            fetchRooms(editId)
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
        } finally {
        }
    };

    const handleRemoveFile = async (fileToRemove, deleteid) => {

        if (!fileToRemove.file) {
            setFiles(files.filter((file) => file !== fileToRemove));
        }
        else {

            try {
                const response = await axios.delete(`${url}/hotel/hotel-room-categories/${deleteid}/images/`, {
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
                }
                // toggleModal('editrooms')
                // fetchRooms(editId);
                setFiles(files.filter((file) => file !== fileToRemove));
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
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: "image/*,application/pdf", // Accept images and PDFs
        multiple: true, // Allow multiple files
    });


    //  hotel file uploads

    const handleRoomFileSubmit = async (id) => {
        event.preventDefault();
        let submitData = {
            files: hotelfiles
        }

        try {
            const response = await axios.post(`${url}/hotel/imghotels/${id}/images/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "multipart/form-data",
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
            }
            sethotelfiles([])
            toggleModal('edit')
            fetchHotels()
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
        } finally {
        }
    };

    const handleRemoveHotelFile = async (fileToRemove, deleteid) => {

        if (!fileToRemove.file) {
            sethotelfiles(hotelfiles.filter((file) => file !== fileToRemove));
        }
        else {

            try {
                const response = await axios.delete(`${url}/hotel/imghotels/${deleteid}/images/`, {
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
                    sethotelfiles(hotelfiles.filter((file) => file !== fileToRemove));
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
    };


    // Dates

    const [selectedDates, setSelectedDates] = useState([]);
    const [showCalendar, setshowCalendar] = useState([])

    const handleDateChange = (date) => {
        // If the clicked date is already selected, remove it
        if (selectedDates.some((d) => d.getDate() === date.getDate())) {
            setSelectedDates(selectedDates.filter((d) => d.getDate() !== date.getDate()));
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

    // formatdate for view

    const formatDateView = (date) => {
        const [year, month, day] = date.split("-");
        return `${day}-${month}-${year}`;
    };


    return (
        <PageContainer title="Hotels" description="Hotels">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }} gap={2} mb={2}>
                {/* <Button size="small" variant={calendarvisible ? "contained" : "outlined"} color='primary' onClick={toggleCalenadar}>Calendar</Button> */}
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
                                <Select
                                    multiple
                                    value={categoryfilter}
                                    onChange={(e) => { setcategoryfilter(e.target.value) }}
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

                        {/* Rating Filter */}
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Rating</InputLabel>
                                <Select
                                    value={ratingfilter}
                                    onChange={(e) => { setratingfilter(e.target.value) }}
                                    MenuProps={MenuProps}
                                    label="Rating">
                                    {[...Array(5)].map((_, index) => (
                                        <MenuItem key={index + 1} value={index + 1}>{index + 1}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Category Filter */}
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Facilities</InputLabel>
                                <Select
                                    multiple
                                    value={facilitesfilter}
                                    onChange={(e) => { setfacilitesfilter(e.target.value); }}
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
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Location"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(e) => setlocationfilter(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                        <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={() => fetchHotels(currentPage)}>Submit</Button>
                        <Button variant="outlined" color="primary" onClick={() => { setcategoryfilter([]); setratingfilter(''); setfacilitesfilter([]); setlocationfilter(''); fetchHotels(1) }}>Clear</Button>
                    </Box>
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
                                                Rooms
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
                                                    {/* <Box component="img" src={`${url}${item?.hotelimgs[0]?.file}`} alt="Hotel Image" width="100px" height="auto" onClick={() => { handleNavigateToViewHotel(item.id) }} /> */}
                                                    <Box
                                                        display="flex"
                                                        justifyContent="center"
                                                        alignItems="center"
                                                        height="100%"
                                                    >
                                                        <Avatar
                                                            src={`${url}/hotel${item.hotelimgs[0]?.file}` || ""}
                                                            alt=""
                                                            variant="rounded"
                                                            sx={{ width: 50, height: 50 }}
                                                            onClick={() => { handleNavigateToViewHotel(item.id) }}
                                                        />
                                                    </Box>
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
                                                            {item.rating}
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
                                                <TableCell align="center">
                                                    <Button sx={{ border: '1px solid lightgrey', cursor: "pointer" }} onClick={() => { toggleModal('roomlist'); fetchRooms(item.id), seteditId(item.id) }}><IconBedFilled className='m-0 p-0' /></Button>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        {/* <IconEye width={20} style={{ marginRight: "15px" }} /> */}
                                                        <Button
                                                            sx={{ border: '1px solid lightgrey', marginRight: "10px" }} onClick={() => { toggleModal('edit'); setEditData(item); setedittags(item.tags); sethotelfiles(item.hotelimgs), setfileuploadmode('hotel') }}><IconEdit width={15} /><Typography variant="subtitle2" fontWeight={500} className='ms-1 me-1' > Edit </Typography>
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
                                            <TableCell colSpan={8} align="center">
                                                <Typography variant="subtitle2" fontWeight={600} sx={{ paddingTop: "300px" }}>
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

            {/* edit modal */}

            <Dialog
                open={modal.edit}
                onClose={() => toggleModal('edit')}
                maxWidth="lg"
                fullWidth
                sx={{ padding: 2 }}
            >
                <DialogTitle sx={{ m: 2, p: 2, position: 'relative' }} id="customized-dialog-title">
                    Edit Hotel
                    <IconButton
                        onClick={() => toggleModal('edit')} sx={{ position: 'absolute', right: 8, top: 8 }}>x</IconButton>
                </DialogTitle>

                <DialogContent sx={{ padding: 3 }}>
                    <form className="row gy-4 mt-2" onSubmit={handleEdit}>
                        <Grid container spacing={3}>
                            <Grid item md={12} xs={12}>
                                <TextField
                                    label="Name"
                                    variant="outlined"
                                    fullWidth
                                    defaultValue={editData.name}
                                    sx={{ mb: 2 }}
                                    onChange={(e) => {
                                        setEditData({ ...editData, name: e.target.value })
                                    }}
                                />
                                <TextField
                                    label="Description"
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    defaultValue={editData.description}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    onChange={(e) => {
                                        setEditData({ ...editData, description: e.target.value })
                                    }}
                                />
                                <Typography variant="body2" color="textSecondary" fontWeight="bold" className='mt-3'>
                                    Rating :
                                </Typography>
                                <Rating
                                    className='m-2'
                                    name="simple-uncontrolled"
                                    onChange={(event, newValue) => { setEditData({ ...editData, rating: newValue }) }}
                                    defaultValue={editData.rating}
                                    size='large'
                                />
                            </Grid>

                            <Grid item md={12} xs={12}>
                                <Box className="mt-3 mb-3" >
                                    <TextField
                                        label="Location"
                                        variant="outlined"
                                        fullWidth
                                        sx={{ mb: 2 }}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleSearchLocation(value);
                                            // setFormData({ ...formData, locationName: value })
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
                                        Selected Location : {selectedLocation || editData.locationName}
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
                                    {hotelfiles.map((file, index) => (
                                        <Grid item key={index} xs={12} sm={2} md={2}>
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    width="100%"
                                                    height="100"
                                                    image={file.preview || `${url}/hotel${file.file}`}
                                                    alt={file.name}
                                                />
                                                <Button
                                                    size="small"
                                                    style={{ color: "red" }}
                                                    onClick={() => handleRemoveHotelFile(file, file.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </Card>
                                        </Grid>
                                    ))}


                                </Grid>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => { handleRoomFileSubmit(editData.id) }}
                                    sx={{ marginTop: 2 }}
                                >
                                    Submit
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Property Type</InputLabel>
                                    <Select
                                        defaultValue={editData.propertytype}
                                        onChange={(e) => { setEditData((prevData) => ({ ...prevData, propertytype: e.target.value })) }}
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
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Emirates</InputLabel>
                                    <Select
                                        defaultValue={editData.emirates}
                                        onChange={(e) => { setEditData((prevData) => ({ ...prevData, emirates: e.target.value })) }}
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
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Facilites</InputLabel>
                                    <Select
                                        multiple
                                        value={editfacilities}
                                        onChange={(e) => { seteditfacilities(e.target.value) }}
                                        renderValue={(selected) => selected.join(', ')}
                                        label="Property Type"
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
                                    {edittags.map((item, index) => (
                                        <span key={index}>
                                            <Chip className='me-2 mb-2' label={item} variant="outlined" onDelete={() => handleRemoveItem(index)} />
                                        </span>
                                    ))}
                                </Box>
                            </Grid>
                            <Grid item md={4} xs={12}>
                                <TextField
                                    label="Owner Name"
                                    variant="outlined"
                                    fullWidth
                                    defaultValue={editData.owner_name}
                                    sx={{ mb: 2 }}
                                    onChange={(e) => {
                                        setEditData({ ...editData, owner_name: e.target.value })
                                    }}
                                />
                            </Grid>
                            <Grid item md={4} xs={12}>
                                <TextField
                                    label="Owner Email"
                                    variant="outlined"
                                    fullWidth
                                    defaultValue={editData.owner_email}
                                    sx={{ mb: 2 }}
                                    onChange={(e) => {
                                        setEditData({ ...editData, owner_email: e.target.value })
                                    }}
                                />
                            </Grid>
                            <Grid item md={4} xs={12}>
                                <TextField
                                    label="Owner Contact No."
                                    variant="outlined"
                                    fullWidth
                                    defaultValue={editData.owner_contact_number}
                                    sx={{ mb: 2 }}
                                    onChange={(e) => {
                                        setEditData({ ...editData, owner_contact_number: e.target.value })
                                    }}
                                />
                            </Grid>
                            <Grid item md={4} xs={12}>
                                <TextField
                                    label="support Email"
                                    variant="outlined"
                                    fullWidth
                                    defaultValue={editData.support_email}
                                    sx={{ mb: 2 }}
                                    onChange={(e) => {
                                        setEditData({ ...editData, support_email: e.target.value })
                                    }}
                                />
                            </Grid>
                            <Grid item md={4} xs={12}>
                                <TextField
                                    label="support Contact No."
                                    variant="outlined"
                                    fullWidth
                                    defaultValue={editData.support_contact_number}
                                    sx={{ mb: 2 }}
                                    onChange={(e) => {
                                        setEditData({ ...editData, support_contact_number: e.target.value })
                                    }}
                                />
                            </Grid>

                        </Grid>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: 2, marginBottom: 2 }}
                        >
                            Submit
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* room view modal */}

            <Dialog
                open={modal.roomlist}
                onClose={() => toggleModal('roomlist')}
                maxWidth="lg"
                fullWidth
                sx={{ padding: 2 }}
            >
                <DialogTitle sx={{ m: 1, p: 1, position: 'relative' }} id="customized-dialog-title">
                    Added Rooms
                    <IconButton
                        onClick={() => toggleModal('roomlist')} sx={{ position: 'absolute', right: 8, top: 8 }}>x</IconButton>
                </DialogTitle>

                <DialogContent sx={{ padding: 3 }}>
                    <form className="row gy-4 mt-2 mb-2">
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
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Category
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Rooms
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
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
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Bathrooms
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Guests
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Excluded Days
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Available Rooms
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Typography variant="subtitle2" fontWeight={600} align='center'>
                                                        Actions
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {roomLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={11} align="center">
                                                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" height="100%">
                                                            <CircularProgress />
                                                            <Typography variant="subtitle2" fontWeight={600} sx={{ ml: 2 }}>
                                                                Loading rooms...
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                roomList.map((item, index) => (
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
                                                                    src={`${url}/hotel${item.hotelroomimgs[0]?.file}` || ""}
                                                                    alt=""
                                                                    variant="rounded"
                                                                    sx={{ width: 50, height: 50 }}
                                                                />
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                {item.room_category?.category_name}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                {item.rooms}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align='center'>
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
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                {item.bathrooms}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                {item.guests}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                                <Button
                                                                    sx={{ border: '1px solid lightgrey', marginRight: "10px" }} onClick={() => { toggleModal('calendar'); setshowCalendar(item?.exclusions?.flatMap(exclusion => exclusion.excluded_days.map(dateStr => new Date(dateStr)))) }}><IconCalendar width={15} />
                                                                </Button>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                {item.available_rooms}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                                <Button
                                                                    sx={{ border: '1px solid lightgrey', marginRight: "10px" }} onClick={() => { toggleModal('editrooms'); setRoomEditData(item); fetchCategory(), seteditroomcategory(item.room_category?.category_name), setFiles(item.hotelroomimgs), setfileuploadmode('room'), setSelectedDates(item?.exclusions?.flatMap(exclusion => exclusion.excluded_days.map(dateStr => new Date(dateStr)))) }}><IconEdit width={15} />
                                                                </Button>
                                                                <Button
                                                                    sx={{ border: '1px solid lightgrey' }} onClick={() => { toggleModal('deleterooms'); setRoomDeleteData(item); }}><IconTrash width={15} className='m-0 p-0' />
                                                                </Button>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
            </Dialog>

            {/* room edit modal */}

            <Dialog
                open={modal.editrooms}
                onClose={() => toggleModal('editrooms')}
                maxWidth="sm"
                fullWidth
                sx={{ padding: 4 }}
            >
                <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }} id="customized-dialog-title">
                    Edit Rooms
                    <IconButton aria-label="close" onClick={() => toggleModal('editrooms')} sx={{ position: 'absolute', right: 8, top: 8 }}>x</IconButton>
                </DialogTitle>

                <DialogContent sx={{ padding: 3 }}>
                    <form className="row gy-4 mt-2" onSubmit={handleRoomEdit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        // multiple
                                        value={editroomcategory}
                                        onOpen={fetchCategory}
                                        onChange={(e) => { seteditroomcategory(e.target.value) }}
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
                                                    image={file.preview || `${url}/hotel${file.file}`}
                                                    alt={file.name}
                                                />
                                                <Button
                                                    size="small"
                                                    style={{ color: "red" }}
                                                    onClick={() => handleRemoveFile(file, file.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </Card>
                                        </Grid>
                                    ))}


                                </Grid>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => { handleFileSubmit(roomEditData.id) }}
                                    sx={{ marginTop: 2 }}
                                >
                                    Submit
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Room No"
                                    placeholder='eg: 123'
                                    variant="outlined"
                                    type='text'
                                    margin="normal"
                                    name="room_no"
                                    defaultValue={roomEditData.rooms}
                                    onChange={(e) => { setRoomEditData({ ...roomEditData, rooms: e.target.value }) }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Room Area"
                                    placeholder='eg: in sq ft'
                                    variant="outlined"
                                    type='number'
                                    margin="normal"
                                    name="room_area"
                                    defaultValue={roomEditData.area}
                                    onChange={(e) => { setRoomEditData({ ...roomEditData, area: e.target.value }) }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Floor"
                                    placeholder='eg: 1'
                                    variant="outlined"
                                    type='number'
                                    margin="normal"
                                    name="floor"
                                    defaultValue={roomEditData.floors}
                                    onChange={(e) => { setRoomEditData({ ...roomEditData, floors: e.target.value }) }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Beds"
                                    placeholder='eg: 2'
                                    variant="outlined"
                                    type='number'
                                    margin="normal"
                                    name="beds"
                                    defaultValue={roomEditData.beds}
                                    onChange={(e) => { setRoomEditData({ ...roomEditData, beds: e.target.value }) }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Bathrooms"
                                    placeholder='eg: 2'
                                    variant="outlined"
                                    type='number'
                                    margin="normal"
                                    name="bathrooms"
                                    defaultValue={roomEditData.bathrooms}
                                    onChange={(e) => { setRoomEditData({ ...roomEditData, bathrooms: e.target.value }) }}
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
                                    name="guests"
                                    defaultValue={roomEditData.guests}
                                    onChange={(e) => { setRoomEditData({ ...roomEditData, guests: e.target.value }) }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Available Rooms"
                                    variant="outlined"
                                    placeholder='eg: 1 - 5'
                                    margin="normal"
                                    type='number'
                                    name="available_rooms"
                                    defaultValue={roomEditData.available_rooms}
                                    onChange={(e) => { setRoomEditData({ ...roomEditData, available_rooms: e.target.value }) }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Room Price"
                                    placeholder='eg: $$$'
                                    variant="outlined"
                                    type='text'
                                    margin="normal"
                                    name="room_price"
                                    defaultValue={roomEditData.booking_price}
                                    onChange={(e) => { setRoomEditData({ ...roomEditData, booking_price: e.target.value }) }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="With Breakfast"
                                    type='number'
                                    variant="outlined"
                                    placeholder='eg: 1 - 5'
                                    margin="normal"
                                    name="withbreakfast"
                                    onChange={(e) => { setRoomEditData({ ...roomEditData, withbreakfast: e.target.value }) }}
                                />
                            </Grid>
                        </Grid>

                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: '10px' }}>
                            <Calendar
                                onChange={handleDateChange}
                                value={selectedDates}
                                selectRange={false}
                                tileContent={({ date }) => {
                                    // Apply the styling for all selected dates
                                    if (selectedDates.some((d) => d.toDateString() === date.toDateString())) {
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
                                    return null;
                                }}
                                tileClassName={({ date }) => {
                                    // Add a class for all selected dates
                                    return selectedDates.some((d) => d.toDateString() === date.toDateString())
                                        ? 'selected-date'
                                        : '';
                                }}
                            />
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginTop: 2 }}>
                                {formattedDates.map((date, index) => (
                                    <Chip key={index} label={date} />
                                ))}
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
                    </form>
                </DialogContent>
            </Dialog>

            {/* delete rooms */}

            <Dialog
                open={modal.deleterooms}
                onClose={() => toggleModal('deleterooms')}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ style: { borderRadius: '15px', padding: '16px', maxWidth: '350px' } }}>
                <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center', paddingBottom: '8px' }}><IconAlertCircle /></DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" style={{ fontSize: '1rem', textAlign: 'center', color: '#333' }}>
                        Are you sure you want to Delete {roomDeleteData.room_category?.category_name} ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', padding: '16px' }}>
                    <Button onClick={() => handleDeleteRooms(roomDeleteData.id)} style={{ backgroundColor: '#2ecc71', color: 'white', fontSize: '1rem', padding: '6px 24px', margin: '0 8px' }}>
                        Yes
                    </Button>
                    <Button onClick={() => toggleModal('deleterooms')} style={{ backgroundColor: '#e74c3c', color: 'white', fontSize: '1rem', padding: '6px 24px', margin: '0 8px' }}>
                        No
                    </Button>
                </DialogActions>
            </Dialog>

            {/* delete rooms */}

            <Dialog
                open={modal.delete}
                onClose={() => toggleModal('delete')}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ style: { borderRadius: '15px', padding: '16px', maxWidth: '350px' } }}>
                <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center', paddingBottom: '8px' }}><IconAlertCircle /></DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" style={{ fontSize: '1rem', textAlign: 'center', color: '#333' }}>
                        Are you sure you want to Delete {deleteData.name} ?
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

            {/*  show calendar */}
            
            <Dialog
                open={modal.calendar}
                onClose={() => toggleModal('calendar')}
                maxWidth="sm"
                fullWidth
                sx={{ padding: 4 }}
            >
                <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }} id="customized-dialog-title">
                    Excluded Days
                    <IconButton aria-label="close" onClick={() => toggleModal('calendar')} sx={{ position: 'absolute', right: 8, top: 8 }}>x</IconButton>
                </DialogTitle>

                <DialogContent sx={{ padding: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: '10px' }}>
                            <Calendar
                                value={showCalendar}
                                selectRange={false}
                                tileContent={({ date }) => {
                                    if (showCalendar.some((d) => d.toDateString() === date.toDateString())) {
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
                                    return null;
                                }}
                                tileClassName={({ date }) => {
                                    return showCalendar.some((d) => d.toDateString() === date.toDateString())
                                        ? 'selected-date'
                                        : '';
                                }}
                                tileDisabled={() => true} // Disable all tiles
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>

        </PageContainer >
    );
};

export default HotelPage;
