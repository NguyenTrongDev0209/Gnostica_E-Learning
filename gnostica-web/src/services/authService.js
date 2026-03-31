import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const register = async (fullName, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            fullName,
            email,
            password
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!';
    }
};

const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password
        });
        if (response.data.status === 'success') {
            localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập!';
    }
};

const logout = async () => {
    try {
        await axios.post(`${API_URL}/logout`);
    } catch (error) {
        // Bỏ qua lỗi nếu backend chưa kịp xử lý
    }
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const verify = async (email, code) => {
    try {
        const response = await axios.post(`${API_URL}/verify?email=${email}&code=${code}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi xác thực!';
    }
};

const resendOTP = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/resend-otp?email=${email}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại mã!';
    }
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    verify,
    resendOTP
};

export default authService;
