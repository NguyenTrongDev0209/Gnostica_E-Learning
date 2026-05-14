import axios from 'axios';

const API_URL = 'http://localhost:8080/api/courses';
const PROGRESS_API_URL = 'http://localhost:8080/api/progress';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('CourseService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const createCourse = async (courseData) => {
    const response = await axios.post(API_URL, courseData, { 
        headers: getAuthHeaders() 
    });
    return response.data;
};
 
const getAllCourses = async (page = 0, size = 10) => {
    const response = await axios.get(API_URL, {
        params: { page, size }
    });
    return response.data;
};

const getInstructorCourses = async (page = 0, size = 10, search = "", categoryId = null, status = null) => {
    const params = { page, size };
    if (search && search.trim() !== "") params.search = search.trim();
    if (categoryId) params.categoryId = categoryId;
    if (status !== null && status !== undefined && status !== "") params.status = status;

    const response = await axios.get(`${API_URL}/instructor`, {
        params,
        headers: getAuthHeaders()
    });
    return response.data;
};

const getCourseBySlug = async (slug) => {
    const response = await axios.get(`${API_URL}/${slug}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const updateCourse = async (slug, courseData) => {
    const response = await axios.put(`${API_URL}/${slug}`, courseData, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const updateCourseStatus = async (id, status) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const deleteCourse = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getAllDrafts = async () => {
    const response = await axios.get(`${API_URL}/draft/all`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const deleteDraft = async ({ courseId, slug } = {}) => {
    const response = await axios.delete(`${API_URL}/draft`, {
        params: {
            courseId: courseId || undefined,
            slug: slug || undefined,
        },
        headers: getAuthHeaders(),
    });
    return response.data;
};

const getPublicCourses = async ({ categoryId, categorySlug, level, page = 0, size = 9 } = {}) => {
    const params = { page, size };
    if (categoryId) params.categoryId = categoryId;
    if (categorySlug) params.categorySlug = categorySlug;
    if (level) params.level = level;
    
    const response = await axios.get(API_URL, { params });
    return response.data;
};

const getCourseProgress = async (slug) => {
    try {
        const response = await axios.get(`${PROGRESS_API_URL}/course/${slug}`, {
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
        await axios.post(`${PROGRESS_API_URL}/lesson/${lessonId}/time?time=${Math.round(time)}`, {}, {
            headers: getAuthHeaders()
        });
    } catch (error) {
        console.error('Error updating last watched time:', error);
    }
};

const markLessonCompleted = async (lessonId) => {
    try {
        await axios.post(`${PROGRESS_API_URL}/lesson/${lessonId}/complete`, {}, {
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
        const response = await axios.post(`${PROGRESS_API_URL}/quiz/${quizId}/submit`, payload, {
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
        const response = await axios.post(`${PROGRESS_API_URL}/quiz/${quizId}/reset`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error resetting quiz result:', error);
        throw error;
    }
};

const generateAiQuestions = async (courseId, file, count, level) => {
    const idToUse = courseId || 0;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('count', count);
    formData.append('level', level);

    const response = await axios.post(`http://localhost:8080/api/instructor/courses/${idToUse}/questions/ai-generate`, formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const saveDraftQuestions = async (courseId, questions) => {
    const response = await axios.post(`http://localhost:8080/api/instructor/courses/${courseId}/questions/drafts`, questions, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getDraftQuestions = async (courseId) => {
    const response = await axios.get(`http://localhost:8080/api/instructor/courses/${courseId}/questions/drafts`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const saveQuestionBank = async (courseId, questions) => {
    const response = await axios.put(`http://localhost:8080/api/instructor/courses/${courseId}/questions`, questions, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const ADMIN_API_URL = 'http://localhost:8080/api/admin/courses';

const getModerationCourses = async (status = null, page = 0, size = 10) => {
    const params = { page, size };
    if (status !== null && status !== undefined && status !== "") params.status = status;
    const response = await axios.get(`${ADMIN_API_URL}/moderation`, {
        params,
        headers: getAuthHeaders()
    });
    return response.data;
};

const getModerationStats = async () => {
    const response = await axios.get(`${ADMIN_API_URL}/moderation/stats`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getCourseForModeration = async (slug) => {
    const response = await axios.get(`${ADMIN_API_URL}/${slug}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const approveCourse = async (slug) => {
    const response = await axios.post(`${ADMIN_API_URL}/${slug}/approve`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const rejectCourse = async (slug, rejectReason) => {
    const response = await axios.post(`${ADMIN_API_URL}/${slug}/reject`, { rejectReason }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const triggerAiScan = async (lessonId) => {
    const response = await axios.post(`${ADMIN_API_URL}/lessons/${lessonId}/ai-scan`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const triggerAiScanInfo = async (slug) => {
    const response = await axios.post(`${ADMIN_API_URL}/${slug}/ai-scan-info`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const triggerAiScanFull = async (slug) => {
    const response = await axios.post(`${ADMIN_API_URL}/${slug}/ai-scan-full`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const checkSubtitleStatus = async (videoId) => {
    const response = await axios.get(`${API_URL}/lessons/check-subtitle/${videoId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const preScanCourseText = async (title, description) => {
    const response = await axios.post(`${API_URL}/ai-pre-scan-text`, { title, description }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const preScanVideoContent = async (videoUrl) => {
    const response = await axios.post(`${API_URL}/ai-pre-scan-video`, { videoUrl }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getVideoTranscriptText = async (videoUrl) => {
    const response = await axios.post(`${API_URL}/get-video-transcript`, { videoUrl }, {
        headers: getAuthHeaders()
    });
    return response.data; // returns { transcript: "..." }
};

const courseService = {
    getVideoTranscriptText,
    preScanVideoContent,
    preScanCourseText,
    getPublicCourses,
    createCourse,
    getAllCourses,
    getInstructorCourses,
    getCourseBySlug,
    updateCourse,
    updateCourseStatus,
    deleteCourse,
    getAllDrafts,
    deleteDraft,
    getCourseProgress,
    updateLastWatchedTime,
    markLessonCompleted,
    submitQuizResult,
    resetQuizResult,
    generateAiQuestions,
    saveDraftQuestions,
    getDraftQuestions,
    saveQuestionBank,
    checkSubtitleStatus,
    // Admin specific APIs
    getModerationCourses,
    getModerationStats,
    getCourseForModeration,
    approveCourse,
    rejectCourse,
    triggerAiScan,
    triggerAiScanInfo,
    triggerAiScanFull
};

export default courseService;
