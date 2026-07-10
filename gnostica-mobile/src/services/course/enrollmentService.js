import api from '../../config/api';

const enrollmentService = {
    /**
     * Láº¥y danh sÃ¡ch khÃ³a há»c Ä‘Ã£ Ä‘Äƒng kÃ½
     * Response: ApiResponse<List<EnrollmentDTO>>
     */
    getMyCourses: () => {
        return api.get('/enrollments/my-courses');
    },

    /**
     * Láº¥y thá»‘ng kÃª há»c táº­p (sá»‘ khÃ³a Ä‘ang há»c, hoÃ n thÃ nh, giá» há»c...)
     */
    getStats: () => {
        return api.get('/enrollments/stats');
    },

    /**
     * Kiá»ƒm tra user Ä‘Ã£ enroll khÃ³a há»c chÆ°a
     * @param {string} courseSlug
     * @returns {{ isEnrolled: boolean }}
     */
    checkEnrollment: (courseSlug) => {
        return api.get(`/enrollments/check/${courseSlug}`);
    },
};

export default enrollmentService;

