import React from "react";
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
  X
} from "lucide-react";
import DataTable from "@/components/common/composite/DataTable";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
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
    // eslint-disable-next-line no-unused-vars
    activeTab,
    setActiveTab,
    accounts,
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
      header: "Người dùng",
      className: "w-[300px]",
      align: "left",
      headerAlign: "left",
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
      header: "Trạng thái",
      align: "center",
      headerAlign: "center",
      render: (acc) => (
        acc.status === 2 ? (
          <AppBadge className="bg-error/10 text-error shadow-none border-error/20">Bị khóa</AppBadge>
        ) : acc.status === 1 ? (
          <AppBadge className="bg-success/10 text-success shadow-none border-success/20">Hoạt động</AppBadge>
        ) : (
          <AppBadge variant="outline" className="text-muted-foreground">Chưa xác thực</AppBadge>
        )
      )
    },
    {
      header: "Nơi đăng ký",
      align: "center",
      headerAlign: "center",
      cellClassName: "text-sm font-medium text-muted-foreground",
      render: (acc) => <AppBadge variant="secondary" className="font-bold">{acc.provider || "Manual"}</AppBadge>
    },
    {
      header: "Điện thoại",
      align: "center",
      headerAlign: "center",
      cellClassName: "text-sm text-muted-foreground font-medium",
      render: (acc) => acc.phone || "--"
    },
    {
      header: "Thao tác",
      align: "right",
      headerAlign: "right",
      render: (acc) => (
        <div className="flex justify-end items-center gap-2">
          {acc.status === 2 ? (
            <AppButton appVariant="gradient"
              size="sm"
              className={`h-9 font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none`}
              onClick={() => handleToggleLock(acc)}
            >
              <Unlock className="w-4 h-4" /> Mở khóa
            </AppButton>
          ) : (
            <AppButton appVariant="ghostMuted" variant="ghost"
              size="sm"
              className={`h-9 font-bold gap-2 border border-error/20 text-error hover:bg-red-50 hover:text-error bg-white`}
              onClick={() => handleToggleLock(acc)}
            >
              <Lock className="w-4 h-4" /> Khóa
            </AppButton>
          )}
        </div>
      )
    }
  ];

  const applicationColumns = [
    {
      header: "Người dùng",
      align: "left",
      headerAlign: "left",
      render: (app) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{app.fullName}</span>
          <span className="text-xs text-muted-foreground">{app.email}</span>
        </div>
      )
    },
    {
      header: "Liên hệ",
      align: "center",
      headerAlign: "center",
      cellClassName: "text-sm font-medium text-muted-foreground",
      render: (app) => app.contactPhone
    },
    {
      header: "Chi tiết Hồ sơ",
      align: "center",
      headerAlign: "center",
      cellClassName: "text-sm",
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
      header: "Thao tác",
      align: "right",
      headerAlign: "right",
      render: (app) => (
        <div className="flex justify-end items-center gap-2">
          <AppButton appVariant="ghostMuted" variant="ghost"
            size="sm"
            className="border border-success/20 text-success hover:bg-green-50 bg-white font-bold"
            onClick={() => handleApprove(app.accountId)}
          >
            Phê duyệt
          </AppButton>
          <AppButton appVariant="ghostMuted" variant="ghost"
            size="sm"
            className="border border-error/20 text-error hover:bg-red-50 bg-white font-bold"
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

      <Tabs defaultValue="USER" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <TabsList className="bg-secondary p-1">
            <TabsTrigger value="USER" className="font-bold">Học viên</TabsTrigger>
            <TabsTrigger value="INSTRUCTOR" className="font-bold">Giảng viên</TabsTrigger>
            <TabsTrigger value="PENDING_APP" className="font-bold">Chờ duyệt</TabsTrigger>
          </TabsList>

          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <AppInput
                placeholder="Tìm kiếm..."
                className="pl-9 h-10 border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <AppButton appVariant="ghostMuted" variant="ghost" className="h-10 px-3 flex items-center gap-2 border border-border bg-white text-foreground hover:bg-muted font-bold">
              <Filter className="w-4 h-4" />
              Lọc
            </AppButton>
          </div>
        </div>

        <TabsContent value="USER" className="mt-0">
          <DataTable 
              columns={accountColumns}
              data={filteredAccounts}
              isLoading={loading}
              emptyState="Không tìm thấy người dùng nào."
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: filteredAccounts.length,
                onPageChange: () => {},
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
              emptyState="Không tìm thấy người dùng nào."
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: filteredAccounts.length,
                onPageChange: () => {},
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
                onPageChange: () => {},
                zeroIndexed: false,
                pageSize: applications.length || 10,
              }}
            />
        </TabsContent>
      </Tabs>

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
            <DialogTitle className="text-xl font-bold flex justify-between items-center pr-6 text-slate-800">
              {previewDocument?.title || "Xem trước tài liệu"}
              <AppButton appVariant="ghostMuted" variant="ghost" size="sm" className="h-8 border border-border bg-white hover:bg-muted font-bold" onClick={() => window.open(previewDocument?.url, '_blank')}>
                Mở trong tab mới
              </AppButton>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-slate-100/50 overflow-hidden border border-border flex items-center justify-center relative">
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
          <DialogHeader className="p-5 border-b border-border shrink-0 bg-slate-50 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800">
                Thẩm định Hồ sơ Giảng viên
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
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
              <div className="w-[320px] border-r border-border bg-slate-50/50 p-5 overflow-y-auto flex flex-col justify-between shrink-0">
                <div className="space-y-6">
                  {/* User Profile Info Card */}
                  <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col items-center text-center">
                    <Avatar className="h-16 w-16 border-2 border-primary mb-3">
                      <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-xl">
                        {selectedAppDetail.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-extrabold text-base text-slate-800">{selectedAppDetail.fullName}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 justify-center"><Mail className="w-3.5 h-3.5" /> {selectedAppDetail.email}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 justify-center"><Phone className="w-3.5 h-3.5" /> {selectedAppDetail.contactPhone}</p>
                  </div>

                  {/* Document Review List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">Danh mục tài liệu</span>
                    <div className="space-y-1">
                      {getDocumentList(selectedAppDetail).map((doc) => {
                        const Icon = doc.icon;
                        const isSelected = activeDoc?.id === doc.id;
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
                              isSelected
                                ? "bg-primary text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
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
                <div className="px-5 py-3 border-b border-border bg-slate-50 flex items-center justify-between shrink-0">
                  <span className="text-sm font-bold text-slate-700">
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
                <div className="flex-1 w-full bg-slate-100/50 overflow-hidden relative flex items-center justify-center">
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
                            <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-primary" /> Đề cương bài giảng dự kiến
                            </h4>
                            <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
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
                <div className="p-4 border-t border-border bg-slate-50 flex justify-end items-center gap-3 shrink-0">
                  <AppButton
                    appVariant="ghostMuted"
                    variant="ghost"
                    size="sm"
                    className="h-10 px-5 border border-error/20 text-error hover:bg-red-50 bg-white font-extrabold text-sm"
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
                    className="h-10 px-5 border border-success/20 text-success hover:bg-green-50 bg-white font-extrabold text-sm"
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
