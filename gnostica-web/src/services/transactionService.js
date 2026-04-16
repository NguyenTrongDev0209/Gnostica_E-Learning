import api from './api';

const RESOURCE_PATH = '/transactions';

const getTransactions = async () => {
    const response = await api.get(RESOURCE_PATH);
    return response.data;
};

const transactionService = {
    getTransactions
};

export default transactionService;
