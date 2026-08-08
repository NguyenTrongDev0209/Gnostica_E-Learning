import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import transactionService from '@/services/payment/transactionService';

export function useTransactions(module = 'payments') {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setTransactions([]);
    try {
      const response = await transactionService.getTransactions(module);
      if (Array.isArray(response)) {
        setTransactions(response);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      toast.error("Không thể tải danh sách giao dịch");
    } finally {
      setIsLoading(false);
    }
  }, [module]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, isLoading, fetchTransactions };
}
