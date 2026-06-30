import api from './api';

const instructorService = {
    /**
     * Lấy danh sách giảng viên kèm thống kê
     * Response: List<InstructorStatsResponse>
     */
    getAll: () => {
        return api.get('/instructors/list');
    },

    /**
     * Lấy hồ sơ công khai của giảng viên
     * @param {number} id - Account ID
     */
    getProfile: (id) => {
        return api.get(`/instructors/${id}/profile`);
    },

    /**
     * Lấy khóa học của giảng viên
     * @param {number} id - Account ID
     */
    getCourses: (id) => {
        return api.get(`/instructors/${id}/courses`);
    },

    /**
     * Gửi đơn đăng ký làm giảng viên
     * @param {Object} body - InstructorApplicationRequest { fullName, phone, bio, ... }
     */
    apply: (body) => {
        return api.post('/instructor-applications', body);
    },
};

export default instructorService;
