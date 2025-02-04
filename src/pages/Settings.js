import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Switch, Typography, Button, } from '@mui/material';
import { Link } from 'react-router-dom';


function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const Settings = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const label = { inputProps: { 'aria-label': 'Switch demo' } };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Terms And Conditions" {...a11yProps(0)} />
                    <Tab label="Privacy Policy" {...a11yProps(1)} />
                    <Tab label="Logout" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <Typography variant="h2" gutterBottom>
                    Terms And Conditions
                </Typography>
                <Typography variant="body1" gutterBottom>
                    These Terms and Conditions govern your use of our website and services. By accessing or using our website, you agree to comply with and be bound by these terms. If you do not agree to these terms, please refrain from using our services.
                </Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => window.open('https://sites.google.com/view/stay-termsandconditions/home?authuser=1', '_blank')}>
                    Read Full Terms
                </Button>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <Typography variant="h2" gutterBottom>
                    Privacy Policy
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Learn about how we handle your data and protect your privacy. Our privacy policy ensures your personal information is secure.
                </Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => window.open('https://sites.google.com/view/stay-privacypolicy/home?authuser=1', '_blank')}>
                    Privacy Policy
                </Button>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <Typography variant="h2" gutterBottom>
                    Logout
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Are you sure you want to log out ? Make sure to save any unsaved changes before proceeding.
                </Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} component={Link} to="/auth/login">
                    Logout
                </Button>
            </CustomTabPanel>
        </Box>
    );
}
export default Settings;
