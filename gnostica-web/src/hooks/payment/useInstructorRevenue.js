import { useQuery } from '@tanstack/react-query';
import walletService from '@/services/payment/walletService';

export function useInstructorRevenue() {
  const { data, isLoading } = useQuery({
    queryKey: ['instructor_revenue'],
    queryFn: async () => {
      const [walletData, transactionsData] = await Promise.all([
        walletService.getMyWallet(),
        walletService.getMyTransactions()
      ]);

      return {
        wallet: walletData,
        transactions: Array.isArray(transactionsData) ? transactionsData : []
      };
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    wallet: data?.wallet || null,
    transactions: data?.transactions || [],
    loading: isLoading
  };
}
