
const API_URL = "/favourites";

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

const wishlistService = {
  getMyWishlist: async () => {
    const response = await axiosClient.get(API_URL, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  toggleWishlist: async (courseId) => {
    const response = await axiosClient.post(`${API_URL}/toggle/${courseId}`, {}, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  checkWishlist: async (courseId) => {
    const response = await axiosClient.get(`${API_URL}/check/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

export default wishlistService;
