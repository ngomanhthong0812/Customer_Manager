const statsService = require('../service/statsService');

const statsController = {
    // Thống kê tổng quan về members
    getMemberStats: async (req, res) => {
        const { startDate, endDate } = req.query;
        try {
            const stats = await statsService.getMemberStats(startDate, endDate);
            res.json({
                success: true,
                message: 'Lấy thống kê thành viên thành công',
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê thành viên',
                error: error.message
            });
        }
    },

    // Thống kê tương tác theo tháng
    getInteractionStats: async (req, res) => {
        const { startDate, endDate } = req.query;
        try {
            const stats = await statsService.getInteractionStats(startDate, endDate);
            res.json({
                success: true,
                message: 'Lấy thống kê tương tác thành công',
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê tương tác',
                error: error.message
            });
        }
    },

    // Thống kê phản hồi
    getFeedbackStats: async (req, res) => {
        const { startDate, endDate } = req.query;
        try {
            const stats = await statsService.getFeedbackStats(startDate, endDate);
            res.json({
                success: true,
                message: 'Lấy thống kê phản hồi thành công',
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê phản hồi',
                error: error.message
            });
        }
    },

    // Xuất báo cáo thống kê
    exportStats: async (req, res) => {
        const { startDate, endDate } = req.query;
        try {
            const report = await statsService.exportStats(startDate, endDate);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=statistics-report.xlsx');

            res.send(report);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xuất báo cáo thống kê',
                error: error.message
            });
        }
    },

    // Thống kê tổng quan cho dashboard
    getDashboardStats: async (req, res) => {
        const { startDate, endDate } = req.query;
        try {
            const stats = await statsService.getDashboardStats(startDate, endDate);
            res.json({
                success: true,
                message: 'Lấy thống kê dashboard thành công',
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê dashboard',
                error: error.message
            });
        }
    },

    // Thống kê trạng thái thành viên
    getMemberStatusStats: async (req, res) => {
        try {
            const stats = await statsService.getMemberStatusStats();
            res.json({
                success: true,
                message: 'Lấy thống kê trạng thái thành viên thành công',
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê trạng thái thành viên',
                error: error.message
            });
        }
    }
};

module.exports = statsController; 