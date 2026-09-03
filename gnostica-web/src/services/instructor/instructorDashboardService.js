import axiosClient from '@/lib/axiosClient';

const API_URL = '/instructor-dashboard';

export const instructorDashboardService = {
  getStats: async () => {
    const response = await axiosClient.get(`${API_URL}/stats`);
    return response.data;
  },
  getRevenueChart: async (months = 6) => {
    const response = await axiosClient.get(`${API_URL}/revenue-chart`, {
      params: { months }
    });
    return response.data;
  },
  getRatingDistribution: async () => {
    const response = await axiosClient.get(`${API_URL}/rating-distribution`);
    return response.data;
  },
  getStudentGrowthChart: async (months = 6) => {
    const response = await axiosClient.get(`${API_URL}/student-growth`, {
      params: { months }
    });
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
  replyToReview: async (parentReviewId, content) => {
    const response = await axiosClient.post('/reviews/reply', {
      parentReviewId,
      comment: content
    });
    return response.data;
  },
  toggleQuestionStatus: async (commentId, status, userEmail) => {
    const response = await axiosClient.put(`/comments/${commentId}/status`, {
      status,
      userEmail
    });
    return response.data;
  },
  getReplyTemplates: async () => {
    const response = await axiosClient.get('/reply-templates');
    return response.data;
  },
  createReplyTemplate: async (content) => {
    const response = await axiosClient.post('/reply-templates', { content });
    return response.data;
  },
  updateReplyTemplate: async (id, content) => {
    const response = await axiosClient.put(`/reply-templates/${id}`, { content });
    return response.data;
  },
  deleteReplyTemplate: async (id) => {
    const response = await axiosClient.delete(`/reply-templates/${id}`);
    return response.data;
  },
  updateReview: async (id, content) => {
    const response = await axiosClient.put(`/reviews/${id}`, { content });
    return response.data;
  },
  deleteReview: async (id) => {
    const response = await axiosClient.delete(`/reviews/${id}`);
    return response.data;
  }
};
