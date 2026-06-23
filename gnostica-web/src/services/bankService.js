import axiosClient from '@/lib/axiosClient';

const API_URL = '/banks';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('BankService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const createBank = async (data) => {
    const response = await axiosClient.post(API_URL, data, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getBanks = async () => {
    const response = await axiosClient.get(API_URL, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const updateBank = async (id, data) => {
    const response = await axiosClient.put(`${API_URL}/${id}`, data, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const deleteBank = async (id) => {
    const response = await axiosClient.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const syncBanks = async () => {
    const response = await axiosClient.post(`${API_URL}/sync`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const bankService = {
    createBank,
    getBanks,
    updateBank,
    deleteBank,
    syncBanks
};

export default bankService;
