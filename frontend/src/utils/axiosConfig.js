// src/axiosConfig.js
import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000,
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('Response Error:', error.response);

            // Token hết hạn hoặc không hợp lệ
            if (error.response.status === 401 || error.response.status === 403) {
                console.log('Token hết hạn hoặc không hợp lệ:', error.response.data);
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Dispatch một custom event để AuthProvider có thể lắng nghe
                const authError = new CustomEvent('auth-error', {
                    detail: {
                        status: error.response.status,
                        message: error.response.data.message || 'Phiên đăng nhập đã hết hạn'
                    }
                });
                window.dispatchEvent(authError);

                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
        } else if (error.request) {
            console.error('Request Error:', error.request);
            toast.error('Không thể kết nối đến server');
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance;
