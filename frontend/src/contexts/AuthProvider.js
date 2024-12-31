import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Tạo context
const AuthContext = createContext();

// Cung cấp context cho các component con
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setIsLoggedIn(true);
            setUser(JSON.parse(storedUser));
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    }, []);

    // Lắng nghe sự kiện token hết hạn
    const handleAuthError = (event) => {
        console.log('Auth Error:', event.detail);
        setIsLoggedIn(false);
        setUser(null);
        navigate('/login');
    };

    window.addEventListener('auth-error', handleAuthError);

    // Hàm để đăng nhập
    const loginAuth = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoggedIn(true);
        setUser(userData);
    };

    // Hàm để đăng xuất
    const logoutAuth = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, loginAuth, logoutAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook để sử dụng context
export const useAuth = () => useContext(AuthContext);
