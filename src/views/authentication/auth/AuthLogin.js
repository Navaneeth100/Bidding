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
import { toast } from 'react-toastify';
import { IconEye } from '@tabler/icons-react';
import { IconEyeClosed } from '@tabler/icons-react';

const AuthLogin = ({ title, subtitle, subtext }) => {

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle keydown for form submission
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
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
                toast.success('Login successful !', {
                    position: 'top-right',
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                });
                localStorage.setItem('authTokens', JSON.stringify(data));
                setTimeout(() => {
                    navigate("/dashboard")
                }, 1500);
            }
        } catch (err) {
            toast.error(`${err.response.data.error}`, {
                position: 'top-right',
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
            });
        }
        finally {
            // setTimeout(() => {
            //     navigate("/dashboard")
            // }, 2000);
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
                    <CustomTextField id="password" name="password" type={showPassword ? 'text' : 'password'} variant="outlined" fullWidth
                        InputProps={{
                            endAdornment: (
                                <Button className='ms-2' onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <IconEyeClosed /> : <IconEye />}
                                </Button>
                            ),
                        }}
                        onChange={(e) => { handleChange(e) }} onKeyDown={handleKeyDown} />
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
