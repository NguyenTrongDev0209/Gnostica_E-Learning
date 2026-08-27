import axiosClient from '@/lib/axiosClient';

const API_URL = '/dashboard';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('DashboardService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const getStats = async (period) => {
    const response = await axiosClient.get(`${API_URL}/stats`, {
        params: period ? { period } : undefined,
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getMemberGrowth = async (months) => {
    const response = await axiosClient.get(`${API_URL}/member-growth`, {
        params: months ? { months } : undefined,
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getRevenue = async (months) => {
    const response = await axiosClient.get(`${API_URL}/revenue`, {
        params: months ? { months } : undefined,
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getRecentOrders = async () => {
    const response = await axiosClient.get(`${API_URL}/recent-orders`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getTopCourses = async () => {
    const response = await axiosClient.get(`${API_URL}/top-courses`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getTopInstructors = async (period) => {
    const response = await axiosClient.get(`${API_URL}/top-instructors`, {
        params: period ? { period } : undefined,
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getStudentProductivity = async (period) => {
    const response = await axiosClient.get(`${API_URL}/student-productivity`, {
        params: period ? { period } : undefined,
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getUserDemographics = async () => {
    const response = await axiosClient.get(`${API_URL}/user-demographics`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getUserRatings = async (months) => {
    const response = await axiosClient.get(`${API_URL}/user-ratings`, {
        params: months ? { months } : undefined,
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getViolations = async (months) => {
    const response = await axiosClient.get(`${API_URL}/violations`, {
        params: months ? { months } : undefined,
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const dashboardService = {
    getStats,
    getMemberGrowth,
    getRevenue,
    getRecentOrders,
    getTopCourses,
    getTopInstructors,
    getStudentProductivity,
    getUserDemographics,
    getUserRatings,
    getViolations
};

export default dashboardService;
