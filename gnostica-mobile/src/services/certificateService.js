import api from './api';

const certificateService = {
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
