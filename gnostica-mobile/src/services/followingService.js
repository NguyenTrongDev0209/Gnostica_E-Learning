import api from '../config/api';

const followingService = {
    /**
     * Láº¥y danh sÃ¡ch giáº£ng viÃªn Ä‘ang theo dÃµi
     * Response: ApiResponse<List<...>>
     */
    getFollowedInstructors: () => {
        return api.get('/follow/instructors');
    },

    /**
     * Toggle theo dÃµi giáº£ng viÃªn (follow/unfollow)
     * @param {number} instructorId
     * @returns {{ data: { isFollowing: boolean, message: string } }}
     */
    toggle: (instructorId) => {
        return api.post(`/follow/toggle/${instructorId}`);
    },

    /**
     * Kiá»ƒm tra Ä‘ang theo dÃµi giáº£ng viÃªn khÃ´ng
     * @param {number} instructorId
     * @returns {{ data: { isFollowing: boolean } }}
     */
    check: (instructorId) => {
        return api.get(`/follow/check/${instructorId}`);
    },
};

export default followingService;

