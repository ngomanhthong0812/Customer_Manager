import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Container } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ContactsIcon from '@mui/icons-material/Contacts';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthProvider';
import { logout } from '../services/authService';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const drawerWidth = 240;

// Định nghĩa theme colors
const themeColors = {
    primary: '#2196f3',      // Màu chính
    secondary: '#1976d2',    // Màu phụ
    background: '#f8f9fa',   // Màu nền
    drawer: '#fff',          // Màu drawer
    text: '#333',            // Màu chữ
    textLight: '#fff'        // Màu chữ sáng
};

const StyledDrawer = styled(Drawer)({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        marginTop: '0',
        backgroundColor: themeColors.drawer,
        color: themeColors.text,
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    },
});

const StyledListItem = styled(ListItem)(({ active }) => ({
    margin: '5px 10px',
    borderRadius: '8px',
    backgroundColor: active ? `${themeColors.primary}20` : 'transparent',
    '&:hover': {
        backgroundColor: `${themeColors.primary}10`,
    },
    '& .MuiListItemIcon-root': {
        color: active ? themeColors.primary : themeColors.text,
    },
    '& .MuiListItemText-primary': {
        color: active ? themeColors.primary : themeColors.text,
        fontWeight: active ? 600 : 400,
    },
}));

const LogoutListItem = styled(ListItem)({
    margin: '5px 10px',
    borderRadius: '8px',
    color: '#f44336',
    '&:hover': {
        backgroundColor: '#ffebee',
    },
    '& .MuiListItemIcon-root': {
        color: '#f44336',
    },
});

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Quản lý thành viên', icon: <PeopleIcon />, path: '/admin/members' },
    { text: 'Quản lý phản hồi', icon: <FeedbackIcon />, path: '/admin/feedbacks' },
    { text: 'Quản lý tương tác', icon: <ContactsIcon />, path: '/admin/interactions' },
    { text: 'Quản lý thông báo', icon: <NotificationsIcon />, path: '/admin/notifications' },
    { text: 'Trang người dùng', icon: <HomeIcon />, path: '/' },
];

// Tạo theme
const theme = createTheme();

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logoutAuth } = useAuth();

    const handleLogout = async () => {
        try {
            NProgress.start();
            await logout();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.success("Đã đăng xuất");
            logoutAuth();
            navigate('/login');
        } catch (error) {
            console.error(error);
            toast.error('Đăng xuất thất bại');
        } finally {
            NProgress.done();
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <StyledDrawer variant="permanent">
                    <List>
                        {menuItems.map((item) => (
                            <StyledListItem
                                button
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                active={location.pathname === item.path}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </StyledListItem>
                        ))}
                        <LogoutListItem
                            button
                            onClick={handleLogout}
                            sx={{ marginTop: 2 }}
                        >
                            <ListItemIcon>
                                <LogoutIcon />
                            </ListItemIcon>
                            <ListItemText primary="Đăng xuất" />
                        </LogoutListItem>
                    </List>
                </StyledDrawer>

                <Container maxWidth="xl" sx={{ marginTop: '0' }}>
                    {children}
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default AdminLayout; 