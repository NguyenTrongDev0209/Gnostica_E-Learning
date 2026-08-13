import React, { useState } from "react";
import { useAdminUserDetail } from "../../hooks/user/useAdminUserDetail";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  ShieldCheck,
  BookOpen,
  Lock,
  Unlock,
  Users,
  Mail,
  Phone,
  CreditCard,
  FileText,
  GraduationCap,
  X,
  CheckCircle2,
  PlayCircle,
  Coins,
  Banknote,
  Star
} from "lucide-react";
import DataTable from "@/components/common/composite/DataTable";
import AppTable, { TableRow, TableCell } from "@/components/common/micro/AppTable";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import AppSelect from "@/components/common/micro/AppSelect";
import { ArrowLeft } from "lucide-react";
import DataFilter, { DataFilterPriceRange } from "@/components/common/composite/DataFilter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/micro/AppAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import {
  AppDialogRoot as Dialog,
  AppDialogContent as DialogContent,
  AppDialogDescription as DialogDescription,
  AppDialogFooter as DialogFooter,
  AppDialogHeader as DialogHeader,
  AppDialogTitle as DialogTitle,
} from "@/components/common/micro/AppDialog";
import AppTextarea from "@/components/common/micro/AppTextarea";
import useAdminUsers from "@/hooks/user/useAdminUsers";
import { API_URL } from "@/config/environment";

