
const API_URL = "/enrollments";

const getAuthHeaders = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
      }
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }
  return {};
};

const enrollmentService = {
  getMyCourses: async () => {
    const response = await axiosClient.get(`${API_URL}/my-courses`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  checkEnrollment: async (courseSlug) => {
    const response = await axiosClient.get(`${API_URL}/check/${courseSlug}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getMyStats: async () => {
    const response = await axiosClient.get(`${API_URL}/stats`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

export default enrollmentService;
