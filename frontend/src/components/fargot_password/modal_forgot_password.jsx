import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { resetPassword } from '../../services/memberService';
import nProgress from 'nprogress';
import '../admin/members/modal_add_member.css'; // Dùng chung CSS với modal adds

function ModalForgotPassword({ show, setShow, email }) {
    const [formData, setFormData] = useState({
        code: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({
        code: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleClose = () => {
        setShow(false);
        setFormData(
            {
                code: '',
                newPassword: '',
                confirmPassword: ''
            }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // Kiểm tra các trường không được để trống
        if (!formData.code) newErrors.code = 'Mã xác nhận không được để trống';

        // Validate mật khẩu mới
        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword)) {
            newErrors.newPassword = 'Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
        }

        // Validate nhập lại mật khẩu
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu không trùng khớp';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                nProgress.start();
                await resetPassword(email, formData.code, formData.newPassword);
                toast.success("Khôi phục mật khẩu thành công.")
                handleClose();
            } catch (error) {
                console.error('Lỗi từ API:', error);
                toast.error(error.response.data.error);
            } finally {
                nProgress.done();
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose} className='custom-modal'>
            <Modal.Header closeButton>
                <Modal.Title>Quên mật khẩu</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Nhập mã đã gửi đến email</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Mã xác nhận"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            isInvalid={!!errors.code}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.code}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="newPassword">
                        <Form.Label>Nhập mật khẩu mới</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Mật khẩu mới"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            isInvalid={!!errors.confirmPassword}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Huỷ
                        </Button>
                        <Button variant="primary" type="submit">
                            Đổi mật khẩu
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default ModalForgotPassword;
