import axiosConfig from '../utils/axiosConfig';

// Thống kê tổng quan
export const getDashboardStats = async (startDate, endDate) => {
    const response = await axiosConfig.get('/admin/dashboard-stats', {
        params: { startDate, endDate }
    });
    return response.data;
};

// Thống kê thành viên
export const getMemberStats = async (startDate, endDate) => {
    const response = await axiosConfig.get('/admin/member-stats', {
        params: { startDate, endDate }
    });
    return response.data;
};

// Thống kê tương tác
export const getInteractionStats = async (startDate, endDate) => {
    const response = await axiosConfig.get('/admin/interaction-stats', {
        params: { startDate, endDate }
    });
    return response.data;
};

// Thống kê đánh giá
export const getFeedbackStats = async (startDate, endDate) => {
    const response = await axiosConfig.get('/admin/feedback-stats', {
        params: { startDate, endDate }
    });
    return response.data;
};

// Thống kê trạng thái thành viên
export const getMemberStatusStats = async (startDate, endDate) => {
    const response = await axiosConfig.get('/admin/member-status-stats', {
        params: { startDate, endDate }
    });
    return response.data;
};

// Xuất thống kê
export const exportStats = async (startDate, endDate, format) => {
    const response = await axiosConfig.get('/admin/export-stats', {
        params: { startDate, endDate, format },
        responseType: 'arraybuffer'
    });
    return response;
};