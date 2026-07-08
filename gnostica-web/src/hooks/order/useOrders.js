import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import orderService from '@/services/order/orderService';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getOrders();
      if (response) {
        setOrders(response);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, isLoading, fetchOrders };
}
