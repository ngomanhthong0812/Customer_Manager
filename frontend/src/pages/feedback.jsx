import nProgress from 'nprogress';
import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Rating from 'react-rating';
import { createFeedback } from '../services/feedbackService';
import { useAuth } from '../contexts/AuthProvider';
import { toast } from 'react-toastify';

// Thêm styles
const styles = {
    container: {
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center'
    },
    card: {
        border: 'none',
        borderRadius: '15px',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        padding: '2rem'
    },
    title: {
        color: '#2c3e50',
        fontWeight: '600',
        marginBottom: '2rem',
        textAlign: 'center',
        fontSize: '2rem'
    },
    ratingContainer: {
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '10px',
        marginBottom: '1.5rem'
    },
    ratingLabel: {
        color: '#495057',
        fontWeight: '500',
        marginBottom: '1rem'
    },
    ratingStars: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px'
    },
    textArea: {
        resize: 'none',
        border: '1px solid #ced4da',
        borderRadius: '10px',
        padding: '1rem',
        fontSize: '1rem'
    },
    submitButton: {
        padding: '0.8rem 2rem',
        borderRadius: '50px',
        fontWeight: '500',
        fontSize: '1.1rem',
        backgroundColor: '#28a745',
        border: 'none',
        transition: 'all 0.3s ease',
        width: '100%'
    }
};

function FeedbackPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        rating: 0,
        feedback: '',
        reviewImage: null
    });

    const [errors, setErrors] = useState({
        rating: '',
        feedback: '',
        reviewImage: ''
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        // Kiểm tra xem file có tồn tại không
        if (!file) {
            console.log("File is null or undefined");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            console.log("File size exceeds limit");
            setErrors({ ...errors, reviewImage: 'Kích thước ảnh không được vượt quá 5MB' });
            return;
        }
        console.log(file);

        setFormData({ ...formData, reviewImage: file });
        setErrors({ ...errors, reviewImage: '' });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // Kiểm tra rating
        if (formData.rating === 0) newErrors.rating = 'Vui lòng đánh giá sao';

        // Kiểm tra nội dung không được để trống
        if (!formData.feedback) newErrors.feedback = 'Nội dung phản hồi không được để trống';

        if (formData.feedback.length < 5) newErrors.feedback = 'Nội dung phản hồi chứa ít nhất 5 ký tự';

        setErrors(newErrors);

        // Nếu không có lỗi, gửi phản hồi
        if (Object.keys(newErrors).length === 0 && user) {
            try {
                const formDataToSend = new FormData(); // Tạo FormData
                formDataToSend.append('CustomerID', user?.id); // Thêm text data
                formDataToSend.append('Content', formData.feedback); // Thêm text data
                formDataToSend.append('Rating', formData.rating); // Thêm text data

                // Thêm file vào FormData
                if (formData.reviewImage) {
                    formDataToSend.append('file', formData.reviewImage);
                }

                console.log('Dữ liệu gửi đi:', formDataToSend);

                await createFeedback(formDataToSend); // Gửi FormData
                setFormData({ rating: 0, feedback: '', reviewImage: null });
                toast.success('Cảm ơn bạn đã đánh giá');
            } catch (error) {
                console.error('Lỗi từ API:', error);

                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || 'Gửi Đánh giá thất bại.');
                } else {
                    toast.error('Đã xảy ra lỗi khi kết nối với server. Vui lòng thử lại sau.');
                }
            } finally {
                nProgress.done();
            }
        }
    };


    return (
        <Container style={styles.container}>
            <Row className="justify-content-center w-100 mt-4">
                <Col md={8} lg={6}>
                    <Card style={styles.card}>
                        <h2 style={styles.title}>Đánh giá dịch vụ</h2>
                        <Form onSubmit={handleSubmit}>
                            {/* Rating Stars */}
                            <div style={styles.ratingContainer}>
                                <Form.Label style={styles.ratingLabel}>
                                    Bạn cảm thấy dịch vụ của chúng tôi như thế nào?
                                </Form.Label>
                                <div style={styles.ratingStars}>
                                    <Rating
                                        initialRating={formData.rating}
                                        onChange={(newRating) => {
                                            setFormData({ ...formData, rating: newRating });
                                            setErrors({ ...errors, rating: '' });
                                        }}
                                        emptySymbol={
                                            <i className="fa fa-star-o fa-2x"
                                                style={{ fontSize: '30px', color: '#ffc107' }}
                                            />
                                        }
                                        fullSymbol={
                                            <i className="fa fa-star fa-2x"
                                                style={{ fontSize: '30px', color: '#ffc107' }}
                                            />
                                        }
                                    />
                                </div>
                                {errors.rating && (
                                    <div className="text-danger text-center mt-2">
                                        {errors.rating}
                                    </div>
                                )}
                            </div>

                            {/* Feedback Text Area */}
                            <Form.Group className="mb-4">
                                <Form.Label style={styles.ratingLabel}>
                                    Chia sẻ thêm về trải nghiệm của bạn
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={formData.feedback}
                                    onChange={(e) => {
                                        setFormData({ ...formData, feedback: e.target.value });
                                        setErrors({ ...errors, feedback: '' });
                                    }}
                                    isInvalid={!!errors.feedback}
                                    placeholder="Nhập nội dung phản hồi của bạn tại đây..."
                                    style={styles.textArea}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.feedback}
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Image Upload */}
                            <Form.Group className="mb-4">
                                <Form.Label style={styles.ratingLabel}>
                                    Thêm hình ảnh (không bắt buộc)
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    isInvalid={!!errors.reviewImage}
                                />
                                <Form.Text className="text-muted">
                                    Hỗ trợ các định dạng: JPG, PNG, GIF (Tối đa 5MB)
                                </Form.Text>
                                <Form.Control.Feedback type="invalid">
                                    {errors.reviewImage}
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Submit Button */}
                            <Button
                                variant="success"
                                type="submit"
                                style={styles.submitButton}
                                className="hover-shadow"
                            >
                                Gửi đánh giá
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

// Thêm CSS vào file styles của bạn hoặc inline styles
const additionalCSS = `
    .hover-shadow:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
`;

// Thêm style tag vào component
const styleTag = document.createElement('style');
styleTag.textContent = additionalCSS;
document.head.appendChild(styleTag);

export default FeedbackPage;
