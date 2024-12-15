import React, { useState } from 'react';
import {
    Box,
    Typography,
    FormGroup,
    FormControlLabel,
    Button,
    Stack,
    Checkbox
} from '@mui/material';
import { Link } from 'react-router-dom';

import { url } from '../../../../mainurl';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import axios from 'axios';

const AuthLogin = ({ title, subtitle, subtext }) => {

    const [formData, setFormData] = useState({ email: 'stay4hotel@gmail.com', password: 'stayadmin' });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`${url}/auth/admin/login/`, {
                email: formData.email,
                password: formData.password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Login successful:', response.data);
            alert('Login successful!');
        } catch (err) {
            console.error('Error:', err.response?.data || err.message);
            alert('Login failed. Please check your credentials.');
        }
    };


    console.log(formData);

    return (
        <>
            {title ? (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            ) : null}

            {subtext}

            <Stack>
                <Box>
                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='username' mb="5px" value={formData.username} onChange={() => { handleChange(e) }}>Username</Typography>
                    <CustomTextField id="username" variant="outlined" fullWidth />
                </Box>
                <Box mt="25px">
                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='password' mb="5px" value={formData.password} onChange={() => { handleChange(e) }} >Password</Typography>
                    <CustomTextField id="password" type="password" variant="outlined" fullWidth />
                </Box>
                <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox defaultChecked />}
                            label="Remeber this Device"
                        />
                    </FormGroup>
                    {/* <Typography
                    component={Link}
                    to="/"
                    fontWeight="500"
                    sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                    }}
                >
                    Forgot Password ?
                </Typography> */}
                </Stack>
            </Stack>
            <Box>
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    // component={Link}
                    // to="/"
                    onClick={handleSubmit}
                    type="submit"
                >
                    Sign In
                </Button>
            </Box>
            {subtitle}
        </>
    );
}

export default AuthLogin;
