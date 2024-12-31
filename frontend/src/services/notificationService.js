import axios from '../utils/axiosConfig';

// Lấy tất cả thông báo
export const getAllNotifications = async (type) => {
    try {
        const response = await axios.get(`/notifications?type=${type}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Lấy thông báo chưa đọc
export const getUnreadNotifications = async () => {
    try {
        const response = await axios.get('/notifications/unread');
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async () => {
    try {
        const response = await axios.put(`/notifications/read`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Tạo thông báo mới (chỉ admin)
export const createNotification = async (notificationData) => {
    try {
        const response = await axios.post('/notifications', notificationData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
}; 