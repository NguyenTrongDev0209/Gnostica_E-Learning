import axiosClient from "@/lib/axiosClient";

const giftService = {
  searchReceiver: (email, courseId) => {
    return axiosClient.get(`/checkout/gifts/search-receiver?email=${email}&courseId=${courseId}`);
  },

  createGift: async (data) => {
    try {
      const response = await axiosClient.post("/checkout/gifts/create", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn tặng quà!';
    }
  },

  getGiftByToken: (token) => {
    return axiosClient.get(`/checkout/gifts/${token}`);
  },

  acceptGift: async (token) => {
    const res = await axiosClient.post(`/checkout/gifts/${token}/accept`);
    return res.data;
  },

  rejectGift: (token) => {
    return axiosClient.post(`/checkout/gifts/${token}/reject`);
  },
};

export default giftService;

