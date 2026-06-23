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

const getStats = async () => {
    const response = await axiosClient.get(`${API_URL}/stats`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getMemberGrowth = async () => {
    const response = await axiosClient.get(`${API_URL}/member-growth`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getRevenue = async () => {
    const response = await axiosClient.get(`${API_URL}/revenue`, {
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

const dashboardService = {
    getStats,
    getMemberGrowth,
    getRevenue,
    getRecentOrders,
    getTopCourses
};

export default dashboardService;
