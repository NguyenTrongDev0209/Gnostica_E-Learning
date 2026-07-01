import api from '../config/api';

const orderService = {
    /**
     * Láº¥y táº¥t cáº£ Ä‘Æ¡n hÃ ng
     * Response: ApiResponse<List<Order>>
     */
    getAll: () => {
        return api.get('/order/all');
    },

    /**
     * Láº¥y Ä‘Æ¡n hÃ ng phÃ¢n trang
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
     * Láº¥y thÃ´ng tin Ä‘Æ¡n hÃ ng theo ID hoáº·c transactionId
     * @param {string} idOrCode
     */
    getById: (idOrCode) => {
        return api.get(`/order/${idOrCode}`);
    },

    /**
     * Táº¡o link thanh toÃ¡n PayOS
     * @param {Object} body - CreatePaymentLinkRequestBody
     */
    createPaymentLink: (body) => {
        return api.post('/order/create', body);
    },
};

export default orderService;

