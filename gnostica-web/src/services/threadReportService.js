import axiosClient from '@/lib/axiosClient';

const API_URL = '/thread-reports';

export const threadReportService = {
  checkReportStatus: async (threadId, email) => {
    const res = await axiosClient.get(`${API_URL}/check?threadId=${threadId}&email=${encodeURIComponent(email)}`);
    return res.data;
  },

  createReport: async (threadId, email, reason) => {
    const res = await axiosClient.post(API_URL, {
      threadId,
      email,
      reason
    });
    return res.data;
  },

  // Admin endpoints
  getReports: async (page = 0, size = 50) => {
    const res = await axiosClient.get(`${API_URL}?page=${page}&size=${size}`);
    return res.data;
  },

  updateReportStatus: async (id, status) => {
    const res = await axiosClient.put(`${API_URL}/${id}/status`, { status });
    return res.data;
  }
};

export default threadReportService;
