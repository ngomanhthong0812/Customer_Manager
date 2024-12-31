import axios from '../utils/axiosConfig';

export const login = async (email, password) => {
    try {
        const response = await axios.post('/login', { email, password });  // Gọi API POST /login
        return response.data;  // Trả về dữ liệu nhận được từ API (bao gồm token và user)
    } catch (error) {
        throw error;  // Xử lý lỗi ở nơi gọi dịch vụ này
    }
};

export const logout = async () => {
    try {
        const response = await axios.post('/logout');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (fullname, email, password) => {
    try {
        const response = await axios.post('/register', { fullname, email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};
