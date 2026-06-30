import api from './api';

const lessonProgressService = {
    /**
     * Lấy tiến độ học tập của khóa học theo slug
     * @param {string} slug
     */
    getCourseProgress: (slug) => {
        return api.get(`/progress/course/${slug}`);
    },

    /**
     * Cập nhật thời gian xem cuối cùng
     * @param {number} lessonId
     * @param {number} time - seconds
     */
    updateWatchedTime: (lessonId, time) => {
        return api.post(`/progress/lesson/${lessonId}/time`, null, {
            params: { time },
        });
    },

    /**
     * Đánh dấu bài học hoàn thành
     * @param {number} lessonId
     */
    markComplete: (lessonId) => {
        return api.post(`/progress/lesson/${lessonId}/complete`);
    },

    /**
     * Submit kết quả quiz
     * @param {number} quizId
     * @param {Object} body - QuizSubmitRequest
     */
    submitQuiz: (quizId, body) => {
        return api.post(`/progress/quiz/${quizId}/submit`, body);
    },

    /**
     * Reset kết quả quiz (cho phép làm lại)
     * @param {number} quizId
     */
    resetQuiz: (quizId) => {
        return api.post(`/progress/quiz/${quizId}/reset`);
    },
};

export default lessonProgressService;
