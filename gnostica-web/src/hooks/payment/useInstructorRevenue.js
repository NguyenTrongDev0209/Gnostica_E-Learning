import { useQuery } from '@tanstack/react-query';
import walletService from '@/services/payment/walletService';

export function useInstructorRevenue() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['instructor_revenue'],
    queryFn: async () => {
      const [walletData, historyData] = await Promise.all([
        walletService.getMyWallet(),
        walletService.getMyTransactionHistory()
      ]);

      return {
        wallet: walletData || null,
        transactions: Array.isArray(historyData) ? historyData : []
      };
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    wallet: data?.wallet || null,
    transactions: data?.transactions || [],
    loading: isLoading,
    error,
    refetch
  };
}
