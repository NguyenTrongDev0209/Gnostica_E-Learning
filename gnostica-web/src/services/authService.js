import api from './api';

const RESOURCE_PATH = '/auth';

const register = async (fullName, email, password) => {
    try {
        const response = await api.post(`${RESOURCE_PATH}/register`, {
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
        const response = await api.post(`${RESOURCE_PATH}/login`, {
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
        await api.post(`${RESOURCE_PATH}/logout`);
    } catch (error) {
        // Bỏ qua lỗi nếu backend chưa kịp xử lý
    }
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

const verify = async (email, code) => {
    try {
        const response = await api.post(`${RESOURCE_PATH}/verify?email=${email}&code=${code}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi xác thực!';
    }
};

const resendOTP = async (email) => {
    try {
        const response = await api.post(`${RESOURCE_PATH}/resend-otp?email=${email}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại mã!';
    }
};

const forgotPassword = async (email) => {
    try {
        const response = await api.post(`${RESOURCE_PATH}/forgot-password?email=${email}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi yêu cầu khôi phục mật khẩu!';
    }
};

const resetPassword = async (email, code, newPassword) => {
    try {
        const response = await api.post(`${RESOURCE_PATH}/reset-password`, {
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
        const response = await api.post(`${RESOURCE_PATH}/become-instructor?email=${email}`);
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
        const response = await api.get(`${RESOURCE_PATH}/accounts`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách tài khoản!';
    }
};

const getAccountsByRole = async (role) => {
    try {
        const response = await api.get(`${RESOURCE_PATH}/accounts/role/${role}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách tài khoản theo role!';
    }
};

const lockAccount = async (id, reason) => {
    try {
        const response = await api.post(`${RESOURCE_PATH}/accounts/${id}/lock?reason=${encodeURIComponent(reason)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể khóa tài khoản!';
    }
};

const unlockAccount = async (id) => {
    try {
        const response = await api.post(`${RESOURCE_PATH}/accounts/${id}/unlock`);
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
