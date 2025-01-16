import React from 'react';
import { Link } from 'react-router-dom';
import { CardContent, Typography, Grid, Rating, Tooltip, Fab } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { IconBasket, IconHeart } from '@tabler/icons-react';
import BlankCard from '../../../components/shared/BlankCard';
import defaulthotel from 'src/assets/images/profile/DefaultHotel.jpg';


const Blog2 = ({ value }) => {
    return (
        <Box> <Typography className='mb-3 mt-2' variant="h4">Most Favorite Hotels</Typography>
            <Grid container spacing={3}>
                {value?.slice(0, 4).map((item, index) => (
                    <Grid item sm={12} md={4} lg={3} key={index}>
                        <BlankCard>
                            <Typography component={Link} to="/">
                                <img src={defaulthotel} alt="img" width="100%" height="200" />
                            </Typography>
                            <Tooltip title="Favorite">
                            <Fab
                                size="small"
                                variant='extended'
                                sx={{ bottom: '75px', right: '15px', position: 'absolute', background: "Crimson", color: "white","&:hover": {background: "white", color: "Crimson" }, }}
                            >
                                <IconHeart className='me-1' size="16" />{item.total_favorites}
                            </Fab>
                            </Tooltip>
                            <CardContent sx={{ p: 3, pt: 2 }}>
                                <Typography variant="h6">{item.name.length > 22 ? `${item.name.slice(0, 22)}...` : item.name}</Typography>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1}>
                                    <Stack direction="row" alignItems="center">
                                        {/* <Typography variant="h6">${item.price}</Typography> */}
                                        {/* <Typography color="textSecondary">
                                        Booked : {item.total_impressions}
                                    </Typography> */}
                                    </Stack>
                                    <Rating name="read-only" size="small" value={item.rating} readOnly />
                                </Stack>
                            </CardContent>
                        </BlankCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Blog2;
