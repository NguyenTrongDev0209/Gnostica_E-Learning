import api from '../../config/api';

const courseService = {
    /**
     * Láº¥y danh sÃ¡ch khÃ³a há»c public (phÃ¢n trang + filter)
     * @param {Object} params - { categoryId, categorySlug, level, page, size }
     */
    getAll: (params = {}) => {
        const query = {
            page: params.page || 0,
            size: params.size || 9,
            ...(params.categoryId && { categoryId: params.categoryId }),
            ...(params.categorySlug && { categorySlug: params.categorySlug }),
            ...(params.level && { level: params.level }),
        };
        return api.get('/courses', { params: query });
    },

    /**
     * Láº¥y chi tiáº¿t khÃ³a há»c theo slug
     * @param {string} slug
     */
    getBySlug: (slug) => {
        return api.get(`/courses/${slug}`);
    },

    /**
     * Láº¥y khÃ³a há»c gá»£i Ã½ cho user (cáº§n Ä‘Äƒng nháº­p)
     * @param {Object} params - { page, size }
     */
    getRecommendations: (params = {}) => {
        const query = {
            page: params.page || 0,
            size: params.size || 10,
        };
        return api.get('/courses/recommendations', { params: query });
    },

    /**
     * Láº¥y danh sÃ¡ch cÃ¡c level khÃ³a há»c public
     */
    getPublicLevels: () => {
        return api.get('/courses/public-levels');
    },
};

export default courseService;

