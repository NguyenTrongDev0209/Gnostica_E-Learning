import { useState, useEffect } from "react";
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
  const [pricePreset, setPricePreset] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const handlePricePresetChange = (preset) => {
    setPricePreset(preset);
    if (preset === "all") setPriceRange([0, 10000000]);
    else if (preset === "under_500k") setPriceRange([0, 500000]);
    else if (preset === "500k_1m") setPriceRange([500000, 1000000]);
    else if (preset === "over_1m") setPriceRange([1000000, 10000000]);
  };

  const handlePriceRangeChange = (val) => {
    setPriceRange(val);
    if (val[0] === 0 && val[1] === 10000000) setPricePreset("all");
    else if (val[0] === 0 && val[1] === 500000) setPricePreset("under_500k");
    else if (val[0] === 500000 && val[1] === 1000000) setPricePreset("500k_1m");
    else if (val[0] === 1000000 && val[1] === 10000000) setPricePreset("over_1m");
    else setPricePreset("custom");
  };


  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [lockReason, setLockReason] = useState("");


  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const [previewDocument, setPreviewDocument] = useState({ url: null, title: "" });

  useEffect(() => {
    setSelectedUserDetail(null);
    setSelectedApp(null);
    setPage(0);
  }, [activeTab]);

  const { data: accountsPage = { content: [], totalElements: 0, totalPages: 0 }, isLoading: isAccountsLoading } = useQuery({
    queryKey: ['admin_accounts', activeTab, page, pageSize],
    queryFn: async () => {
      const response = await authService.getAccountsByRole(activeTab, { page, size: pageSize });
      const pageData = response?.data ?? response;
      if (Array.isArray(pageData)) {
        return { content: pageData, totalElements: pageData.length, totalPages: 1 };
      }
      // Spring Data's VIA_DTO serializer puts pagination metadata under `page`.
      // Keep the root-level fallback for older server responses.
      const pageMetadata = pageData?.page ?? pageData;
      return {
        content: pageData?.content ?? [],
        totalElements: pageMetadata?.totalElements ?? 0,
        totalPages: pageMetadata?.totalPages ?? 0,
      };
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

  const filteredAccounts = accountsPage.content.filter(acc => {
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

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(0);
  };

  return {
    activeTab,
    accounts: filteredAccounts,
    pagination: {
      currentPage: page,
      totalPages: accountsPage.totalPages,
      totalItems: accountsPage.totalElements,
      pageSize,
      onPageChange: setPage,
      onPageSizeChange: handlePageSizeChange,
      zeroIndexed: true,
    },
    applications,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    priceRange,
    setPriceRange: handlePriceRangeChange,
    pricePreset,
    setPricePreset: handlePricePresetChange,
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
