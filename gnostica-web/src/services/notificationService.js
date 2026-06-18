import axiosClient from '@/lib/axiosClient';

const notificationService = {
  getNotifications: () => axiosClient.get('/api/notifications'),
  getUnreadCount: () => axiosClient.get('/api/notifications/unread-count'),
  markAsRead: (id) => axiosClient.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.put('/api/notifications/read-all'),
};

export default notificationService;
