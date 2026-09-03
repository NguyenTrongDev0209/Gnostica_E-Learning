import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import orderService from "@/services/order/orderService";

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

  if (status === "REFUNDED" || status === 2) {
    return {
      status: "Đã hoàn tiền",
      statusColor: "bg-info-soft text-info",
    };
  }

  if (status === "FAILED" || status === "CANCELLED" || status === 3) {
    return {
      status: "Đã hủy",
      statusColor: "bg-error-soft text-error",
    };
  }

  return {
    status: "Chờ thanh toán",
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
  const user = useAuthStore(state => state.user);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const rawData = await orderService.getMyOrders();
      const mapped = (rawData || []).map((order) => {
        const rawDetails = order.details || order.orderDetails || order.items || [];
        const orderCode = order.orderCode || order.order_code || order.transactionCode || order.transactionId || order.id;
        const orderDate = order.orderDate || order.createdAt;
        const totalAmount = order.totalPrice ?? order.finalAmount ?? 0;
        const statusMeta = getStatusMeta(order.status);

        return {
          id: order.id,
          orderCode,
          date: orderDate ? new Date(orderDate).toLocaleDateString("vi-VN") : "N/A",
          createdAt: orderDate,
          courses: rawDetails.map((detail) => ({ 
            id: detail.id,
            name: getCourseName(detail),
            status: detail.status,
            giftedTo: detail.giftedTo
          })),
          total: formatCurrency(totalAmount),
          totalAmount: totalAmount,
          method: order.paymentMethod || "PAYOS",
          ...statusMeta,
        };
      });

      setOrders(mapped);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange, pageSize]);

  const filteredOrders = orders.filter((order) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = !normalizedQuery ||
      String(order.orderCode || order.id || "").toLowerCase().includes(normalizedQuery) ||
      order.courses.some(c => (c.name || "").toLowerCase().includes(normalizedQuery));

    let matchesDate = true;
    if (dateRange?.from) {
      const orderTime = order.createdAt ? new Date(order.createdAt).getTime() : NaN;
      if (!isNaN(orderTime)) {
        const fromTime = new Date(dateRange.from).setHours(0, 0, 0, 0);
        const toTime = dateRange.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : new Date(dateRange.from).setHours(23, 59, 59, 999);
        matchesDate = orderTime >= fromTime && orderTime <= toTime;
      }
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
    refresh: fetchOrders,
  };
}
