import axios from '../utils/axiosConfig';

// Lấy danh sách feedback
export const getAllFeedbacks = async (page, limit, search = '', rating = '') => {
    try {
        const response = await axios.get('/feedback/', {
            params: {
                page,
                limit,
                search,
                rating
            }
        });
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Lấy feedback theo ID
export const getFeedbackById = async (id) => {
    try {
        const response = await axios.get(`/feedback/${id}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Tạo feedback mới
export const createFeedback = async (data) => {
    try {
        const response = await axios.post('/feedback/', data);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật nội dung feedback
export const updateFeedback = async (id, updateData) => {
    try {
        const response = await axios.put(`/feedback/${id}`, updateData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Xóa feedback
export const deleteFeedback = async (id) => {
    try {
        const response = await axios.delete(`/feedback/${id}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};
