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

const USERS_DATA = [
  { id: "USR-001", name: "Nguyễn Văn A", email: "nguyenvana@gmail.com", role: "user", status: "active", joinDate: "12/03/2026", courses: 3 },
  { id: "USR-002", name: "Trần Thị B", email: "tranthib.dev@yahoo.com", role: "user", status: "inactive", joinDate: "10/03/2026", courses: 0 },
  { id: "USR-003", name: "Lê Quốc Minh", email: "minhle.admin@techone.vn", role: "admin", status: "active", joinDate: "01/01/2026", courses: 14 },
  { id: "USR-004", name: "Phạm Minh C", email: "phamc99@edu.com.vn", role: "instructor", status: "active", joinDate: "15/02/2026", courses: 5 },
  { id: "USR-005", name: "Hoàng Ngọc D", email: "ngocd.hoang@gmail.com", role: "user", status: "banned", joinDate: "20/02/2026", courses: 1 },
];

export default function AdminUsers() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Người Dùng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Xem, thêm mới, sửa và phân quyền cho người dùng trên hệ thống.
          </p>
        </div>
        <Button className="font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm Người Dùng
        </Button>
      </div>

      {/* Filters & Actions */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-80 border-slate-200">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Tìm user theo tên, email..." 
                className="pl-9 h-10 border-slate-200 focus:bg-white"
              />
            </div>
            <Button variant="outline" className="h-10 px-3 border-slate-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Lọc
            </Button>
          </div>
          
          <div className="flex text-sm font-medium text-slate-500 bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm">Tất cả (12,456)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Admin (4)</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Giảng viên (24)</button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-700 w-[300px]">Người dùng</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Vai trò</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Ngày tham gia</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center">Số khóa học</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS_DATA.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={`https://i.pravatar.cc/100?u=${user.id}`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{user.name}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === "admin" && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 shadow-none border-purple-200 gap-1"><ShieldCheck className="w-3 h-3"/> Admin</Badge>}
                    {user.role === "instructor" && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 shadow-none border-blue-200 gap-1"><BookOpen className="w-3 h-3"/> Giảng viên</Badge>}
                    {user.role === "user" && <Badge variant="outline" className="text-slate-600 border-slate-200 font-medium">Học viên</Badge>}
                  </TableCell>
                  <TableCell>
                    {user.status === "active" && <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500"></span> Hoạt động</span>}
                    {user.status === "inactive" && <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Tạm ngưng</span>}
                    {user.status === "banned" && <span className="inline-flex items-center gap-1.5 text-sm text-red-600 font-medium"><span className="w-2 h-2 rounded-full bg-red-500"></span> Cấm</span>}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {user.joinDate}
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-900">
                    {user.courses}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>Hiển thị <span className="font-bold text-slate-900">1-5</span> trong số <span className="font-bold text-slate-900">12,456</span> người dùng</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8" disabled>Trước</Button>
            <Button variant="outline" size="sm" className="h-8 bg-primary text-white border-primary hover:bg-primary/90 hover:text-white">1</Button>
            <Button variant="outline" size="sm" className="h-8">2</Button>
            <Button variant="outline" size="sm" className="h-8">3</Button>
            <Button variant="ghost" size="sm" className="h-8">...</Button>
            <Button variant="outline" size="sm" className="h-8">Sau</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
