import axiosClient from '@/lib/axiosClient';

const notificationService = {
  getNotifications: () => axiosClient.get('/notifications'),
  getUnreadCount: () => axiosClient.get('/notifications/unread-count'),
  markAsRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.put('/notifications/read-all'),
};

export default notificationService;
