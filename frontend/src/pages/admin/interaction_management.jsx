import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Row, Col, Form } from 'react-bootstrap';
import PaginationRounded from '../../components/PaginationRounded';
import InteractionFilter from '../../components/admin/interactions/interaction_filter';
import ModalUpdateNotes from '../../components/admin/interactions/modal_update_notes';
import ModalConfirm from '../../components/modal_confirm/modal_confirm';
import { toast } from 'react-toastify';
import { getAllInteractions, deleteInteraction, updateInteractionNotes } from '../../services/interactionService';
import NProgress from 'nprogress';

const InteractionManagement = () => {
    const [interactions, setInteractions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(5);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [filterType, setFilterType] = useState('');
    const [search, setSearch] = useState('');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedInteraction, setSelectedInteraction] = useState(null);

    const fetchInteractions = async () => {
        try {
            NProgress.start();
            const response = await getAllInteractions(page, 10, search, dateRange.startDate, dateRange.endDate, filterType);
            setInteractions(response.interactions);
            setTotalPages(response.totalPages);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách tương tác');
            console.error(error);
        } finally {
            NProgress.done();
        }
    };

    useEffect(() => {
        fetchInteractions();
    }, [page, search, dateRange.startDate, dateRange.endDate, filterType]);

    const getInteractionBadge = (type) => {
        const colors = {
            'Call': 'primary',
            'Email': 'success',
            'Meeting': 'warning',
            'Others': 'info'
        };
        return <Badge bg={colors[type] || 'secondary'}>{type}</Badge>;
    };

    const handleResetFilter = () => {
        setDateRange({
            startDate: '',
            endDate: ''
        });
        setFilterType('');
        setPage(1);
        fetchInteractions();
    };

    const handleEdit = (interaction) => {
        setSelectedInteraction(interaction);
        setShowUpdateModal(true);
    };

    const handleDelete = (interaction) => {
        setSelectedInteraction(interaction);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            NProgress.start();
            await deleteInteraction(selectedInteraction.InteractionID);
            toast.success('Xóa tương tác thành công');
            setShowDeleteModal(false);
            fetchInteractions();
        } catch (error) {
            toast.error('Lỗi khi xóa tương tác');
            console.error(error);
        } finally {
            NProgress.done();
        }
    };



    return (
        <Container fluid className="mt-4">
            <h2 className="mb-4">Quản lý tương tác</h2>

            <InteractionFilter
                dateRange={dateRange}
                setDateRange={setDateRange}
                filterType={filterType}
                setFilterType={setFilterType}
                handleResetFilter={handleResetFilter}
            />
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Table striped bordered hover responsive className="shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Tên Nhân viên</th>
                        <th>Tên Khách hàng</th>
                        <th>Loại tương tác</th>
                        <th>Ghi chú</th>
                        <th>Thời gian tạo</th>
                        <th>Cập nhật lần cuối</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {interactions.length > 0 ? (
                        interactions.map((interaction) => (
                            <tr key={interaction.InteractionID}>
                                <td>{interaction.InteractionID}</td>
                                <td>{interaction.MemberName}</td>
                                <td>{interaction.CustomerName}</td>
                                <td>{getInteractionBadge(interaction.InteractionType)}</td>
                                <td>{interaction.Notes}</td>
                                <td>{new Date(interaction.CreatedAt).toLocaleString()}</td>
                                <td>{new Date(interaction.UpdatedAt).toLocaleString()}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => handleEdit(interaction)}
                                        >
                                            Sửa
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(interaction)}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center py-4">
                                Không có dữ liệu tương tác nào được tìm thấy
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
            <div className="d-flex justify-content-center mt-4">
                <PaginationRounded
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                />
            </div>

            <ModalUpdateNotes
                show={showUpdateModal}
                setShow={setShowUpdateModal}
                data={selectedInteraction}
                onSuccess={fetchInteractions}
            />

            <ModalConfirm
                show={showDeleteModal}
                setShow={setShowDeleteModal}
                onConfirm={confirmDelete}
                message={
                    <>
                        Bạn có chắc chắn muốn xóa tương tác này?
                    </>
                }
            />
        </Container>
    );
};

export default InteractionManagement;