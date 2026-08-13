import api from '../../config/api';

const walletService = {
  getMyWallet: async () => {
    return api.get('/wallet/me');
  }
};

export default walletService;
