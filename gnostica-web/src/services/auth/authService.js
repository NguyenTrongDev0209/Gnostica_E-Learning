import axiosClient from '@/lib/axiosClient';

const API_URL = '/auth';

const register = async (fullName, email, password) => {
    try {
        const response = await axiosClient.post(`${API_URL}/register`, {
            fullName,
            email,
            password
        });
        return response.data;
    } catch (error) {
        const responseData = error.response?.data;
        throw {
            message: responseData?.message || 'Có lỗi xảy ra khi đăng ký!',
            fields: responseData?.data || {}
        };
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
            if (userData) {
                const isCompleted = userData.onboardingCompleted === true || userData.onboardingCompleted === 'true' ||
                    (Array.isArray(userData.selectedCategories) && userData.selectedCategories.length > 0) ||
                    (Array.isArray(userData.categoryIds) && userData.categoryIds.length > 0) ||
                    Boolean(userData.level);
                userData.onboardingCompleted = isCompleted;
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

const becomeInstructor = async (email) => {
    try {
        const response = await axiosClient.post(`${API_URL}/become-instructor?email=${email}`);
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

const getOAuth2User = async (email) => {
    return await axiosClient.get(`${API_URL}/user?email=${encodeURIComponent(email)}`);
};

const getAllAccounts = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/accounts`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách tài khoản!';
    }
};

const getAccountsByRole = async (role) => {
    try {
        const response = await axiosClient.get(`${API_URL}/accounts/role/${role}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách tài khoản theo role!';
    }
};

const lockAccount = async (id, reason) => {
    try {
        const response = await axiosClient.post(`${API_URL}/accounts/${id}/lock?reason=${encodeURIComponent(reason)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể khóa tài khoản!';
    }
};

const unlockAccount = async (id) => {
    try {
        const response = await axiosClient.post(`${API_URL}/accounts/${id}/unlock`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể mở khóa tài khoản!';
    }
};

const searchAccounts = async (role, search, statuses, page, size = 10) => {
    try {
        let url = `${API_URL}/accounts/search?page=${page}&size=${size}`;
        if (role) url += `&role=${encodeURIComponent(role)}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (statuses && statuses.length > 0) {
            statuses.forEach(status => {
                url += `&statuses=${status}`;
            });
        }
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể tìm kiếm tài khoản!';
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
    getOAuth2User,
    getAllAccounts,
    getAccountsByRole,
    searchAccounts,
    lockAccount,
    unlockAccount
};

export default authService;
