import axiosClient from '@/lib/axiosClient';

const ADMIN_API_URL = '/admin/courses';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('adminCourseService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const getModerationCourses = async ({ status = null, search = '', categoryId = null, page = 0, size = 10 } = {}) => {
    const params = { page, size };
    if (status !== null && status !== undefined && status !== "") params.status = status;
    if (search.trim()) params.search = search.trim();
    if (categoryId !== null && categoryId !== undefined && categoryId !== "") params.categoryId = categoryId;
    const response = await axiosClient.get(`${ADMIN_API_URL}/moderation`, {
        params,
        headers: getAuthHeaders()
    });
    return response.data;
};

const getModerationStats = async () => {
    const response = await axiosClient.get(`${ADMIN_API_URL}/moderation/stats`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getCourseForModeration = async (slug) => {
    const response = await axiosClient.get(`${ADMIN_API_URL}/${slug}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const approveCourse = async (slug) => {
    const response = await axiosClient.post(`${ADMIN_API_URL}/${slug}/approve`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const rejectCourse = async (slug, rejectReason) => {
    const response = await axiosClient.post(`${ADMIN_API_URL}/${slug}/reject`, { rejectReason }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const triggerAiScan = async (lessonId) => {
    const response = await axiosClient.post(`${ADMIN_API_URL}/lessons/${lessonId}/ai-scan`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const triggerAiScanInfo = async (slug) => {
    const response = await axiosClient.post(`${ADMIN_API_URL}/${slug}/ai-scan-info`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const triggerAiScanFull = async (slug) => {
    const response = await axiosClient.post(`${ADMIN_API_URL}/${slug}/ai-scan-full`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const adminCourseService = {
    getModerationCourses,
    getModerationStats,
    getCourseForModeration,
    approveCourse,
    rejectCourse,
    triggerAiScan,
    triggerAiScanInfo,
    triggerAiScanFull,
};

export default adminCourseService;
