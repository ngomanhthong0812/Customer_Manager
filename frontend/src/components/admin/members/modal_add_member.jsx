import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';
import './modal_add_member.css';
import { createMember } from '../../../services/memberService';

const ModalAddMember = ({ show, setShow, onSuccess }) => {
    const [newMember, setNewMember] = useState({
        FullName: '',
        Email: '',
        Phone: '',
        Address: '',
        Password: '',
        RoleID: 345,
        IsActive: true,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            NProgress.start();
            // Gọi API thêm member ở đây
            await createMember(newMember);
            toast.success('Thêm thành viên thành công');
            setShow(false);
            onSuccess(); // Callback để refresh danh sách
            // Reset form
            setNewMember({
                FullName: '',
                Email: '',
                Phone: '',
                Address: '',
                Password: '',
                RoleID: 345,
                IsActive: true,
            });
        } catch (error) {
            console.error('Error adding member:', error);
            toast.error(`Lỗi khi thêm thành viên: ${error.response?.data?.message || error.message}`);
        } finally {
            NProgress.done();
        }
    };

    return (
        <Modal
            show={show}
            onHide={() => setShow(false)}
            centered
            className="custom-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Thêm thành viên mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ tên</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newMember.FullName}
                                    onChange={(e) => setNewMember({ ...newMember, FullName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={newMember.Email}
                                    onChange={(e) => setNewMember({ ...newMember, Email: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control
                                    type="tel"
                                    value={newMember.Phone}
                                    onChange={(e) => setNewMember({ ...newMember, Phone: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Mật khẩu</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={newMember.Password}
                                    onChange={(e) => setNewMember({ ...newMember, Password: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Địa chỉ</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={newMember.Address}
                            onChange={(e) => setNewMember({ ...newMember, Address: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Vai trò</Form.Label>
                        <Form.Select
                            value={newMember.RoleID}
                            onChange={(e) => setNewMember({ ...newMember, RoleID: parseInt(e.target.value) })}
                        >
                            <option value={345}>Thành viên</option>
                            <option value={123}>Admin</option>
                        </Form.Select>
                    </Form.Group>

                    <div className="text-end mt-4">
                        <Button variant="secondary" className="me-2" onClick={() => setShow(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit">
                            Thêm thành viên
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ModalAddMember; 