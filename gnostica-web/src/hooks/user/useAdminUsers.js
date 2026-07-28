import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "@/services/auth/authService";
import instructorService from "@/services/instructor/instructorService";
import { toast } from "sonner";

export default function useAdminUsers() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read activeTab from URL search params (e.g. ?tab=USER, ?tab=INSTRUCTOR, ?tab=PENDING_APP)
  const tabFromUrl = searchParams.get("tab") || "USER";
  const [activeTab, setActiveTabState] = useState(tabFromUrl);

  useEffect(() => {
    const currentTab = searchParams.get("tab") || "USER";
    if (currentTab !== activeTab) {
      setActiveTabState(currentTab);
    }
  }, [searchParams]);

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    setSearchParams({ tab: newTab });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [pricePreset, setPricePreset] = useState("all");

  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lockReason, setLockReason] = useState("");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const [previewDocument, setPreviewDocument] = useState({ url: null, title: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

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
    const matchesSearch = !searchTerm || 
      (acc.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (acc.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.phone || "").toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (Array.isArray(statusFilter) && statusFilter.length > 0) {
      matchesStatus = statusFilter.some(statusVal => {
        if (statusVal === "active") return acc.status === 1;
        if (statusVal === "locked") return acc.status === 2;
        if (statusVal === "unverified") return acc.status === 0 || acc.status === null;
        return true;
      });
    }

    return matchesSearch && matchesStatus;
  });

  const pagination = {
    currentPage,
    pageSize,
    totalElements: filteredAccounts.length,
    totalPages: Math.ceil(filteredAccounts.length / pageSize) || 1,
    onPageChange: (page) => setCurrentPage(page)
  };

  return {
    activeTab,
    setActiveTab,
    accounts: filteredAccounts,
    pagination,
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
    pricePreset,
    setPricePreset,
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
