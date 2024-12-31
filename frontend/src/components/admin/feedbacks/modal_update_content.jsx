import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { updateFeedback } from '../../../services/feedbackService';

const ModalUpdateContent = ({ show, setShow, data, onSuccess }) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (data) {
            setContent(data.Content);
        }
    }, [data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateFeedback(data.FeedbackID, { Content: content });
            toast.success('Cập nhật nội dung thành công');
            setShow(false);
            onSuccess();
        } catch (error) {
            toast.error('Lỗi khi cập nhật nội dung');
        }
    };

    return (
        <Modal show={show} onHide={() => setShow(false)} centered className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Cập nhật nội dung phản hồi</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Nội dung</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <div className="text-end mt-3">
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

export default ModalUpdateContent; 