import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';
import './modal_add_member.css'; // Dùng chung CSS với modal add
import { updateMember } from '../../../services/memberService';

const ModalUpdateMember = ({ show, setShow, onSuccess, data }) => {
    const [memberData, setMemberData] = useState({
        FullName: null,
        Email: null,
        Phone: null,
        Address: null,
        RoleID: 1,
        IsActive: true,
    });

    // Cập nhật form khi data thay đổi
    useEffect(() => {
        if (data) {
            setMemberData({
                FullName: data.FullName || null,
                Email: data.Email || null,
                Phone: data.Phone || null,
                Address: data.Address || null,
                RoleID: data.RoleID,
                IsActive: data.IsActive === 1,
            });
        }
    }, [data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            NProgress.start();
            await updateMember(data.MemberID, memberData);
            toast.success('Cập nhật thành viên thành công');
            setShow(false);
            onSuccess();
        } catch (error) {
            toast.error('Lỗi khi cập nhật thành viên');
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
                <Modal.Title>Cập nhật thành viên</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ tên</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={memberData.FullName}
                                    onChange={(e) => setMemberData({ ...memberData, FullName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={memberData.Email}
                                    onChange={(e) => setMemberData({ ...memberData, Email: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control
                                    type="tel"
                                    value={memberData.Phone}
                                    onChange={(e) => setMemberData({ ...memberData, Phone: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Địa chỉ</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={memberData.Address}
                            onChange={(e) => setMemberData({ ...memberData, Address: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Vai trò</Form.Label>
                        <Form.Select
                            value={memberData.RoleID}
                            onChange={(e) => setMemberData({ ...memberData, RoleID: parseInt(e.target.value) })}
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
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ModalUpdateMember; 