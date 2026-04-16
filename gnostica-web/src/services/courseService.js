import api from './api';

const RESOURCE_PATH = '/courses';
const PROGRESS_PATH = '/progress';

const createCourse = async (courseData) => {
    const response = await api.post(RESOURCE_PATH, courseData);
    return response.data;
};
 
const getAllCourses = async (page = 0, size = 10) => {
    const response = await api.get(RESOURCE_PATH, {
        params: { page, size }
    });
    return response.data;
};

const getInstructorCourses = async (page = 0, size = 10) => {
    const response = await api.get(`${RESOURCE_PATH}/instructor`, {
        params: { page, size }
    });
    return response.data;
};

const getCourseBySlug = async (slug) => {
    const response = await api.get(`${RESOURCE_PATH}/${slug}`);
    return response.data;
};

const updateCourse = async (slug, courseData) => {
    const response = await api.put(`${RESOURCE_PATH}/${slug}`, courseData);
    return response.data;
};

const updateCourseStatus = async (id, status) => {
    const response = await api.patch(`${RESOURCE_PATH}/${id}/status`, { status });
    return response.data;
};

const deleteCourse = async (id) => {
    const response = await api.delete(`${RESOURCE_PATH}/${id}`);
    return response.data;
};

const getAllDrafts = async () => {
    const response = await api.get(`${RESOURCE_PATH}/draft/all`);
    return response.data;
};

const deleteDraft = async ({ courseId, slug } = {}) => {
    const response = await api.delete(`${RESOURCE_PATH}/draft`, {
        params: {
            courseId: courseId || undefined,
            slug: slug || undefined,
        }
    });
    return response.data;
};

const getPublicCourses = async ({ categoryId, categorySlug, level, page = 0, size = 9 } = {}) => {
    const params = { page, size };
    if (categoryId) params.categoryId = categoryId;
    if (categorySlug) params.categorySlug = categorySlug;
    if (level) params.level = level;
    
    const response = await api.get(RESOURCE_PATH, { params });
    return response.data;
};

const getCourseProgress = async (slug) => {
    try {
        const response = await api.get(`${PROGRESS_PATH}/course/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching course progress:', error);
        return [];
    }
};

const updateLastWatchedTime = async (lessonId, time) => {
    try {
        await api.post(`${PROGRESS_PATH}/lesson/${lessonId}/time?time=${Math.round(time)}`, {});
    } catch (error) {
        console.error('Error updating last watched time:', error);
    }
};

const markLessonCompleted = async (lessonId) => {
    try {
        await api.post(`${PROGRESS_PATH}/lesson/${lessonId}/complete`, {});
        return true;
    } catch (error) {
        console.error('Error marking lesson complete:', error);
        throw error;
    }
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
    markLessonCompleted
};

export default courseService;
