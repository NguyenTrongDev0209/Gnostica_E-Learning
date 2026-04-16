import api from './api';

const RESOURCE_PATH = '/dashboard';

const getStats = async () => {
    const response = await api.get(`${RESOURCE_PATH}/stats`);
    return response.data.data;
};

const getMemberGrowth = async () => {
    const response = await api.get(`${RESOURCE_PATH}/member-growth`);
    return response.data.data;
};

const dashboardService = {
    getStats,
    getMemberGrowth
};

export default dashboardService;
