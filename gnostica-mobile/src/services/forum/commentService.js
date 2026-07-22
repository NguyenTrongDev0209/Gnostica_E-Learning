import api from '../../config/api';

const commentService = {
    /**
     * Láº¥y comments theo thread ID
     * @param {string} threadId
     */
    getByThreadId: (threadId) => {
        return api.get(`/comments/target/THREAD/${threadId}`);
    },

    getByTarget: (targetType, targetId) => {
        return api.get(`/comments/target/${targetType}/${targetId}`);
    },

    /**
     * ThÃªm comment má»›i
     * @param {Object} body - { content, targetType, targetId, userEmail, parentId? }
     */
    create: (body) => {
        const normalizedBody = body.threadId && !body.targetType
            ? { ...body, targetType: 'THREAD', targetId: body.threadId }
            : body;
        return api.post('/comments', normalizedBody);
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

