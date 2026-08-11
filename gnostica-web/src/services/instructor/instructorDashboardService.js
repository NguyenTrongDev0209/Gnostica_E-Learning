import axiosClient from '@/lib/axiosClient';

const API_URL = '/instructor-dashboard';

export const instructorDashboardService = {
  getStats: async () => {
    const response = await axiosClient.get(`${API_URL}/stats`);
    return response.data;
  },
  getRevenueChart: async () => {
    const response = await axiosClient.get(`${API_URL}/revenue-chart`);
    return response.data;
  },
  getRatingDistribution: async () => {
    const response = await axiosClient.get(`${API_URL}/rating-distribution`);
    return response.data;
  },
  getStudentGrowthChart: async () => {
    const response = await axiosClient.get(`${API_URL}/student-growth`);
    return response.data;
  },
  getCoursePerformance: async () => {
    const response = await axiosClient.get(`${API_URL}/course-performance`);
    return response.data;
  },
  getQuestions: async () => {
    const response = await axiosClient.get(`${API_URL}/questions`);
    return response.data;
  },
  getReviews: async () => {
    const response = await axiosClient.get(`${API_URL}/reviews`);
    return response.data;
  },
  replyToQuestion: async (parentId, targetId, content, userEmail) => {
    const response = await axiosClient.post('/comments', {
      parentId,
      targetId,
      targetType: 'LESSON',
      content,
      userEmail
    });
    return response.data;
  },
  toggleQuestionStatus: async (commentId, status, userEmail) => {
    const response = await axiosClient.put(`/comments/${commentId}/status`, {
      status,
      userEmail
    });
    return response.data;
  }
};
