import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { forgotPassword } from '../../services/memberService';
import ModalForgotPassword from './modal_forgot_password';
import { toast } from 'react-toastify';
import nProgress from 'nprogress';
import '../admin/members/modal_add_member.css'; // Dùng chung CSS với modal adds

function ModalForgotPasswordEmail({ show, setShow }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);  // Trạng thái gửi yêu cầu

    const [showModalForgotPassword, setShowModalForgotPassword] = useState(false);

    const handleClose = () => {
        setShow(false);
        setEmail('');
    }

    const handleSubmit = async () => {
        if (!email) {
            setError('Vui lòng nhập email');
        } else {
            try {
                setLoading(true);  // Bắt đầu gửi yêu cầu
                nProgress.start();
                await forgotPassword(email);
                toast.success("Đã gửi mã xác nhận đến email của bạn.");
                setShowModalForgotPassword(true);
            } catch (error) {
                console.log(error);
                toast.error("Đã xảy ra lỗi khi gửi yêu cầu.");
            } finally {
                setLoading(false);  // Kết thúc gửi yêu cầu
                nProgress.done();
            }
        }
    }

    useEffect(() => {
        if (!showModalForgotPassword) {
            handleClose();
        }
    }, [showModalForgotPassword]);

    return (
        <>
            <Modal show={show} onHide={handleClose} className='custom-modal'>
                <Modal.Header closeButton>
                    <Modal.Title>Quên mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Nhập địa chỉ Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                autoFocus
                                isInvalid={!!error}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Huỷ
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading} // Vô hiệu hóa nút khi đang gửi yêu cầu
                    >
                        {loading ? 'Đang gửi...' : 'Tiếp theo'}
                    </Button>
                </Modal.Footer>
            </Modal>
            <ModalForgotPassword show={showModalForgotPassword} setShow={setShowModalForgotPassword} email={email} />
        </>
    );
}

export default ModalForgotPasswordEmail;
