import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "@/services/authService";
import instructorService from '@/services/instructorService';
import { toast } from "sonner";

export default function useAdminUsers() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("USER");
  const [searchTerm, setSearchTerm] = useState("");

  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lockReason, setLockReason] = useState("");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const { data: accounts = [], isLoading: isAccountsLoading } = useQuery({
    queryKey: ['admin_accounts', activeTab],
    queryFn: async () => {
      const response = await authService.getAccountsByRole(activeTab);
      return response.data || [];
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
    if (user.locked) {
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

  const filteredAccounts = accounts.filter(acc => 
    acc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    activeTab,
    setActiveTab,
    accounts: filteredAccounts,
    applications,
    loading,
    searchTerm,
    setSearchTerm,
    lockDialogOpen,
    setLockDialogOpen,
    selectedUser,
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
    confirmLock
  };
}
