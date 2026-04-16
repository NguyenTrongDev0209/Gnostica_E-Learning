import api from './api';

const RESOURCE_PATH = '/wallet';

const getMyWallet = async () => {
    const response = await api.get(`${RESOURCE_PATH}/me`);
    return response.data;
};

const getMyTransactions = async () => {
    const response = await api.get(`${RESOURCE_PATH}/transactions`);
    return response.data;
};

const getWalletStats = async () => {
    const response = await api.get(`${RESOURCE_PATH}/stats`);
    return response.data;
};

const walletService = {
    getMyWallet,
    getMyTransactions,
    getWalletStats
};

export default walletService;
