import api from '../../config/api';

const favouriteService = {
    /**
     * Láº¥y danh sÃ¡ch khÃ³a há»c yÃªu thÃ­ch
     * Response: ApiResponse<List<...>>
     */
    getWishlist: () => {
        return api.get('/favourites');
    },

    /**
     * Toggle yÃªu thÃ­ch (thÃªm/xoÃ¡)
     * @param {number} courseId
     * @returns {{ data: { isFavourite: boolean, message: string } }}
     */
    toggle: (courseId) => {
        return api.post(`/favourites/toggle/${courseId}`);
    },

    /**
     * Kiá»ƒm tra khÃ³a há»c cÃ³ trong danh sÃ¡ch yÃªu thÃ­ch khÃ´ng
     * @param {number} courseId
     * @returns {{ data: { isFavourite: boolean } }}
     */
    check: (courseId) => {
        return api.get(`/favourites/check/${courseId}`);
    },
};

export default favouriteService;

