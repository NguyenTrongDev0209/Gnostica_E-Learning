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
import DataTable from "@/components/common/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import useAdminUsers from "@/hooks/admin/useAdminUsers";

export default function AdminUsers() {
  const {
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
            <Button variant="outline" className="h-10 px-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Lọc
            </Button>
          </div>
        </div>

        <TabsContent value="USER" className="mt-0">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="py-4 font-bold text-foreground w-[300px]">Người dùng</TableHead>
                    <TableHead className="py-4 font-bold text-foreground">Trạng thái</TableHead>
                    <TableHead className="py-4 font-bold text-foreground">Nơi đăng ký</TableHead>
                    <TableHead className="py-4 font-bold text-foreground">Điện thoại</TableHead>
                    <TableHead className="py-4 font-bold text-foreground text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-medium">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-medium">
                        Không tìm thấy người dùng nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((acc) => (
                      <TableRow key={acc.id} className="hover:bg-muted">
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          {acc.locked ? (
                            <Badge className="bg-error/10 text-error text-error shadow-none border-error/20">Bị khóa</Badge>
                          ) : acc.active ? (
                            <Badge className="bg-success/10 text-success text-success shadow-none border-success/20">Hoạt động</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Chưa xác thực</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-muted-foreground">
                          <Badge variant="secondary" className="font-bold">{acc.provider || "Manual"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-medium">
                          {acc.phone || "--"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant={acc.locked ? "default" : "outline"}
                              size="sm"
                              className={`h-9 font-bold gap-2 ${acc.locked ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-error/20 text-error hover:bg-red-50 hover:text-error'}`}
                              onClick={() => handleToggleLock(acc)}
                            >
                              {acc.locked ? (
                                <>
                                  <Unlock className="w-4 h-4" /> Mở khóa
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4" /> Khóa
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
              <div>Hiển thị <span className="font-bold text-foreground">{filteredAccounts.length}</span> kết quả</div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="INSTRUCTOR" className="mt-0">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="py-4 font-bold text-foreground w-[300px]">Người dùng</TableHead>
                    <TableHead className="py-4 font-bold text-foreground">Trạng thái</TableHead>
                    <TableHead className="py-4 font-bold text-foreground">Nơi đăng ký</TableHead>
                    <TableHead className="py-4 font-bold text-foreground">Điện thoại</TableHead>
                    <TableHead className="py-4 font-bold text-foreground text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-medium">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-medium">
                        Không tìm thấy người dùng nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((acc) => (
                      <TableRow key={acc.id} className="hover:bg-muted">
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          {acc.locked ? (
                            <Badge className="bg-error/10 text-error text-error shadow-none border-error/20">Bị khóa</Badge>
                          ) : acc.active ? (
                            <Badge className="bg-success/10 text-success text-success shadow-none border-success/20">Hoạt động</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Chưa xác thực</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-muted-foreground">
                          <Badge variant="secondary" className="font-bold">{acc.provider || "Manual"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-medium">
                          {acc.phone || "--"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant={acc.locked ? "default" : "outline"}
                              size="sm"
                              className={`h-9 font-bold gap-2 ${acc.locked ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-error/20 text-error hover:bg-red-50 hover:text-error'}`}
                              onClick={() => handleToggleLock(acc)}
                            >
                              {acc.locked ? (
                                <>
                                  <Unlock className="w-4 h-4" /> Mở khóa
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4" /> Khóa
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
              <div>Hiển thị <span className="font-bold text-foreground">{filteredAccounts.length}</span> kết quả</div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="PENDING_APP" className="mt-0">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="py-4 font-bold text-foreground">Người dùng</TableHead>
                    <TableHead className="py-4 font-bold text-foreground">Liên hệ</TableHead>
                    <TableHead className="py-4 font-bold text-foreground">Chi tiết Hồ sơ</TableHead>
                    <TableHead className="py-4 font-bold text-foreground text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-medium">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-medium">
                        Không có đơn đăng ký chờ duyệt.
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow key={app.id} className="hover:bg-muted">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{app.fullName}</span>
                            <span className="text-xs text-muted-foreground">{app.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-muted-foreground">
                          {app.contactPhone}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
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
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-success/20 text-success hover:bg-green-50"
                              onClick={() => handleApprove(app.id)}
                            >
                              Phê duyệt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-error/20 text-error hover:bg-red-50"
                              onClick={() => {
                                setSelectedApp(app.id);
                                setRejectReason("");
                                setRejectDialogOpen(true);
                              }}
                            >
                              Từ chối
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
            <Button variant="ghost" onClick={() => setLockDialogOpen(false)}>Hủy</Button>
            <Button className="bg-error/10 text-error hover:bg-error/10 text-error font-bold" onClick={confirmLock}>
              Xác nhận khóa
            </Button>
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
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>Hủy</Button>
            <Button className="bg-error/10 text-error hover:bg-error/10 text-error font-bold" onClick={handleReject}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDocument?.url} onOpenChange={(open) => !open && setPreviewDocument({ url: null, title: "" })}>
        <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="mb-2 shrink-0">
            <DialogTitle className="text-xl font-bold flex justify-between items-center pr-6 text-slate-800">
              {previewDocument?.title || "Xem trước tài liệu"}
              <Button size="sm" variant="outline" className="h-8" onClick={() => window.open(previewDocument?.url, '_blank')}>
                Mở trong tab mới
              </Button>
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
