const memberService = require('../service/memberService');
const logService = require('../service/logService');
const interactionsService = require('../service/interactionsService');
const feedbackService = require('../service/feedbackService');
const reportService = require('../service/reportService');
const notificationService = require('../service/notificationService');

const getAllMembers = async (req, res) => {
    // Lấy tham số phân trang từ query
    let { page = 1, limit = 10, search = null } = req.query;

    // Chuyển đổi page và limit thành kiểu số
    page = parseInt(page);
    limit = parseInt(limit);
    try {
        const offset = (page - 1) * limit;
        const members = await memberService.getAll(limit, offset, search);
        res.json({
            success: true,
            message: 'Lấy danh sách members thành công',
            data: members, // Trả về danh sách members
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách members',
            error: error.message,
        });
    }
};

const getMemberById = async (req, res) => {
    const id = req.params.id;
    try {
        const member = await memberService.getById(id);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Lấy thông tin member thành công',
            data: member, // Trả về thông tin member
        });
    } catch (error) {
        console.error(`Error fetching member with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin member',
            error: error.message,
        });
    }
};

const getMemberByRole = async (req, res) => {
    try {
        const role = req.params.role;
        const members = await memberService.getByRole(role);
        res.json({
            success: true,
            message: 'Lấy danh sách members thành công',
            data: members,
        });
    } catch (error) {
        console.error('Error fetching members by role:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách members',
            error: error.message,
        });
    }
}

const createMember = async (req, res) => {
    const data = req.body;

    try {
        // Kiểm tra email không được để trống
        if (!data.Email) {
            return res.status(400).json({
                success: false,
                message: 'Email không được để trống',
            });
        }

        // Kiểm tra số điện thoại không được để trống 
        if (!data.Phone) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại không được để trống',
            });
        }

        // Kiểm tra email đã tồn tại
        const existingEmail = await memberService.getByEmail(data.Email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng',
            });
        }

        // Kiểm tra số điện thoại đã tồn tại
        const existingPhone = await memberService.getByPhone(data.Phone);
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại đã được sử dụng',
            });
        }

        // Tạo mã 6 chữ số ngẫu nhiên
        const code = Math.floor(100000 + Math.random() * 900000);
        data.Code = code;

        // Tạo thành viên mới
        const result = await memberService.create(data);
        res.status(201).json({
            success: true,
            message: 'Tạo member mới thành công',
            data: result,
        });
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo member mới',
            error: error.message,
        });
    }
};


const updateMember = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        // Kiểm tra email đã tồn tại
        const emailExists = await memberService.checkEmailExist(id, data.Email);
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại',
            });
        }

        // Kiểm tra số điện thoại đã tồn tại
        const phoneExists = await memberService.checkPhoneExist(id, data.Phone);
        if (phoneExists) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại đã tồn tại',
            });
        }

        const result = await memberService.update(id, data);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member không tồn tại',
            });
        }
        // Ghi lại hành động sửa thông tin vào bảng logs
        const logData = {
            MemberID: id,
            ActionType: 'UpdateInfo',
            ActionDescription: `Sửa thông tin thành viên: ${data.FullName}`,
        };
        await logService.create(logData);  // Ghi log

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: result,
        });
    } catch (error) {
        console.error(`Error updating member with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật thông tin member',
            error: error.message,
        });
    }
};

const deleteMember = async (req, res) => {
    const id = req.params.id;
    try {
        await logService.deleteByMemberId(id);
        await interactionsService.deleteByMemberId(id);
        await reportService.deleteByMemberId(id);
        await feedbackService.deleteByMemberId(id);
        await notificationService.deleteNotificationByMemberId(id);

        // Then delete the member
        const result = await memberService.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member không tồn tại',
            });
        }
        res.json({
            success: true,
            message: 'Xóa member thành công',
        });
    } catch (error) {
        console.error(`Error deleting member with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa member',
            error: error.message,
        });
    }
};

const changePassword = async (req, res) => {
    const { memberId, currentPassword, newPassword } = req.body;

    try {
        const member = await memberService.getById(memberId);

        const result = await memberService.changePassword(memberId, currentPassword, newPassword);
        // Ghi lại hành động sửa thông tin vào bảng logs
        const logData = {
            MemberID: memberId,
            ActionType: 'ChangePassword',
            ActionDescription: `Đổi mật khẩu tài khoản thành viên: ${member.FullName}`,
        };
        await logService.create(logData);  // Ghi log

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công',
            data: result,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email.' });
    }

    try {
        // Kiểm tra email có tồn tại không
        const emailExists = await memberService.getByEmail(email);

        if (!emailExists) {
            return res.status(404).json({ message: 'Email không tồn tại trong hệ thống.' });
        }

        // Tạo mã xác nhận
        const resetCode = await memberService.generateResetCode();

        // Gửi mã xác nhận qua email
        await memberService.sendResetCode(email, resetCode);

        return res.json({
            success: true,
            message: 'Gửi Mail thành công',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' });
    }

}

const confirmPasswordReset = async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;

        if (!email || !resetCode || !newPassword) {
            return res.status(400).json({ error: 'Vui lòng cung cấp email, mã xác nhận và mật khẩu mới' });
        }

        const result = await memberService.confirmResetCode(email, resetCode, newPassword);
        return res.json({
            success: true,
            message: 'Đổi mật khẩu thành công',
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateMemberStatus = async (req, res) => {
    const id = req.params.id;

    try {
        // Kiểm tra member có tồn tại không
        const member = await memberService.getById(id);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member không tồn tại',
            });
        }

        // Cập nhật trạng thái
        const result = await memberService.updateStatus(id);

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: result,
        });
    } catch (error) {
        console.error(`Error updating member status with ID ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái member',
            error: error.message,
        });
    }
};

module.exports = {
    getAllMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
    changePassword,
    forgotPassword,
    confirmPasswordReset,
    updateMemberStatus,
    getMemberByRole,
};
