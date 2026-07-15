import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const token = useAuthStore(state => state.user?.token);

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8080/api/order/my-orders", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.data || []).map(o => {
            // Determine status text & color
            let statusText = "Đang xử lý";
            let statusColor = "bg-warning/10 text-warning";
            
            if (o.status === "SUCCESS" || o.status === 1) {
              statusText = "Thành công";
              statusColor = "bg-emerald-100 text-emerald-700";
            } else if (o.status === "FAILED" || o.status === "CANCELLED" || o.status === 2) {
              statusText = "Đã hủy";
              statusColor = "bg-error/10 text-error";
            }

            return {
              id: o.transactionCode || o.id,
              date: o.orderDate ? new Date(o.orderDate).toLocaleDateString("vi-VN") : "N/A",
              courses: o.orderDetails?.map(d => ({ name: d.courseName })) || [],
              total: o.finalAmount ? o.finalAmount.toLocaleString("vi-VN") + "đ" : "0đ",
              method: o.paymentMethod || "N/A",
              status: statusText,
              statusColor: statusColor
            };
          });
          setOrders(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Mock logic for dateRange
    let matchesDate = true;
    if (dateRange?.from) {
      matchesDate = true; // In a real app, parse order.date and compare
    }

    return matchesSearch && matchesDate;
  });

  return { 
    orders: filteredOrders, 
    loading,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    totalItems: filteredOrders.length,
    totalPages: Math.ceil(filteredOrders.length / pageSize) || 1
  };
}
