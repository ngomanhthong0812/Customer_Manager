import React, { useEffect, useState } from 'react';
import { TextField, Button, Link, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';
import { Visibility, VisibilityOff } from '@mui/icons-material';

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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
            newErrors.password = 'Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
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
                await register(formData.fullname, formData.email, formData.password);

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
        <div className="auth-page">
            <div className="auth-form">
                <h2>Đăng ký</h2>
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
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <TextField
                        label="Xác nhận mật khẩu"
                        type={showConfirmPassword ? 'text' : 'password'}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
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
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        Đã có tài khoản? <Link href="/login" style={{ textDecoration: 'none' }}>Đăng nhập</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
