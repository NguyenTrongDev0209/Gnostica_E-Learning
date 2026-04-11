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
        if (response.data.status === 200 || response.data.status === 'success') {
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

const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/forgot-password?email=${email}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi yêu cầu khôi phục mật khẩu!';
    }
};

const resetPassword = async (email, code, newPassword) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, {
            email,
            code,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu!';
    }
};

const becomeInstructor = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/become-instructor?email=${email}`);
        if (response.data.status === 200) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.role = 'INSTRUCTOR';
                localStorage.setItem('user', JSON.stringify(user));
            }
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký giảng viên!';
    }
};

const getAllAccounts = async () => {
    try {
        const response = await axios.get(`${API_URL}/accounts`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách tài khoản!';
    }
};

const getAccountsByRole = async (role) => {
    try {
        const response = await axios.get(`${API_URL}/accounts/role/${role}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách tài khoản theo role!';
    }
};

const lockAccount = async (id, reason) => {
    try {
        const response = await axios.post(`${API_URL}/accounts/${id}/lock?reason=${encodeURIComponent(reason)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể khóa tài khoản!';
    }
};

const unlockAccount = async (id) => {
    try {
        const response = await axios.post(`${API_URL}/accounts/${id}/unlock`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể mở khóa tài khoản!';
    }
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    verify,
    resendOTP,
    forgotPassword,
    resetPassword,
    becomeInstructor,
    getAllAccounts,
    getAccountsByRole,
    lockAccount,
    unlockAccount
};

export default authService;
