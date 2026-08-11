import axiosClient from '@/lib/axiosClient';

const API_URL = '/admin/stats';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('requestStatsService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const getSupportsStats = async (months = 12) => {
    const response = await axiosClient.get(`${API_URL}/supports`, {
        params: { months },
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getRefundsStats = async (months = 12) => {
    const response = await axiosClient.get(`${API_URL}/refunds`, {
        params: { months },
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getWithdrawalsStats = async (months = 12) => {
    const response = await axiosClient.get(`${API_URL}/withdrawals`, {
        params: { months },
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getThreadReportsStats = async (months = 12) => {
    const response = await axiosClient.get(`${API_URL}/thread-reports`, {
        params: { months },
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const requestStatsService = {
    getSupportsStats,
    getRefundsStats,
    getWithdrawalsStats,
    getThreadReportsStats
};

export default requestStatsService;
