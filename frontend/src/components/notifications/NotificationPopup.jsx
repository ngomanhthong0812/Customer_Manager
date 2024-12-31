import React, { useState, useEffect, useRef } from 'react';
import { Overlay, Popover, Badge } from 'react-bootstrap';
import { BsBell } from 'react-icons/bs';
import { getAllNotifications, getUnreadNotifications, markNotificationAsRead } from '../../services/notificationService';
import './NotificationPopup.css';
import { useAuth } from '../../contexts/AuthProvider';
import socket from '../../services/socket';
import { toast } from 'react-toastify';

const NotificationPopup = () => {
    const { user } = useAuth();
    const [show, setShow] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const target = useRef(null);

    const fetchNotifications = async () => {
        if (user) {
            try {
                setLoading(true);
                const data = await getAllNotifications(user?.role === 123 ? 'ADMIN' : 'MEMBER');
                setNotifications(data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Lắng nghe thông báo mới từ server
        socket.on("receive-notification", (content) => {
            fetchNotifications();
            fetchUnreadNotifications();
            setTimeout(() => {
                toast.info(`Bạn có thông báo mới!`);
            }, 500);
        });

        // Dọn dẹp socket khi component unmount
        return () => {
            socket.off("receive-notification");
        };
    }, [user?.role]);

    const handleNotificationClick = async () => {
        setShow(!show);
        if (!show) {
            try {
                await markNotificationAsRead();
                setUnreadCount(0);
            } catch (error) {
                console.error('Error marking notifications as read:', error);
            }
        }
    };

    const fetchUnreadNotifications = async () => {
        try {
            const unreadNotifications = await getUnreadNotifications();
            setUnreadCount(unreadNotifications.length);
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    };

    useEffect(() => {
        fetchUnreadNotifications();
    }, [notifications]);

    return (
        <div className="notification-container">
            <div ref={target} onClick={() => handleNotificationClick()} className="notification-icon">
                <BsBell size={20} className='text-white' />
                {unreadCount > 0 && (
                    <Badge bg="danger" className="notification-badge">
                        {unreadCount}
                    </Badge>
                )}
            </div>

            <Overlay
                target={target.current}
                show={show}
                placement="bottom"
                rootClose
                onHide={() => setShow(false)}
            >
                <Popover className="notification-popover">
                    <Popover.Header>
                        <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">Thông báo</h6>
                            {unreadCount > 0 && (
                                <Badge bg="danger">{unreadCount} mới</Badge>
                            )}
                        </div>
                    </Popover.Header>
                    <Popover.Body>
                        <div className="notification-list">
                            {loading ? (
                                <div className="text-center py-3">
                                    Đang tải...
                                </div>
                            ) : notifications?.length > 0 ? (
                                notifications.map(notification => (
                                    <div
                                        key={notification.NotificationID}
                                        className='notification-item'
                                    >
                                        <div className="notification-title">{notification.Title}</div>
                                        <div className="notification-content">{notification.Content}</div>
                                        <div className="notification-time">
                                            {new Date(notification.CreatedAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-notifications">
                                    Không có thông báo nào
                                </div>
                            )}
                        </div>
                    </Popover.Body>
                </Popover>
            </Overlay>
        </div>
    );
};

export default NotificationPopup; 