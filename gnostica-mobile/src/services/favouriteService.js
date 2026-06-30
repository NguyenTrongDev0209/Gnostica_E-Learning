import api from './api';

const favouriteService = {
    /**
     * Lấy danh sách khóa học yêu thích
     * Response: ApiResponse<List<...>>
     */
    getWishlist: () => {
        return api.get('/favourites');
    },

    /**
     * Toggle yêu thích (thêm/xoá)
     * @param {number} courseId
     * @returns {{ data: { isFavourite: boolean, message: string } }}
     */
    toggle: (courseId) => {
        return api.post(`/favourites/toggle/${courseId}`);
    },

    /**
     * Kiểm tra khóa học có trong danh sách yêu thích không
     * @param {number} courseId
     * @returns {{ data: { isFavourite: boolean } }}
     */
    check: (courseId) => {
        return api.get(`/favourites/check/${courseId}`);
    },
};

export default favouriteService;
