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
            console.error('AdminRefundService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

/**
 * Lấy tất cả yêu cầu hoàn tiền (dành cho Admin)
 * @returns {Promise<Array>}
 */
const getAllRefunds = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/all`, {
            headers: getAuthHeaders()
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách yêu cầu hoàn tiền!';
    }
};

/**
 * Phê duyệt yêu cầu hoàn tiền
 * @param {string} id - ID của yêu cầu hoàn tiền
 * @returns {Promise<Object>}
 */
const approveRefund = async (id) => {
    try {
        const response = await axiosClient.post(`${API_URL}/${id}/approve`, null, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt hoàn tiền!';
    }
};

/**
 * Từ chối yêu cầu hoàn tiền
 * @param {string} id - ID của yêu cầu hoàn tiền
 * @param {string} reason - Lý do từ chối
 * @returns {Promise<Object>}
 */
const rejectRefund = async (id, reason) => {
    try {
        const response = await axiosClient.post(`${API_URL}/${id}/reject`, { reason }, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi từ chối hoàn tiền!';
    }
};

const adminRefundService = {
    getAllRefunds,
    approveRefund,
    rejectRefund
};

export default adminRefundService;
