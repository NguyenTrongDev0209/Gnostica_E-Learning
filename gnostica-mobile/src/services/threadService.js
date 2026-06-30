import api from './api';

const threadService = {
    /**
     * Lấy danh sách threads (phân trang)
     * @param {Object} params - { page, size, sortBy }
     */
    getAll: (params = {}) => {
        const query = {
            page: params.page || 0,
            size: params.size || 15,
            sortBy: params.sortBy || 'views',
        };
        return api.get('/threads', { params: query });
    },

    /**
     * Lấy chi tiết thread theo ID
     * @param {number} id
     */
    getById: (id) => {
        return api.get(`/threads/${id}`);
    },

    /**
     * Tăng lượt xem thread
     * @param {number} id
     */
    incrementView: (id) => {
        return api.post(`/threads/${id}/view`);
    },

    /**
     * Tạo thread mới (multipart/form-data)
     * @param {FormData} formData - { content, authorEmail, categoryId, images[] }
     */
    create: async (formData) => {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const token = await AsyncStorage.getItem('token');
        const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.34:8080/api';

        const response = await fetch(`${BASE_URL}/threads`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                // Không set Content-Type, để browser tự xử lý multipart boundary
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw data || { message: 'Tạo bài viết thất bại' };
        return data;
    },

    /**
     * Like/unlike thread
     * @param {number} id
     * @param {string} userEmail
     */
    like: (id, userEmail) => {
        return api.post(`/threads/${id}/like`, { userEmail });
    },

    /**
     * Kiểm tra trạng thái like
     * @param {number} id
     * @param {string} email
     */
    getLikeStatus: (id, email) => {
        return api.get(`/threads/${id}/like-status`, { params: { email } });
    },

    /**
     * Lấy bài đăng của chính mình (phân trang)
     * @param {string} email
     * @param {Object} params - { page, size }
     */
    getMyPosts: (email, params = {}) => {
        const query = {
            email,
            page: params.page || 0,
            size: params.size || 5,
        };
        return api.get('/threads/me', { params: query });
    },

    /**
     * Lấy thống kê forum cá nhân
     * @param {string} email
     */
    getMyStats: (email) => {
        return api.get('/threads/me/stats', { params: { email } });
    },

    /**
     * Lấy top contributors
     */
    getTopContributors: () => {
        return api.get('/threads/top-contributors');
    },

    /**
     * Lấy threads liên quan
     * @param {number} id
     */
    getRelated: (id) => {
        return api.get(`/threads/${id}/related`);
    },

    /**
     * Xoá thread
     * @param {number} id
     */
    delete: (id) => {
        return api.delete(`/threads/${id}`);
    },
};

export default threadService;
