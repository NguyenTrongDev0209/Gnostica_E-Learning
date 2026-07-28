import axiosClient from '@/lib/axiosClient';

const API_URL = '/auth';
const ADMIN_API_URL = '/admin/accounts';

const register = async (fullName, email, password) => {
    try {
        const response = await axiosClient.post(`${API_URL}/register`, {
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
        const response = await axiosClient.post(`${API_URL}/login`, {
            email,
            password
        });
        if (response.data.status === 200 || response.data.status === 'success') {
            const userData = response.data.data;
            if (userData && (userData.onboardingCompleted === undefined || userData.onboardingCompleted === null)) {
                userData.onboardingCompleted = false;
            }
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData?.email) {
                sessionStorage.removeItem(`personalization_skipped_${userData.email}`);
            }
            sessionStorage.removeItem('personalization_skipped');
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập!';
    }
};

const logout = async () => {
    try {
        await axiosClient.post(`${API_URL}/logout`);
    } catch (error) {
        // Bỏ qua lỗi nếu backend chưa kịp xử lý
    }
    const currentUser = getCurrentUser();
    if (currentUser?.email) {
        sessionStorage.removeItem(`personalization_skipped_${currentUser.email}`);
    }
    sessionStorage.removeItem('personalization_skipped');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const getMe = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/me`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy thông tin người dùng!';
    }
};

const verify = async (email, code) => {
    try {
        const response = await axiosClient.post(`${API_URL}/verify?email=${email}&code=${code}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi xác thực!';
    }
};

const resendOTP = async (email) => {
    try {
        const response = await axiosClient.post(`${API_URL}/resend-otp?email=${email}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại mã!';
    }
};

const forgotPassword = async (email) => {
    try {
        const response = await axiosClient.post(`${API_URL}/forgot-password?email=${email}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi yêu cầu khôi phục mật khẩu!';
    }
};

const resetPassword = async (email, code, newPassword) => {
    try {
        const response = await axiosClient.post(`${API_URL}/reset-password`, {
            email,
            code,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu!';
    }
};

const getOAuth2User = async () => {
    return await getMe();
};

const getAllAccounts = async (page = 0, size = 10, role = '', search = '') => {
    try {
        const params = new URLSearchParams({ page, size });
        if (role) params.append('role', role);
        if (search) params.append('search', search);
        const response = await axiosClient.get(`${ADMIN_API_URL}?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách tài khoản!';
    }
};

const getAccountsByRole = async (role, { page = 0, size = 20 } = {}) => {
    try {
        const response = await axiosClient.get(`${API_URL}/accounts/role/${role}`, {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách tài khoản theo role!';
    }
};

const lockAccount = async (id, reason) => {
    try {
        const response = await axiosClient.post(`${ADMIN_API_URL}/${id}/lock?reason=${encodeURIComponent(reason)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể khóa tài khoản!';
    }
};

const unlockAccount = async (id) => {
    try {
        const response = await axiosClient.post(`${ADMIN_API_URL}/${id}/unlock`);
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
    getMe,
    verify,
    resendOTP,
    forgotPassword,
    resetPassword,
    getOAuth2User,
    getAllAccounts,
    getAccountsByRole,
    lockAccount,
    unlockAccount
};

export default authService;
