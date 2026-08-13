import api from '../../config/api';

const giftService = {
  searchReceiver: (email, courseId) => {
    return api.get(`/checkout/gifts/search-receiver?email=${email}&courseId=${courseId}`);
  },

  createGift: (data) => {
    return api.post("/checkout/gifts/create", data);
  },

  getGiftByToken: (token) => {
    return api.get(`/checkout/gifts/${token}`);
  },

  acceptGift: async (token) => {
    const res = await api.post(`/checkout/gifts/${token}/accept`);
    return res.data || res;
  },

  rejectGift: (token) => {
    return api.post(`/checkout/gifts/${token}/reject`);
  },
};

export default giftService;
