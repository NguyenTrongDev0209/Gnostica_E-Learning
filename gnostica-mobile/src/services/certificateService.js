import api from './api';

const certificateService = {
    /**
     * Lấy tất cả chứng chỉ của user
     */
    getAll: () => {
        return api.get('/certificates/my-certificates');
    },

    /**
     * Lấy thông tin chứng chỉ theo certifiUrl
     * Response: CertificateDTO { certifiUrl, courseTitle, studentName, instructorName, completedAt }
     * @param {string} certifiUrl
     */
    getByUrl: (certifiUrl) => {
        return api.get(`/certificates/${certifiUrl}`);
    },
};

export default certificateService;
