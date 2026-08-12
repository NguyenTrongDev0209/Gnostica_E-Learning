import { useState, useCallback, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import adminPayoutService from "@/services/admin/adminPayoutService";
import { toast } from "sonner";

export default function useWithdrawalRequests(enabled = true) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState(null);
  
  const token = useAuthStore(state => state.user?.token);

  const fetchWithdrawals = useCallback(async (page = 0, size = 10, status = null) => {
    if (!token || !enabled) return;
    
    setLoading(true);
    try {
      // If status is empty array or undefined, pass null
      const statusParam = status && status.length > 0 ? status.join(',') : null;
      const data = await adminPayoutService.getPage(page, size, statusParam);
      
      setWithdrawals(data.content || []);
      setPagination({
        page: data.number,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages
      });
      setStatusFilter(status);
    } catch (error) {
      console.error("Failed to fetch withdrawal requests:", error);
      toast.error("Không thể tải danh sách rút tiền");
    } finally {
      setLoading(false);
    }
  }, [token, enabled]);

  useEffect(() => {
    if (enabled) {
      fetchWithdrawals(0, 10, statusFilter);
    }
  }, [enabled, fetchWithdrawals]);

  const approveWithdrawal = async (id) => {
    setActionLoading(true);
    try {
      await adminPayoutService.approvePayout(id);
      toast.success("Đã duyệt yêu cầu rút tiền!");
      await fetchWithdrawals(pagination.page, pagination.size, statusFilter);
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setActionLoading(false);
    }
  };

  const rejectWithdrawal = async (id, reason) => {
    setActionLoading(true);
    try {
      await adminPayoutService.rejectPayout(id, reason);
      toast.success("Đã từ chối yêu cầu rút tiền!");
      await fetchWithdrawals(pagination.page, pagination.size, statusFilter);
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setActionLoading(false);
    }
  };

  return {
    withdrawals,
    loading,
    actionLoading,
    pagination,
    approveWithdrawal,
    rejectWithdrawal,
    fetchWithdrawals
  };
}
