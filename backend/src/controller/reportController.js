const reportService = require('../service/reportService');

const getAllReports = async (req, res) => {
    try {
        const reports = await reportService.getAll();
        res.json({
            success: true,
            message: 'Lấy danh sách reports thành công',
            data: reports, // Trả về danh sách reports
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách reports',
            error: error.message,
        });
    }
};

const getReportById = async (req, res) => {
    const id = req.params.id;
    try {
        const report = await reportService.getById(id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Lấy thông tin report thành công',
            data: report, // Trả về thông tin report
        });
    } catch (error) {
        console.error(`Error fetching report with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin report',
            error: error.message,
        });
    }
};

const createReport = async (req, res) => {
    const data = req.body;
    try {
        const result = await reportService.create(data);
        res.status(201).json({
            success: true,
            message: 'Tạo report mới thành công',
            data: result, // Trả về kết quả tạo report
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo report mới',
            error: error.message,
        });
    }
};

const updateReport = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const result = await reportService.update(id, data);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Cập nhật thông tin report thành công',
            data: result, // Trả về kết quả cập nhật
        });
    } catch (error) {
        console.error(`Error updating report with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật thông tin report',
            error: error.message,
        });
    }
};

const deleteReport = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await reportService.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Xóa report thành công',
        });
    } catch (error) {
        console.error(`Error deleting report with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa report',
            error: error.message,
        });
    }
};

module.exports = {
    getAllReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
};
