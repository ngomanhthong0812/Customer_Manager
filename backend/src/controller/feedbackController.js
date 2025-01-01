const feedbackService = require('../service/feedbackService');
const upload = require('../config/uploadConfig');

// Middleware xử lý upload ảnh đơn
const uploadSingle = upload.single('reviewImage');

// Lấy tất cả Feedbacks
const getAllFeedbacks = async (req, res) => {
    // Lấy các tham số từ query params
    let { page = 1, limit = 10, search = '', rating = '' } = req.query;

    // Chuyển đổi page và limit thành số
    page = parseInt(page);
    limit = parseInt(limit);

    try {
        const feedbacks = await feedbackService.getAll(page, limit, search, rating);
        res.json({
            success: true,
            message: 'Lấy danh sách Feedbacks thành công',
            data: feedbacks, // Trả về danh sách Feedbacks
        });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách Feedbacks',
            error: error.message,
        });
    }
};

// Lấy thông tin Feedback theo ID
const getFeedbackById = async (req, res) => {
    const id = req.params.id;
    try {
        const feedback = await feedbackService.getById(id);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Lấy thông tin Feedback thành công',
            data: feedback, // Trả về thông tin Feedback
        });
    } catch (error) {
        console.error(`Error fetching feedback with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin Feedback',
            error: error.message,
        });
    }
};

// Tạo Feedback mới
const createFeedback = async (req, res) => {
    console.log(req.body);

    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'Lỗi khi upload ảnh',
                error: err.message
            });
        }

        try {
            const { CustomerID, Content, Rating } = req.body;
            const file = req.file;

            // Kiểm tra và xử lý file upload
            let ReviewImage = null;
            if (file) {
                // Kiểm tra thông tin file
                if (!file.originalname || !file.filename) {
                    throw new Error('Thông tin file không hợp lệ');
                }
                ReviewImage = `/uploads/reviews/${file.filename}`;
            }

            const result = await feedbackService.create({
                CustomerID,
                Content,
                Rating,
                ReviewImage
            });

            res.status(201).json({
                success: true,
                message: 'Tạo Feedback mới thành công',
                data: result
            });
        } catch (error) {
            console.error('Error creating feedback:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo Feedback mới',
                error: error.message
            });
        }
    });
};

// Cập nhật Feedback
const updateFeedback = async (req, res) => {
    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'Lỗi khi upload ảnh',
                error: err.message
            });
        }

        try {
            const id = req.params.id;
            const { Content, Rating } = req.body;

            // Lấy feedback cũ để kiểm tra
            const oldFeedback = await feedbackService.getById(id);
            if (!oldFeedback) {
                return res.status(404).json({
                    success: false,
                    message: 'Feedback không tồn tại'
                });
            }

            // Nếu có upload ảnh mới thì cập nhật đường dẫn
            const ReviewImage = req.file
                ? `/uploads/reviews/${req.file.filename}`
                : oldFeedback.ReviewImage;

            const result = await feedbackService.update(id, {
                Content,
                Rating,
                ReviewImage
            });

            res.json({
                success: true,
                message: 'Cập nhật Feedback thành công',
                data: result
            });
        } catch (error) {
            console.error(`Error updating feedback:`, error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật Feedback',
                error: error.message
            });
        }
    });
};

// Xóa Feedback
const deleteFeedback = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await feedbackService.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Feedback không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Xóa Feedback thành công',
        });
    } catch (error) {
        console.error(`Error deleting feedback with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa Feedback',
            error: error.message,
        });
    }
};

module.exports = {
    getAllFeedbacks,
    getFeedbackById,
    createFeedback,
    updateFeedback,
    deleteFeedback,
};
