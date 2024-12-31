const logService = require('../service/logService');

const getAllLogs = async (req, res) => {
    try {
        const logs = await logService.getAll();
        res.json({
            success: true,
            message: 'Lấy danh sách logs thành công',
            data: logs,
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách logs',
            error: error.message,
        });
    }
};

const getLogsByMemberId = async (req, res) => {
    const id = req.params.id;

    // Lấy tham số phân trang từ query
    let { page = 1, limit = 10 } = req.query;

    // Chuyển đổi page và limit thành kiểu số
    page = parseInt(page);
    limit = parseInt(limit);

    // Tính toán offset
    const offset = (page - 1) * limit;
    try {
        const logs = await logService.getByMemberId(id, limit, offset);
        res.json({
            success: true,
            message: 'Lấy danh sách logs thành công',
            data: logs,
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách logs',
            error: error.message,
        });
    }
};

const getLogById = async (req, res) => {
    const id = req.params.id;
    try {
        const log = await logService.getById(id);
        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Log không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Lấy thông tin log thành công',
            data: log,
        });
    } catch (error) {
        console.error(`Error fetching log with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin log',
            error: error.message,
        });
    }
};

const createLog = async (req, res) => {
    const data = req.body;
    try {
        const result = await logService.create(data);
        res.status(201).json({
            success: true,
            message: 'Tạo log mới thành công',
            data: result,
        });
    } catch (error) {
        console.error('Error creating log:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo log mới',
            error: error.message,
        });
    }
};

const updateLog = async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    try {
        const result = await logService.update(id, data);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Log không tồn tại',
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật log thành công',
            data: result,
        });
    } catch (error) {
        console.error(`Error updating log with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật log',
            error: error.message,
        });
    }
};


const deleteLog = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await logService.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Log không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Xóa log thành công',
        });
    } catch (error) {
        console.error(`Error deleting log with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa log',
            error: error.message,
        });
    }
};

module.exports = {
    getAllLogs,
    getLogsByMemberId,
    getLogById,
    createLog,
    updateLog,
    deleteLog,
};
