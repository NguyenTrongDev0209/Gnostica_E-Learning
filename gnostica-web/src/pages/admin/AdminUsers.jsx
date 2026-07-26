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
  PlayCircle
} from "lucide-react";
import DataTable from "@/components/common/composite/DataTable";
import AppTable, { TableRow, TableCell } from "@/components/common/micro/AppTable";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
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
      cellClassName: "text-sm font-medium text-muted-foreground py-4 text-center whitespace-nowrap",
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
      cellClassName: "text-sm text-muted-foreground font-medium py-4 text-center whitespace-nowrap",
      render: (acc) => acc.createdAt ? new Date(acc.createdAt).toLocaleDateString("vi-VN") : "--"
    },
    {
      header: "Trạng thái",
      align: "center",
      headerAlign: "center",
      width: "1%",
      className: "py-4 whitespace-nowrap",
      cellClassName: "py-4 whitespace-nowrap",
      render: (acc) => (
        acc.status === 2 ? (
          <AppBadge variant="error">Bị khóa</AppBadge>
        ) : acc.status === 1 ? (
          <AppBadge variant="success">Hoạt động</AppBadge>
        ) : (
          <AppBadge variant="secondary" className="text-muted-foreground">Chưa xác thực</AppBadge>
        )
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
      render: (app) => app.createdAt ? new Date(app.createdAt).toLocaleDateString("vi-VN") : "--"
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
              <DataFilterPriceRange
                title="Giao dịch"
                min={0}
                max={10000000}
                step={50000}
                value={priceRange}
                onValueChange={setPriceRange}
                onClear={() => setPriceRange([0, 10000000])}
              />
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
        <AdminUserDetail user={selectedUserDetail} onBack={() => setSelectedUserDetail(null)} />
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

function AdminUserDetail({ user, onBack }) {
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatus, setCourseStatus] = useState([]);
  const [courseDateRange, setCourseDateRange] = useState({ from: undefined, to: undefined });
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedChapterId, setExpandedChapterId] = useState(null);

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState([]);
  const [orderDateRange, setOrderDateRange] = useState({ from: undefined, to: undefined });

  const [postSearch, setPostSearch] = useState("");
  const [postDateRange, setPostDateRange] = useState({ from: undefined, to: undefined });

  if (!user) return null;

  // Mock data for UI testing
  const mockCourses = [
    { id: 1, title: "React.js Từ Cơ Bản Đến Nâng Cao - Trở Thành Lập Trình Viên Chuyên Nghiệp Thực Chiến Cùng Đội Ngũ", instructor: "Lê Quốc Minh", orderId: "ORD-98231", enrollDate: "15/07/2026", progress: 85, thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80", status: "Đang học" },
    { id: 2, title: "Spring Boot 3 & Microservices", instructor: "Phạm Văn Nam", orderId: "ORD-98105", enrollDate: "10/06/2026", progress: 100, thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80", status: "Hoàn thành" },
    { id: 3, title: "Lập trình C++ căn bản", instructor: "Trần Thế Tuấn", orderId: "ORD-97554", enrollDate: "25/07/2026", progress: 12, thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=400&q=80", status: "Đang học" },
  ];

  const mockChapters = {
    1: [
      { id: 101, title: "Chương 1: Mở đầu", lessons: [
          { id: 1001, title: "Bài 1: Giới thiệu khóa học", duration: "05:20" },
          { id: 1002, title: "Bài 2: Cài đặt môi trường", duration: "12:15" },
      ] },
      { id: 102, title: "Chương 2: React Core", lessons: [
          { id: 1003, title: "Bài 3: JSX cơ bản", duration: "08:45" },
          { id: 1004, title: "Bài 4: State và Props", duration: "15:30" },
      ] }
    ],
    2: [
      { id: 201, title: "Chương 1: Tổng quan Spring Boot", lessons: [
          { id: 2001, title: "Bài 1: Khởi tạo project với Spring Initializr", duration: "10:00" },
      ]}
    ]
  };

  const mockOrders = [
    { id: "ORD-98231", date: "15/07/2026", amount: 1599000, method: "VNPay", status: "Thành công" },
    { id: "ORD-98105", date: "02/07/2026", amount: 850000, method: "Chuyển khoản", status: "Thành công" },
  ];

  const mockPosts = [
    { id: 1, title: "Lỗi CORS khi gọi API từ React sang Spring Boot?", date: "24/07/2026", likes: 12, comments: 5 },
    { id: 2, title: "Chia sẻ lộ trình học Backend Java cho người mới", date: "10/07/2026", likes: 45, comments: 18 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
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
                {user.createdAt ? new Intl.DateTimeFormat('vi-VN').format(new Date(user.createdAt)) : "Không xác định"}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Hoạt động mua hàng</h4>
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-muted-foreground">Tổng mua hàng:</span>
              <span className="font-bold text-primary">
                {new Intl.NumberFormat('vi-VN').format(user.totalSpent || mockOrders.reduce((sum, o) => sum + o.amount, 0))} đ
              </span>
              <span className="text-muted-foreground">Khóa học đã mua:</span>
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
          <TabsTrigger value="ORDERS" className="gap-2"><CreditCard className="w-4 h-4" /> Đơn hàng</TabsTrigger>
          <TabsTrigger value="POSTS" className="gap-2"><FileText className="w-4 h-4" /> Bài viết</TabsTrigger>
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
                  items: [
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
              dateRangePlaceholder="Ngày đăng ký"
            />
          </div>
          {mockCourses.length > 0 ? (
            <DataTable
              columns={[
                {
                  header: "STT",
                  width: "60px",
                  className: "text-center",
                  render: (_, idx) => <div className="text-center w-full text-muted-foreground font-semibold">{idx + 1}</div>
                },
                { 
                  header: "Khóa học",
                  width: "300px",
                  render: (c) => (
                    <div className="flex items-center gap-3">
                      <img src={c.thumbnail} alt={c.title} className="w-16 h-10 object-cover rounded border border-border shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground" title={c.title}>
                          {c.title.length > 50 ? c.title.substring(0, 50) + "..." : c.title}
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
                  render: (c) => <div className="text-center w-full text-sm text-muted-foreground">{c.enrollDate}</div>
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
                    <div className="text-center w-full">
                      <AppBadge variant={c.progress === 100 ? "success" : "info"} className="gap-1.5 px-2.5 py-1 text-white">
                        {c.progress === 100 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
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
                    <TableCell colSpan={6} className="p-4 border-l-4 border-l-primary">
                      <div className="pl-4">
                        <h5 className="font-semibold text-sm mb-3">Nội dung khóa học: {course.title}</h5>
                        {chapters.length > 0 ? (
                          <DataTable 
                            columns={[
                              { header: "Chương", render: (ch) => <span className="font-medium">{ch.title}</span> },
                              { header: "Số bài học", width: "120px", className: "text-center", render: (ch) => <div className="text-center w-full text-muted-foreground text-sm">{ch.lessons.length} bài</div> }
                            ]}
                            data={chapters}
                            pagination={false}
                            onRowClick={(ch) => setExpandedChapterId(ch.id === expandedChapterId ? null : ch.id)}
                            renderExpandedRow={(chapter) => {
                              if (expandedChapterId !== chapter.id) return null;
                              return (
                                <TableRow className="bg-background hover:bg-background">
                                  <TableCell colSpan={2} className="p-3 border-l-4 border-l-secondary pl-6">
                                    <div className="space-y-1">
                                      {chapter.lessons.map(lesson => (
                                        <div key={lesson.id} className="flex justify-between items-center text-sm py-2 px-3 hover:bg-muted/50 rounded transition-colors cursor-default">
                                          <span className="font-medium text-muted-foreground hover:text-foreground transition-colors">{lesson.title}</span>
                                          <span className="text-muted-foreground text-xs">{lesson.duration}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            }}
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground italic">Chưa có nội dung chương học.</div>
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
            />
          </div>
          <DataTable
            columns={[
              { header: "Mã đơn hàng", render: (o) => <span className="font-bold text-foreground">{o.id}</span> },
              { header: "Ngày giao dịch", render: (o) => <span className="text-muted-foreground">{o.date}</span> },
              { header: "Thanh toán", render: (o) => <span className="font-medium">{o.method}</span> },
              { header: "Tổng tiền", render: (o) => <span className="font-bold text-primary">{new Intl.NumberFormat('vi-VN').format(o.amount)} đ</span> },
              { header: "Trạng thái", width: "120px", render: (o) => <AppBadge variant="success" soft>{o.status}</AppBadge> },
              {
                header: "Thao tác",
                width: "100px",
                className: "text-right",
                render: () => (
                  <AppButton size="sm" className="w-8 h-8 p-0 bg-info hover:bg-info/90 text-white border-none shrink-0" title="Tùy chọn">
                    <MoreHorizontal className="w-4 h-4" />
                  </AppButton>
                )
              }
            ]}
            data={mockOrders}
            emptyState="Không có lịch sử giao dịch nào."
            pagination={false}
          />
        </TabsContent>
        
        <TabsContent value="POSTS" className="mt-0">
          <div className="mb-4">
            <DataFilter
              searchQuery={postSearch}
              onSearchChange={setPostSearch}
              searchPlaceholder="Tìm kiếm bài viết..."
              dateRange={postDateRange}
              onDateRangeChange={setPostDateRange}
              dateRangePlaceholder="Khoảng thời gian đăng"
            />
          </div>
          <DataTable
            columns={[
              { 
                header: "Bài viết", 
                render: (p) => (
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground line-clamp-1">{p.title}</span>
                  </div>
                ) 
              },
              { 
                header: "Ngày đăng", 
                width: "120px",
                render: (p) => <span className="text-muted-foreground text-sm">{p.date}</span> 
              },
              { 
                header: "Tương tác", 
                width: "150px",
                render: (p) => (
                  <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="text-error">♥</span> {p.likes}</span>
                    <span className="flex items-center gap-1"><span className="text-info">💬</span> {p.comments}</span>
                  </div>
                ) 
              },
              {
                header: "Thao tác",
                width: "100px",
                className: "text-right",
                render: () => (
                  <AppButton size="sm" className="w-8 h-8 p-0 bg-info hover:bg-info/90 text-white border-none shrink-0" title="Tùy chọn">
                    <MoreHorizontal className="w-4 h-4" />
                  </AppButton>
                )
              }
            ]}
            data={mockPosts}
            emptyState="Không có bài viết nào."
            pagination={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
