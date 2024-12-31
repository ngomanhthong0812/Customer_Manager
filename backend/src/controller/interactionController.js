const interactionService = require('../service/interactionsService');

const getAllInteractions = async (req, res) => {
    // Lấy các tham số từ query params
    let { page = 1, limit = 10, search = '', startDate = '', endDate = '', type = '' } = req.query;

    // Chuyển đổi page và limit thành số
    page = parseInt(page);
    limit = parseInt(limit);

    try {
        const offset = (page - 1) * limit;
        const interactions = await interactionService.getAll(limit, offset, search, startDate, endDate, type);

        res.json({
            success: true,
            message: 'Lấy danh sách tương tác thành công',
            data: interactions
        });
    } catch (error) {
        console.error('Error fetching interactions:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách tương tác',
            error: error.message
        });
    }
};

const getInteractionById = async (req, res) => {
    const id = req.params.id;
    try {
        const interaction = await interactionService.getById(id);
        if (!interaction) {
            return res.status(404).json({
                success: false,
                message: 'Interaction không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Lấy thông tin Interaction thành công',
            data: interaction, // Trả về thông tin Interaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin Interaction',
            error: error.message,
        });
    }
};

const getInteractionByMemberIdAndAdminId = async (req, res) => {
    try {
        const { memberId, customerId } = req.params;
        const interaction = await interactionService.getInteractionByMemberIdAndAdminId(memberId, customerId);
        res.json({
            success: true,
            message: 'Lấy thông tin Interaction thành công',
            data: interaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin Interaction',
            error: error.message
        });
    }
};

const createInteraction = async (req, res) => {
    try {
        // Lấy ID người dùng từ token đã được xử lý trong middleware auth
        const senderID = req.user.id;

        // Thêm SenderID vào data
        const interactionData = {
            ...req.body,
            SenderID: senderID
        };

        await interactionService.create(interactionData);

        res.json({
            success: true,
            message: 'Tạo Interaction thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo Interaction',
            error: error.message
        });
    }
};

const updateInteraction = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const result = await interactionService.update(id, data);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Interaction không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Cập nhật Interaction thành công',
            data: result, // Trả về kết quả của việc cập nhật
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật Interaction',
            error: error.message,
        });
    }
};

const deleteInteraction = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await interactionService.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Interaction không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Xóa Interaction thành công',
        }); // Trả về thông báo xóa thành công
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa Interaction',
            error: error.message,
        });
    }
};

module.exports = {
    getAllInteractions,
    getInteractionById,
    createInteraction,
    updateInteraction,
    deleteInteraction,
    getInteractionByMemberIdAndAdminId,
};
