import api from './api';

const orderService = {
    /**
     * Lấy tất cả đơn hàng
     * Response: ApiResponse<List<Order>>
     */
    getAll: () => {
        return api.get('/order/all');
    },

    /**
     * Lấy đơn hàng phân trang
     * @param {Object} params - { page, size }
     */
    getPaginated: (params = {}) => {
        const query = {
            page: params.page || 0,
            size: params.size || 10,
        };
        return api.get('/order/paged', { params: query });
    },

    /**
     * Lấy thông tin đơn hàng theo ID hoặc transactionId
     * @param {string} idOrCode
     */
    getById: (idOrCode) => {
        return api.get(`/order/${idOrCode}`);
    },

    /**
     * Tạo link thanh toán PayOS
     * @param {Object} body - CreatePaymentLinkRequestBody
     */
    createPaymentLink: (body) => {
        return api.post('/order/create', body);
    },
};

export default orderService;
