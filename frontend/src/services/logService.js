import axios from '../utils/axiosConfig';

export const getLogsByMemberId = async (id, page, limit) => {
    try {
        const response = await axios.get(`/log/getLogsByMemberId/${id}?page=${page}&limit=${limit}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};
