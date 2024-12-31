import React, { useEffect, useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        fullname: '',      // Thêm trường họ và tên
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        fullname: '',      // Thêm lỗi cho trường họ và tên
        email: '',
        password: '',
        confirmPassword: ''
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

        // Kiểm tra các trường nhập liệu (có thể tùy chỉnh thêm)
        const newErrors = {};
        // Kiểm tra họ và tên
        if (!formData.fullname) newErrors.fullname = 'Họ và tên không được để trống';

        // Kiểm tra email
        if (!formData.email) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) { // Kiểm tra định dạng email
            newErrors.email = 'Email không hợp lệ';
        }

        // Kiểm tra mật khẩu
        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (formData.password.length < 6) {  // Kiểm tra mật khẩu ít nhất 6 ký tự
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        // Kiểm tra xác nhận mật khẩu
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu không khớp';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                NProgress.start();
                // Gọi API đăng nhập từ service
                const response = await register(formData.fullname, formData.email, formData.password);

                // Hiển thị thông báo thành công
                toast.success('Đăng kí thành công, vui lòng đăng nhập');

                // Điều hướng đến trang chủ hoặc trang người dùng
                navigate('/login');
            } catch (error) {
                console.error('Lỗi từ API:', error);

                // Hiển thị thông báo lỗi khi đăng nhập thất bại
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || 'Đăng kí thất bại. Vui lòng kiểm tra lại thông tin.');
                } else {
                    toast.error('Đã xảy ra lỗi khi kết nối với server. Vui lòng thử lại sau.');
                }
            } finally {
                NProgress.done();
            }
        }
    };

    return (
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
                    Đăng ký tài khoản
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Họ và tên"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={formData.fullname}
                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                        error={!!errors.fullname}
                        helperText={errors.fullname}
                    />
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
                    <TextField
                        label="Xác nhận mật khẩu"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        style={{ marginTop: '20px' }}
                    >
                        Đăng ký
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Register;
