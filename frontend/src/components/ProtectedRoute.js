// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token) {
        // Nếu chưa đăng nhập, chuyển đến trang login
        return <Navigate to="/login" />;
    }

    if (adminOnly && (!user || user.role !== 123)) {
        // Nếu route yêu cầu admin nhưng user không phải admin
        // chuyển về trang chủ
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
