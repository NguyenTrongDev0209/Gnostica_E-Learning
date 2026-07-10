import api from '../../config/api';

const lessonProgressService = {
    /**
     * Láº¥y tiáº¿n Ä‘á»™ há»c táº­p cá»§a khÃ³a há»c theo slug
     * @param {string} slug
     */
    getCourseProgress: (slug) => {
        return api.get(`/progress/course/${slug}`);
    },

    /**
     * Cáº­p nháº­t thá»i gian xem cuá»‘i cÃ¹ng
     * @param {number} lessonId
     * @param {number} time - seconds
     */
    updateWatchedTime: (lessonId, time) => {
        return api.post(`/progress/lesson/${lessonId}/time`, null, {
            params: { time },
        });
    },

    /**
     * ÄÃ¡nh dáº¥u bÃ i há»c hoÃ n thÃ nh
     * @param {number} lessonId
     */
    markComplete: (lessonId) => {
        return api.post(`/progress/lesson/${lessonId}/complete`);
    },

    /**
     * Submit káº¿t quáº£ quiz
     * @param {number} quizId
     * @param {Object} body - QuizSubmitRequest
     */
    submitQuiz: (quizId, body) => {
        return api.post(`/progress/quiz/${quizId}/submit`, body);
    },

    /**
     * Reset káº¿t quáº£ quiz (cho phÃ©p lÃ m láº¡i)
     * @param {number} quizId
     */
    resetQuiz: (quizId) => {
        return api.post(`/progress/quiz/${quizId}/reset`);
    },
};

export default lessonProgressService;

