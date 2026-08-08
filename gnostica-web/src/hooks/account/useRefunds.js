import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import refundService from "@/services/order/refund.service";

const getStatusMeta = (status) => {
  if (status === 2) {
    return {
      statusLabel: "Đã hoàn tiền",
      statusColor: "bg-success-soft text-success",
    };
  }

  if (status === 3) {
    return {
      statusLabel: "Bị từ chối",
      statusColor: "bg-error-soft text-error",
    };
  }

  return {
    statusLabel: "Đang chờ",
    statusColor: "bg-warning-soft text-warning",
  };
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("vi-VN")}đ`;
};

export default function useRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const token = useAuthStore(state => state.user?.token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchRefunds = async () => {
      setLoading(true);
      try {
        const data = await refundService.getMyRefunds();
        
        const mapped = (data || []).map((refund) => {
          const statusMeta = getStatusMeta(refund.status);

          return {
            id: refund.id,
            orderCode: refund.orderCode || "N/A",
            date: refund.createdAt ? new Date(refund.createdAt).toLocaleDateString("vi-VN") : "N/A",
            courseName: refund.courseTitle || "Khóa học",
            amount: formatCurrency(refund.amount),
            reason: refund.reason,
            ...statusMeta,
          };
        });

        setRefunds(mapped);
      } catch (error) {
        console.error("Failed to fetch refunds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  const filteredRefunds = refunds.filter((refund) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = !normalizedQuery ||
      String(refund.orderCode || "").toLowerCase().includes(normalizedQuery) ||
      String(refund.courseName || "").toLowerCase().includes(normalizedQuery);

    return matchesSearch;
  });

  const totalItems = filteredRefunds.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRefunds = filteredRefunds.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  return {
    refunds: paginatedRefunds,
    loading,
    currentPage: safeCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    totalItems,
    totalPages,
  };
}
