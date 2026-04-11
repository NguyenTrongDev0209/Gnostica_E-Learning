import React from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ShieldCheck,
  BookOpen
} from "lucide-react";
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
import authService from "@/services/authService";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Lock, Unlock } from "lucide-react";

const USERS_DATA = [
  { id: "USR-001", name: "Nguyễn Văn A", email: "nguyenvana@gmail.com", role: "user", status: "active", joinDate: "12/03/2026", courses: 3 },
  { id: "USR-002", name: "Trần Thị B", email: "tranthib.dev@yahoo.com", role: "user", status: "inactive", joinDate: "10/03/2026", courses: 0 },
  { id: "USR-003", name: "Lê Quốc Minh", email: "minhle.admin@techone.vn", role: "admin", status: "active", joinDate: "01/01/2026", courses: 14 },
  { id: "USR-004", name: "Phạm Minh C", email: "phamc99@edu.com.vn", role: "instructor", status: "active", joinDate: "15/02/2026", courses: 5 },
  { id: "USR-005", name: "Hoàng Ngọc D", email: "ngocd.hoang@gmail.com", role: "user", status: "banned", joinDate: "20/02/2026", courses: 1 },
];

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("USER");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lockReason, setLockReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAccounts = async (role) => {
    setLoading(true);
    try {
      const response = await authService.getAccountsByRole(role);
      setAccounts(response.data || []);
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(activeTab);
  }, [activeTab]);

  const handleToggleLock = async (user) => {
    if (user.locked) {
      // Mở khóa luôn
      try {
        await authService.unlockAccount(user.id);
        toast.success("Đã mở khóa tài khoản.");
        fetchAccounts(activeTab);
      } catch (error) {
        toast.error(error.toString());
      }
    } else {
      // Hiện dialog để nhập lý do
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

    try {
      await authService.lockAccount(selectedUser.id, lockReason);
      toast.success(`Đã khóa tài khoản ${selectedUser.fullName}.`);
      setLockDialogOpen(false);
      fetchAccounts(activeTab);
    } catch (error) {
      toast.error(error.toString());
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Người Dùng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Xem, khóa/mở khóa và quản lý quyền hạn của người dùng.
          </p>
        </div>
      </div>

      <Tabs defaultValue="USER" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="USER" className="font-bold">Học viên</TabsTrigger>
            <TabsTrigger value="INSTRUCTOR" className="font-bold">Giảng viên</TabsTrigger>
          </TabsList>

          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm..." 
                className="pl-9 h-10 border-slate-200"
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

        <TabsContent value={activeTab} className="mt-0">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="py-4 font-bold text-slate-700 w-[300px]">Người dùng</TableHead>
                    <TableHead className="py-4 font-bold text-slate-700">Trạng thái</TableHead>
                    <TableHead className="py-4 font-bold text-slate-700">Nơi đăng ký</TableHead>
                    <TableHead className="py-4 font-bold text-slate-700">Điện thoại</TableHead>
                    <TableHead className="py-4 font-bold text-slate-700 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-slate-500 font-medium">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-slate-500 font-medium">
                        Không tìm thấy người dùng nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((acc) => (
                      <TableRow key={acc.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200">
                              <AvatarImage src={acc.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {acc.fullName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{acc.fullName}</span>
                              <span className="text-xs text-slate-500">{acc.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {acc.locked ? (
                            <Badge className="bg-red-100 text-red-700 shadow-none border-red-200">Bị khóa</Badge>
                          ) : acc.active ? (
                            <Badge className="bg-green-100 text-green-700 shadow-none border-green-200">Hoạt động</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400">Chưa xác thực</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-600">
                          <Badge variant="secondary" className="font-bold">{acc.provider || "Manual"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 font-medium">
                          {acc.phone || "--"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button 
                              variant={acc.locked ? "default" : "outline"} 
                              size="sm" 
                              className={`h-9 font-bold gap-2 ${acc.locked ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'}`}
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
            
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <div>Hiển thị <span className="font-bold text-slate-900">{filteredAccounts.length}</span> kết quả</div>
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
            <Button className="bg-red-600 hover:bg-red-700 font-bold" onClick={confirmLock}>
              Xác nhận khóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
