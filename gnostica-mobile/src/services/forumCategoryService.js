import api from '../config/api';

const forumCategoryService = {
    /**
     * Láº¥y táº¥t cáº£ chuyÃªn má»¥c diá»…n Ä‘Ã n (kÃ¨m sá»‘ thread)
     * Response: List<{ id, name, slug, status, threadCount }>
     */
    getAll: () => {
        return api.get('/forum-categories');
    },
};

export default forumCategoryService;

