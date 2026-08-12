import axiosClient from '@/lib/axiosClient';

const API_URL = '/admin/payouts';

const approvePayout = async (payoutId) => {
    const response = await axiosClient.post(`${API_URL}/${payoutId}/approve`);
    return response.data?.data ?? response.data;
};

const rejectPayout = async (payoutId, reason) => {
    const response = await axiosClient.post(`${API_URL}/${payoutId}/reject`, { reason });
    return response.data?.data ?? response.data;
};

const getPage = async (page = 0, size = 10, status = null) => {
    const params = { page, size };
    if (status) params.status = status;
    const response = await axiosClient.get(API_URL, { params });
    return response.data?.data ?? response.data;
};

const adminPayoutService = {
    getPage,
    approvePayout,
    rejectPayout
};

export default adminPayoutService;
