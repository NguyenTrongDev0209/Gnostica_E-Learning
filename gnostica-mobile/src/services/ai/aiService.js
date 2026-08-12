import api from '../../config/api';

const aiService = {
    /**
     * Gửi tin nhắn chat tới AI
     * @param {Array} messages List of { role: 'user'|'assistant', content: string }
     * @param {string|null} sessionId ID phiên chat hiện tại (nếu có)
     */
    sendChatMessage: async (messages, sessionId = null) => {
        try {
            const payload = {
                sessionId: sessionId || null,
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            };
            const response = await api.post('/ai/chat', payload);
            return response;
        } catch (error) {
            console.error('Error sending message to AI service:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách các phiên trò chuyện của người dùng
     */
    getSessions: async () => {
        try {
            const response = await api.get('/ai/sessions');
            return response;
        } catch (error) {
            console.error('Error fetching AI chat sessions:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết tin nhắn trong 1 phiên trò chuyện
     */
    getSessionDetail: async (sessionId) => {
        try {
            const response = await api.get(`/ai/sessions/${sessionId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching AI session ${sessionId}:`, error);
            throw error;
        }
    },

    /**
     * Xóa 1 phiên trò chuyện
     */
    deleteSession: async (sessionId) => {
        try {
            const response = await api.delete(`/ai/sessions/${sessionId}`);
            return response;
        } catch (error) {
            console.error(`Error deleting AI session ${sessionId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy giới hạn lượt hỏi AI còn lại trong ngày
     */
    getQuota: async () => {
        try {
            const response = await api.get('/ai/quota');
            return response?.data || response;
        } catch (error) {
            console.error('Error fetching AI quota:', error);
            return { dailyLimit: 15, remaining: 15, used: 0 };
        }
    }
};

export default aiService;
