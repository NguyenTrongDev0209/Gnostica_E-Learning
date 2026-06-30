import api from './api';

const commentService = {
    /**
     * Lấy comments theo thread ID
     * @param {string} threadId
     */
    getByThreadId: (threadId) => {
        return api.get(`/comments/thread/${threadId}`);
    },

    /**
     * Thêm comment mới
     * @param {Object} body - { content, objectId, userEmail, parentId? }
     */
    create: (body) => {
        return api.post('/comments', body);
    },

    /**
     * Xoá comment
     * @param {number} id
     * @param {string} userEmail
     */
    delete: (id, userEmail) => {
        return api.delete(`/comments/${id}`, { params: { userEmail } });
    },
};

export default commentService;
