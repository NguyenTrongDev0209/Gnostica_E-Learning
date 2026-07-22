import axiosClient from '@/lib/axiosClient';

const API_URL = '/comments';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('commentService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const commentService = {
  getCommentsByTarget: async (targetType, targetId) => {
    try {
      const response = await axiosClient.get(`${API_URL}/target/${targetType}/${targetId}`, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  getCommentsByThreadId: async (threadId) => {
    try {
      return await commentService.getCommentsByTarget("THREAD", threadId);
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },
  
  addComment: async (payload) => {
    try {
      const normalizedPayload = payload.threadId && !payload.targetType
        ? { ...payload, targetType: "THREAD", targetId: payload.threadId }
        : payload;
      const response = await axiosClient.post(`${API_URL}`, normalizedPayload, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },
  
  deleteComment: async (id, userEmail) => {
    try {
      const response = await axiosClient.delete(`${API_URL}/${id}`, {
        params: { userEmail },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }
};

export default commentService;
