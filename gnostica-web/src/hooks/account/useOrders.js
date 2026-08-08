import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { API_URL } from "@/config/environment";

const getCourseName = (detail) => (
  detail?.courseName ||
  detail?.courseTitle ||
  detail?.course?.title ||
  detail?.course?.courseTitle ||
  detail?.title ||
  "Khóa học"
);

const getStatusMeta = (status) => {
  if (status === "SUCCESS" || status === "PAID" || status === 1) {
    return {
      status: "Thành công",
      statusColor: "bg-success-soft text-success",
    };
  }

  if (status === "FAILED" || status === "CANCELLED" || status === 2) {
    return {
      status: "Đã hủy",
      statusColor: "bg-error-soft text-error",
    };
  }

  return {
    status: "Đang xử lý",
    statusColor: "bg-warning-soft text-warning",
  };
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("vi-VN")}đ`;
};

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const token = useAuthStore(state => state.user?.token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/order/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const mapped = (data.data || []).map((order) => {
            const rawDetails = order.details || order.orderDetails || order.items || [];
            const orderCode = order.order_code || order.orderCode || order.transactionCode || order.transactionId || order.id;
            const orderDate = order.orderDate || order.createdAt;
            const totalAmount = order.finalAmount ?? order.totalPrice ?? 0;
            const statusMeta = getStatusMeta(order.status);

            return {
              id: order.id,
              orderCode,
              date: orderDate ? new Date(orderDate).toLocaleDateString("vi-VN") : "N/A",
              courses: rawDetails.map((detail) => ({ 
                id: detail.id,
                name: getCourseName(detail),
                status: detail.status,
                giftedTo: detail.giftedTo
              })),
              total: formatCurrency(totalAmount),
              method: order.paymentMethod || "N/A",
              ...statusMeta,
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange, pageSize]);

  const filteredOrders = orders.filter((order) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = !normalizedQuery ||
      String(order.orderCode || order.id || "").toLowerCase().includes(normalizedQuery);

    let matchesDate = true;
    if (dateRange?.from) {
      matchesDate = true;
    }

    return matchesSearch && matchesDate;
  });

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  return {
    orders: paginatedOrders,
    loading,
    currentPage: safeCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    totalItems,
    totalPages,
  };
}
