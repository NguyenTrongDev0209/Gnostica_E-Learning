import api from '../../config/api';

const refundService = {
  getMyRefunds: async () => {
    try {
      const response = await api.get('/checkout/refunds/me');
      return response.data; // Expected: { success: true, data: [...] }
    } catch (error) {
      throw error.response?.data?.message || 'Lỗi khi tải danh sách hoàn tiền';
    }
  },

  requestRefund: async (data) => {
    try {
      // data: { orderDetailId, reason }
      const response = await api.post('/checkout/refunds/request', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Lỗi khi gửi yêu cầu hoàn tiền';
    }
  }
};

export default refundService;
