import api from './api';

const forumCategoryService = {
    /**
     * Lấy tất cả chuyên mục diễn đàn (kèm số thread)
     * Response: List<{ id, name, slug, status, threadCount }>
     */
    getAll: () => {
        return api.get('/forum-categories');
    },
};

export default forumCategoryService;
