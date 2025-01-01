import React from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { logout } from '../services/authService';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import NotificationPopup from '../components/notifications/NotificationPopup';

const UserLayout = ({ children }) => {
    const navigate = useNavigate();
    const { logoutAuth, user } = useAuth();
    const isAdmin = user?.role === 123; // Kiểm tra role admin

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
        <div className="app-background">
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="/">
                        <img
                            src="/favicon.ico"
                            alt="Logo"
                            style={{ width: '40px', height: '40px' }}
                        />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Tài khoản</Nav.Link>
                            <Nav.Link href="/feedback">Phản hồi</Nav.Link>
                            <Nav.Link href="/transaction_history">Lịch sử hoạt động</Nav.Link>
                            <Nav.Link href="/chat">Chat với {isAdmin ? 'Member' : 'Admin'}</Nav.Link>
                        </Nav>
                        <div className="d-flex gap-2 align-items-center">
                            <NotificationPopup />
                            {isAdmin && (
                                <Button
                                    variant="outline-info"
                                    onClick={() => navigate('/admin/dashboard')}
                                >
                                    Truy cập Admin
                                </Button>
                            )}
                            <Button variant="outline-light" onClick={handleLogout}>
                                Đăng xuất
                            </Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <div style={{ minHeight: 'calc(100vh - 56px)' }}>
                {children}
            </div>
        </div>
    );
};

export default UserLayout; 