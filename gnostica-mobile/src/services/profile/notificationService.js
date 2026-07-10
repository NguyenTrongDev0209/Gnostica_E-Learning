import api from '../../config/api';

const notificationService = {
    /**
     * Láº¥y danh sÃ¡ch thÃ´ng bÃ¡o cá»§a user
     * Response: List<Notification> (tráº£ trá»±c tiáº¿p, khÃ´ng qua ApiResponse wrapper)
     */
    getAll: () => {
        return api.get('/notifications');
    },

    /**
     * Láº¥y sá»‘ thÃ´ng bÃ¡o chÆ°a Ä‘á»c
     * @returns {number}
     */
    getUnreadCount: () => {
        return api.get('/notifications/unread-count');
    },

    /**
     * ÄÃ¡nh dáº¥u 1 thÃ´ng bÃ¡o Ä‘Ã£ Ä‘á»c
     * @param {number} id
     */
    markAsRead: (id) => {
        return api.put(`/notifications/${id}/read`);
    },

    /**
     * ÄÃ¡nh dáº¥u táº¥t cáº£ Ä‘Ã£ Ä‘á»c
     */
    markAllAsRead: () => {
        return api.put('/notifications/read-all');
    },
};

export default notificationService;

