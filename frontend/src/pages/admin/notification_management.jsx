import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Row, Col, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import { getAllNotifications, createNotification } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthProvider';
import socket from '../../services/socket';

const NotificationManagement = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        SenderID: user?.id || null,
        Title: '',
        Content: '',
        Type: 'MEMBER'
    });

    const [errors, setErrors] = useState({
        Title: '',
        Content: '',
        Type: ''
    });

    useEffect(() => {
        setFormData({ ...formData, SenderID: user?.id });
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            NProgress.start();
            const data = await getAllNotifications('ALL');
            setNotifications(data);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách thông báo');
        } finally {
            setLoading(false);
            NProgress.done();
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        // Validate Title
        if (!formData.Title.trim()) {
            newErrors.Title = 'Tiêu đề không được để trống';
        }

        // Validate Content
        if (!formData.Content.trim()) {
            newErrors.Content = 'Nội dung không được để trống';
        }

        // Validate Type
        if (!['MEMBER', 'ADMIN', 'ALL'].includes(formData.Type)) {
            newErrors.Type = 'Loại thông báo không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            NProgress.start();
            // Gửi thông báo qua API
            await createNotification(formData);

            // Gửi thông báo qua socket
            socket.emit('send-notification', formData.Type, (ack) => {
                if (ack.success) {
                    console.log('Notification sent via socket successfully:', ack.notification);
                } else {
                    console.error('Failed to send notification via socket:', ack.error);
                }
            });

            toast.success('Gửi thông báo thành công');
            setFormData({ SenderID: user?.id || null, Title: '', Content: '', Type: 'MEMBER' });
            setShowForm(false);
            fetchNotifications();
        } catch (error) {
            toast.error('Lỗi khi gửi thông báo');
        } finally {
            NProgress.done();
        }
    };

    return (
        <Container fluid className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Quản lý thông báo</h2>
                <Button
                    variant="primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Đóng form' : 'Tạo thông báo mới'}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white p-4 rounded shadow-sm mb-4">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tiêu đề</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.Title}
                                        onChange={(e) => {
                                            setFormData({ ...formData, Title: e.target.value });
                                            if (errors.Title) setErrors({ ...errors, Title: '' });
                                        }}
                                        isInvalid={!!errors.Title}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.Title}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Đối tượng nhận</Form.Label>
                                    <Form.Select
                                        value={formData.Type}
                                        onChange={(e) => {
                                            setFormData({ ...formData, Type: e.target.value });
                                            if (errors.Type) setErrors({ ...errors, Type: '' });
                                        }}
                                        isInvalid={!!errors.Type}
                                    >
                                        <option value="MEMBER">Thành viên</option>
                                        <option value="ADMIN">Admin</option>
                                        <option value="ALL">All</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.Type}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nội dung</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={formData.Content}
                                        onChange={(e) => {
                                            setFormData({ ...formData, Content: e.target.value });
                                            if (errors.Content) setErrors({ ...errors, Content: '' });
                                        }}
                                        isInvalid={!!errors.Content}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.Content}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="text-end">
                            <Button variant="primary" type="submit">
                                Gửi thông báo
                            </Button>
                        </div>
                    </Form>
                </div>
            )}

            <div className="bg-white rounded shadow-sm">
                <Table hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tiêu đề</th>
                            <th>Nội dung</th>
                            <th>Đối tượng</th>
                            <th>Thời gian tạo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : notifications?.length > 0 ? (
                            notifications.map((notification) => (
                                <tr key={notification.NotificationID}>
                                    <td>{notification.NotificationID}</td>
                                    <td>{notification.Title}</td>
                                    <td>{notification.Content}</td>
                                    <td>{notification.Type}</td>
                                    <td>{new Date(notification.CreatedAt).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    Không có thông báo nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default NotificationManagement;