export default function AdminUsers() {
  const {
    activeTab,
    setActiveTab,
    accounts,
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
  } = useAdminUsers();

  const [selectedAppDetail, setSelectedAppDetail] = React.useState(null);
  const [activeDoc, setActiveDoc] = React.useState(null);
  const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAccounts = React.useMemo(() => {
    if (!accounts || !sortConfig.key) return accounts;
    return [...accounts].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Luôn đẩy các giá trị null/undefined/rỗng xuống cuối danh sách
      const isEmptyA = valA === null || valA === undefined || valA === '';
      const isEmptyB = valB === null || valB === undefined || valB === '';
      if (isEmptyA && isEmptyB) return 0;
      if (isEmptyA) return 1;
      if (isEmptyB) return -1;

      if (sortConfig.key === 'birthDay') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
        // Độ tuổi nghịch biến với Ngày sinh. Tuổi nhỏ (asc) = Ngày sinh lớn.
        if (valA < valB) return sortConfig.direction === 'asc' ? 1 : -1;
        if (valA > valB) return sortConfig.direction === 'asc' ? -1 : 1;
        return 0;
      } else if (sortConfig.key === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB);
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [accounts, sortConfig]);

  const sortedApplications = React.useMemo(() => {
    if (!applications || !sortConfig.key) return applications;
    return [...applications].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Luôn đẩy các giá trị null/undefined/rỗng xuống cuối danh sách
      const isEmptyA = valA === null || valA === undefined || valA === '';
      const isEmptyB = valB === null || valB === undefined || valB === '';
      if (isEmptyA && isEmptyB) return 0;
      if (isEmptyA) return 1;
      if (isEmptyB) return -1;

      if (sortConfig.key === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB);
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [applications, sortConfig]);

  const getIdCardDocuments = (app) => [
    {
      id: "front",
      title: "CCCD Mặt trước",
      url: app?.idCardFront,
      type: "image",
      icon: CreditCard,
    },
    {
      id: "back",
      title: "CCCD Mặt sau",
      url: app?.idCardBack,
      type: "image",
      icon: CreditCard,
    },
  ];

  const hasCompleteIdCard = (app) => Boolean(
    app?.idCardFront?.trim() && app?.idCardBack?.trim()
  );

  const resolveDocumentUrl = (url) => {
    if (!url) return url;

    const legacyPrefix = "https://gnostica-attachment.b-cdn.net/documents/";
    if (url.startsWith(legacyPrefix)) {
      const fileName = url.slice(legacyPrefix.length).split(/[?#]/)[0];
      return `${API_URL}/upload/document/${encodeURIComponent(decodeURIComponent(fileName))}`;
    }

    return url;
  };

  const getDocumentList = (app) => {
    const list = [];
    if (!app) return list;
    list.push(...getIdCardDocuments(app).filter((document) => document.url));
    if (app.cvUrl) {
      list.push({ id: "cv", title: "CV / Resume (PDF)", url: resolveDocumentUrl(app.cvUrl), type: "pdf", icon: FileText });
    }
    if (app.degreeUrls) {
      app.degreeUrls.split(',').filter(u => u).forEach((url, index) => {
        const isPdf = url.split('?')[0].toLowerCase().endsWith('.pdf');
        list.push({ id: `degree-${index}`, title: `Bằng cấp chuyên môn ${index + 1}`, url: resolveDocumentUrl(url), type: isPdf ? "pdf" : "image", icon: GraduationCap });
      });
    }
    if (app.certificateUrls) {
      app.certificateUrls.split(',').filter(u => u).forEach((url, index) => {
        const isPdf = url.split('?')[0].toLowerCase().endsWith('.pdf');
        list.push({ id: `cert-${index}`, title: `Chứng chỉ liên quan ${index + 1}`, url: resolveDocumentUrl(url), type: isPdf ? "pdf" : "image", icon: ShieldCheck });
      });
    }
    if (app.courseOutline) {
      list.push({ id: "outline", title: "Đề cương bài giảng", url: app.courseOutline, type: "text", icon: BookOpen });
    }
    return list;
  };

  React.useEffect(() => {
    if (selectedAppDetail) {
      const docs = getDocumentList(selectedAppDetail);
      if (docs.length > 0) {
        setActiveDoc(docs[0]);
      }
    } else {
      setActiveDoc(null);
    }
  }, [selectedAppDetail]);

  const formatDate = (dateVal) => {
    if (!dateVal) return "--";
    try {
      let d;
      if (Array.isArray(dateVal)) {
        const [y, m, day, h = 0, min = 0, s = 0] = dateVal;
        d = new Date(y, m - 1, day, h, min, s);
      } else {
        d = new Date(dateVal);
      }
      if (isNaN(d.getTime())) return "--";
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(d).replace(/,/, '');
    } catch (e) {
      return "--";
    }
  };

  const filteredAccounts = Array.isArray(accounts) ? accounts : [];

  const accountColumns = [
    {
      header: "STT",
      sortable: false,
      width: "80px",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-bold text-foreground py-4 text-center whitespace-nowrap",
      render: (_acc, rowIndex) => ((pagination?.currentPage || 0) * (pagination?.pageSize || 10)) + rowIndex + 1,
    },
    {
      header: "Người dùng",
      accessor: "fullName",
      className: "py-4",
      width: "280px",
      align: "left",
      headerAlign: "left",
      cellClassName: "py-4",
      render: (acc) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={acc?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {acc?.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{acc?.fullName}</span>
            <span className="text-xs text-muted-foreground">{acc?.email}</span>
          </div>
        </div>
      )
    },
    {
      header: "Số điện thoại",
      accessor: "phone",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium py-4 text-center whitespace-nowrap",
      render: (acc) => acc?.phone ? <span className="text-foreground">{acc.phone}</span> : <span className="text-muted-foreground italic text-xs">(Chưa thiết lập)</span>
    },
    {
      header: "Độ tuổi",
      accessor: "birthDay",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "py-4 text-center whitespace-nowrap",
      render: (acc) => {
        if (!acc?.birthDay) return <span className="text-muted-foreground italic text-xs">(Chưa thiết lập)</span>;
        const d = new Date(acc.birthDay);
        if (isNaN(d.getTime())) return <span className="text-muted-foreground italic text-xs">(Chưa thiết lập)</span>;
        
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
          age--;
        }
        
        const dobStr = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
        
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{age} tuổi</span>
            <span className="text-xs text-muted-foreground">{dobStr}</span>
          </div>
        );
      }
    },
    {
      header: "Số dư",
      accessor: "balance",
      width: "180px",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
      render: (acc) => Number(acc?.balance || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    },
    {
      header: "Khóa học đã mua",
      accessor: "courseCount",
      width: "120px",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
      render: (acc) => `${acc?.courseCount || 0}`
    },
    {
      header: "Tổng mua hàng",
      accessor: "totalSpent",
      width: "180px",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
      render: (acc) => Number(acc?.totalSpent || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    },
    {
      header: "Ngày đăng ký",
      accessor: "createdAt",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm text-foreground font-medium py-4 text-center whitespace-nowrap",
      render: (acc) => formatDate(acc?.createdAt)
    },
    {
      header: "Trạng thái",
      accessor: "status",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "py-4 whitespace-nowrap",
      render: (acc) => (
        <div className="flex justify-center w-full">
          {acc.status === 2 ? (
            <AppBadge variant="error" className="w-[100px] justify-center px-2.5 py-1 text-white">Bị khóa</AppBadge>
          ) : acc.status === 1 ? (
            <AppBadge variant="success" className="w-[100px] justify-center px-2.5 py-1 text-white">Hoạt động</AppBadge>
          ) : (
            <AppBadge variant="secondary" className="w-[100px] justify-center px-2.5 py-1 text-white">Chưa xác thực</AppBadge>
          )}
        </div>
      )
    },
    {
      header: "Thao tác",
      sortable: false,
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      width: "1%",
      cellClassName: "py-4 text-center whitespace-nowrap",
      render: (acc) => (
        <div className="flex justify-center items-center gap-2">
          {acc.status === 2 ? (
            <AppButton
              size="sm"
              className="w-9 h-9 p-0 bg-success hover:bg-success/90 text-white border-none shrink-0"
              onClick={() => handleToggleLock(acc)}
              title="Mở khóa"
            >
              <Unlock className="w-4 h-4" />
            </AppButton>
          ) : (
            <AppButton
              size="sm"
              className="w-9 h-9 p-0 bg-error hover:bg-error/90 text-white border-none shrink-0"
              onClick={() => handleToggleLock(acc)}
              title="Khóa"
            >
              <Lock className="w-4 h-4" />
            </AppButton>
          )}
          <AppButton
            size="sm"
            className="w-9 h-9 p-0 bg-info hover:bg-info/90 text-white border-none shrink-0"
            title="Tùy chọn"
            onClick={() => setSelectedUserDetail(acc)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </AppButton>
        </div>
      )
    }
  ];

  const instructorColumns = [
    {
      header: "STT",
      sortable: false,
      width: "80px",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-bold text-foreground py-4 text-center whitespace-nowrap",
      render: (_acc, rowIndex) => ((pagination?.currentPage || 0) * (pagination?.pageSize || 10)) + rowIndex + 1,
    },
    {
      header: "Người dùng",
      accessor: "fullName",
      className: "py-4",
      width: "280px",
      align: "left",
      headerAlign: "left",
      cellClassName: "py-4",
      render: (acc) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={acc?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {acc?.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{acc?.fullName}</span>
            <span className="text-xs text-muted-foreground">{acc?.email}</span>
          </div>
        </div>
      )
    },
    {
      header: "Số điện thoại",
      accessor: "phone",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium py-4 text-center whitespace-nowrap",
      render: (acc) => acc?.phone ? <span className="text-foreground">{acc.phone}</span> : <span className="text-muted-foreground italic text-xs">(Chưa thiết lập)</span>
    },
    {
      header: "Độ tuổi",
      accessor: "birthDay",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "py-4 text-center whitespace-nowrap",
      render: (acc) => {
        if (!acc?.birthDay) return <span className="text-muted-foreground italic text-xs">(Chưa thiết lập)</span>;
        const d = new Date(acc.birthDay);
        if (isNaN(d.getTime())) return <span className="text-muted-foreground italic text-xs">(Chưa thiết lập)</span>;
        
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
          age--;
        }
        
        const dobStr = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
        
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{age} tuổi</span>
            <span className="text-xs text-muted-foreground">{dobStr}</span>
          </div>
        );
      }
    },
    {
      header: "Số dư",
      accessor: "balance",
      width: "180px",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
      render: (acc) => Number(acc?.balance || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    },
    {
      header: "Khóa học đã tạo",
      accessor: "courseCount",
      width: "120px",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
      render: (acc) => `${acc?.courseCount || 0}`
    },
    {
      header: "Doanh thu",
      accessor: "totalRevenue",
      width: "180px",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
      render: (acc) => Number(acc?.totalRevenue || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    },
    {
      header: "Ngày đăng ký",
      accessor: "createdAt",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm text-foreground font-medium py-4 text-center whitespace-nowrap",
      render: (acc) => formatDate(acc?.createdAt)
    },
    {
      header: "Trạng thái",
      accessor: "status",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "py-4 whitespace-nowrap",
      render: (acc) => (
        <div className="flex justify-center w-full">
          {acc?.status === 2 ? (
            <AppBadge variant="error" className="w-[100px] justify-center px-2.5 py-1 text-white">Bị khóa</AppBadge>
          ) : acc?.status === 1 ? (
            <AppBadge variant="success" className="w-[100px] justify-center px-2.5 py-1 text-white">Hoạt động</AppBadge>
          ) : (
            <AppBadge variant="secondary" className="w-[100px] justify-center px-2.5 py-1 text-white">Chưa xác thực</AppBadge>
          )}
        </div>
      )
    },
    {
      header: "Thao tác",
      sortable: false,
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      width: "1%",
      cellClassName: "py-4 text-center whitespace-nowrap",
      render: (acc) => (
        <div className="flex justify-center items-center gap-2">
          {acc?.status === 2 ? (
            <AppButton
              size="sm"
              className="w-9 h-9 p-0 bg-success hover:bg-success/90 text-white border-none shrink-0"
              onClick={() => handleToggleLock(acc)}
              title="Mở khóa"
            >
              <Unlock className="w-4 h-4" />
            </AppButton>
          ) : (
            <AppButton
              size="sm"
              className="w-9 h-9 p-0 bg-error hover:bg-error/90 text-white border-none shrink-0"
              onClick={() => handleToggleLock(acc)}
              title="Khóa"
            >
              <Lock className="w-4 h-4" />
            </AppButton>
          )}
          <AppButton
            size="sm"
            className="w-9 h-9 p-0 bg-info hover:bg-info/90 text-white border-none shrink-0"
            title="Tùy chọn"
            onClick={() => setSelectedUserDetail(acc)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </AppButton>
        </div>
      )
    }
  ];

  const applicationColumns = [
    {
      header: "STT",
      sortable: false,
      width: "80px",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-bold text-foreground py-4 text-center whitespace-nowrap",
      render: (_app, rowIndex) => rowIndex + 1,
    },
    {
      header: "Người dùng",
      accessor: "fullName",
      align: "left",
      headerAlign: "left",
      className: "py-4",
      cellClassName: "py-4",
      render: (app) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{app?.fullName}</span>
          <span className="text-xs text-muted-foreground">{app?.email}</span>
          {app?.contactPhone && <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" /> {app.contactPhone}</span>}
        </div>
      )
    },
    {
      header: "Chi tiết Hồ sơ",
      sortable: false,
      align: "center",
      headerAlign: "center",
      className: "py-4",
      cellClassName: "text-sm py-4",
      render: (app) => (
        <AppButton
          appVariant="ghostMuted"
          variant="outline"
          size="sm"
          className="h-9 px-4 border border-primary/20 text-primary hover:bg-primary/5 font-bold gap-2 bg-white"
          onClick={() => setSelectedAppDetail(app)}
        >
          <BookOpen className="w-4 h-4" /> Xem hồ sơ
        </AppButton>
      )
    },
    {
      header: "Ngày đăng ký",
      accessor: "createdAt",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm text-muted-foreground font-medium py-4 text-center whitespace-nowrap",
      render: (app) => formatDate(app?.createdAt)
    },
    {
      header: "Thao tác",
      sortable: false,
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      width: "1%",
      cellClassName: "py-4 text-center whitespace-nowrap",
      render: (app) => (
        <div className="flex justify-center items-center gap-2">
          <AppButton appVariant="ghostMuted" variant="ghost"
            size="sm"
            className="border border-success/20 text-success hover:bg-success/10 bg-white font-bold disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasCompleteIdCard(app)}
            title={!hasCompleteIdCard(app) ? "Cần đầy đủ ảnh CCCD mặt trước và mặt sau" : "Phê duyệt hồ sơ"}
            onClick={() => handleApprove(app.accountId)}
          >
            Phê duyệt
          </AppButton>
          <AppButton appVariant="ghostMuted" variant="ghost"
            size="sm"
            className="border border-error/20 text-error hover:bg-error/10 bg-white font-bold"
            onClick={() => {
              setSelectedApp(app.accountId);
              setRejectReason("");
              setRejectDialogOpen(true);
            }}
          >
            Từ chối
          </AppButton>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Quản Lý Người Dùng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý danh sách thành viên, giảng viên và phân quyền hệ thống.
          </p>
        </div>
      </div>

      {!selectedUserDetail ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4">
            <DataFilter
              searchQuery={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm kiếm học viên, giảng viên..."
              dropdownChecklists={[
                {
                  title: "Trạng thái",
                  items: [
                    { label: "Hoạt động", value: "active" },
                    { label: "Bị khóa", value: "locked" },
                    { label: "Chưa xác thực", value: "unverified" },
                  ],
                  selectedItems: statusFilter,
                  onItemToggle: (val) => setStatusFilter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
                  onClear: () => setStatusFilter([])
                }
              ]}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              dateRangePlaceholder="Ngày đăng ký"
            >
              <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className="w-full xl:w-[200px] shrink-0">
                  <AppSelect 
                    value={pricePreset} 
                    onValueChange={setPricePreset}
                    options={[
                      ...(pricePreset === "custom" ? [{ label: "Tùy chọn", value: "custom" }] : []),
                      { label: "Tất cả số tiền", value: "all" },
                      { label: "Dưới 500.000 đ", value: "under_500k" },
                      { label: "500.000 đ - 1.000.000 đ", value: "500k_1m" },
                      { label: "Trên 1.000.000 đ", value: "over_1m" }
                    ]}
                    placeholder="Chọn khoảng tiền"
                  />
                </div>
                <DataFilterPriceRange
                  title="Giao dịch"
                  min={0}
                  max={10000000}
                  step={50000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  onClear={() => setPricePreset("all")}
                />
              </div>
            </DataFilter>
          </div>

          <TabsContent value="USER" className="mt-0">
            <DataTable
              columns={accountColumns}
              data={sortedAccounts}
              isLoading={loading}
              rowClassName={(acc) => acc.status === 2 ? "bg-error/5 hover:bg-error/10" : ""}
              emptyState="Không tìm thấy người dùng nào."
              pagination={pagination}
              onSort={handleSort}
              sortConfig={sortConfig}
            />
          </TabsContent>

          <TabsContent value="INSTRUCTOR" className="mt-0">
            <DataTable
              columns={instructorColumns}
              data={sortedAccounts}
              isLoading={loading}
              rowClassName={(acc) => acc.status === 2 ? "bg-error/5 hover:bg-error/10" : ""}
              emptyState="Không tìm thấy người dùng nào."
              pagination={pagination}
              onSort={handleSort}
              sortConfig={sortConfig}
            />
          </TabsContent>

          <TabsContent value="PENDING_APP" className="mt-0">
            <DataTable
              columns={applicationColumns}
              data={sortedApplications}
              isLoading={loading}
              emptyState="Không có đơn đăng ký chờ duyệt."
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: applications.length,
                onPageChange: () => { },
                zeroIndexed: false,
                pageSize: applications.length || 10,
              }}
              onSort={handleSort}
              sortConfig={sortConfig}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <AdminUserDetail user={selectedUserDetail} onBack={() => setSelectedUserDetail(null)} isInstructorContext={activeTab === "INSTRUCTOR"} />
      )}

      {/* Lock Reason Dialog */}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Khóa tài khoản</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do khóa tài khoản cho <strong>{selectedUser?.fullName}</strong>. Lý do này sẽ hiển thị khi họ cố gắng đăng nhập.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AppTextarea
              placeholder="Nhập lý do tại đây..."
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              className="resize-none h-32"
            />
          </div>
          <DialogFooter>
            <AppButton appVariant="ghostMuted" variant="ghost" className="border-none hover:bg-muted font-bold" onClick={() => setLockDialogOpen(false)}>Hủy</AppButton>
            <AppButton appVariant="gradient" className="bg-error/10 text-error hover:bg-error/20 text-error font-bold border-none" onClick={confirmLock}>
              Xác nhận khóa
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Từ chối đơn đăng ký</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối. Lý do này sẽ được gửi đến email của người dùng.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AppTextarea
              placeholder="Nhập lý do tại đây..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="resize-none h-32"
            />
          </div>
          <DialogFooter>
            <AppButton appVariant="ghostMuted" variant="ghost" className="border-none hover:bg-muted font-bold" onClick={() => setRejectDialogOpen(false)}>Hủy</AppButton>
            <AppButton appVariant="gradient" className="bg-error/10 text-error hover:bg-error/20 text-error font-bold border-none" onClick={handleReject}>
              Xác nhận từ chối
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDocument?.url} onOpenChange={(open) => !open && setPreviewDocument({ url: null, title: "" })}>
        <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="mb-2 shrink-0">
            <DialogTitle className="text-xl font-bold flex justify-between items-center pr-6 text-foreground">
              {previewDocument?.title || "Xem trước tài liệu"}
              <AppButton appVariant="ghostMuted" variant="ghost" size="sm" className="h-8 border border-border bg-white hover:bg-muted font-bold" onClick={() => window.open(previewDocument?.url, '_blank')}>
                Mở trong tab mới
              </AppButton>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-muted/50 overflow-hidden border border-border flex items-center justify-center relative">
            {previewDocument?.url && (
              (() => {
                const isPdf = previewDocument.url.split('?')[0].toLowerCase().endsWith('.pdf') ||
                  previewDocument.title?.toLowerCase().includes("pdf");
                if (isPdf) {
                  return (
                    <iframe
                      src={previewDocument.url}
                      className="w-full h-full border-0 absolute inset-0 bg-card"
                      title={previewDocument.title}
                      loading="lazy"
                    />
                  );
                } else {
                  return (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img
                        src={previewDocument.url}
                        alt={previewDocument.title}
                        className="max-w-[95%] max-h-[95%] object-contain shadow-md bg-card border border-border"
                      />
                    </div>
                  );
                }
              })()
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lecturer Application Review Dialog */}
      <Dialog open={!!selectedAppDetail} onOpenChange={(open) => !open && setSelectedAppDetail(null)}>
        <DialogContent className="sm:max-w-[1000px] h-[85vh] flex flex-col p-0 overflow-hidden bg-white" showCloseButton={false}>
          <DialogHeader className="p-5 border-b border-border shrink-0 bg-muted flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Thẩm định Hồ sơ Giảng viên
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Duyệt chi tiết hồ sơ đăng ký của <strong>{selectedAppDetail?.fullName}</strong>.
              </DialogDescription>
            </div>
            <AppButton appVariant="ghostMuted" variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full border border-border bg-white text-muted-foreground hover:bg-muted" onClick={() => setSelectedAppDetail(null)}>
              <X className="w-4 h-4" />
            </AppButton>
          </DialogHeader>

          {selectedAppDetail && (
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* Left Column: Sidebar with details & menu */}
              <div className="w-[320px] border-r border-border bg-muted/50 p-5 overflow-y-auto flex flex-col justify-between shrink-0">
                <div className="space-y-6">
                  {/* User Profile Info Card */}
                  <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col items-center text-center">
                    <Avatar className="h-16 w-16 border-2 border-primary mb-3">
                      <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-xl">
                        {selectedAppDetail.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-extrabold text-base text-foreground">{selectedAppDetail.fullName}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 justify-center"><Mail className="w-3.5 h-3.5" /> {selectedAppDetail.email}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 justify-center"><Phone className="w-3.5 h-3.5" /> {selectedAppDetail.contactPhone}</p>
                  </div>

                  {/* Document Review List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block px-1">Danh mục tài liệu</span>
                    <div className="space-y-1">
                      {getDocumentList(selectedAppDetail).map((doc) => {
                        const Icon = doc.icon;
                        const isSelected = activeDoc?.id === doc.id;
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${isSelected
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            onClick={() => setActiveDoc(doc)}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                            <span className="truncate flex-1">{doc.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground text-center mt-6">
                  Xét duyệt hồ sơ tuân thủ quy trình bảo mật thông tin.
                </p>
              </div>

              {/* Right Column: Preview pane & actions */}
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* ID card images are always visible for manual identity review. */}
                <div className="p-4 border-b border-border bg-white shrink-0">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        CCCD đối chiếu thủ công
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Kiểm tra đầy đủ hai mặt trước khi phê duyệt hồ sơ.
                      </p>
                    </div>
                    <AppBadge
                      variant={hasCompleteIdCard(selectedAppDetail) ? "success" : "error"}
                      className="shrink-0 px-2.5 py-1 text-white"
                    >
                      {hasCompleteIdCard(selectedAppDetail) ? "Đủ 2 mặt" : "Thiếu ảnh"}
                    </AppBadge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {getIdCardDocuments(selectedAppDetail).map((document) => {
                      const isSelected = activeDoc?.id === document.id;
                      return (
                        <button
                          key={document.id}
                          type="button"
                          disabled={!document.url}
                          onClick={() => document.url && setActiveDoc(document)}
                          className={`group relative h-32 overflow-hidden rounded-lg border-2 bg-muted/40 transition-all ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/15"
                              : document.url
                                ? "border-border hover:border-primary/50"
                                : "border-dashed border-error/40 cursor-not-allowed"
                          }`}
                          aria-label={`Xem ${document.title}`}
                        >
                          {document.url ? (
                            <img
                              src={document.url}
                              alt={document.title}
                              className="h-full w-full object-contain bg-muted/20 transition-transform group-hover:scale-[1.02]"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center gap-1 text-error">
                              <CreditCard className="w-6 h-6" />
                              <span className="text-xs font-bold">Chưa cung cấp ảnh</span>
                            </div>
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-foreground/75 px-2 py-1.5 text-xs font-bold text-white text-center">
                            {document.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Document Header */}
                <div className="px-5 py-3 border-b border-border bg-muted flex items-center justify-between shrink-0">
                  <span className="text-sm font-bold text-foreground">
                    Đang xem: <span className="text-primary">{activeDoc?.title}</span>
                  </span>
                  {activeDoc && activeDoc.type !== "text" && (
                    <AppButton
                      appVariant="ghostMuted"
                      variant="ghost"
                      size="sm"
                      className="h-8 border border-border bg-white hover:bg-muted font-bold text-xs"
                      onClick={() => window.open(activeDoc.url, "_blank")}
                    >
                      Mở tab mới
                    </AppButton>
                  )}
                </div>

                {/* Active Document Viewer Pane */}
                <div className="flex-1 w-full bg-muted/50 overflow-hidden relative flex items-center justify-center">
                  {activeDoc && (
                    (() => {
                      if (activeDoc.type === "pdf") {
                        return (
                          <iframe
                            src={activeDoc.url}
                            className="w-full h-full border-0 absolute inset-0 bg-card"
                            title={activeDoc.title}
                            loading="lazy"
                          />
                        );
                      } else if (activeDoc.type === "text") {
                        return (
                          <div className="w-full h-full overflow-y-auto p-6 bg-white flex flex-col justify-start">
                            <h4 className="text-lg font-bold text-foreground mb-4 border-b pb-2 flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-primary" /> Đề cương bài giảng dự kiến
                            </h4>
                            <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                              {activeDoc.url || "Giảng viên chưa cung cấp đề cương chi tiết."}
                            </p>
                          </div>
                        );
                      } else {
                        return (
                          <div className="w-full h-full flex items-center justify-center p-4">
                            <img
                              src={activeDoc.url}
                              alt={activeDoc.title}
                              className="max-w-[95%] max-h-[95%] object-contain shadow-md bg-card border border-border"
                            />
                          </div>
                        );
                      }
                    })()
                  )}
                </div>

                {/* Review Action Buttons */}
                <div className="p-4 border-t border-border bg-muted flex justify-end items-center gap-3 shrink-0">
                  <AppButton
                    appVariant="ghostMuted"
                    variant="ghost"
                    size="sm"
                    className="h-10 px-5 border border-error/20 text-error hover:bg-error/10 bg-white font-extrabold text-sm"
                    onClick={() => {
                      setSelectedApp(selectedAppDetail.accountId);
                      setRejectReason("");
                      setRejectDialogOpen(true);
                      setSelectedAppDetail(null);
                    }}
                  >
                    Từ chối hồ sơ
                  </AppButton>
                  <AppButton
                    appVariant="ghostMuted"
                    variant="ghost"
                    size="sm"
                    className="h-10 px-5 border border-success/20 text-success hover:bg-success/10 bg-white font-extrabold text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasCompleteIdCard(selectedAppDetail)}
                    title={!hasCompleteIdCard(selectedAppDetail) ? "Cần đầy đủ ảnh CCCD mặt trước và mặt sau" : "Phê duyệt hồ sơ"}
                    onClick={() => {
                      handleApprove(selectedAppDetail.accountId);
                      setSelectedAppDetail(null);
                    }}
                  >
                    Phê duyệt hồ sơ
                  </AppButton>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminUserDetail({ user, onBack, isInstructorContext }) {
  const isInstructor = isInstructorContext || user?.role?.name === "Giảng viên" || user?.role?.name === "INSTRUCTOR" || user?.role?.name === "ROLE_INSTRUCTOR";
  const [activeDetailTab, setActiveDetailTab] = useState("COURSES");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatus, setCourseStatus] = useState([]);
  const [courseDateRange, setCourseDateRange] = useState({ from: undefined, to: undefined });
  const [expandedChapterId, setExpandedChapterId] = useState(null);

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState([]);
  const [orderAmountRange, setOrderAmountRange] = useState([0, 10000000]);
  const [orderAmountPreset, setOrderAmountPreset] = useState("all");
  const [orderDateRange, setOrderDateRange] = useState({ from: undefined, to: undefined });

  const handleOrderAmountPresetChange = (preset) => {
    setOrderAmountPreset(preset);
    if (preset === "all") setOrderAmountRange([0, 10000000]);
    else if (preset === "under_500k") setOrderAmountRange([0, 500000]);
    else if (preset === "500k_1m") setOrderAmountRange([500000, 1000000]);
    else if (preset === "over_1m") setOrderAmountRange([1000000, 10000000]);
  };

  const handleOrderAmountSliderChange = (val) => {
    setOrderAmountRange(val);
    if (val[0] === 0 && val[1] === 10000000) setOrderAmountPreset("all");
    else if (val[0] === 0 && val[1] === 500000) setOrderAmountPreset("under_500k");
    else if (val[0] === 500000 && val[1] === 1000000) setOrderAmountPreset("500k_1m");
    else if (val[0] === 1000000 && val[1] === 10000000) setOrderAmountPreset("over_1m");
    else setOrderAmountPreset("custom");
  };

  const [incomeSearch, setIncomeSearch] = useState("");
  const [incomeStatus, setIncomeStatus] = useState([]);
  const [incomeDateRange, setIncomeDateRange] = useState({ from: undefined, to: undefined });

  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutStatus, setPayoutStatus] = useState([]);
  const [payoutDateRange, setPayoutDateRange] = useState({ from: undefined, to: undefined });

  const [postSearch, setPostSearch] = useState("");
  const [postStatus, setPostStatus] = useState([]);
  const [postDateRange, setPostDateRange] = useState({ from: undefined, to: undefined });

  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewRating, setReviewRating] = useState([]);
  const [reviewStatus, setReviewStatus] = useState([]);
  const [reviewDateRange, setReviewDateRange] = useState({ from: undefined, to: undefined });

  if (!user) return null;

  const {
    summary, enrollments, enrollmentPage, setEnrollmentPage, enrollmentSize, setEnrollmentSize,
    enrollmentProgress, expandedCourseId, setExpandedCourseId,
    courses, coursePage, setCoursePage, courseSize, setCourseSize,
    orders, orderPage, setOrderPage, orderSize, setOrderSize,
    orderDetails, expandedOrderId, setExpandedOrderId,
    incomes, incomePage, setIncomePage, incomeSize, setIncomeSize,
    payouts, payoutPage, setPayoutPage, payoutSize, setPayoutSize,
    threads, threadPage, setThreadPage, threadSize, setThreadSize,
    reviews, reviewPage, setReviewPage, reviewSize, setReviewSize,
    activities, activityPage, setActivityPage, activitySize, setActivitySize
  } = useAdminUserDetail(user.id, isInstructor, activeDetailTab);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <AppButton variant="outline" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Trở lại
        </AppButton>
        <h2 className="text-xl font-bold">Chi tiết người dùng</h2>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <Avatar className="w-24 h-24 border-4 border-background shadow-md">
            <AvatarImage src={user.avatar || "https://github.com/shadcn.png"} alt={user.fullName} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="text-2xl font-bold">{user.fullName}</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {user.status === 2 ? (
                <AppBadge variant="error" soft>Bị khóa</AppBadge>
              ) : user.status === 1 ? (
                <AppBadge variant="success" soft>Hoạt động</AppBadge>
              ) : (
                <AppBadge variant="warning" soft>Chưa xác thực</AppBadge>
              )}
              <AppBadge variant="info" soft>{user.role?.name || "Học viên"}</AppBadge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-border">
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Thông tin liên hệ</h4>
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
              <span className="text-muted-foreground">Số điện thoại:</span>
              <span className="font-medium">{user.phone || "(Chưa thiết lập)"}</span>
              <span className="text-muted-foreground">Ngày đăng ký:</span>
              <span className="font-medium">
                {user.createdAt ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(user.createdAt)).replace(/,/, '') : "Không xác định"}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{isInstructor ? "Tổng quan tài chính" : "Hoạt động mua hàng"}</h4>
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-muted-foreground">{isInstructor ? "Tổng doanh thu:" : "Tổng mua hàng:"}</span>
              <span className="font-bold text-primary">
                {new Intl.NumberFormat('vi-VN').format(summary?.data?.totalSpent || 0)} đ
              </span>
              <span className="text-muted-foreground">{isInstructor ? "Khóa học đã tạo:" : "Khóa học đã mua:"}</span>
              <span className="font-medium">{summary?.data?.courseCount || 0} Khóa học</span>
              <span className="text-muted-foreground">Số dư:</span>
              <span className="font-bold text-success">
                {new Intl.NumberFormat('vi-VN').format(summary?.data?.balance || 0)} đ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="COURSES" className="w-full pt-4" onValueChange={setActiveDetailTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="COURSES" className="gap-2"><GraduationCap className="w-4 h-4" /> Khóa học</TabsTrigger>
          {isInstructor ? (
            <>
              <TabsTrigger value="INCOME" className="gap-2"><Coins className="w-4 h-4" /> Thu nhập</TabsTrigger>
              <TabsTrigger value="PAYOUT" className="gap-2"><Banknote className="w-4 h-4" /> Rút tiền</TabsTrigger>
              <TabsTrigger value="POSTS" className="gap-2"><FileText className="w-4 h-4" /> Chủ đề</TabsTrigger>
              <TabsTrigger value="REVIEWS" className="gap-2"><Star className="w-4 h-4" /> Đánh giá</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="ORDERS" className="gap-2"><CreditCard className="w-4 h-4" /> Đơn hàng</TabsTrigger>
              <TabsTrigger value="POSTS" className="gap-2"><FileText className="w-4 h-4" /> Bài viết</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="COURSES" className="mt-0">
          <div className="mb-4">
            <DataFilter
              searchQuery={courseSearch}
              onSearchChange={setCourseSearch}
              searchPlaceholder="Tìm kiếm khóa học..."
              dropdownChecklists={[
                {
                  title: "Trạng thái",
                  items: isInstructor ? [
                    { label: "Bản nháp", value: "1" },
                    { label: "Chờ duyệt", value: "2" },
                    { label: "Đã xuất bản", value: "3" },
                    { label: "Từ chối", value: "0" }
                  ] : [
                    { label: "Đang học", value: "learning" },
                    { label: "Hoàn thành", value: "completed" }
                  ],
                  selectedItems: courseStatus,
                  onItemToggle: (val) => setCourseStatus(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
                  onClear: () => setCourseStatus([])
                }
              ]}
              dateRange={courseDateRange}
              onDateRangeChange={setCourseDateRange}
              dateRangePlaceholder={isInstructor ? "Ngày tạo" : "Ngày đăng ký"}
            />
          </div>
          {isInstructor ? (
            (courses?.data?.content?.length > 0) ? (
              <DataTable
                selection={false}
                columns={[
                  {
                    header: "STT",
                    width: "50px",
                    className: "text-center",
                    cellClassName: "text-center",
                    render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
                  },
                  { 
                    header: "Khóa học",
                    width: "320px",
                    render: (c) => (
                      <div className="flex items-center gap-3">
                        <img src={c.thumbnail} alt={c.title} className="w-[100px] h-[60px] object-cover rounded border border-border shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-semibold text-foreground whitespace-normal line-clamp-2 break-words" title={c.title}>
                            {c.title}
                          </span>
                        </div>
                      </div>
                    ) 
                  },
                  {
                    header: "Giá bán",
                    width: "150px",
                    className: "text-center",
                    render: (c) => {
                      const finalPrice = c.discount > 0 ? c.price * (100 - c.discount) / 100 : c.price;
                      return (
                        <div className="flex flex-col items-center w-full">
                          <span className="font-bold text-foreground text-sm">{new Intl.NumberFormat('vi-VN').format(finalPrice)} đ</span>
                          {c.discount > 0 && <span className="text-[10px] text-muted-foreground line-through">{new Intl.NumberFormat('vi-VN').format(c.price)} đ</span>}
                        </div>
                      )
                    }
                  },
                  {
                    header: "Học viên",
                    width: "120px",
                    className: "text-center",
                    render: (c) => <div className="text-center w-full font-medium text-foreground text-sm">{new Intl.NumberFormat('vi-VN').format(c.studentCount)}</div>
                  },
                  {
                    header: "Doanh thu",
                    width: "150px",
                    className: "text-center",
                    render: (c) => <div className="text-center w-full font-bold text-success text-sm">{new Intl.NumberFormat('vi-VN').format(c.revenue)} đ</div>
                  },
                  {
                    header: "Ngày tạo",
                    width: "140px",
                    className: "text-center",
                    render: (c) => <div className="text-center w-full text-sm text-foreground">{c.createdAt ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(c.createdAt)).replace(/,/, '') : "---"}</div>
                  },
                  { 
                    header: "Trạng thái", 
                    width: "140px",
                    className: "text-center",
                    render: (c) => (
                      <div className="text-center w-full flex justify-center">
                        <AppBadge variant={c.status === 3 ? "success" : c.status === 2 ? "warning" : c.status === 1 ? "secondary" : "error"} className="w-[100px] justify-center px-2.5 py-1 text-white">
                          {c.status === 3 ? "Đã xuất bản" : c.status === 2 ? "Chờ duyệt" : c.status === 1 ? "Bản nháp" : "Từ chối"}
                        </AppBadge>
                      </div>
                    ) 
                  }
                ]}
                data={courses?.data?.content || []}
                emptyState="Chưa có khóa học nào."
                pagination={{
                  currentPage: coursePage,
                  totalPages: courses?.data?.page?.totalPages ?? courses?.data?.totalPages ?? 1,
                  totalItems: courses?.data?.page?.totalElements ?? courses?.data?.totalElements ?? 0,
                  onPageChange: (p) => setCoursePage(p),
                  onPageSizeChange: (s) => { setCourseSize(s); setCoursePage(1); },
                  zeroIndexed: false,
                  pageSize: courseSize,
                }}
              />
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
                <GraduationCap className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-1">Chưa có khóa học</h4>
                <p className="text-sm text-muted-foreground">Giảng viên này chưa tạo khóa học nào.</p>
              </div>
            )
          ) : (
            (enrollments?.data?.content?.length > 0) ? (
              <DataTable
                selection={false}
                columns={[
                  {
                    header: "STT",
                    width: "50px",
                    className: "text-center",
                    cellClassName: "text-center",
                    render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
                  },
                  { 
                    header: "Khóa học",
                    width: "350px",
                    render: (c) => (
                      <div className="flex items-center gap-3">
                        <img src={c.courseThumbnail} alt={c.courseTitle} className="w-[100px] h-[60px] object-cover rounded border border-border shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-semibold text-foreground whitespace-normal line-clamp-2 break-words" title={c.courseTitle}>
                            {c.courseTitle}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5 whitespace-normal break-words">Giảng viên: {c.instructorName}</span>
                        </div>
                      </div>
                    ) 
                  },
                  {
                    header: "Mã đơn hàng",
                    width: "160px",
                    className: "text-center",
                    render: (c) => <div className="text-center w-full font-bold text-foreground">{c.orderCode || "---"}</div>
                  },
                  {
                    header: "Ngày đăng ký",
                    width: "120px",
                    className: "text-center",
                    render: (c) => <div className="text-center w-full text-sm text-foreground">{c.enrollDate ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(c.enrollDate)).replace(/,/, '') : "---"}</div>
                  },
                  { 
                    header: "Tiến độ", 
                    width: "200px",
                    className: "text-center",
                    render: (c) => (
                      <div className="w-full max-w-[150px] mx-auto">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
                          <span className={c.progressPercent === 100 ? "text-success" : "text-primary"}>{c.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden text-left">
                          <div className={`h-full rounded-full transition-all ${c.progressPercent === 100 ? "bg-success" : "bg-primary"}`} style={{ width: `${c.progressPercent}%` }}></div>
                        </div>
                      </div>
                    ) 
                  },
                  { 
                    header: "Trạng thái", 
                    width: "140px",
                    className: "text-center",
                    render: (c) => (
                      <div className="text-center w-full flex justify-center">
                        <AppBadge variant={c.status === 2 ? "success" : c.status === 1 ? "info" : "secondary"} className="w-[100px] justify-center px-2.5 py-1 text-white">
                          {c.status === 2 ? "Hoàn thành" : c.status === 1 ? "Đang học" : "Đã hủy"}
                        </AppBadge>
                      </div>
                    ) 
                  }
                ]}
                data={enrollments?.data?.content || []}
                emptyState="Chưa có khóa học nào."
                pagination={{
                  currentPage: enrollmentPage,
                  totalPages: enrollments?.data?.page?.totalPages ?? enrollments?.data?.totalPages ?? 1,
                  totalItems: enrollments?.data?.page?.totalElements ?? enrollments?.data?.totalElements ?? 0,
                  onPageChange: (p) => setEnrollmentPage(p),
                  onPageSizeChange: (s) => { setEnrollmentSize(s); setEnrollmentPage(1); },
                  zeroIndexed: false,
                  pageSize: enrollmentSize,
                }}
                onRowClick={(row) => setExpandedCourseId(row.enrollmentId === expandedCourseId ? null : row.enrollmentId)}
                renderExpandedRow={(course) => {
                  if (expandedCourseId !== course.enrollmentId) return null;
                  const chapters = expandedCourseId === course.enrollmentId ? (enrollmentProgress?.data?.modules || []) : [];
                  
                  return (
                    <TableRow className="bg-muted/10 border-b border-border/50 hover:bg-muted/10">
                      <TableCell colSpan={100} className="p-0 border-l-4 border-l-primary">
                        <div className="flex flex-col w-full">
                          <h5 className="font-semibold text-sm py-4 text-center">Chi tiết tiến độ</h5>
                          {chapters.length > 0 ? (
                            <DataTable 
                              selection={false}
                              className="border-0 shadow-none rounded-none"
                              columns={[
                                { 
                                  header: "STT", 
                                  width: "50px", 
                                  className: "text-center",
                                  cellClassName: "text-center", 
                                  render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div> 
                                },
                                { header: "Chương", width: "300px", render: (ch) => <div className="font-medium truncate text-foreground text-sm" title={ch.title}>{ch.title}</div> },
                                { header: "Thời lượng", width: "100px", className: "text-center", render: (ch) => {
                                  const totalSecs = ch.lessons.reduce((acc, curr) => {
                                    const parts = (curr.duration || "0:0").split(':').map(Number);
                                    return acc + (parts.length === 3 ? parts[0]*3600 + parts[1]*60 + parts[2] : parts[0]*60 + parts[1]);
                                  }, 0);
                                  const h = Math.floor(totalSecs / 3600);
                                  const m = Math.floor((totalSecs % 3600) / 60);
                                  const s = totalSecs % 60;
                                  const str = h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                  return <div className="text-center w-full text-foreground text-sm">{str}</div>;
                                }},
                                { header: "Số bài học", width: "100px", className: "text-center", render: (ch) => <div className="text-center w-full text-foreground text-sm">{ch.lessons.length} bài</div> },
                                { header: "Ngày hoàn thành", width: "160px", className: "text-center", render: (ch) => <div className="text-center w-full text-sm text-foreground">{ch.completedDate ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(ch.completedDate)).replace(/,/, '') : <span className="italic text-muted-foreground">(Chưa hoàn thành)</span>}</div> },
                                { header: "Tiến độ", width: "150px", className: "text-center", render: (ch) => (
                                  <div className="w-full mx-auto">
                                    <div className="flex justify-between text-sm mb-1 font-semibold text-foreground">
                                      <span className={ch.progressPercent === 100 ? "text-success" : "text-primary"}>{ch.progressPercent || 0}%</span>
                                    </div>
                                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${ch.progressPercent === 100 ? "bg-success" : "bg-primary"}`} style={{ width: `${ch.progressPercent || 0}%` }}></div>
                                    </div>
                                  </div>
                                )},
                                { header: "Trạng thái", width: "140px", className: "text-center", render: (ch) => (
                                  <div className="text-center w-full flex justify-center">
                                    <AppBadge variant={ch.progressPercent === 100 ? "success" : (ch.progressPercent > 0 ? "info" : "secondary")} className="w-[100px] justify-center px-2.5 py-1 text-white">
                                      {ch.progressPercent === 100 ? "Hoàn thành" : (ch.progressPercent > 0 ? "Đang học" : "Chưa học")}
                                    </AppBadge>
                                  </div>
                                )}
                              ]}
                              data={chapters}
                              pagination={false}
                              onRowClick={(ch) => setExpandedChapterId(ch.id === expandedChapterId ? null : ch.id)}
                              renderExpandedRow={(chapter) => {
                                if (expandedChapterId !== chapter.id) return null;
                                return (
                                  <>
                                    {chapter.lessons.map((lesson, idx) => (
                                      <TableRow key={lesson.id} className="bg-background hover:bg-muted/30 transition-colors cursor-default border-b border-border/50">
                                        <TableCell className="py-2 text-center text-xs text-muted-foreground/70" style={{ width: "50px", minWidth: "50px", maxWidth: "50px" }}>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-left" style={{ width: "300px", minWidth: "300px", maxWidth: "300px" }}>
                                          <div className="text-sm font-medium text-foreground flex items-center gap-2">
                                            <span className="truncate" title={lesson.title}>{lesson.title}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-center" style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}>
                                          <span className="text-foreground text-sm font-medium">{lesson.duration || "00:00"}</span>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-center" style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}></TableCell>
                                        <TableCell className="py-2 px-4 text-center" style={{ width: "160px", minWidth: "160px", maxWidth: "160px" }}>
                                          <span className="text-foreground text-sm">{lesson.completedDate ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(lesson.completedDate)).replace(/,/, '') : <span className="italic text-muted-foreground">(Chưa hoàn thành)</span>}</span>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-center" style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
                                          <div className="w-full mx-auto">
                                            <div className="flex justify-between text-sm mb-1 font-semibold text-foreground">
                                              <span className={lesson.progressPercent === 100 ? "text-success" : "text-primary"}>{lesson.progressPercent || 0}%</span>
                                            </div>
                                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                              <div className={`h-full rounded-full ${lesson.progressPercent === 100 ? "bg-success" : "bg-primary"}`} style={{ width: `${lesson.progressPercent || 0}%` }}></div>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-center" style={{ width: "140px", minWidth: "140px", maxWidth: "140px" }}>
                                          <div className="flex justify-center w-full">
                                            <AppBadge variant={lesson.progressPercent === 100 ? "success" : (lesson.progressPercent > 0 ? "info" : "secondary")} className="w-[100px] justify-center px-2.5 py-1 text-white">
                                              {lesson.progressPercent === 100 ? "Hoàn thành" : (lesson.progressPercent > 0 ? "Đang học" : "Chưa học")}
                                            </AppBadge>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </>
                                );
                              }}
                            />
                          ) : (
                            <div className="text-sm text-muted-foreground italic px-4 py-4">Chưa có nội dung chương học.</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
                <GraduationCap className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-1">Chưa có khóa học</h4>
                <p className="text-sm text-muted-foreground">Người dùng này chưa mua khóa học nào.</p>
              </div>
            )
          )}
        </TabsContent>
        
        <TabsContent value="ORDERS" className="mt-0">
          <div className="mb-4">
            <DataFilter
              searchQuery={orderSearch}
              onSearchChange={setOrderSearch}
              searchPlaceholder="Tìm kiếm mã đơn hàng..."
              dropdownChecklists={[
                {
                  title: "Trạng thái",
                  items: [
                    { label: "Thành công", value: "success" },
                    { label: "Thất bại", value: "failed" },
                    { label: "Đang xử lý", value: "pending" }
                  ],
                  selectedItems: orderStatus,
                  onItemToggle: (val) => setOrderStatus(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
                  onClear: () => setOrderStatus([])
                }
              ]}
              dateRange={orderDateRange}
              onDateRangeChange={setOrderDateRange}
              dateRangePlaceholder="Thời gian đặt hàng"
            >
              <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className="w-full xl:w-[200px] shrink-0">
                  <AppSelect 
                    value={orderAmountPreset} 
                    onValueChange={handleOrderAmountPresetChange}
                    options={[
                      ...(orderAmountPreset === "custom" ? [{ label: "Tùy chọn", value: "custom" }] : []),
                      { label: "Tất cả số tiền", value: "all" },
                      { label: "Dưới 500.000 đ", value: "under_500k" },
                      { label: "500.000 đ - 1.000.000 đ", value: "500k_1m" },
                      { label: "Trên 1.000.000 đ", value: "over_1m" }
                    ]}
                    placeholder="Chọn khoảng tiền"
                  />
                </div>
                <DataFilterPriceRange
                  title="Giao dịch"
                  min={0}
                  max={10000000}
                  step={50000}
                  value={orderAmountRange}
                  onValueChange={handleOrderAmountSliderChange}
                  onClear={() => handleOrderAmountPresetChange("all")}
                />
              </div>
            </DataFilter>
          </div>
          <DataTable
            selection={false}
            columns={[
              {
                header: "STT",
                width: "50px",
                className: "text-center",
                cellClassName: "text-center",
                render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
              },
              { header: "Mã đơn hàng", width: "160px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-bold text-foreground">{o.orderCode}</span></div> },
              { header: "Phân loại", width: "120px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-medium text-foreground">{o.type || "Mua hàng"}</span></div> },
              { header: "Ngày giao dịch", width: "160px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="text-foreground text-sm font-medium">{o.date ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(o.date)).replace(/,/, '') : "---"}</span></div> },
              { header: "Phương thức", width: "140px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-medium">{o.paymentMethod || "---"}</span></div> },
              { header: "Mã giảm", width: "120px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-medium text-foreground">{o.couponCode || "--"}</span></div> },
              { header: "Giảm Coupon", width: "140px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-medium text-error">-{new Intl.NumberFormat('vi-VN').format(o.couponDiscount || 0)} đ</span></div> },
              { header: "Tổng tiền", width: "160px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-bold text-primary">{new Intl.NumberFormat('vi-VN').format(o.amount)} đ</span></div> },
              { header: "Trạng thái", width: "140px", className: "text-center", render: (o) => (
                  <div className="text-center w-full flex justify-center">
                    <AppBadge variant={o.status === 1 ? "success" : o.status === 0 ? "warning" : o.status === 2 ? "secondary" : "error"} className="w-[100px] justify-center px-2.5 py-1 text-white">
                      {o.status === 1 ? "Thành công" : o.status === 0 ? "Chờ TT" : o.status === 2 ? "Đã hoàn" : "Đã hủy"}
                    </AppBadge>
                  </div>
                ) 
              }
            ]}
            data={orders?.data?.content || []}
            emptyState="Không có lịch sử giao dịch nào."
            pagination={{
              currentPage: orderPage,
                totalPages: orders?.data?.page?.totalPages ?? orders?.data?.totalPages ?? 1,
                totalItems: orders?.data?.page?.totalElements ?? orders?.data?.totalElements ?? 0,
                onPageChange: (p) => setOrderPage(p),
                onPageSizeChange: (s) => { setOrderSize(s); setOrderPage(1); },
                zeroIndexed: false,
                pageSize: orderSize,
            }}
            onRowClick={(row) => setExpandedOrderId(row.orderId === expandedOrderId ? null : row.orderId)}
            renderExpandedRow={(order) => {
              if (expandedOrderId !== order.orderId) return null;
              const details = expandedOrderId === order.orderId ? (orderDetails?.data || []) : [];
              
              return (
                <TableRow className="bg-muted/10 border-b border-border/50 hover:bg-muted/10">
                  <TableCell colSpan={100} className="p-0 border-l-4 border-l-primary">
                    <div className="flex flex-col w-full">
                      <h5 className="font-semibold text-sm py-4 text-center">Chi tiết đơn hàng</h5>
                      {order.type === "Quà tặng" && order.recipient && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <span className="text-sm font-medium text-muted-foreground">Tặng cho:</span>
                          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={order.recipient.avatar} alt={order.recipient.name} />
                              <AvatarFallback className="text-[10px]">{order.recipient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold text-foreground">{order.recipient.name}</span>
                            <span className="text-xs text-muted-foreground">({order.recipient.email})</span>
                          </div>
                        </div>
                      )}
                      {details.length > 0 ? (
                        <DataTable 
                          selection={false}
                          className="border-0 shadow-none rounded-none"
                          columns={[
                            { header: "Khóa học", width: "350px", className: "pl-6", render: (d) => (
                              <div className="flex items-center gap-3 pl-6">
                                <img src={d.thumbnail} alt={d.courseName} className="w-[100px] h-[60px] object-cover rounded border border-border shrink-0" />
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-semibold text-foreground whitespace-normal line-clamp-2 break-words" title={d.courseName}>
                                    {d.courseName}
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-0.5">Giảng viên: {d.instructor}</span>
                                </div>
                              </div>
                            )},
                            { header: "Giá gốc", width: "150px", className: "text-center", render: (d) => <div className="text-center w-full font-medium text-foreground text-sm">{new Intl.NumberFormat('vi-VN').format(d.originalPrice)} đ</div> },
                            { header: "Khuyến mãi", width: "150px", className: "text-center", render: (d) => <div className="text-center w-full text-error font-medium text-sm">-{d.discount}%</div> },
                            { header: "Giảm Coupon", width: "150px", className: "text-center", render: (d) => <div className="text-center w-full text-error font-medium text-sm">-{new Intl.NumberFormat('vi-VN').format(d.couponDiscount || 0)} đ</div> },
                            { header: "Tỷ lệ nền tảng", width: "150px", className: "text-center", render: (d) => <div className="text-center w-full font-medium text-sm text-foreground">{d.platformFeeRate}%</div> },
                            { header: "Giá thực tế", width: "150px", className: "text-center pr-10", render: (d) => <div className="text-center w-full pr-10 text-primary font-bold text-sm">{new Intl.NumberFormat('vi-VN').format(d.finalPrice)} đ</div> }
                          ]}
                          data={details}
                          pagination={false}
                        />
                      ) : (
                        <div className="text-center text-sm text-muted-foreground py-4">Không có chi tiết đơn hàng</div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            }}
          />
        </TabsContent>
        
        {isInstructor && (
          <TabsContent value="INCOME" className="mt-0">
            <div className="mb-4">
              <DataFilter
                searchQuery={incomeSearch}
                onSearchChange={setIncomeSearch}
                searchPlaceholder="Tìm kiếm thu nhập (tên khóa học, học viên)..."
                dropdownChecklists={[
                  {
                    title: "Trạng thái",
                    items: [
                      { label: "Hợp lệ", value: 1 },
                      { label: "Đã hoàn tiền", value: 0 }
                    ],
                    selectedItems: incomeStatus,
                    onItemToggle: (val) => setIncomeStatus(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
                    onClear: () => setIncomeStatus([])
                  }
                ]}
                dateRange={incomeDateRange}
                onDateRangeChange={setIncomeDateRange}
                dateRangePlaceholder="Ngày ghi nhận"
              />
            </div>
            <DataTable
              selection={false}
              columns={[
                {
                  header: "STT",
                  width: "50px",
                  className: "text-center",
                  cellClassName: "text-center",
                  render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
                },
                { 
                  header: "Khóa học",
                  width: "250px",
                  render: (c) => (
                    <div className="font-semibold text-foreground line-clamp-2" title={c.courseTitle}>
                      {c.courseTitle}
                    </div>
                  ) 
                },
                { 
                  header: "Học viên",
                  width: "200px",
                  render: (c) => (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={c.studentAvatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{c.studentName.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm text-foreground">{c.studentName}</span>
                    </div>
                  ) 
                },
                {
                  header: "Giá bán",
                  width: "120px",
                  className: "text-center",
                  render: (c) => <div className="text-center w-full font-medium text-foreground text-sm">{new Intl.NumberFormat('vi-VN').format(c.price)} đ</div>
                },
                {
                  header: "Tỷ lệ",
                  width: "90px",
                  className: "text-center",
                  render: (c) => <div className="text-center w-full text-sm text-foreground">{c.instructorRatio}%</div>
                },
                {
                  header: "Thu nhập",
                  width: "140px",
                  className: "text-center",
                  render: (c) => <div className="text-center w-full font-bold text-success text-sm">{new Intl.NumberFormat('vi-VN').format(c.price * c.instructorRatio / 100)} đ</div>
                },
                {
                  header: "Ngày",
                  width: "120px",
                  className: "text-center",
                  render: (c) => <div className="text-center w-full text-sm text-foreground">{c.createdAt ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(c.createdAt)).replace(/,/, '') : "---"}</div>
                },
                { 
                  header: "Trạng thái", 
                  width: "130px",
                  className: "text-center",
                  render: (c) => (
                    <div className="text-center w-full flex justify-center">
                      <AppBadge variant={c.status === 1 ? "success" : "warning"} className="w-[100px] justify-center px-2.5 py-1 text-white">
                        {c.status === 1 ? "Hợp lệ" : "Đã hoàn tiền"}
                      </AppBadge>
                    </div>
                  ) 
                }
              ]}
              data={incomes?.data?.content || []}
              emptyState="Chưa có thu nhập nào."
              pagination={{
                currentPage: incomePage,
                totalPages: incomes?.data?.page?.totalPages ?? incomes?.data?.totalPages ?? 1,
                totalItems: incomes?.data?.page?.totalElements ?? incomes?.data?.totalElements ?? 0,
                onPageChange: (p) => setIncomePage(p),
                onPageSizeChange: (s) => { setIncomeSize(s); setIncomePage(1); },
                zeroIndexed: false,
                pageSize: incomeSize,
              }}
            />
          </TabsContent>
        )}

        {isInstructor && (
          <TabsContent value="PAYOUT" className="mt-0">
            <div className="mb-4">
              <DataFilter
                searchQuery={payoutSearch}
                onSearchChange={setPayoutSearch}
                searchPlaceholder="Tìm kiếm mã GD hoặc ngân hàng..."
                dropdownChecklists={[
                  {
                    title: "Trạng thái",
                    items: [
                      { label: "Chờ duyệt", value: 1 },
                      { label: "Đang chuyển", value: 2 },
                      { label: "Hoàn tất", value: 3 },
                      { label: "Lỗi", value: 4 },
                      { label: "Từ chối", value: 5 }
                    ],
                    selectedItems: payoutStatus,
                    onItemToggle: (val) => setPayoutStatus(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
                    onClear: () => setPayoutStatus([])
                  }
                ]}
                dateRange={payoutDateRange}
                onDateRangeChange={setPayoutDateRange}
                dateRangePlaceholder="Ngày yêu cầu"
              />
            </div>
            <DataTable
              selection={false}
              columns={[
                {
                  header: "STT",
                  width: "50px",
                  className: "text-center",
                  cellClassName: "text-center",
                  render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
                },
                { 
                  header: "Mã GD",
                  width: "160px",
                  className: "text-center",
                  render: (c) => {
                    const code = c.transactionCode || c.id;
                    const display = /^\d{12}$/.test(code) ? `RT-${code}` : code;
                    return <div className="text-center w-full font-bold text-foreground">{display}</div>;
                  }
                },
                { 
                  header: "Ngân hàng",
                  width: "250px",
                  render: (c) => (
                    <div className="font-semibold text-foreground line-clamp-2" title={c.accountBank}>
                      {c.accountBank}
                    </div>
                  ) 
                },
                {
                  header: "Số tiền rút",
                  width: "150px",
                  className: "text-center",
                  render: (c) => <div className="text-center w-full font-bold text-error text-sm">-{new Intl.NumberFormat('vi-VN').format(c.amount)} đ</div>
                },
                {
                  header: "Ngày yêu cầu",
                  width: "140px",
                  className: "text-center",
                  render: (c) => <div className="text-center w-full text-sm text-foreground">{c.createdAt ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(c.createdAt)).replace(/,/, '') : "---"}</div>
                },
                { 
                  header: "Trạng thái", 
                  width: "150px",
                  className: "text-center",
                  render: (c) => {
                    let variant = "info";
                    let label = "Chờ duyệt";
                    if (c.status === 2) { variant = "primary"; label = "Đang chuyển"; }
                    else if (c.status === 3) { variant = "success"; label = "Hoàn tất"; }
                    else if (c.status === 4) { variant = "error"; label = "Lỗi"; }
                    else if (c.status === 5) { variant = "secondary"; label = "Từ chối"; }
                    else if (c.status === 6) { variant = "warning"; label = "Chờ admin duyệt"; }
                    return (
                      <div className="text-center w-full flex justify-center">
                        <AppBadge variant={variant} className="w-[110px] justify-center px-2.5 py-1 text-white">
                          {label}
                        </AppBadge>
                      </div>
                    );
                  }
                }
              ]}
              data={payouts?.data?.content || []}
              emptyState="Chưa có yêu cầu rút tiền nào."
              pagination={{
                currentPage: payoutPage,
                totalPages: payouts?.data?.page?.totalPages ?? payouts?.data?.totalPages ?? 1,
                totalItems: payouts?.data?.page?.totalElements ?? payouts?.data?.totalElements ?? 0,
                onPageChange: (p) => setPayoutPage(p),
                onPageSizeChange: (s) => { setPayoutSize(s); setPayoutPage(1); },
                zeroIndexed: false,
                pageSize: payoutSize,
              }}
            />
          </TabsContent>
        )}

        <TabsContent value="POSTS" className="mt-0">
          <div className="mb-4">
            <DataFilter
              searchQuery={postSearch}
              onSearchChange={setPostSearch}
              searchPlaceholder={isInstructor ? "Tìm kiếm chủ đề..." : "Tìm kiếm bài viết..."}
              dropdownChecklists={[
                {
                  title: "Trạng thái",
                  items: [
                    { label: "Ẩn", value: 0 },
                    { label: "Bản nháp", value: 1 },
                    { label: "Đã xuất bản", value: 2 },
                    { label: "Vi phạm", value: 3 }
                  ],
                  selectedItems: postStatus,
                  onItemToggle: (val) => setPostStatus(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
                  onClear: () => setPostStatus([])
                }
              ]}
              dateRange={postDateRange}
              onDateRangeChange={setPostDateRange}
              dateRangePlaceholder="Khoảng thời gian đăng"
            />
          </div>
          <DataTable
            selection={false}
            columns={[
              {
                header: "STT",
                width: "50px",
                className: "text-center",
                cellClassName: "text-center",
                render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
              },
              {
                header: "Chủ đề",
                width: "180px",
                className: "text-center",
                render: (p) => <div className="text-center w-full"><span className="font-medium text-foreground">{p.topic}</span></div>
              },
              { 
                header: "Bài viết", 
                width: "300px",
                render: (p) => (
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground line-clamp-1" title={p.title}>{p.title.length > 50 ? p.title.substring(0, 50) + "..." : p.title}</span>
                  </div>
                ) 
              },
              { 
                header: "Lượt xem", 
                width: "120px",
                className: "text-center",
                render: (p) => <div className="text-center w-full"><span className="text-muted-foreground text-sm">{p.views || 0}</span></div> 
              },
              { 
                header: "Tương tác", 
                width: "180px",
                className: "text-center",
                render: (p) => (
                  <div className="flex items-center justify-center gap-4 text-sm font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1" title="Lượt thích"><span className="text-error">♥</span> {p.likes || 0}</span>
                    <span className="flex items-center gap-1" title="Bình luận"><span className="text-info">💬</span> {p.comments || 0}</span>
                    <span className="flex items-center gap-1" title="Chia sẻ"><span className="text-success">↪</span> {p.shares || 0}</span>
                  </div>
                ) 
              },
              { 
                header: "Ngày đăng", 
                width: "140px",
                className: "text-center",
                render: (p) => <div className="text-center w-full"><span className="text-muted-foreground text-sm">{p.date}</span></div> 
              },
              { 
                header: "Trạng thái", 
                width: "130px",
                className: "text-center",
                render: (p) => (
                  <div className="text-center w-full flex justify-center">
                    <AppBadge 
                      variant={p.status === 2 ? "success" : (p.status === 3 ? "error" : (p.status === 0 ? "secondary" : "warning"))} 
                      className="w-[100px] justify-center px-2.5 py-1 text-white"
                    >
                      {p.status === 2 ? "Đã xuất bản" : (p.status === 3 ? "Vi phạm" : (p.status === 0 ? "Ẩn" : "Bản nháp"))}
                    </AppBadge>
                  </div>
                ) 
              }
            ]}
            data={threads?.data?.content || []}
            emptyState={isInstructor ? "Không có chủ đề nào." : "Không có bài viết nào."}
            pagination={{
              currentPage: threadPage,
                totalPages: threads?.data?.page?.totalPages ?? threads?.data?.totalPages ?? 1,
                totalItems: threads?.data?.page?.totalElements ?? threads?.data?.totalElements ?? 0,
                onPageChange: (p) => setThreadPage(p),
                onPageSizeChange: (s) => { setThreadSize(s); setThreadPage(1); },
                zeroIndexed: false,
                pageSize: threadSize,
            }}
          />
        </TabsContent>

        {isInstructor && (
          <TabsContent value="REVIEWS" className="mt-0">
            <div className="mb-4">
              <DataFilter
                searchQuery={reviewSearch}
                onSearchChange={setReviewSearch}
                searchPlaceholder="Tìm kiếm nội dung đánh giá..."
                dropdownChecklists={[
                  {
                    title: "Số sao",
                    items: [
                      { label: "5 sao", value: 5 },
                      { label: "4 sao", value: 4 },
                      { label: "3 sao", value: 3 },
                      { label: "2 sao", value: 2 },
                      { label: "1 sao", value: 1 }
                    ],
                    selectedItems: reviewRating,
                    onItemToggle: (val) => setReviewRating(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
                    onClear: () => setReviewRating([])
                  },
                  {
                    title: "Trạng thái",
                    items: [
                      { label: "Hiển thị", value: 1 },
                      { label: "Đã ẩn", value: 0 },
                      { label: "Vi phạm", value: 2 }
                    ],
                    selectedItems: reviewStatus,
                    onItemToggle: (val) => setReviewStatus(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
                    onClear: () => setReviewStatus([])
                  }
                ]}
                dateRange={reviewDateRange}
                onDateRangeChange={setReviewDateRange}
                dateRangePlaceholder="Ngày đánh giá"
              />
            </div>
            <DataTable
              selection={false}
              columns={[
                {
                  header: "STT",
                  width: "70px",
                  className: "text-center",
                  cellClassName: "text-center",
                  render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
                },
                { 
                  header: "Học viên",
                  width: "200px",
                  render: (c) => (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={c.studentAvatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{c.studentName.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm text-foreground">{c.studentName}</span>
                    </div>
                  ) 
                },
                { 
                  header: "Khóa học",
                  width: "250px",
                  render: (c) => (
                    <div className="font-semibold text-foreground line-clamp-2" title={c.courseTitle}>
                      {c.courseTitle}
                    </div>
                  ) 
                },
                {
                  header: "Số sao",
                  width: "120px",
                  className: "text-center",
                  render: (c) => (
                    <div className="flex items-center justify-center text-warning text-lg">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`w-4 h-4 ${idx < c.rating ? "fill-warning" : "fill-muted text-muted"}`} />
                      ))}
                    </div>
                  )
                },
                {
                  header: "Nội dung",
                  width: "250px",
                  render: (c) => <div className="text-sm text-foreground line-clamp-2" title={c.comment}>{c.comment}</div>
                },
                {
                  header: "Ngày đánh giá",
                  width: "140px",
                  className: "text-center",
                  render: (c) => <div className="text-center w-full text-sm text-foreground">{c.createdAt}</div>
                },
                { 
                  header: "Trạng thái", 
                  width: "120px",
                  className: "text-center",
                  render: (c) => {
                    let variant = "success";
                    let label = "Hiển thị";
                    if (c.status === 0) { variant = "secondary"; label = "Đã ẩn"; }
                    else if (c.status === 2) { variant = "error"; label = "Vi phạm"; }
                    return (
                      <div className="text-center w-full flex justify-center">
                        <AppBadge variant={variant} className="w-[80px] justify-center px-2.5 py-1 text-white">
                          {label}
                        </AppBadge>
                      </div>
                    );
                  }
                }
              ]}
              data={reviews?.data?.content || []}
              emptyState="Chưa có đánh giá nào."
              pagination={{
                currentPage: reviewPage,
                totalPages: reviews?.data?.page?.totalPages ?? reviews?.data?.totalPages ?? 1,
                totalItems: reviews?.data?.page?.totalElements ?? reviews?.data?.totalElements ?? 0,
                onPageChange: (p) => setReviewPage(p),
                onPageSizeChange: (s) => { setReviewSize(s); setReviewPage(1); },
                zeroIndexed: false,
                pageSize: reviewSize,
              }}
            />
          </TabsContent>
        )}

        <TabsContent value="ACTIVITY" className="mt-0">
          <DataTable
            selection={false}
            columns={[
              {
                header: "STT",
                width: "70px",
                className: "text-center",
                cellClassName: "text-center",
                render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1 + (activityPage - 1) * activitySize}</div>
              },
              {
                header: "Hành động",
                width: "200px",
                render: (c) => <div className="font-semibold text-foreground whitespace-pre-wrap">{c.action}</div>
              },
              {
                header: "Dữ liệu",
                width: "400px",
                render: (c) => <div className="text-sm text-muted-foreground whitespace-pre-wrap">{c.payload || ""}</div>
              },
              {
                header: "Thời gian",
                width: "180px",
                className: "text-center",
                render: (c) => {
                  if (!c.createdAt) return "-";
                  const d = new Date(c.createdAt);
                  return <div className="text-center w-full text-sm">{d.toLocaleString('vi-VN')}</div>
                }
              }
            ]}
            data={activities?.data?.content || []}
            emptyState="Không có hoạt động nào."
            pagination={{
              currentPage: activityPage,
              totalPages: activities?.data?.page?.totalPages ?? activities?.data?.totalPages ?? 1,
              totalItems: activities?.data?.page?.totalElements ?? activities?.data?.totalElements ?? 0,
              onPageChange: (p) => setActivityPage(p),
              onPageSizeChange: (s) => { setActivitySize(s); setActivityPage(1); },
              zeroIndexed: false,
              pageSize: activitySize,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
