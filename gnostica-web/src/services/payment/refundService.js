import axiosClient from '@/lib/axiosClient';

const API_URL = '/checkout/refunds';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('RefundService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

/**
 * Lấy danh sách yêu cầu hoàn tiền của tôi
 */
const getMyRefunds = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/me`, {
            headers: getAuthHeaders()
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách yêu cầu hoàn tiền!';
    }
};

/**
 * Gửi yêu cầu hoàn tiền
 * @param {Object} data - { courseId, reason }
 */
const requestRefund = async (data) => {
    try {
        const response = await axiosClient.post(`${API_URL}/request`, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu hoàn tiền!';
    }
};

const refundService = {
    getMyRefunds,
    requestRefund
};

export default refundService;
