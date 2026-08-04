import axiosClient from "@/lib/axiosClient";

const BASE_URL = "/admin/users";

export const adminUserDetailService = {
  getUserSummary: async (userId) => {
    const response = await axiosClient.get(`${BASE_URL}/${userId}/summary`);
    return response.data.data;
  },

  getUserEnrollments: async (userId, page = 0, size = 10) => {
    const response = await axiosClient.get(`${BASE_URL}/${userId}/enrollments`, {
      params: { page, size },
    });
    return response.data.data;
  },

  getEnrollmentProgress: async (userId, enrollmentId) => {
    const response = await axiosClient.get(
      `${BASE_URL}/${userId}/enrollments/${enrollmentId}/progress`
    );
    return response.data.data;
  },

  getUserCourses: async (userId, page = 0, size = 10) => {
    const response = await axiosClient.get(`${BASE_URL}/${userId}/courses`, {
      params: { page, size },
    });
    return response.data.data;
  },

  getUserOrders: async (userId, page = 0, size = 10) => {
    const response = await axiosClient.get(`${BASE_URL}/${userId}/orders`, {
      params: { page, size },
    });
    return response.data.data;
  },

  getOrderDetails: async (userId, orderId) => {
    const response = await axiosClient.get(
      `${BASE_URL}/${userId}/orders/${orderId}/details`
    );
    return response.data.data;
  },

  getUserIncomes: async (userId, page = 0, size = 10) => {
    const response = await axiosClient.get(`${BASE_URL}/${userId}/incomes`, {
      params: { page, size },
    });
    return response.data.data;
  },

  getUserPayouts: async (userId, page = 0, size = 10) => {
    const response = await axiosClient.get(`${BASE_URL}/${userId}/payouts`, {
      params: { page, size },
    });
    return response.data.data;
  },

  getUserThreads: async (userId, page = 0, size = 10) => {
    const response = await axiosClient.get(`${BASE_URL}/${userId}/threads`, {
      params: { page, size },
    });
    return response.data.data;
  },

  getUserReviews: async (userId, page = 0, size = 10) => {
    const response = await axiosClient.get(`${BASE_URL}/${userId}/reviews`, {
      params: { page, size },
    });
    return response.data.data;
  },

  getUserActivities: async (userId, page = 0, size = 10) => {
    const response = await axiosClient.get(`${BASE_URL}/${userId}/activities`, {
      params: { page, size },
    });
    return response.data.data;
  },
};
