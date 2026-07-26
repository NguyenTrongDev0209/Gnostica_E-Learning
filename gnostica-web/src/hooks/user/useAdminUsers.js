import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import authService from "@/services/auth/authService";
import instructorService from '@/services/instructor/instructorService';
import { toast } from "sonner";

export default function useAdminUsers() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "USER";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [priceRange, setPriceRange] = useState([0, 10000000]);

  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [lockReason, setLockReason] = useState("");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const [previewDocument, setPreviewDocument] = useState({ url: null, title: "" });

  const { data: accounts = [], isLoading: isAccountsLoading } = useQuery({
    queryKey: ['admin_accounts', activeTab],
    queryFn: async () => {
      const response = await authService.getAccountsByRole(activeTab);
      console.log('API getAccountsByRole:', response);
      if (response && response.data) return response.data;
      if (Array.isArray(response)) return response;
      return [];
    },
    enabled: activeTab !== 'PENDING_APP',
    staleTime: 1000 * 60, // 1 min
  });

  const { data: applications = [], isLoading: isAppsLoading } = useQuery({
    queryKey: ['admin_applications'],
    queryFn: async () => {
      const data = await instructorService.getApplications('PENDING');
      return data.content || data || [];
    },
    enabled: activeTab === 'PENDING_APP',
    staleTime: 1000 * 60, // 1 min
  });

  const loading = activeTab === 'PENDING_APP' ? isAppsLoading : isAccountsLoading;

  const approveMutation = useMutation({
    mutationFn: async (id) => {
      return await instructorService.approveApplication(id);
    },
    onSuccess: () => {
      toast.success("Đã phê duyệt đơn đăng ký");
      queryClient.invalidateQueries({ queryKey: ['admin_applications'] });
    },
    onError: () => {
      toast.error("Lỗi khi phê duyệt");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      return await instructorService.rejectApplication(id, reason);
    },
    onSuccess: () => {
      toast.success("Đã từ chối đơn đăng ký");
      setRejectDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin_applications'] });
    },
    onError: () => {
      toast.error("Lỗi khi từ chối");
    }
  });

  const handleApprove = async (id) => {
    await approveMutation.mutateAsync(id);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    await rejectMutation.mutateAsync({ id: selectedApp, reason: rejectReason });
  };

  const lockMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      return await authService.lockAccount(id, reason);
    },
    onSuccess: () => {
      toast.success("Đã khóa tài khoản thành công.");
      setLockDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin_accounts'] });
    },
    onError: (error) => {
      toast.error(error.toString());
    }
  });

  const unlockMutation = useMutation({
    mutationFn: async (id) => {
      return await authService.unlockAccount(id);
    },
    onSuccess: () => {
      toast.success("Đã mở khóa tài khoản.");
      queryClient.invalidateQueries({ queryKey: ['admin_accounts'] });
    },
    onError: (error) => {
      toast.error(error.toString());
    }
  });

  const handleToggleLock = async (user) => {
    if (user.status === 2) {
      await unlockMutation.mutateAsync(user.id);
    } else {
      setSelectedUser(user);
      setLockReason("");
      setLockDialogOpen(true);
    }
  };

  const confirmLock = async () => {
    if (!lockReason.trim()) {
      toast.error("Vui lòng nhập lý do khóa.");
      return;
    }
    await lockMutation.mutateAsync({ id: selectedUser.id, reason: lockReason });
  };

  const filteredAccounts = accounts.filter(acc => {
    const searchString = searchTerm.toLowerCase();
    const matchSearch = (acc.fullName || "").toLowerCase().includes(searchString) || 
      (acc.email || "").toLowerCase().includes(searchString);

    let matchStatus = true;
    if (statusFilter.length > 0) {
      if (statusFilter.includes("active") && acc.status !== 1) matchStatus = false;
      if (statusFilter.includes("locked") && acc.status !== 2) matchStatus = false;
      if (statusFilter.includes("unverified") && acc.status !== 0) matchStatus = false;
    }

    let matchDate = true;
    if (dateRange?.from) {
      const accDate = new Date(acc.createdAt);
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = dateRange.to ? new Date(dateRange.to) : new Date(from);
      to.setHours(23, 59, 59, 999);
      matchDate = accDate >= from && accDate <= to;
    }

    let matchPrice = true;
    if (priceRange[0] > 0 || priceRange[1] < 10000000) {
      const userSpent = acc.totalSpent || 0;
      if (userSpent < priceRange[0] || userSpent > priceRange[1]) matchPrice = false;
    }

    return matchSearch && matchStatus && matchDate && matchPrice;
  });

  return {
    activeTab,
    accounts: filteredAccounts,
    applications,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    priceRange,
    setPriceRange,
    lockDialogOpen,
    setLockDialogOpen,
    selectedUser,
    selectedUserDetail,
    setSelectedUserDetail,
    lockReason,
    setLockReason,
    rejectDialogOpen,
    setRejectDialogOpen,
    rejectReason,
    setRejectReason,
    setSelectedApp,
    handleApprove,
    handleReject,
    handleToggleLock,
    confirmLock,
    previewDocument,
    setPreviewDocument
  };
}
