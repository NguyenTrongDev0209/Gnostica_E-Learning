import api from '../../config/api';

const threadReportService = {
    checkReportStatus: (threadId, email) =>
        api.get(`/thread-reports/check`, { params: { threadId, email } }),

    createReport: (threadId, email, reason, detail) =>
        api.post('/thread-reports', { threadId, email, reason, detail }),
};

export default threadReportService;
