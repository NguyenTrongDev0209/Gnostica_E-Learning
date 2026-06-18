import axiosClient from '@/lib/axiosClient';

const API_URL = '/transactions';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('TransactionService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const getTransactions = async () => {
    const response = await axiosClient.get(API_URL, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const transactionService = {
    getTransactions
};

export default transactionService;
