import api from './api';

const courseService = {
    /**
     * Lấy danh sách khóa học public (phân trang + filter)
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
     * Lấy chi tiết khóa học theo slug
     * @param {string} slug
     */
    getBySlug: (slug) => {
        return api.get(`/courses/${slug}`);
    },

    /**
     * Lấy khóa học gợi ý cho user (cần đăng nhập)
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
     * Lấy danh sách các level khóa học public
     */
    getPublicLevels: () => {
        return api.get('/courses/public-levels');
    },
};

export default courseService;
