import api from './api';

const RESOURCE_PATH = '/order';

/**
 * Lấy tất cả đơn hàng (Admin)
 * @returns {Promise<Array>}
 */
const getOrders = async () => {
    try {
        const response = await api.get(`${RESOURCE_PATH}/all`);
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
        const response = await api.post(`${RESOURCE_PATH}/create`, data);
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
        const response = await api.get(`${RESOURCE_PATH}/${orderId}`);
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
        const response = await api.put(`${RESOURCE_PATH}/${orderId}`, null);
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
        const response = await api.get(`${RESOURCE_PATH}/${orderId}/invoices`);
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
        const response = await api.get(`${RESOURCE_PATH}/${orderId}/invoices/${invoiceId}/download`, {
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
