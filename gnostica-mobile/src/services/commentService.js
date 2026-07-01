import api from '../config/api';

const commentService = {
    /**
     * Láº¥y comments theo thread ID
     * @param {string} threadId
     */
    getByThreadId: (threadId) => {
        return api.get(`/comments/thread/${threadId}`);
    },

    /**
     * ThÃªm comment má»›i
     * @param {Object} body - { content, objectId, userEmail, parentId? }
     */
    create: (body) => {
        return api.post('/comments', body);
    },

    /**
     * XoÃ¡ comment
     * @param {number} id
     * @param {string} userEmail
     */
    delete: (id, userEmail) => {
        return api.delete(`/comments/${id}`, { params: { userEmail } });
    },
};

export default commentService;

