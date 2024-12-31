import React, { useEffect, useState } from 'react';
import { TextField, Button, Container, Typography, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Dùng để điều hướng trang
import ModalForgotPasswordEmail from '../components/fargot_password/modal_forgot_password_email';
import { toast } from 'react-toastify';
import { login } from '../services/authService';
import NProgress from "nprogress";
import { useAuth } from '../contexts/AuthProvider';

const Login = () => {
    const { loginAuth } = useAuth();

    const [showModalForgotPasswordEmail, setShowModalForgotPasswordEmail] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');  // Redirect to Home if the user is already logged in
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra email và password (có thể tùy chỉnh thêm)
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email không được để trống';
        if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                NProgress.start();
                // Gọi API đăng nhập từ service
                const response = await login(formData.email, formData.password);

                loginAuth(response.user, response.token)

                // Hiển thị thông báo thành công
                toast.success('Đăng nhập thành công');

                // Điều hướng đến trang chủ hoặc trang người dùng
                navigate('/');
            } catch (error) {
                console.error('Lỗi từ API:', error);

                // Hiển thị thông báo lỗi khi đăng nhập thất bại
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
                } else {
                    toast.error('Đã xảy ra lỗi khi kết nối với server. Vui lòng thử lại sau.');
                }
            } finally {
                NProgress.done();
            }
        }
    };

    const handleForgotPassword = () => {
        setShowModalForgotPasswordEmail(true);
    };

    const handleRegisterRedirect = () => {
        navigate('/register');
    };

    return (
        <>
            <Container maxWidth="sm" style={{ marginTop: '50px' }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'white'
                    }}
                >
                    <Typography variant="h5" gutterBottom>
                        Đăng nhập
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <TextField
                            label="Mật khẩu"
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            style={{ marginTop: '20px' }}
                        >
                            Đăng nhập
                        </Button>
                    </form>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '10px' }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={handleForgotPassword}
                            style={{ textDecoration: 'none' }}
                        >
                            Quên mật khẩu?
                        </Link>
                        <div>
                            Chưa có tài khoản?
                            <Link
                                component="button"
                                variant="body2"
                                onClick={handleRegisterRedirect}
                                style={{ textDecoration: 'none' }}
                            >
                                Đăng ký ngay
                            </Link>
                        </div>
                    </Box>
                </Box>
            </Container>
            <ModalForgotPasswordEmail show={showModalForgotPasswordEmail} setShow={setShowModalForgotPasswordEmail} />
        </>
    );
};

export default Login;
