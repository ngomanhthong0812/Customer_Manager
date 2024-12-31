import axios from '../utils/axiosConfig';

// Lấy danh sách người dùng
export const getMember = async (page, limit, search) => {
    try {
        const response = await axios.get(`/member?page=${page}&limit=${limit}&search=${search}`);  // Thay đường dẫn API cho phù hợp
        return response.data.data;
    } catch (error) {
        throw error;  // Xử lý lỗi ở nơi gọi dịch vụ này
    }
};

// Lấy danh sách theo role
export const getByRole = async (role) => {
    try {
        const response = await axios.get(`/member/role/${role}`);
        return response.data.data;
    } catch (error) {
        throw error;  // Xử lý lỗi ở nơi gọi dịch vụ này
    }
};

// Lấy thông tin người dùng theo ID
export const getMemberById = async (id) => {
    try {
        const response = await axios.get(`/member/${id}`);
        return response.data.data;
    } catch (error) {
        throw error;  // Xử lý lỗi ở nơi gọi dịch vụ này
    }
};

// Thêm người dùng mới
export const createMember = async (memberData) => {
    console.log(memberData);

    try {
        const response = await axios.post('/member', memberData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật thông tin người dùng
export const updateMember = async (id, memberData) => {
    try {
        const response = await axios.put(`/member/${id}`, memberData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Xoá người dùng
export const deleteMember = async (id) => {
    try {
        const response = await axios.delete(`/member/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const updateStatusMember = async (id) => {
    try {
        const response = await axios.put(`/member/status/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

//Đổi mật khẩu
export const changePasswordMember = async (memberId, currentPassword, newPassword) => {
    try {
        const response = await axios.put(`/member/changePassword`, { memberId, currentPassword, newPassword });
        return response.data;
    } catch (error) {
        throw error;
    }
};

//Gửi mail khôi phục mật khẩu
export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`/member/forgot-password`, { email });
        return response.data;
    } catch (error) {
        throw error;
    }
};

//Khôi phục mật khẩu
export const resetPassword = async (email, resetCode, newPassword) => {
    try {
        const response = await axios.post(`/member/reset-password`, { email, resetCode, newPassword });
        return response.data;
    } catch (error) {
        throw error;
    }
};

