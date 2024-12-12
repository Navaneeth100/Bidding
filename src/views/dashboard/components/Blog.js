import React from 'react';
import { Link } from 'react-router-dom';
import { CardContent, Typography, Grid, Rating, Tooltip, Fab } from '@mui/material';
import img1 from 'src/assets/images/products/s4.jpg';
import img2 from 'src/assets/images/products/s5.jpg';
import img3 from 'src/assets/images/products/s7.jpg';
import img4 from 'src/assets/images/products/s11.jpg';
import { Box, Stack } from '@mui/system';
import { IconBasket } from '@tabler/icons-react';
import BlankCard from '../../../components/shared/BlankCard';

const ecoCard = [
    {
        title: 'TIME Moonstone Hotel Apartments',
        subheader: 'September 14, 2023',
        photo: "https://lh5.googleusercontent.com/p/AF1QipO-lrkTfA84I-9wAch-6shsZN_ya_pWVwdCBwbM=w255-h174-n-k-no",
        salesPrice: 2799,
        price: 3500,
        rating: 4,
    },
    {
        title: 'TIME Moonstone Hotel Apartments',
        subheader: 'September 14, 2023',
        photo: "https://lh5.googleusercontent.com/p/AF1QipO-lrkTfA84I-9wAch-6shsZN_ya_pWVwdCBwbM=w255-h174-n-k-no",
        salesPrice: 2799,
        price: 3500,
        rating: 4,
    },
    {
        title: 'TIME Moonstone Hotel Apartments',
        subheader: 'September 14, 2023',
        photo: "https://lh5.googleusercontent.com/p/AF1QipO-lrkTfA84I-9wAch-6shsZN_ya_pWVwdCBwbM=w255-h174-n-k-no",
        salesPrice: 2799,
        price: 3500,
        rating: 4,
    },
    {
        title: 'TIME Moonstone Hotel Apartments',
        subheader: 'September 14, 2023',
        photo: "https://lh5.googleusercontent.com/p/AF1QipO-lrkTfA84I-9wAch-6shsZN_ya_pWVwdCBwbM=w255-h174-n-k-no",
        salesPrice: 2799,
        price: 3500,
        rating: 4,
    },
];

const Blog = () => {
    return (
        <Box> <Typography className='mb-3 mt-2' variant="h4">Stay Choices</Typography>
        <Grid container spacing={3}>
            {ecoCard.map((product, index) => (
                <Grid item sm={12} md={4} lg={3} key={index}>
                    <BlankCard>
                        <Typography component={Link} to="/">
                            <img src={product.photo} alt="img" width="100%" height="200"/>
                        </Typography>
                        {/* <Tooltip title="Add To Cart">
                            <Fab
                                size="small"
                                color="primary"
                                sx={{ bottom: '75px', right: '15px', position: 'absolute' }}
                            >
                                <IconBasket size="16" />
                            </Fab>
                        </Tooltip> */}
                        <CardContent sx={{ p: 3, pt: 2 }}>
                            <Typography variant="h6">{product.title}</Typography>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1}>
                                {/* <Stack direction="row" alignItems="center">
                                    <Typography variant="h6">${product.price}</Typography>
                                    <Typography color="textSecondary" ml={1} sx={{ textDecoration: 'line-through' }}>
                                        ${product.salesPrice}
                                    </Typography>
                                </Stack> */}
                                <Rating name="read-only" size="small" value={product.rating} readOnly />
                            </Stack>
                        </CardContent>
                    </BlankCard>
                </Grid>
            ))}
        </Grid>
        </Box>
    );
};

export default Blog;
