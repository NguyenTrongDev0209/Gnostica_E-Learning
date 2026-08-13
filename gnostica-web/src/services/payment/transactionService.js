import axiosClient from '@/lib/axiosClient';

const API_URL = '/admin/transactions';

const getTransactions = async (module = 'payments') => {
    const response = await axiosClient.get(API_URL, { params: { module } });
    return response.data?.data ?? response.data;
};

const transactionService = {
    getTransactions
};

export default transactionService;
