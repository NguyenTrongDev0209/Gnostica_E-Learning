import api from '../config/api';

const certificateService = {
    /**
     * Láº¥y táº¥t cáº£ chá»©ng chá»‰ cá»§a user
     */
    getAll: () => {
        return api.get('/certificates/my-certificates');
    },

    /**
     * Láº¥y thÃ´ng tin chá»©ng chá»‰ theo certifiUrl
     * Response: CertificateDTO { certifiUrl, courseTitle, studentName, instructorName, completedAt }
     * @param {string} certifiUrl
     */
    getByUrl: (certifiUrl) => {
        return api.get(`/certificates/${certifiUrl}`);
    },
};

export default certificateService;

