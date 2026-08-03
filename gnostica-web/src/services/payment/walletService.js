import axiosClient from '@/lib/axiosClient';

const API_URL = '/wallet';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('WalletService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const getMyWallet = async () => {
    const response = await axiosClient.get(`${API_URL}/me`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getMyTransactions = async () => {
    const response = await axiosClient.get(`${API_URL}/transactions`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getWalletStats = async () => {
    const response = await axiosClient.get(`${API_URL}/stats`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const requestWithdraw = async (withdrawData, suppliedIdempotencyKey) => {
    const idempotencyKey = suppliedIdempotencyKey || globalThis.crypto?.randomUUID?.().replaceAll('-', '')
        || `${Date.now()}${Math.random().toString(36).slice(2)}`;
    const response = await axiosClient.post(`${API_URL}/withdraw`, withdrawData, {
        headers: { ...getAuthHeaders(), 'Idempotency-Key': idempotencyKey }
    });
    return response.data;
};

const setBankAccount = async (data) => {
    const response = await axiosClient.post(`${API_URL}/bank-account`, data, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const removeBankAccount = async (pin) => {
    const response = await axiosClient.delete(`${API_URL}/bank-account`, {
        headers: getAuthHeaders(),
        data: { pin }
    });
    return response.data;
};

const walletService = {
    getMyWallet,
    getMyTransactions,
    getWalletStats,
    requestWithdraw,
    setBankAccount,
    removeBankAccount
};

export default walletService;
