import { Box, Typography, Container } from "@mui/material";
import { IconCreditCardOff } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const PaymentCancelled = () => {

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
                <IconCreditCardOff size={100} color="#f44336" />
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                    Payment Cancelled
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                    Your payment was cancelled. If this was a mistake, please try again or contact support.
                </Typography>
            </Box>
        </Container>
    );
};

export default PaymentCancelled;
