import { Button, Box, Typography, Container } from "@mui/material";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const PermissionDenied = () => {
  const navigate = useNavigate();

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
        <IconAlertCircle size={64} color="#f44336" />
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
          Permission Denied
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          You don’t have access to view this page. Please contact your administrator to request the necessary permission.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Go to Home
        </Button>
      </Box>
    </Container>
  );
};

export default PermissionDenied;
