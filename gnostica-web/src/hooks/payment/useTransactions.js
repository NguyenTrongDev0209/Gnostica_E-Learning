import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import transactionService from '@/services/payment/transactionService';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await transactionService.getTransactions();
      if (response) {
        setTransactions(response);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      toast.error("Không thể tải danh sách giao dịch");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return { transactions, isLoading, fetchTransactions };
}
