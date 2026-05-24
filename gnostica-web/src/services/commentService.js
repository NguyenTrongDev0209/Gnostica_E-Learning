import axios from 'axios';

const API_URL = 'http://localhost:8080/api/comments';

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
  getCommentsByThreadId: async (threadId) => {
    try {
      const response = await axios.get(`${API_URL}/thread/${threadId}`, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },
  
  addComment: async (payload) => {
    try {
      const response = await axios.post(`${API_URL}`, payload, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },
  
  deleteComment: async (id, userEmail) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
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
