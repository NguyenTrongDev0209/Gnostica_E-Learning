import api from '../../config/api';

const wishlistService = {
    /**
     * Kiểm tra khóa học có trong danh sách yêu thích chưa
     * @param {number|string} courseId
     */
    check: (courseId) => api.get(`/favourites/check/${courseId}`),

    /**
     * Toggle yêu thích/bỏ yêu thích khóa học
     * @param {number|string} courseId
     */
    toggle: (courseId) => api.post(`/favourites/toggle/${courseId}`),

    /**
     * Lấy danh sách khóa học yêu thích
     */
    getAll: () => api.get('/favourites'),
};

export default wishlistService;
