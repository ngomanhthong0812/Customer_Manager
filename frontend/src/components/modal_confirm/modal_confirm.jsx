import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './modal_confirm.css';

const ModalDeleteConfirm = ({ show, setShow, onConfirm, message }) => {
    return (
        <Modal
            show={show}
            onHide={() => setShow(false)}
            centered
            className="confirm-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>{'Xác nhận'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Hủy
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Xác nhận
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalDeleteConfirm; 