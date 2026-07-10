import api from '../../config/api';

const threadService = {
    /**
     * Láº¥y danh sÃ¡ch threads (phÃ¢n trang)
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
     * Láº¥y chi tiáº¿t thread theo ID
     * @param {number} id
     */
    getById: (id) => {
        return api.get(`/threads/${id}`);
    },

    /**
     * TÄƒng lÆ°á»£t xem thread
     * @param {number} id
     */
    incrementView: (id) => {
        return api.post(`/threads/${id}/view`);
    },

    /**
     * Táº¡o thread má»›i (multipart/form-data)
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
                // KhÃ´ng set Content-Type, Ä‘á»ƒ browser tá»± xá»­ lÃ½ multipart boundary
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw data || { message: 'Táº¡o bÃ i viáº¿t tháº¥t báº¡i' };
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
     * Kiá»ƒm tra tráº¡ng thÃ¡i like
     * @param {number} id
     * @param {string} email
     */
    getLikeStatus: (id, email) => {
        return api.get(`/threads/${id}/like-status`, { params: { email } });
    },

    /**
     * Láº¥y bÃ i Ä‘Äƒng cá»§a chÃ­nh mÃ¬nh (phÃ¢n trang)
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
     * Láº¥y thá»‘ng kÃª forum cÃ¡ nhÃ¢n
     * @param {string} email
     */
    getMyStats: (email) => {
        return api.get('/threads/me/stats', { params: { email } });
    },

    /**
     * Láº¥y top contributors
     */
    getTopContributors: () => {
        return api.get('/threads/top-contributors');
    },

    /**
     * Láº¥y threads liÃªn quan
     * @param {number} id
     */
    getRelated: (id) => {
        return api.get(`/threads/${id}/related`);
    },

    /**
     * XoÃ¡ thread
     * @param {number} id
     */
    delete: (id) => {
        return api.delete(`/threads/${id}`);
    },
};

export default threadService;

