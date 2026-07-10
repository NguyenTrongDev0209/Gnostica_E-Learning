import api from '../../config/api';

const instructorService = {
    /**
     * Láº¥y danh sÃ¡ch giáº£ng viÃªn kÃ¨m thá»‘ng kÃª
     * Response: List<InstructorStatsResponse>
     */
    getAll: () => {
        return api.get('/instructors/list');
    },

    /**
     * Láº¥y há»“ sÆ¡ cÃ´ng khai cá»§a giáº£ng viÃªn
     * @param {number} id - Account ID
     */
    getProfile: (id) => {
        return api.get(`/instructors/${id}/profile`);
    },

    /**
     * Láº¥y khÃ³a há»c cá»§a giáº£ng viÃªn
     * @param {number} id - Account ID
     */
    getCourses: (id) => {
        return api.get(`/instructors/${id}/courses`);
    },

    /**
     * Gá»­i Ä‘Æ¡n Ä‘Äƒng kÃ½ lÃ m giáº£ng viÃªn
     * @param {Object} body - InstructorApplicationRequest { fullName, phone, bio, ... }
     */
    apply: (body) => {
        return api.post('/instructor-applications', body);
    },
};

export default instructorService;

