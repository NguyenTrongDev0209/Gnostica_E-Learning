import { useQuery } from '@tanstack/react-query';
import walletService from '@/services/payment/walletService';
import { USE_INSTRUCTOR_MOCK, MOCK_REVENUE } from "@/mocks/instructorMockData";

export function useInstructorRevenue() {
  const { data, isLoading } = useQuery({
    queryKey: ['instructor_revenue'],
    queryFn: async () => {
      let walletData = null;
      let transactionsData = [];
      try {
        [walletData, transactionsData] = await Promise.all([
          walletService.getMyWallet(),
          walletService.getMyTransactions()
        ]);
      } catch (e) {
        if (USE_INSTRUCTOR_MOCK) {
          console.log("Using Mock Data for Revenue due to error");
        } else {
          throw e;
        }
      }

      if (USE_INSTRUCTOR_MOCK && (!walletData || !transactionsData || transactionsData.length === 0)) {
        walletData = MOCK_REVENUE.wallet;
        transactionsData = MOCK_REVENUE.transactions;
      }

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
