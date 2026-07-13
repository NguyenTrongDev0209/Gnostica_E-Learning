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
  Unlock
} from "lucide-react";
import DataTable from "@/components/common/composite/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppButton } from "@/components/common/micro/AppButton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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

  const filteredAccounts = accounts;

  const accountColumns = [
    {
      header: "Người dùng",
      className: "w-[300px]",
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
      render: (acc) => (
        acc.locked ? (
          <Badge className="bg-error/10 text-error shadow-none border-error/20">Bị khóa</Badge>
        ) : acc.active ? (
          <Badge className="bg-success/10 text-success shadow-none border-success/20">Hoạt động</Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">Chưa xác thực</Badge>
        )
      )
    },
    {
      header: "Nơi đăng ký",
      cellClassName: "text-sm font-medium text-muted-foreground",
      render: (acc) => <Badge variant="secondary" className="font-bold">{acc.provider || "Manual"}</Badge>
    },
    {
      header: "Điện thoại",
      cellClassName: "text-sm text-muted-foreground font-medium",
      render: (acc) => acc.phone || "--"
    },
    {
      header: () => <div className="text-right w-full">Thao tác</div>,
      className: "text-right",
      cellClassName: "text-right",
      render: (acc) => (
        <div className="flex justify-end items-center gap-2">
          {acc.locked ? (
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
      render: (app) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{app.fullName}</span>
          <span className="text-xs text-muted-foreground">{app.email}</span>
        </div>
      )
    },
    {
      header: "Liên hệ",
      cellClassName: "text-sm font-medium text-muted-foreground",
      render: (app) => app.contactPhone
    },
    {
      header: "Chi tiết Hồ sơ",
      cellClassName: "text-sm text-muted-foreground",
      render: (app) => (
        <>
          <div className="flex gap-2 mb-1">
            <button type="button" onClick={() => setPreviewDocument({ url: app.idCardFront, title: "CCCD Mặt trước" })} className="text-info underline hover:text-blue-700 transition-colors">CCCD Trước</button>
            <button type="button" onClick={() => setPreviewDocument({ url: app.idCardBack, title: "CCCD Mặt sau" })} className="text-info underline hover:text-blue-700 transition-colors">CCCD Sau</button>
          </div>
          <div>
            <button type="button" onClick={() => setPreviewDocument({ url: app.cvUrl, title: "CV/Resume (PDF)" })} className="text-info underline hover:text-blue-700 transition-colors">CV PDF</button>
          </div>
          {app.degreeUrls && (
            <div className="flex flex-wrap gap-x-2 mt-1 italic">
              {app.degreeUrls.split(',').filter(u => u).map((url, i) => (
                <button key={i} type="button" onClick={() => setPreviewDocument({ url: url, title: `Bằng cấp/Chứng chỉ ${i + 1}` })} className="text-emerald-600 underline hover:text-emerald-800 transition-colors">
                  Bằng cấp {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )
    },
    {
      header: () => <div className="text-right w-full">Thao tác</div>,
      className: "text-right",
      cellClassName: "text-right",
      render: (app) => (
        <div className="flex justify-end items-center gap-2">
          <AppButton appVariant="ghostMuted" variant="ghost"
            size="sm"
            className="border border-success/20 text-success hover:bg-green-50 bg-white font-bold"
            onClick={() => handleApprove(app.id)}
          >
            Phê duyệt
          </AppButton>
          <AppButton appVariant="ghostMuted" variant="ghost"
            size="sm"
            className="border border-error/20 text-error hover:bg-red-50 bg-white font-bold"
            onClick={() => {
              setSelectedApp(app.id);
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Quản Lý Người Dùng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xem, khóa/mở khóa và quản lý quyền hạn của người dùng.
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
              <Input
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
          <Card className="border-border shadow-sm overflow-hidden border-none bg-transparent">
            <DataTable 
              columns={accountColumns}
              data={filteredAccounts}
              isLoading={loading}
              emptyState="Không tìm thấy người dùng nào."
            />
            <div className="p-4 bg-white border border-t-0 border-border rounded-b-xl flex items-center justify-between text-sm text-muted-foreground">
              <div>Hiển thị <span className="font-bold text-foreground">{filteredAccounts.length}</span> kết quả</div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="INSTRUCTOR" className="mt-0">
          <Card className="border-border shadow-sm overflow-hidden border-none bg-transparent">
            <DataTable 
              columns={accountColumns}
              data={filteredAccounts}
              isLoading={loading}
              emptyState="Không tìm thấy người dùng nào."
            />
            <div className="p-4 bg-white border border-t-0 border-border rounded-b-xl flex items-center justify-between text-sm text-muted-foreground">
              <div>Hiển thị <span className="font-bold text-foreground">{filteredAccounts.length}</span> kết quả</div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="PENDING_APP" className="mt-0">
          <Card className="border-border shadow-sm overflow-hidden border-none bg-transparent">
            <DataTable 
              columns={applicationColumns}
              data={applications}
              isLoading={loading}
              emptyState="Không có đơn đăng ký chờ duyệt."
            />
          </Card>
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
            <Textarea
              placeholder="Nhập lý do tại đây..."
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              className="resize-none h-32 focus-visible:ring-red-500"
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
            <Textarea
              placeholder="Nhập lý do tại đây..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="resize-none h-32 focus-visible:ring-red-500"
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
          <div className="flex-1 w-full bg-slate-100/50 rounded-lg overflow-hidden border border-border flex items-center justify-center relative">
            {previewDocument?.url && (
              <iframe
                src={previewDocument.url}
                className="w-full h-full border-0 rounded-md absolute inset-0 bg-white"
                title={previewDocument.title}
                loading="lazy"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
