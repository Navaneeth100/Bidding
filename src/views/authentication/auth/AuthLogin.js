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
import { Link, useNavigate } from 'react-router-dom';
import { url } from '../../../../mainurl';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import axios from 'axios';

const AuthLogin = ({ title, subtitle, subtext }) => {

    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const navigate = useNavigate()

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
            if (response.status === 200) {
                const data = response.data;
                alert('Login successful!');
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate("/dashboard")
            }
        } catch (err) {
            alert(err.response.data.error);
        }
    };

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
                        fontWeight={600} component="label" htmlFor='email' mb="5px">Email</Typography>
                    <CustomTextField id="email" name="email" variant="outlined" fullWidth onChange={(e) => { handleChange(e) }} />
                </Box>
                <Box mt="25px">
                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='password' mb="5px">Password</Typography>
                    <CustomTextField id="password" name="password" type="password" variant="outlined" fullWidth onChange={(e) => { handleChange(e) }} />
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
