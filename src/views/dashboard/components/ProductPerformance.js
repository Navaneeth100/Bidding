import React from 'react';
import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import DashboardCard from '../../../components/shared/DashboardCard';
import { IconStar } from '@tabler/icons-react';

const hotels = [
    {
        "id": 1,
        "name": "TIME Moonstone Hotel Apartments",
        "location": "Fujairah, United Arab Emirates",
        "address": "Fujairah City Center",
        "rating": 4.9,
        "contact": "+971 9 203 0000",
        "image": "https://lh5.googleusercontent.com/p/AF1QipO-lrkTfA84I-9wAch-6shsZN_ya_pWVwdCBwbM=w255-h174-n-k-no"
    },
    {
        "id": 2,
        "name": "TIME Onyx Hotel Apartments",
        "location": "Dubai, United Arab Emirates",
        "address": "Al Qusais Industrial Area - Al Qusais Industrial Area 5",
        "rating": 4.8,
        "contact": "+971 4 604 2999",
        "image": "https://lh3.googleusercontent.com/proxy/fRmAhI1AexkpJd2S0xadJC1-LUAqp03Xn-iNTmWQ9F4-DbI2VWS7dguTHtp_2e8DGjFVbaYmFUzP3moJVp20mv9rYTmqLKjhI1PSxIs_Q-1LubN7LKhYp4EqpPxYaYKRo2X-82ETINajS5gUqHgDkYnVf14I-Bo=s680-w680-h510"
    },
    {
        "id": 3,
        "name": "TIME Moonstone Hotel Apartments",
        "location": "Fujairah, United Arab Emirates",
        "address": "Fujairah City Center",
        "rating": 4.9,
        "contact": "+971 9 203 0000",
        "image": "https://lh5.googleusercontent.com/p/AF1QipO-lrkTfA84I-9wAch-6shsZN_ya_pWVwdCBwbM=w255-h174-n-k-no"
    },
    {
        "id": 4,
        "name": "TIME Onyx Hotel Apartments",
        "location": "Dubai, United Arab Emirates",
        "address": "Al Qusais Industrial Area - Al Qusais Industrial Area 5",
        "rating": 4.8,
        "contact": "+971 4 604 2999",
        "image": "https://lh3.googleusercontent.com/proxy/fRmAhI1AexkpJd2S0xadJC1-LUAqp03Xn-iNTmWQ9F4-DbI2VWS7dguTHtp_2e8DGjFVbaYmFUzP3moJVp20mv9rYTmqLKjhI1PSxIs_Q-1LubN7LKhYp4EqpPxYaYKRo2X-82ETINajS5gUqHgDkYnVf14I-Bo=s680-w680-h510"
    },
    {
        "id": 5,
        "name": "TIME Moonstone Hotel Apartments",
        "location": "Fujairah, United Arab Emirates",
        "address": "Fujairah City Center",
        "rating": 4.9,
        "contact": "+971 9 203 0000",
        "image": "https://lh5.googleusercontent.com/p/AF1QipO-lrkTfA84I-9wAch-6shsZN_ya_pWVwdCBwbM=w255-h174-n-k-no"
    }
]


const ProductPerformance = () => {
    return (

        <DashboardCard title="Top Rated  Hotels">
            <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                <Table
                    aria-label="simple table"
                    sx={{
                        whiteSpace: "nowrap",
                        mt: 2
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    SN
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Image
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Name
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Location
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Ratings
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {hotels.map((hotels) => (
                            <TableRow key={hotels.id}>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {hotels.id}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box component="img" src={hotels.image} alt="Hotel Image" width="100px" height="auto" onClick={() => { handleNavigateToViewHotel(hotels.id) }} />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {hotels.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {hotels.address}
                                            </Typography>
                                            <Typography
                                                color="textSecondary"
                                                sx={{
                                                    fontSize: "13px",
                                                }}
                                            >
                                                {hotels.location}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <IconStar width={15} style={{ marginRight: "5px" }} />
                                        <Typography variant="subtitle2" fontWeight={600} fontSize={18}>
                                            {hotels.rating}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </DashboardCard>
    );
};

export default ProductPerformance;
