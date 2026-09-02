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

const buildRangeParams = (param) => {
    if (!param) return undefined;
    if (typeof param === 'object') {
        const { start, end, months } = param;
        const res = {};
        if (start) res.start = start;
        if (end) res.end = end;
        if (months) res.months = months;
        return Object.keys(res).length > 0 ? res : undefined;
    }
    return { months: param };
};

const getStats = async (period) => {
    const response = await axiosClient.get(`${API_URL}/stats`, {
        params: period ? { period } : undefined,
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getMemberGrowth = async (params) => {
    const response = await axiosClient.get(`${API_URL}/member-growth`, {
        params: buildRangeParams(params),
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getRevenue = async (params) => {
    const response = await axiosClient.get(`${API_URL}/revenue`, {
        params: buildRangeParams(params),
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

const getUserRatings = async (params) => {
    const response = await axiosClient.get(`${API_URL}/user-ratings`, {
        params: buildRangeParams(params),
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getViolations = async (params) => {
    const response = await axiosClient.get(`${API_URL}/violations`, {
        params: buildRangeParams(params),
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getRefunds = async (params) => {
    const response = await axiosClient.get(`${API_URL}/refunds`, {
        params: buildRangeParams(params),
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const dashboardService = {
    getStats,
    getMemberGrowth,
    getRevenue,
    getRefunds,
    getRecentOrders,
    getTopCourses,
    getTopInstructors,
    getStudentProductivity,
    getUserDemographics,
    getUserRatings,
    getViolations
};

export default dashboardService;
