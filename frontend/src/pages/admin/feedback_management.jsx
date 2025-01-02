import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Row, Col, Button } from 'react-bootstrap';
import PaginationRounded from '../../components/PaginationRounded';
import ModalConfirm from '../../components/modal_confirm/modal_confirm';
import ModalUpdateContent from '../../components/admin/feedbacks/modal_update_content';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import { getAllFeedbacks, deleteFeedback } from '../../services/feedbackService';

const FeedbackManagement = () => {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            NProgress.start();
            const response = await getAllFeedbacks(page, 10, search, ratingFilter);
            setFeedbacks(response.feedbacks);
            setTotalPages(response.totalPages);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu phản hồi');
        } finally {
            setLoading(false);
            NProgress.done();
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [page, search, ratingFilter]);

    const renderStars = (rating) => {
        return "⭐".repeat(rating);
    };

    const handleDelete = (feedback) => {
        setSelectedFeedback(feedback);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            NProgress.start();
            await deleteFeedback(selectedFeedback.FeedbackID);
            toast.success('Xóa phản hồi thành công');
            setShowDeleteModal(false);
            fetchFeedbacks();
        } catch (error) {
            toast.error('Lỗi khi xóa phản hồi');
        } finally {
            NProgress.done();
        }
    };

    const handleEdit = (feedback) => {
        setSelectedFeedback(feedback);
        setShowUpdateModal(true);
    };

    return (
        <Container fluid className="mt-4">
            <h2 className="mb-4">Quản lý phản hồi</h2>
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm theo nội dung..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Form.Group>
                        <Form.Select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                        >
                            <option value="">Tất cả đánh giá</option>
                            <option value="5">5 sao</option>
                            <option value="4">4 sao</option>
                            <option value="3">3 sao</option>
                            <option value="2">2 sao</option>
                            <option value="1">1 sao</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            <Table striped bordered hover responsive className="shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>ID Khách hàng</th>
                        <th>Nội dung</th>
                        <th>Đánh giá</th>
                        <th>Ảnh đánh giá</th>
                        <th>Thời gian tạo</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="text-center py-4">
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    ) : feedbacks.length > 0 ? (
                        feedbacks.map((feedback) => (
                            <tr key={feedback.FeedbackID}>
                                <td>{feedback.FeedbackID}</td>
                                <td>{feedback.CustomerName}</td>
                                <td>{feedback.Content}</td>
                                <td>{renderStars(feedback.Rating)}</td>
                                {feedback.ReviewImage ?
                                    <td>
                                        <img src={`${process.env.REACT_APP_SOCKET_URL}${feedback.ReviewImage}`}
                                            alt=""
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                    </td> :
                                    <td>

                                    </td>}
                                <td>{new Date(feedback.CreatedAt).toLocaleString()}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => handleEdit(feedback)}
                                        >
                                            Sửa
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(feedback)}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-4">
                                Không có dữ liệu phản hồi nào được tìm thấy
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

            <ModalConfirm
                show={showDeleteModal}
                setShow={setShowDeleteModal}
                onConfirm={confirmDelete}
                message={
                    <>
                        Bạn có chắc chắn muốn xóa phản hồi này?
                    </>
                }
            />

            <ModalUpdateContent
                show={showUpdateModal}
                setShow={setShowUpdateModal}
                data={selectedFeedback}
                onSuccess={fetchFeedbacks}
            />
        </Container>
    );
};

export default FeedbackManagement;