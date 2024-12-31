import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useAuth } from '../contexts/AuthProvider';
import nProgress from 'nprogress';
import { toast } from 'react-toastify';
import { updateMember } from '../services/memberService';
import './admin/members/modal_add_member.css';

function ModalUpdateProfile({ show, setShow, data }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        setFormData({
            name: data?.FullName,
            email: data?.Email,
            phone: data?.Phone,
            address: data?.Address
        })
    }, [data])


    const handleClose = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: ''
        })
        setShow(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // Kiểm tra các trường không được để trống
        if (!formData.name) newErrors.name = 'Tên người dùng không được để trống';
        if (!formData.email) newErrors.email = 'Email không được để trống';
        if (!formData.phone) newErrors.phone = 'Số điện thoại không được để trống';

        // Kiểm tra định dạng email
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (formData.email && !emailPattern.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Kiểm tra số điện thoại phải có 10 chữ số
        const phonePattern = /^[0-9]{10}$/;
        if (formData.phone && !phonePattern.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại phải gồm 10 chữ số';
        }

        setErrors(newErrors);
        console.log(user);

        // Nếu không có lỗi, bạn có thể xử lý việc cập nhật thông tin ở đây
        if (Object.keys(newErrors).length === 0 && user) {
            try {
                nProgress.start();
                // Gọi API đăng nhập từ service
                await updateMember(
                    user.id,
                    {
                        RoleID: user.role,
                        FullName: formData.name,
                        Email: formData.email,
                        Phone: formData.phone,
                        Address: formData.address || null,
                        IsActive: true
                    }
                );

                // Hiển thị thông báo thành công
                handleClose();
                toast.success('Cập nhật thông tin thành công');
            } catch (error) {
                console.error('Lỗi từ API:', error);

                // Hiển thị thông báo lỗi khi đăng nhập thất bại
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || 'Cập nhật thông tin không thành công');
                } else {
                    toast.error('Đã xảy ra lỗi khi kết nối với server. Vui lòng thử lại sau.');
                }
            } finally {
                nProgress.done();
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose} className='custom-modal'>
            <Modal.Header closeButton>
                <Modal.Title>Thông tin người dùng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Tên người dùng</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                        <Form.Label>Địa chỉ Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            isInvalid={!!errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.phone}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput4">
                        <Form.Label>Địa chỉ</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            isInvalid={!!errors.address}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.address}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={handleClose} className="me-2">
                            Huỷ
                        </Button>
                        <Button variant="primary" type="submit">
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default ModalUpdateProfile;
