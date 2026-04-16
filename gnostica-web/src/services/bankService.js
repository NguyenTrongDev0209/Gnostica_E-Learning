import api from './api';

const RESOURCE_PATH = '/banks';

const createBank = async (data) => {
    const response = await api.post(RESOURCE_PATH, data);
    return response.data;
};

const getBanks = async () => {
    const response = await api.get(RESOURCE_PATH);
    return response.data;
};

const updateBank = async (id, data) => {
    const response = await api.put(`${RESOURCE_PATH}/${id}`, data);
    return response.data;
};

const deleteBank = async (id) => {
    const response = await api.delete(`${RESOURCE_PATH}/${id}`);
    return response.data;
};

const syncBanks = async () => {
    const response = await api.post(`${RESOURCE_PATH}/sync`, {});
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
