import axios from 'axios';

const API_URL = 'http://localhost:8080/api/courses';

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

const courseService = {
    createCourse,
    getInstructorCourses,
    getCourseBySlug,
    updateCourse,
    updateCourseStatus,
    deleteCourse,
    getAllDrafts,
    deleteDraft,
};

export default courseService;
