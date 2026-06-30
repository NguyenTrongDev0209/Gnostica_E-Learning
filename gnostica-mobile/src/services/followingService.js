import api from './api';

const followingService = {
    /**
     * Lấy danh sách giảng viên đang theo dõi
     * Response: ApiResponse<List<...>>
     */
    getFollowedInstructors: () => {
        return api.get('/follow/instructors');
    },

    /**
     * Toggle theo dõi giảng viên (follow/unfollow)
     * @param {number} instructorId
     * @returns {{ data: { isFollowing: boolean, message: string } }}
     */
    toggle: (instructorId) => {
        return api.post(`/follow/toggle/${instructorId}`);
    },

    /**
     * Kiểm tra đang theo dõi giảng viên không
     * @param {number} instructorId
     * @returns {{ data: { isFollowing: boolean } }}
     */
    check: (instructorId) => {
        return api.get(`/follow/check/${instructorId}`);
    },
};

export default followingService;
