import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { updateInteractionNotes } from '../../../services/interactionService';

const ModalUpdateNotes = ({ show, setShow, data, onSuccess }) => {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (data) {
            setNotes(data.Notes);
        }
    }, [data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Sau này sẽ gọi API cập nhật
            await updateInteractionNotes(data.InteractionID, notes);
            toast.success('Cập nhật ghi chú thành công');
            setShow(false);
            onSuccess();
        } catch (error) {
            toast.error('Lỗi khi cập nhật ghi chú');
        }
    };

    return (
        <Modal show={show} onHide={() => setShow(false)} centered className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Cập nhật ghi chú</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Ghi chú</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <div className="text-end mt-3">
                        <Button variant="secondary" className="me-2" onClick={() => setShow(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary"
                            type='submit'>
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ModalUpdateNotes; 