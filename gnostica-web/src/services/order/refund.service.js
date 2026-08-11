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
 * Gửi yêu cầu hoàn tiền cho một chi tiết đơn hàng
 * @param {Object} data - Dữ liệu yêu cầu hoàn tiền { orderDetailId, reason }
 * @returns {Promise<Object>}
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

/**
 * Lấy danh sách hoàn tiền của người dùng hiện tại
 * @returns {Promise<Array>}
 */
const getMyRefunds = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/me`, {
            headers: getAuthHeaders()
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách hoàn tiền!';
    }
};

const refundService = {
    requestRefund,
    getMyRefunds
};

export default refundService;
