import axiosClient from '@/lib/axiosClient';

const API_URL = '/threads';

export const threadService = {
  getTopContributors: async () => {
    const res = await axiosClient.get(`${API_URL}/top-contributors`);
    return res.data;
  },

  getThreads: async (page = 0, size = 1000) => {
    const res = await axiosClient.get(`${API_URL}?page=${page}&size=${size}`);
    return res.data;
  },

  getThreadById: async (id) => {
    const res = await axiosClient.get(`${API_URL}/${id}`);
    return res.data;
  },

  getRelatedThreads: async (id) => {
    const res = await axiosClient.get(`${API_URL}/${id}/related`);
    return res.data;
  },

  createThread: async (formData) => {
    // Note: formData may require multipart/form-data headers, but axiosClient interceptor handles token.
    const res = await axiosClient.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  deleteThread: async (id) => {
    const res = await axiosClient.delete(`${API_URL}/${id}`);
    return res.data;
  },

  getLikeStatus: async (id, email) => {
    const res = await axiosClient.get(`${API_URL}/${id}/like-status?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  toggleLike: async (id, email) => {
    const res = await axiosClient.post(`${API_URL}/${id}/like`, { email });
    return res.data;
  },

  viewThread: async (id) => {
    const res = await axiosClient.post(`${API_URL}/${id}/view`);
    return res.data;
  },

  getMyThreads: async (email, page = 0, size = 1000) => {
    const res = await axiosClient.get(`${API_URL}/me?email=${encodeURIComponent(email)}&page=${page}&size=${size}`);
    return res.data;
  },

  getMyThreadStats: async (email) => {
    const res = await axiosClient.get(`${API_URL}/me/stats?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  // Admin endpoints
  getPendingThreads: async (page = 0, size = 100) => {
    const res = await axiosClient.get(`${API_URL}/pending?page=${page}&size=${size}`);
    return res.data;
  },

  approveThread: async (id) => {
    const res = await axiosClient.post(`${API_URL}/${id}/approve`);
    return res.data;
  }
};

export default threadService;
