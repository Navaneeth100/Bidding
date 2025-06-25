import { Box, Typography, Container } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";

const PaymentSuccess = () => {

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="80vh"
                textAlign="center"
            >
                <IconCheck size={100} color="#4caf50" />
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                    Payment Successful
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                    Your payment has been completed successfully. Thank you for your purchase!
                </Typography>
            </Box>
        </Container>
    );
};

export default PaymentSuccess;
