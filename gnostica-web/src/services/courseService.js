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

const getInstructorCourses = async (page = 0, size = 10) => {
    const response = await axios.get(`${API_URL}/instructor`, {
        params: { page, size },
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

const courseService = {
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
    generateAiQuestions,
    saveDraftQuestions,
    getDraftQuestions,
    saveQuestionBank
};

export default courseService;
