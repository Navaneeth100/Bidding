import React, { useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import BlankCard from 'src/components/shared/BlankCard';
import ProductPerformance from '../views/dashboard/components/ProductPerformance';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, InputLabel, MenuItem, Select, TextField, IconButton, Badge } from '@mui/material';
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


const AddHotel = () => {

    const [modal, setModal] = useState({ add: false, view: false, edit: false });

    // Function to toggle the modal state
    const toggleModal = (type) => {
        setModal((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    const navigate = useNavigate();

    const handleNavigateToViewHotel = (id) => {
        navigate(`/hotels/${id}`);
    }

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        photos: [],
        profilePic: null,
        rating: "",
        category: [],
        facilities: [],
        location: "",
        hotelRating: "",
        bookingPrice: "",
        discount: "",
        availableRooms: "",
        roomDetails: {
            roomCategory: "",
            roomSqFeet: "",
            beds: "",
            roomFacilities: [],
            noOfRoomsAvailable: "",
        },
        owner: {
            name: "",
            contactNo: "",
            image: null,
            email: "",
        },
        support: {
            contactNumber: "",
            email: "",
        },
    });

    const facilitiesList = ["Free WiFi", "Pool", "Gym", "Parking"];
    const categoriesList = ["Luxury", "Budget", "Family", "Business"];
    const starRatings = [1, 2, 3, 4, 5];

    const handleChange = (field, value, nestedField) => {
        if (nestedField) {
            setFormData((prev) => ({
                ...prev,
                [nestedField]: { ...prev[nestedField], [field]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    const [imageSrc, setImageSrc] = useState('https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg')

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImageSrc(reader.result)
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


    return (
        <PageContainer title="Hotels" description="Hotels">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <DashboardCard title="Add Hotel">
                        <Grid container spacing={2} sx={{ p: 3 }}>

                            {/* Hotel Image Upload Section */}

                            <Grid item xs={12} sm={3} className="relative aspect-video" sx={{ textAlign: 'center' }}>
                                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                    <img
                                        src={imageSrc}
                                        width="200"
                                        height="200"
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
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                                <TextField
                                    label="Description"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                />
                                <Typography variant="body2" color="textSecondary" fontWeight="bold" className='mt-3'>
                                    Rating :
                                </Typography>
                                <Rating
                                    className='m-2'
                                    name="simple-uncontrolled"
                                    onChange={(event, newValue) => {
                                        console.log(newValue);
                                    }}
                                    defaultValue={1}
                                />
                            </Grid>
                        </Grid>

                        {/* Hotel Specifications */}

                        <Grid container spacing={2} sx={{ mt: 3, textAlign: 'center' }}>
                            {[
                                { label: 'Area', placeholder: "eg: 1000sqft" },
                                { label: 'Floor', placeholder: "eg: 3" },
                                { label: 'Rooms', placeholder: "eg: 5" },
                                { label: 'Beds', placeholder: "eg: 5" },
                                { label: 'Bathrooms', placeholder: "eg: 5" },
                                { label: 'Guests', placeholder: "eg: 1 - 4" },
                            ].map((spec, index) => (
                                <Grid item xs={6} sm={4} md={2} key={index}>
                                    <Typography variant="body2" color="textSecondary" fontWeight="bold">
                                        {spec.label.toUpperCase()}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" className='mt-2' classes="text-center">
                                        <TextField
                                            label=""
                                            required
                                            variant="outlined"
                                            placeholder={spec.placeholder}
                                            fullWidth
                                            sx={{ mb: 2 }}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                        />
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>


                        {/* Hotel Image Upload Section */}

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item lg={12} sm={12}>
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
                                                <Typography variant="body2" align="center" gutterBottom>
                                                    {file.name}
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    style={{color:"red"}}
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
                                    {/* Dropdowns */}
                                    <Grid item xs={12} sm={6}>
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

                                    {/* Text Inputs */}
                                    {[
                                        { label: 'Location', key: 'location' },
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
                                                    handleChange(field.key, e.target.value, field.group || undefined)
                                                }
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </form>
                        </Box>

                        {/* Owner Details Form */}

                        <Box sx={{ mt: 4 }}>
                            <form>
                                <Typography variant="h5" className='mb-3' gutterBottom>
                                    Owner Details
                                </Typography>
                                <Grid container spacing={2}>

                                    {/* Text Inputs */}
                                    {[
                                        { label: 'Owner Name', key: 'name', group: 'owner' },
                                        { label: 'Owner Contact', key: 'contactNo', group: 'owner' },
                                        { label: 'Owner Email', key: 'email', group: 'owner' },
                                    ].map((field, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <TextField
                                                label={field.label}
                                                variant="outlined"
                                                fullWidth
                                                onChange={(e) =>
                                                    handleChange(field.key, e.target.value, field.group || undefined)
                                                }
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </form>
                        </Box>

                        {/* Support Details Form */}

                        <Box sx={{ mt: 4 }}>
                            <form>
                                <Typography variant="h5" className='mb-3' gutterBottom>
                                    Support Details
                                </Typography>
                                <Grid container spacing={2}>

                                    {/* Text Inputs */}
                                    {[
                                        { label: 'Support Contact', key: 'contactNo', group: 'support' },
                                        { label: 'Support Email', key: 'email', group: 'support' },
                                    ].map((field, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <TextField
                                                label={field.label}
                                                variant="outlined"
                                                fullWidth
                                                onChange={(e) =>
                                                    handleChange(field.key, e.target.value, field.group || undefined)
                                                }
                                            />
                                        </Grid>
                                    ))}


                                    {/* Submit Button */}
                                    <Grid item xs={12} sm={12}>
                                        <Button type="submit" variant="contained" fullWidth>
                                            Submit
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Box>

                    </DashboardCard>
                </Grid>
            </Grid>
        </PageContainer>

    );
};

export default AddHotel;
