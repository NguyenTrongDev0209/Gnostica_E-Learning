import axiosClient from '@/lib/axiosClient';

const PROGRESS_API_URL = '/progress';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('progressService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const getCourseProgress = async (slug) => {
    try {
        const response = await axiosClient.get(`${PROGRESS_API_URL}/course/${slug}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching course progress:', error);
        return [];
    }
};

const updateLastWatchedTime = async (lessonId, time) => {
    try {
        await axiosClient.post(`${PROGRESS_API_URL}/lesson/${lessonId}/time?time=${Math.round(time)}`, {}, {
            headers: getAuthHeaders()
        });
    } catch (error) {
        console.error('Error updating last watched time:', error);
    }
};

const markLessonCompleted = async (lessonId) => {
    try {
        await axiosClient.post(`${PROGRESS_API_URL}/lesson/${lessonId}/complete`, {}, {
            headers: getAuthHeaders()
        });
        return true;
    } catch (error) {
        console.error('Error marking lesson complete:', error);
        throw error;
    }
};

const submitQuizResult = async (quizId, payload) => {
    try {
        const response = await axiosClient.post(`${PROGRESS_API_URL}/quiz/${quizId}/submit`, payload, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting quiz result:', error);
        throw error;
    }
};

const resetQuizResult = async (quizId) => {
    try {
        const response = await axiosClient.post(`${PROGRESS_API_URL}/quiz/${quizId}/reset`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error resetting quiz result:', error);
        throw error;
    }
};

const progressService = {
    getCourseProgress,
    updateLastWatchedTime,
    markLessonCompleted,
    submitQuizResult,
    resetQuizResult,
};

export default progressService;
