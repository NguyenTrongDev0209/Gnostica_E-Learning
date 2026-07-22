import axiosClient from '@/lib/axiosClient';

export const supportService = {
    getAll: async () => {
        const res = await axiosClient.get('/admin/supports');
        return res.data.data || [];
    },
    updateStatus: async (id, status) => {
        const res = await axiosClient.put(`/admin/supports/${id}/status`, { status });
        return res.data;
    },
    updatePriority: async (id, priority) => {
        const res = await axiosClient.put(`/admin/supports/${id}/priority`, { priority });
        return res.data;
    }
};
