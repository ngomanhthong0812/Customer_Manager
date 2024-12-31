import axios from '../utils/axiosConfig';

// Lấy tất cả tương tác
export const getAllInteractions = async (page, limit, search = '', startDate = '', endDate = '', type = '') => {
    try {
        const response = await axios.get('/interaction/', {
            params: {
                page,
                limit,
                search,
                startDate,
                endDate,
                type
            }
        });
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Lấy tương tác theo ID
export const getInteractionById = async (id) => {
    try {
        const response = await axios.get(`/interaction/${id}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Lấy tương tác theo ID của member và id của admin
export const getInteractionByMemberIdAndAdminId = async (memberId, customerId) => {
    try {
        const response = await axios.get(`/interaction/member/${memberId}/customer/${customerId}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};


// Tạo tương tác mới
export const createInteraction = async (interactionData) => {
    try {
        const response = await axios.post('/interaction/', interactionData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật tương tác
export const updateInteraction = async (id, updateData) => {
    try {
        const response = await axios.put(`/interaction/${id}`, updateData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Xóa tương tác
export const deleteInteraction = async (id) => {
    try {
        const response = await axios.delete(`/interaction/${id}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật ghi chú tương tác
export const updateInteractionNotes = async (id, notes) => {
    try {
        const response = await axios.put(`/interaction/${id}`, { Notes: notes });
        return response.data.data;
    } catch (error) {
        throw error;
    }
}; 