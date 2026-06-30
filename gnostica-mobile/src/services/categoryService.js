import api from '../config/api';

const categoryService = {
    /**
     * Láº¥y danh sÃ¡ch danh má»¥c (phÃ¢n trang)
     * Response format: { status, message, data: { content: [...], totalPages, ... } }
     * @param {Object} params - { page, limit, search, status }
     */
    getAll: (params = {}) => {
        const query = {
            page: params.page || 1,
            limit: params.limit || 50,
            ...(params.search && { search: params.search }),
            ...(params.status !== undefined && { status: params.status }),
        };
        return api.get('/categories', { params: query });
    },
};

export default categoryService;

