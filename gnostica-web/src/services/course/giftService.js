import axiosClient from "@/lib/axiosClient";

const giftService = {
  searchReceiver: (email, courseId) => {
    return axiosClient.get(`/gifts/search-receiver?email=${email}&courseId=${courseId}`);
  },

  createGift: (data) => {
    return axiosClient.post("/gifts/create", data);
  },

  getGiftByToken: (token) => {
    return axiosClient.get(`/gifts/${token}`);
  },

  acceptGift: (token) => {
    return axiosClient.post(`/gifts/${token}/accept`);
  },

  rejectGift: (token) => {
    return axiosClient.post(`/gifts/${token}/reject`);
  },
};

export default giftService;
