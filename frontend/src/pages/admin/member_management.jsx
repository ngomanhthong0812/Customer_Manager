import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Row, Col } from 'react-bootstrap';
import PaginationRounded from '../../components/PaginationRounded';
import { getMember, deleteMember, updateStatusMember } from '../../services/memberService';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';
import ModalAddMember from '../../components/admin/members/modal_add_member';
import ModalUpdateMember from '../../components/admin/members/modal_update_member';
import ModalConfirm from '../../components/modal_confirm/modal_confirm';
import { useAuth } from '../../contexts/AuthProvider';


const MemberManagement = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const limit = 10;
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const [memberToDelete, setMemberToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [memberToUpdateStatus, setMemberToUpdateStatus] = useState(null);
    const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);

    const fetchMember = async () => {
        try {
            NProgress.start();
            const data = await getMember(page, limit, search);
            setMembers(data.members);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách thành viên');
        } finally {
            NProgress.done();
        }
    }

    useEffect(() => {
        fetchMember();
    }, [page])

    useEffect(() => {
        if (!search) {
            fetchMember();
        }
    }, [search])

    const handleEdit = (member) => {
        setSelectedMember(member);
        setShowUpdateModal(true);
    };

    const handleDelete = (member) => {
        setMemberToDelete(member);
        setShowDeleteModal(true);
    };
    const handleUpdateStatus = (member) => {
        setMemberToUpdateStatus(member);
        setShowUpdateStatusModal(true);
    };

    const confirmDelete = async () => {
        try {
            NProgress.start();
            await deleteMember(memberToDelete.MemberID);
            toast.success('Xóa thành viên thành công');
            fetchMember();
            setShowDeleteModal(false);
        } catch (error) {
            toast.error('Lỗi khi xóa thành viên');
            console.error(error);
        } finally {
            NProgress.done();
        }
    };

    const confirmUpdateStatus = async () => {
        try {
            NProgress.start();
            await updateStatusMember(memberToUpdateStatus.MemberID);
            toast.success('Thay đổi trạng thái thành công');
            fetchMember();
            setShowUpdateStatusModal(false);
        } catch (error) {
            toast.error('Lỗi khi đổi trạng thái thành viên');
            console.error(error);
        } finally {
            NProgress.done();
        }
    };

    return (
        <Container fluid className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Quản lý thành viên</h2>
                <Button
                    variant="primary"
                    className="ms-2 d-flex align-items-center justify-content-center"
                    onClick={() => setShowAddModal(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus me-2" viewBox="0 0 16 16">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                    Thêm thành viên
                </Button>
            </div>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                            variant="primary"
                            className="ms-2 d-flex align-items-center justify-content-center"
                            onClick={() => {
                                setPage(1);
                                fetchMember();
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                        </Button>
                    </Form.Group>
                </Col>
            </Row>

            <Table striped bordered hover responsive className="shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) => (
                        member.MemberID !== user.id && (
                            <tr key={member.id}>
                                <td>{member.MemberID}</td>
                                <td>{member.FullName}</td>
                                <td>{member.Email}</td>
                                <td>{member.Phone}</td>
                                <td>{member.RoleID === 123 ? 'Admin' : 'Member'}</td>
                                <td>
                                    <span className={`badge ${member.IsActive ? 'bg-success' : 'bg-danger'}`}>
                                        {member.IsActive ? 'Đang hoạt động' : 'Không hoạt động'}
                                    </span>
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => handleEdit(member)}
                                        >
                                            Sửa
                                        </Button>
                                        {member.RoleID !== 123
                                            && (
                                                <>
                                                    <Button
                                                        variant={member.IsActive ? 'danger' : 'success'}
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(member)}
                                                    >
                                                        {member.IsActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(member)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </>
                                            )}

                                    </div>
                                </td>
                            </tr>
                        )
                    ))}
                </tbody>
            </Table>

            <div className="d-flex justify-content-center mt-4">
                <PaginationRounded
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                />
            </div>

            <ModalAddMember
                show={showAddModal}
                setShow={setShowAddModal}
                onSuccess={fetchMember}
            />

            <ModalUpdateMember
                show={showUpdateModal}
                setShow={setShowUpdateModal}
                onSuccess={fetchMember}
                data={selectedMember}
            />

            <ModalConfirm
                show={showDeleteModal}
                setShow={setShowDeleteModal}
                onConfirm={confirmDelete}
                message={
                    <>
                        Bạn có chắc chắn muốn xóa thành viên{' '}
                        <strong>{memberToDelete?.FullName}</strong>?
                        Lưu ý các bảng ghi liên quan tới người dùng này cũng sẽ bị xoá
                    </>
                }
            />

            <ModalConfirm
                show={showUpdateStatusModal}
                setShow={setShowUpdateStatusModal}
                onConfirm={confirmUpdateStatus}
                message={
                    <>
                        Bạn có chắc chắn muốn {memberToUpdateStatus?.IsActive === 1 ? 'vô hiệu hoá' : 'kích hoạt'} tài khoản{' '}
                        <strong>{memberToUpdateStatus?.FullName}</strong>?
                    </>
                }
            />
        </Container>
    );
};

export default MemberManagement; 