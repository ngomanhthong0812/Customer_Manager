const notificationService = require('../service/notificationService');

const notificationController = {
    // Lấy danh sách thông báo
    getAll: async (req, res) => {
        try {
            let { type = '' } = req.query;

            const result = await notificationService.getAll(type);

            res.json({
                success: true,
                message: 'Lấy danh sách thông báo thành công',
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách thông báo',
                error: error.message
            });
        }
    },
    
    // Tạo thông báo mới
    create: async (req, res) => {
        try {
            const result = await notificationService.create(req.body);

            res.json({
                success: true,
                message: 'Tạo thông báo thành công',
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo thông báo',
                error: error.message
            });
        }
    },

    // Đánh dấu thông báo đã đọc
    markAsRead: async (req, res) => {
        try {
            const memberId = req.user.id;
            console.log(memberId);
            const result = await notificationService.markAsRead(memberId);

            res.json({
                success: true,
                message: 'Đánh dấu đã đọc thành công',
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi đánh dấu đã đọc',
                error: error.message
            });
        }
    },

    // Lấy thông báo chưa đọc
    getUnread: async (req, res) => {
        try {
            const memberId = req.user.id; // Lấy từ token
            const notifications = await notificationService.getUnreadByMember(memberId);

            res.json({
                success: true,
                message: 'Lấy thông báo chưa đọc thành công',
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thông báo chưa đọc',
                error: error.message
            });
        }
    }
};

module.exports = notificationController; 