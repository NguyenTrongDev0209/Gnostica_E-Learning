import axiosClient from '@/lib/axiosClient';

const API_URL = '/checkout/orders';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('OrderService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

/**
 * Lấy tất cả đơn hàng (Admin)
 * @returns {Promise<Array>}
 */
const getOrders = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/all`, {
            headers: getAuthHeaders()
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách đơn hàng!';
    }
};

/**
 * Tạo đơn hàng và link thanh toán PayOS
 * @param {Object} data - Dữ liệu đơn hàng (CreatePaymentLinkRequestBody)
 * @returns {Promise<Object>} - Kết quả từ server (ApiResponse<CreatePaymentLinkResponse>)
 */
const createOrder = async (data) => {
    try {
        const response = await axiosClient.post(`${API_URL}/create`, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng!';
    }
};

/**
 * Lấy thông tin chi tiết đơn hàng (từ PayOS)
 * @param {number|string} orderId - ID của đơn hàng
 * @returns {Promise<Object>}
 */
const getOrderById = async (orderId) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${orderId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy thông tin đơn hàng!';
    }
};

/**
 * Hủy đơn hàng
 * @param {number|string} orderId - ID của đơn hàng 
 * @returns {Promise<Object>}
 */
const cancelOrder = async (orderId) => {
    try {
        const response = await axiosClient.put(`${API_URL}/${orderId}/cancel`, null, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng!';
    }
};

/**
 * Lấy danh sách hóa đơn của đơn hàng
 * @param {number|string} orderId 
 * @returns {Promise<Object>}
 */
const getInvoices = async (orderId) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${orderId}/invoices`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy danh sách hóa đơn!';
    }
};

/**
 * Tải hóa đơn (PDF)
 * @param {number|string} orderId 
 * @param {string} invoiceId 
 * @returns {Promise<Blob>}
 */
const downloadInvoice = async (orderId, invoiceId) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${orderId}/invoices/${invoiceId}/download`, {
            headers: getAuthHeaders(),
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Có lỗi xảy ra khi tải hóa đơn!';
    }
};

const orderService = {
    getOrders,
    createOrder,
    getOrderById,
    cancelOrder,
    getInvoices,
    downloadInvoice
};

export default orderService;

