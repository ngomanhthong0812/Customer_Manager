import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { changePasswordMember } from '../services/memberService';
import { useAuth } from '../contexts/AuthProvider';
import { toast } from 'react-toastify';
import nProgress from 'nprogress';
import '../components/admin/members/modal_add_member.css';

function ModalUpdatePassword({ show, setShow }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleClose = () => {
        setFormData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        })
        setShow(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validate mật khẩu cũ
        if (!formData.oldPassword) {
            newErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
        }

        // Validate mật khẩu mới
        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        }

        // Validate nhập lại mật khẩu
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu không trùng khớp';
        }

        setErrors(newErrors);

        // Nếu không có lỗi, thực hiện hành động
        if (Object.keys(newErrors).length === 0 && user) {
            try {
                nProgress.start();
                // Gọi API đăng nhập từ service
                await changePasswordMember(user.id, formData.oldPassword, formData.newPassword);

                // Hiển thị thông báo thành công
                handleClose();
                toast.success('Đổi mật khẩu thành công');
            } catch (error) {
                console.error('Lỗi từ API:', error);

                // Hiển thị thông báo lỗi khi đăng nhập thất bại
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || 'Đổi mật khẩu không thành công');
                } else {
                    toast.error('Đã xảy ra lỗi khi kết nối với server. Vui lòng thử lại sau.');
                }
            } finally {
                nProgress.done();
            }
        }
    };

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
        setErrors({
            ...errors,
            [field]: '', // Xóa lỗi khi người dùng chỉnh sửa
        });
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Thay đổi mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="oldPassword">
                            <Form.Label>Nhập mật khẩu cũ</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Mật khẩu cũ"
                                value={formData.oldPassword}
                                onChange={(e) => handleChange('oldPassword', e.target.value)}
                                isInvalid={!!errors.oldPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.oldPassword}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="newPassword">
                            <Form.Label>Nhập mật khẩu mới</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Mật khẩu mới"
                                value={formData.newPassword}
                                onChange={(e) => handleChange('newPassword', e.target.value)}
                                isInvalid={!!errors.newPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.newPassword}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="confirmPassword">
                            <Form.Label>Nhập lại mật khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                isInvalid={!!errors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.confirmPassword}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Huỷ
                    </Button>
                    <Button variant="primary" type="submit" onClick={handleSubmit}>
                        Đổi mật khẩu
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalUpdatePassword;
