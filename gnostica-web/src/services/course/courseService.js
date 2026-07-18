import axiosClient from '@/lib/axiosClient';

const API_URL = '/courses';
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
            console.error('CourseService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const createCourse = async (courseData) => {
    const response = await axiosClient.post(API_URL, courseData, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getAllCourses = async (page = 0, size = 10) => {
    const response = await axiosClient.get(API_URL, {
        params: { page, size }
    });
    return response.data;
};

const getInstructorCourses = async (page = 0, size = 10, search = "", categoryId = null, status = null) => {
    const params = { page, size };
    if (search && search.trim() !== "") params.search = search.trim();
    if (categoryId) params.categoryId = categoryId;
    if (status !== null && status !== undefined && status !== "") params.status = status;

    const response = await axiosClient.get(`${API_URL}/instructor`, {
        params,
        headers: getAuthHeaders()
    });
    return response.data;
};

const getCourseBySlug = async (slug) => {
    const response = await axiosClient.get(`${API_URL}/${slug}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const updateCourse = async (slug, courseData) => {
    const response = await axiosClient.put(`${API_URL}/${slug}`, courseData, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const updateCourseStatus = async (id, status) => {
    const response = await axiosClient.patch(`${API_URL}/${id}/status`, { status }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const deleteCourse = async (id) => {
    const response = await axiosClient.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getAllDrafts = async () => {
    const response = await axiosClient.get(`${API_URL}/draft/all`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const deleteDraft = async ({ courseId, slug } = {}) => {
    const response = await axiosClient.delete(`${API_URL}/draft`, {
        params: {
            courseId: courseId || undefined,
            slug: slug || undefined,
        },
        headers: getAuthHeaders(),
    });
    return response.data;
};

const getPublicCourses = async ({ categoryId, categorySlug, level, search, page = 0, size = 9, signal } = {}) => {
    const params = { page, size };
    if (categoryId) params.categoryId = categoryId;
    if (categorySlug) params.categorySlug = categorySlug;
    if (level && level !== 'all') params.level = level;
    if (search && search.trim() !== "") params.search = search.trim();

    const response = await axiosClient.get(API_URL, { params, signal });
    return response.data;
};

const getPublicLevels = async () => {
    const response = await axiosClient.get(`${API_URL}/public-levels`);
    return response.data;
};









const preScanCourseText = async (title, description) => {
    const response = await axiosClient.post(`${API_URL}/ai-pre-scan-text`, { title, description }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const preScanVideoContent = async (videoUrl) => {
    const response = await axiosClient.post(`${API_URL}/ai-pre-scan-video`, { videoUrl }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getVideoTranscriptText = async (videoUrl) => {
    const response = await axiosClient.post(`${API_URL}/get-video-transcript`, { videoUrl }, {
        headers: getAuthHeaders()
    });
    return response.data; // returns { transcript: "..." }
};

const deleteVideoFromBunny = async (videoUrl) => {
    if (!videoUrl || !videoUrl.includes('/')) return false;
    // videoUrl is in format: libraryId/videoId
    try {
        const response = await axiosClient.delete(`/upload/video/${videoUrl}`, {
            headers: getAuthHeaders()
        });
        return response.status === 200;
    } catch (error) {
        console.error('Error deleting video from Bunny:', error);
        return false;
    }
};

const courseService = {
    getVideoTranscriptText,
    preScanVideoContent,
    preScanCourseText,
    getPublicCourses,
    getPublicLevels,
    createCourse,
    getAllCourses,
    getInstructorCourses,
    getCourseBySlug,
    updateCourse,
    updateCourseStatus,
    deleteCourse,
    getAllDrafts,
    deleteDraft,
    deleteVideoFromBunny,
    getRecommendedCourses: async (page = 0, size = 10) => {
        const response = await axiosClient.get(`${API_URL}/recommendations`, {
            params: { page, size },
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

export default courseService;
