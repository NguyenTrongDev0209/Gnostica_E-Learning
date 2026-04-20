import axios from 'axios';

const API_URL = 'http://localhost:8080/api/wallet';

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
    const response = await axios.get(`${API_URL}/me`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getMyTransactions = async () => {
    const response = await axios.get(`${API_URL}/transactions`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getWalletStats = async () => {
    const response = await axios.get(`${API_URL}/stats`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const requestWithdraw = async (withdrawData) => {
    const response = await axios.post(`${API_URL}/withdraw`, withdrawData, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const walletService = {
    getMyWallet,
    getMyTransactions,
    getWalletStats,
    requestWithdraw
};

export default walletService;
