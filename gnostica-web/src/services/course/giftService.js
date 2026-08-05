import axiosClient from "@/lib/axiosClient";

const giftService = {
  searchReceiver: (email, courseId) => {
    return axiosClient.get(`/checkout/gifts/search-receiver?email=${email}&courseId=${courseId}`);
  },

  createGift: (data) => {
    return axiosClient.post("/checkout/gifts/create", data);
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

