import api from './api';

const notificationService = {
    /**
     * Lấy danh sách thông báo của user
     * Response: List<Notification> (trả trực tiếp, không qua ApiResponse wrapper)
     */
    getAll: () => {
        return api.get('/notifications');
    },

    /**
     * Lấy số thông báo chưa đọc
     * @returns {number}
     */
    getUnreadCount: () => {
        return api.get('/notifications/unread-count');
    },

    /**
     * Đánh dấu 1 thông báo đã đọc
     * @param {number} id
     */
    markAsRead: (id) => {
        return api.put(`/notifications/${id}/read`);
    },

    /**
     * Đánh dấu tất cả đã đọc
     */
    markAllAsRead: () => {
        return api.put('/notifications/read-all');
    },
};

export default notificationService;
