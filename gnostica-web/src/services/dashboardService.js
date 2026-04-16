import axios from 'axios';

const API_URL = 'http://localhost:8080/api/dashboard';

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
    const response = await axios.get(`${API_URL}/stats`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getMemberGrowth = async () => {
    const response = await axios.get(`${API_URL}/member-growth`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const dashboardService = {
    getStats,
    getMemberGrowth
};

export default dashboardService;
