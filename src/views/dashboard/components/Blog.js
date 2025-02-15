import React from 'react';
import { Link } from 'react-router-dom';
import { CardContent, Typography, Grid, Rating, Tooltip, Fab } from '@mui/material';
import img1 from 'src/assets/images/products/s4.jpg';
import img2 from 'src/assets/images/products/s5.jpg';
import img3 from 'src/assets/images/products/s7.jpg';
import img4 from 'src/assets/images/products/s11.jpg';
import { Box, Stack } from '@mui/system';
import { IconBasket, IconCircleCheck } from '@tabler/icons-react';
import BlankCard from '../../../components/shared/BlankCard';
import defaulthotel from 'src/assets/images/profile/DefaultHotel.jpg';
import { url } from '../../../../mainurl';


const Blog = ({ value }) => {
    return (
        <Box> <Typography className='mb-3 mt-2' variant="h4">Top Impression Hotels</Typography>
            {value?.length == 0 ? (
                <Box sx={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="h6" color="textSecondary">
                    No Hotels Found
                </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {value?.map((product, index) => (
                        <Grid item sm={12} md={4} lg={3} key={index}>
                            <BlankCard>
                                <Typography component={Link} to="/">
                                    <img src={product.image ? `${url}${product.image}` : defaulthotel} alt="img" width="100%" height="200" />
                                </Typography>
                                <Tooltip title="Impression">
                                    <Fab
                                        size="small"
                                        color="primary"
                                        variant='extended'
                                        sx={{ bottom: '75px', right: '15px', position: 'absolute', background: "limegreen", color: "white", "&:hover": { background: "white", color: "limegreen" }, }}
                                    >
                                        <IconCircleCheck className='me-1' size="18" /> {product.total_impressions}
                                    </Fab>
                                </Tooltip>
                                <CardContent sx={{ p: 3, pt: 2 }}>
                                    <Typography variant="h6">{product?.hotel_name?.length > 22 ? `${product.hotel_name.slice(0, 22)}...` : product.hotel_name}</Typography>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1}>
                                        <Stack direction="row" alignItems="center">
                                            {/* <Typography variant="h6">${product.price}</Typography> */}
                                            {/* <Typography color="textSecondary">
                                        Booked : {product.total_impressions}
                                    </Typography> */}
                                        </Stack>
                                        <Rating name="read-only" size="small" value={product.rating} readOnly />
                                    </Stack>
                                </CardContent>
                            </BlankCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default Blog;
