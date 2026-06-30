import api from './api';

const enrollmentService = {
    /**
     * Lấy danh sách khóa học đã đăng ký
     * Response: ApiResponse<List<EnrollmentDTO>>
     */
    getMyCourses: () => {
        return api.get('/enrollments/my-courses');
    },

    /**
     * Lấy thống kê học tập (số khóa đang học, hoàn thành, giờ học...)
     */
    getStats: () => {
        return api.get('/enrollments/stats');
    },

    /**
     * Kiểm tra user đã enroll khóa học chưa
     * @param {string} courseSlug
     * @returns {{ isEnrolled: boolean }}
     */
    checkEnrollment: (courseSlug) => {
        return api.get(`/enrollments/check/${courseSlug}`);
    },
};

export default enrollmentService;
