import { useState, useCallback, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import adminRefundService from "@/services/payment/adminRefundService";
import { toast } from "sonner";

const getStatusMeta = (status) => {
  if (status === 2) {
    return {
      statusLabel: "Đã duyệt",
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

export default function useRefundRequests(enabled = true) {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState(null);
  
  const token = useAuthStore(state => state.user?.token);

  const fetchRefunds = useCallback(async (page = 0, size = 10, status = null) => {
    if (!token || !enabled) return;
    
    setLoading(true);
    try {
      // Backend nhận List<Integer> status (comma-separated), giống useWithdrawalRequests
      const statusParam = status && status.length > 0 ? status.join(',') : null;
      const data = await adminRefundService.getAllRefunds(page, size, statusParam);
      const mapped = (data.content || []).map(refund => ({
        ...refund,
        id: refund.id,
        transactionCode: refund.orderCode || "N/A",
        refundCode: refund.refundCode || "N/A",
        createdAt: refund.createdAt,
        amount: refund.amount,
        performerName: refund.accountName || refund.email || "Học viên",
        performerEmail: refund.email,
        performerAvatar: refund.avatar,
        type: 4,
        paymentMethod: "Ví Gnostica",
        status: refund.status,
        statusLabel: getStatusMeta(refund.status).statusLabel,
        ref: refund.reason,
        senderBankId: "N/A",
        senderAccountNumber: "N/A"
      }));
      setRefunds(mapped);
      setPagination({
        page: data.number,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages
      });
      setStatusFilter(status);
    } catch (error) {
      console.error("Failed to fetch refund requests:", error);
      toast.error("Không thể tải danh sách hoàn tiền");
    } finally {
      setLoading(false);
    }
  }, [token, enabled]);

  useEffect(() => {
    if (enabled) {
      fetchRefunds(0, 10, statusFilter);
    }
  }, [enabled, fetchRefunds]);

  const approveRefund = async (id) => {
    setActionLoading(true);
    try {
      await adminRefundService.approveRefund(id);
      toast.success("Đã duyệt yêu cầu hoàn tiền!");
      await fetchRefunds(pagination.page, pagination.size, statusFilter);
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRefund = async (id, reason) => {
    setActionLoading(true);
    try {
      await adminRefundService.rejectRefund(id, reason);
      toast.success("Đã từ chối yêu cầu hoàn tiền!");
      await fetchRefunds(pagination.page, pagination.size, statusFilter);
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setActionLoading(false);
    }
  };

  return {
    refunds,
    loading,
    actionLoading,
    pagination,
    approveRefund,
    rejectRefund,
    fetchRefunds
  };
}
