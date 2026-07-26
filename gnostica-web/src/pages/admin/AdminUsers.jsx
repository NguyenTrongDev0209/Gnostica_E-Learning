import React, { useState } from "react";
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

export default function AdminUsers() {
  const {
    activeTab,
    accounts,
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

  const getDocumentList = (app) => {
    const list = [];
    if (!app) return list;
    if (app.idCardFront) {
      list.push({ id: "front", title: "CCCD Mặt trước", url: app.idCardFront, type: "image", icon: CreditCard });
    }
    if (app.idCardBack) {
      list.push({ id: "back", title: "CCCD Mặt sau", url: app.idCardBack, type: "image", icon: CreditCard });
    }
    if (app.cvUrl) {
      list.push({ id: "cv", title: "CV / Resume (PDF)", url: app.cvUrl, type: "pdf", icon: FileText });
    }
    if (app.degreeUrls) {
      app.degreeUrls.split(',').filter(u => u).forEach((url, index) => {
        const isPdf = url.split('?')[0].toLowerCase().endsWith('.pdf');
        list.push({ id: `degree-${index}`, title: `Bằng cấp chuyên môn ${index + 1}`, url: url, type: isPdf ? "pdf" : "image", icon: GraduationCap });
      });
    }
    if (app.certificateUrls) {
      app.certificateUrls.split(',').filter(u => u).forEach((url, index) => {
        const isPdf = url.split('?')[0].toLowerCase().endsWith('.pdf');
        list.push({ id: `cert-${index}`, title: `Chứng chỉ liên quan ${index + 1}`, url: url, type: isPdf ? "pdf" : "image", icon: ShieldCheck });
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

  const filteredAccounts = accounts;

  const accountColumns = [
    {
      header: "STT",
      width: "72px",
      align: "center",
      headerAlign: "center",
      className: "py-4",
      cellClassName: "font-bold text-muted-foreground py-4 text-center",
      render: (_acc, rowIndex) => rowIndex + 1,
    },
    {
      header: "Người dùng",
      className: "py-4",
      align: "left",
      headerAlign: "left",
      cellClassName: "py-4",
      render: (acc) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={acc.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {acc.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{acc.fullName}</span>
            <span className="text-xs text-muted-foreground">{acc.email}</span>
          </div>
        </div>
      )
    },
    {
      header: "Số điện thoại",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium py-4 text-center whitespace-nowrap",
      render: (acc) => acc.phone ? <span className="text-foreground">{acc.phone}</span> : <span className="text-muted-foreground italic text-xs">(Chưa thiết lập)</span>
    },
    {
      header: "Khóa học",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
      render: (acc) => `Đã mua ${acc.courseCount || 0} Khóa học`
    },
    {
      header: "Tổng mua hàng",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "font-bold text-foreground py-4 text-center whitespace-nowrap",
      render: (acc) => (acc.totalSpent || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    },
    {
      header: "Ngày đăng ký",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm text-foreground font-medium py-4 text-center whitespace-nowrap",
      render: (acc) => acc.createdAt ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(acc.createdAt)).replace(/,/, '') : "--"
    },
    {
      header: "Trạng thái",
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
      width: "72px",
      align: "center",
      headerAlign: "center",
      className: "py-4",
      cellClassName: "font-bold text-muted-foreground py-4 text-center",
      render: (_acc, rowIndex) => rowIndex + 1,
    },
    {
      header: "Người dùng",
      className: "py-4",
      align: "left",
      headerAlign: "left",
      cellClassName: "py-4",
      render: (acc) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={acc.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {acc.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{acc.fullName}</span>
            <span className="text-xs text-muted-foreground">{acc.email}</span>
          </div>
        </div>
      )
    },
    {
      header: "Số điện thoại",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium py-4 text-center whitespace-nowrap",
      render: (acc) => acc.phone ? <span className="text-foreground">{acc.phone}</span> : <span className="text-muted-foreground italic text-xs">(Chưa thiết lập)</span>
    },
    {
      header: "Khóa học",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
      render: (acc) => `Đã tạo ${acc.courseCount || 0} Khóa học`
    },
    {
      header: "Doanh thu",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      cellClassName: "font-bold text-primary py-4 text-center whitespace-nowrap",
      render: (acc) => (acc.totalRevenue || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    },
    {
      header: "Ngày đăng ký",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm text-foreground font-medium py-4 text-center whitespace-nowrap",
      render: (acc) => acc.createdAt ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(acc.createdAt)).replace(/,/, '') : "--"
    },
    {
      header: "Trạng thái",
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

  const applicationColumns = [
    {
      header: "STT",
      width: "72px",
      align: "center",
      headerAlign: "center",
      className: "py-4",
      cellClassName: "font-bold text-muted-foreground py-4 text-center",
      render: (_app, rowIndex) => rowIndex + 1,
    },
    {
      header: "Người dùng",
      align: "left",
      headerAlign: "left",
      className: "py-4",
      cellClassName: "py-4",
      render: (app) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{app.fullName}</span>
          <span className="text-xs text-muted-foreground">{app.email}</span>
          {app.contactPhone && <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" /> {app.contactPhone}</span>}
        </div>
      )
    },
    {
      header: "Chi tiết Hồ sơ",
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
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "text-sm text-muted-foreground font-medium py-4 text-center whitespace-nowrap",
      render: (app) => app.createdAt ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(app.createdAt)).replace(/,/, '') : "--"
    },
    {
      header: "Thao tác",
      align: "center",
      headerAlign: "center",
      className: "py-4 whitespace-nowrap",
      width: "1%",
      cellClassName: "py-4 text-center whitespace-nowrap",
      render: (app) => (
        <div className="flex justify-center items-center gap-2">
          <AppButton appVariant="ghostMuted" variant="ghost"
            size="sm"
            className="border border-success/20 text-success hover:bg-success/10 bg-white font-bold"
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
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
        <Tabs value={activeTab} className="w-full">
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
              data={filteredAccounts}
              isLoading={loading}
              rowClassName={(acc) => acc.status === 2 ? "bg-error/5 hover:bg-error/10" : ""}
              emptyState="Không tìm thấy người dùng nào."
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: filteredAccounts.length,
                onPageChange: () => { },
                zeroIndexed: false,
                pageSize: filteredAccounts.length || 10,
              }}
            />
          </TabsContent>

          <TabsContent value="INSTRUCTOR" className="mt-0">
            <DataTable
              columns={instructorColumns}
              data={filteredAccounts}
              isLoading={loading}
              rowClassName={(acc) => acc.status === 2 ? "bg-error/5 hover:bg-error/10" : ""}
              emptyState="Không tìm thấy người dùng nào."
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: filteredAccounts.length,
                onPageChange: () => { },
                zeroIndexed: false,
                pageSize: filteredAccounts.length || 10,
              }}
            />
          </TabsContent>

          <TabsContent value="PENDING_APP" className="mt-0">
            <DataTable
              columns={applicationColumns}
              data={applications}
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
                    className="h-10 px-5 border border-success/20 text-success hover:bg-success/10 bg-white font-extrabold text-sm"
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
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatus, setCourseStatus] = useState([]);
  const [courseDateRange, setCourseDateRange] = useState({ from: undefined, to: undefined });
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

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

  // Mock data for UI testing
  const mockCourses = [
    { id: 1, title: "React.js Từ Cơ Bản Đến Nâng Cao - Trở Thành Lập Trình Viên Chuyên Nghiệp Thực Chiến Cùng Đội Ngũ", instructor: "Lê Quốc Minh", orderId: "ORD-98231", enrollDate: "14:30 15/07/2026", progress: 85, thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80", status: "Đang học" },
    { id: 2, title: "Spring Boot 3 & Microservices", instructor: "Phạm Văn Nam", orderId: "ORD-98105", enrollDate: "09:15 10/06/2026", progress: 100, thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80", status: "Hoàn thành" },
    { id: 3, title: "Lập trình C++ căn bản", instructor: "Trần Thế Tuấn", orderId: "ORD-97554", enrollDate: "10:00 25/07/2026", progress: 12, thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=400&q=80", status: "Đang học" },
  ];

  const mockInstructorCourses = [
    { id: 1, title: "React.js Từ Cơ Bản Đến Nâng Cao - Trở Thành Lập Trình Viên Chuyên Nghiệp Thực Chiến Cùng Đội Ngũ", thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80", price: 1899000, discount: 15, studentCount: 1542, revenue: 250000000, createdAt: "10:30 01/05/2025", status: 3 },
    { id: 2, title: "Next.js 14 Thực Chiến Kèm Dự Án Thực Tế (E-Commerce)", thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80", price: 2100000, discount: 0, studentCount: 856, revenue: 179760000, createdAt: "14:15 12/08/2025", status: 3 },
    { id: 3, title: "Khóa học TypeScript Chuyên Sâu Cùng React", thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=400&q=80", price: 950000, discount: 20, studentCount: 0, revenue: 0, createdAt: "09:00 20/07/2026", status: 2 },
  ];

  const mockIncomes = [
    { id: "ORD-123", courseTitle: "React.js Từ Cơ Bản Đến Nâng Cao", studentName: "Trần Văn A", studentAvatar: "https://github.com/shadcn.png", price: 1899000, instructorRatio: 70, createdAt: "10:30 15/07/2026", status: 1 },
    { id: "ORD-124", courseTitle: "Next.js 14 Thực Chiến Kèm Dự Án Thực Tế", studentName: "Nguyễn Thị B", studentAvatar: "", price: 2100000, instructorRatio: 70, createdAt: "14:15 14/07/2026", status: 1 },
    { id: "ORD-125", courseTitle: "React.js Từ Cơ Bản Đến Nâng Cao", studentName: "Lê Văn C", studentAvatar: "", price: 1899000, instructorRatio: 70, createdAt: "09:00 13/07/2026", status: 0 },
    { id: "ORD-126", courseTitle: "Next.js 14 Thực Chiến Kèm Dự Án Thực Tế", studentName: "Phạm Thị D", studentAvatar: "https://github.com/shadcn.png", price: 2100000, instructorRatio: 70, createdAt: "11:20 12/07/2026", status: 1 },
  ];

  const mockPayouts = [
    { id: "PO-78921", accountBank: "Vietcombank - 0123456789", amount: 15000000, createdAt: "09:00 20/07/2026", status: 3 }, // 1: Chờ duyệt, 2: Đang chuyển, 3: Hoàn tất, 4: Lỗi, 5: Từ chối
    { id: "PO-78922", accountBank: "Techcombank - 1903456789", amount: 5000000, createdAt: "10:15 22/07/2026", status: 1 },
    { id: "PO-78923", accountBank: "MB Bank - 0987654321", amount: 10000000, createdAt: "14:30 24/07/2026", status: 5 },
  ];

  const mockReviews = [
    { id: "REV-1", courseTitle: "React.js Từ Cơ Bản Đến Nâng Cao", studentName: "Trần Văn A", studentAvatar: "https://github.com/shadcn.png", rating: 5, comment: "Khóa học rất chi tiết và dễ hiểu, giảng viên hỗ trợ nhiệt tình.", createdAt: "15:00 25/07/2026", status: 1 }, // 0: Ẩn, 1: Hiển thị, 2: Vi phạm
    { id: "REV-2", courseTitle: "Next.js 14 Thực Chiến Kèm Dự Án Thực Tế", studentName: "Nguyễn Thị B", studentAvatar: "", rating: 4, comment: "Nội dung tốt nhưng video hơi nhỏ, cần cải thiện âm thanh.", createdAt: "09:30 20/07/2026", status: 1 },
    { id: "REV-3", courseTitle: "React.js Từ Cơ Bản Đến Nâng Cao", studentName: "Lê Văn C", studentAvatar: "", rating: 1, comment: "Nội dung spam, không liên quan.", createdAt: "11:15 18/07/2026", status: 2 },
    { id: "REV-4", courseTitle: "Khóa học TypeScript Chuyên Sâu", studentName: "Phạm Thị D", studentAvatar: "https://github.com/shadcn.png", rating: 5, comment: "Rất hay, cảm ơn giảng viên.", createdAt: "16:45 10/07/2026", status: 1 },
  ];

  const mockChapters = {
    1: [
      { id: 101, title: "Chương 1: Mở đầu", progress: 100, completedDate: "17:35 16/07/2026", status: "Hoàn thành", lessons: [
          { id: 1001, title: "Bài 1: Giới thiệu khóa học", duration: "05:20", progress: 100, completedDate: "14:50 15/07/2026", status: "Hoàn thành" },
          { id: 1002, title: "Bài 2: Cài đặt môi trường", duration: "12:15", progress: 100, completedDate: "17:35 16/07/2026", status: "Hoàn thành" },
      ] },
      { id: 102, title: "Chương 2: React Core", progress: 50, completedDate: null, status: "Đang học", lessons: [
          { id: 1003, title: "Bài 3: JSX cơ bản", duration: "08:45", progress: 100, completedDate: "20:10 18/07/2026", status: "Hoàn thành" },
          { id: 1004, title: "Bài 4: State và Props", duration: "15:30", progress: 0, completedDate: null, status: "Chưa học" },
      ] }
    ],
    2: [
      { id: 201, title: "Chương 1: Tổng quan Spring Boot", progress: 100, completedDate: "12:00 12/06/2026", status: "Hoàn thành", lessons: [
          { id: 2001, title: "Bài 1: Khởi tạo project với Spring Initializr", duration: "10:00", progress: 100, completedDate: "12:00 12/06/2026", status: "Hoàn thành" },
      ]}
    ]
  };

  const mockOrders = [
    { id: "ORD-98231", date: "14:30 15/07/2026", type: "Mua hàng", amount: 1599000, method: "VNPay", status: "Thành công", coupon: "SUMMER30", couponDiscount: 150000 },
    { id: "ORD-98105", date: "09:15 02/07/2026", type: "Quà tặng", amount: 850000, method: "Chuyển khoản", status: "Thành công", couponDiscount: 0, recipient: { name: "Nguyễn Văn A", email: "nva@gmail.com", avatar: "https://github.com/shadcn.png" } },
  ];

  const mockOrderDetails = {
    "ORD-98231": [
      { id: 1, courseName: "React.js Từ Cơ Bản Đến Nâng Cao - Trở Thành Lập Trình Viên Chuyên Nghiệp Thực Chiến Cùng Đội Ngũ", thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80", instructor: "Lê Quốc Minh", price: 1899000, discount: 150000, couponDiscount: 150000, finalPrice: 1599000, platformFeeRate: 30 }
    ],
    "ORD-98105": [
      { id: 2, courseName: "Spring Boot 3 & Microservices", thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80", instructor: "Phạm Văn Nam", price: 1000000, discount: 150000, couponDiscount: 0, finalPrice: 850000, platformFeeRate: 30 }
    ]
  };

  const mockPosts = [
    { id: 1, topic: "Hỏi đáp Lập trình", title: "Lỗi CORS khi gọi API từ React sang Spring Boot?", views: 120, shares: 2, date: "15:45 24/07/2026", likes: 12, comments: 5, status: 2 },
    { id: 2, topic: "Chia sẻ kinh nghiệm", title: "Chia sẻ lộ trình học Backend Java cho người mới", views: 540, shares: 10, date: "20:00 10/07/2026", likes: 45, comments: 18, status: 2 },
    { id: 3, topic: "Thảo luận chung", title: "Cần tìm đồng đội làm dự án cuối kỳ môn Web", views: 56, shares: 0, date: "09:15 05/07/2026", likes: 3, comments: 1, status: 0 },
    { id: 4, topic: "Hỏi đáp Lập trình", title: "Cách cài đặt biến môi trường trong Windows 11", views: 320, shares: 1, date: "14:20 01/07/2026", likes: 15, comments: 8, status: 3 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-10">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <AppButton variant="outline" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Trở lại
        </AppButton>
        <h2 className="text-xl font-bold">Chi tiết người dùng</h2>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <Avatar className="w-24 h-24 border-4 border-background shadow-md">
            <AvatarImage src={user.profilePicture || "https://github.com/shadcn.png"} alt={user.fullName} />
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
                {new Intl.NumberFormat('vi-VN').format(user.totalSpent || mockOrders.reduce((sum, o) => sum + o.amount, 0))} đ
              </span>
              <span className="text-muted-foreground">{isInstructor ? "Khóa học đã tạo:" : "Khóa học đã mua:"}</span>
              <span className="font-medium">{user.coursesPurchased || mockCourses.length} Khóa học</span>
              <span className="text-muted-foreground">Số dư:</span>
              <span className="font-bold text-success">
                {new Intl.NumberFormat('vi-VN').format(user.balance || 150000)} đ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="COURSES" className="w-full pt-4">
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
            mockInstructorCourses.length > 0 ? (
              <DataTable
                columns={[
                  {
                    header: "STT",
                    width: "70px",
                    className: "text-center",
                    cellClassName: "text-center",
                    render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
                  },
                  { 
                    header: "Khóa học",
                    width: "350px",
                    render: (c) => (
                      <div className="flex items-center gap-3">
                        <img src={c.thumbnail} alt={c.title} className="w-16 h-10 object-cover rounded border border-border shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground line-clamp-2" title={c.title}>
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
                    render: (c) => <div className="text-center w-full text-sm text-foreground">{c.createdAt}</div>
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
                data={mockInstructorCourses}
                emptyState="Chưa có khóa học nào."
                pagination={{
                  currentPage: 1,
                  totalPages: 1,
                  totalItems: mockInstructorCourses.length,
                  onPageChange: () => { },
                  zeroIndexed: false,
                  pageSize: mockInstructorCourses.length || 10,
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
            mockCourses.length > 0 ? (
              <DataTable
                columns={[
                  {
                    header: "STT",
                    width: "70px",
                    className: "text-center",
                    cellClassName: "text-center",
                    render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
                  },
                  { 
                    header: "Khóa học",
                    width: "300px",
                    render: (c) => (
                      <div className="flex items-center gap-3">
                        <img src={c.thumbnail} alt={c.title} className="w-16 h-10 object-cover rounded border border-border shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground line-clamp-1" title={c.title}>
                            {c.title}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">Giảng viên: {c.instructor}</span>
                        </div>
                      </div>
                    ) 
                  },
                  {
                    header: "Mã đơn hàng",
                    width: "160px",
                    className: "text-center",
                    render: (c) => <div className="text-center w-full font-bold text-foreground">{c.orderId}</div>
                  },
                  {
                    header: "Ngày đăng ký",
                    width: "120px",
                    className: "text-center",
                    render: (c) => <div className="text-center w-full text-sm text-foreground">{c.enrollDate}</div>
                  },
                  { 
                    header: "Tiến độ", 
                    width: "200px",
                    className: "text-center",
                    render: (c) => (
                      <div className="w-full max-w-[150px] mx-auto">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
                          <span className={c.progress === 100 ? "text-success" : "text-primary"}>{c.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden text-left">
                          <div className={`h-full rounded-full transition-all ${c.progress === 100 ? "bg-success" : "bg-primary"}`} style={{ width: `${c.progress}%` }}></div>
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
                        <AppBadge variant={c.progress === 100 ? "success" : "info"} className="w-[100px] justify-center px-2.5 py-1 text-white">
                          {c.status}
                        </AppBadge>
                      </div>
                    ) 
                  }
                ]}
                data={mockCourses}
                emptyState="Chưa có khóa học nào."
                pagination={{
                  currentPage: 1,
                  totalPages: 1,
                  totalItems: mockCourses.length,
                  onPageChange: () => { },
                  zeroIndexed: false,
                  pageSize: mockCourses.length || 10,
                }}
                onRowClick={(row) => setExpandedCourseId(row.id === expandedCourseId ? null : row.id)}
                renderExpandedRow={(course) => {
                  if (expandedCourseId !== course.id) return null;
                  const chapters = mockChapters[course.id] || [];
                  
                  return (
                    <TableRow className="bg-muted/10 border-b border-border/50 hover:bg-muted/10">
                      <TableCell colSpan={6} className="p-0 border-l-4 border-l-primary">
                        <div className="flex flex-col w-full">
                          <h5 className="font-semibold text-sm py-4 text-center">Chi tiết tiến độ</h5>
                          {chapters.length > 0 ? (
                            <DataTable 
                              className="border-0 shadow-none rounded-none"
                              columns={[
                                { 
                                  header: "STT", 
                                  width: "70px", 
                                  className: "text-center",
                                  cellClassName: "text-center", 
                                  render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div> 
                                },
                                { header: "Chương", width: "220px", render: (ch) => <div className="font-medium truncate text-foreground text-sm" title={ch.title}>{ch.title}</div> },
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
                                { header: "Ngày hoàn thành", width: "160px", className: "text-center", render: (ch) => <div className="text-center w-full text-sm text-foreground">{ch.completedDate || <span className="italic text-muted-foreground">(Chưa hoàn thành)</span>}</div> },
                                { header: "Tiến độ", width: "150px", className: "text-center", render: (ch) => (
                                  <div className="w-full mx-auto">
                                    <div className="flex justify-between text-sm mb-1 font-semibold text-foreground">
                                      <span className={ch.progress === 100 ? "text-success" : "text-primary"}>{ch.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${ch.progress === 100 ? "bg-success" : "bg-primary"}`} style={{ width: `${ch.progress || 0}%` }}></div>
                                    </div>
                                  </div>
                                )},
                                { header: "Trạng thái", width: "140px", className: "text-center", render: (ch) => (
                                  <div className="text-center w-full flex justify-center">
                                    <AppBadge variant={ch.progress === 100 ? "success" : (ch.progress > 0 ? "info" : "secondary")} className="w-[100px] justify-center px-2.5 py-1 text-white">
                                      {ch.status}
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
                                        <TableCell className="py-2 text-center text-xs text-muted-foreground/70" style={{ width: "70px", minWidth: "70px", maxWidth: "70px" }}>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-left" style={{ width: "220px", minWidth: "220px", maxWidth: "220px" }}>
                                          <div className="text-sm font-medium text-foreground flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0"></div>
                                            <span className="truncate" title={lesson.title}>{lesson.title}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-center" style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}>
                                          <span className="text-foreground text-sm font-medium">{lesson.duration}</span>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-center" style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}></TableCell>
                                        <TableCell className="py-2 px-4 text-center" style={{ width: "160px", minWidth: "160px", maxWidth: "160px" }}>
                                          <span className="text-foreground text-sm">{lesson.completedDate || <span className="italic text-muted-foreground">(Chưa hoàn thành)</span>}</span>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-center" style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
                                          <div className="w-full mx-auto">
                                            <div className="flex justify-between text-sm mb-1 font-semibold text-foreground">
                                              <span className={lesson.progress === 100 ? "text-success" : "text-primary"}>{lesson.progress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                              <div className={`h-full rounded-full ${lesson.progress === 100 ? "bg-success" : "bg-primary"}`} style={{ width: `${lesson.progress || 0}%` }}></div>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-center" style={{ width: "140px", minWidth: "140px", maxWidth: "140px" }}>
                                          <div className="flex justify-center w-full">
                                            <AppBadge variant={lesson.progress === 100 ? "success" : (lesson.progress > 0 ? "info" : "secondary")} className="w-[100px] justify-center px-2.5 py-1 text-white">
                                              {lesson.status}
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
            columns={[
              {
                header: "STT",
                width: "70px",
                className: "text-center",
                cellClassName: "text-center",
                render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
              },
              { header: "Mã đơn hàng", width: "160px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-bold text-foreground">{o.id}</span></div> },
              { header: "Phân loại", width: "120px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-medium text-foreground">{o.type || "Mua hàng"}</span></div> },
              { header: "Ngày giao dịch", width: "160px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="text-foreground text-sm font-medium">{o.date}</span></div> },
              { header: "Phương thức", width: "140px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-medium">{o.method}</span></div> },
              { header: "Mã giảm", width: "120px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-medium text-foreground">{o.coupon || "--"}</span></div> },
              { header: "Giảm Coupon", width: "140px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-medium text-error">-{new Intl.NumberFormat('vi-VN').format(o.couponDiscount || 0)} đ</span></div> },
              { header: "Tổng tiền", width: "160px", className: "text-center", render: (o) => <div className="text-center w-full"><span className="font-bold text-primary">{new Intl.NumberFormat('vi-VN').format(o.amount)} đ</span></div> },
              { header: "Trạng thái", width: "140px", className: "text-center", render: (o) => (
                  <div className="text-center w-full flex justify-center">
                    <AppBadge variant={o.status === "Thành công" ? "success" : (o.status === "Thất bại" ? "error" : "warning")} className="w-[100px] justify-center px-2.5 py-1 text-white">
                      {o.status}
                    </AppBadge>
                  </div>
                ) 
              }
            ]}
            data={mockOrders}
            emptyState="Không có lịch sử giao dịch nào."
            pagination={{
              currentPage: 1,
              totalPages: 1,
              totalItems: mockOrders.length,
              onPageChange: () => { },
              zeroIndexed: false,
              pageSize: mockOrders.length || 10,
            }}
            onRowClick={(row) => setExpandedOrderId(row.id === expandedOrderId ? null : row.id)}
            renderExpandedRow={(order) => {
              if (expandedOrderId !== order.id) return null;
              const details = mockOrderDetails[order.id] || [];
              
              return (
                <TableRow className="bg-muted/10 border-b border-border/50 hover:bg-muted/10">
                  <TableCell colSpan={9} className="p-0 border-l-4 border-l-primary">
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
                          className="border-0 shadow-none rounded-none"
                          columns={[
                            { header: "Khóa học", width: "350px", className: "pl-6", render: (d) => (
                              <div className="flex items-center gap-3 pl-6">
                                <img src={d.thumbnail} alt={d.courseName} className="w-16 h-10 object-cover rounded border border-border shrink-0" />
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground line-clamp-1" title={d.courseName}>
                                    {d.courseName.length > 50 ? d.courseName.substring(0, 50) + '...' : d.courseName}
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-0.5">Giảng viên: {d.instructor}</span>
                                </div>
                              </div>
                            )},
                            { header: "Giá gốc", width: "150px", className: "text-center", render: (d) => <div className="text-center w-full text-muted-foreground line-through text-sm">{new Intl.NumberFormat('vi-VN').format(d.price)} đ</div> },
                            { header: "Khuyến mãi", width: "150px", className: "text-center", render: (d) => <div className="text-center w-full text-error font-medium text-sm">-{new Intl.NumberFormat('vi-VN').format(d.discount)} đ</div> },
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
              columns={[
                {
                  header: "STT",
                  width: "70px",
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
                  render: (c) => <div className="text-center w-full text-sm text-foreground">{c.createdAt}</div>
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
              data={mockIncomes}
              emptyState="Chưa có thu nhập nào."
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: mockIncomes.length,
                onPageChange: () => { },
                zeroIndexed: false,
                pageSize: mockIncomes.length || 10,
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
              columns={[
                {
                  header: "STT",
                  width: "70px",
                  className: "text-center",
                  cellClassName: "text-center",
                  render: (_, idx) => <div className="text-center w-full text-foreground font-semibold text-sm">{idx + 1}</div>
                },
                { 
                  header: "Mã GD",
                  width: "160px",
                  className: "text-center",
                  render: (c) => <div className="text-center w-full font-bold text-foreground">{c.id}</div>
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
                  render: (c) => <div className="text-center w-full text-sm text-foreground">{c.createdAt}</div>
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
              data={mockPayouts}
              emptyState="Chưa có yêu cầu rút tiền nào."
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: mockPayouts.length,
                onPageChange: () => { },
                zeroIndexed: false,
                pageSize: mockPayouts.length || 10,
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
            columns={[
              {
                header: "STT",
                width: "70px",
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
            data={mockPosts}
            emptyState={isInstructor ? "Không có chủ đề nào." : "Không có bài viết nào."}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              totalItems: mockPosts.length,
              onPageChange: () => { },
              zeroIndexed: false,
              pageSize: mockPosts.length || 10,
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
              data={mockReviews}
              emptyState="Chưa có đánh giá nào."
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: mockReviews.length,
                onPageChange: () => { },
                zeroIndexed: false,
                pageSize: mockReviews.length || 10,
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
