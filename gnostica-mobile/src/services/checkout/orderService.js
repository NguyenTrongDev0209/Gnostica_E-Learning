import api from '../../config/api';

const orderService = {
    /**
     * Lấy tất cả đơn hàng
     * Response: ApiResponse<List<Order>>
     */
    getAll: () => {
        return api.get('/checkout/orders/all');
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
        return api.get('/checkout/orders/paged', { params: query });
    },

    /**
     * Lấy thông tin đơn hàng theo ID hoặc transactionId
     * @param {string} idOrCode
     */
    getById: (idOrCode) => {
        return api.get(`/checkout/orders/${idOrCode}`);
    },

    /**
     * Tạo link thanh toán PayOS
     * @param {Object} body - CreatePaymentLinkRequestBody
     */
    createPaymentLink: (body) => {
        return api.post('/checkout/orders/create', body);
    },
};

export default orderService;


