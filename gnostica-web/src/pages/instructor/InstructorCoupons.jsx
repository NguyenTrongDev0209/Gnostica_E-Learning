import React from "react";
import { 
  Plus, 
  Search, 
  Ticket, 
  Calendar, 
  Tag, 
  Trash2, 
  Edit, 
  MoreHorizontal,
  CircleCheck,
  CircleOff,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const MOCK_COUPONS = [
  {
    id: "CPN-001",
    code: "GNOSTICA100",
    discount: "100.000đ",
    type: "fixed",
    minOrder: "500.000đ",
    expiryDate: "2024-12-31",
    usageCount: 45,
    maxUsage: 100,
    status: "active"
  },
  {
    id: "CPN-002",
    code: "SUMMER50",
    discount: "50%",
    type: "percentage",
    minOrder: "200.000đ",
    expiryDate: "2024-06-30",
    usageCount: 120,
    maxUsage: 200,
    status: "active"
  },
  {
    id: "CPN-003",
    code: "WELCOME2024",
    discount: "20.000đ",
    type: "fixed",
    minOrder: "0đ",
    expiryDate: "2024-01-15",
    usageCount: 50,
    maxUsage: 50,
    status: "expired"
  },
  {
    id: "CPN-004",
    code: "HOLIDAY15",
    discount: "15%",
    type: "percentage",
    minOrder: "300.000đ",
    expiryDate: "2024-05-20",
    usageCount: 0,
    maxUsage: 300,
    status: "scheduled"
  }
];

export default function InstructorCoupons() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Phiếu Giảm Giá</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tạo và quản lý các mã giảm giá để thúc đẩy doanh số bán khóa học của bạn.
          </p>
        </div>
        <Button className="font-bold flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-none">
          <Plus className="w-4 h-4" />
          Tạo Mã Giảm Giá Mới
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-blue-50/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">Tổng số mã</p>
              <p className="text-xl font-black text-slate-900">12</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-green-50/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <CircleCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">Đang hoạt động</p>
              <p className="text-xl font-black text-slate-900">8</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-amber-50/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">Sắp diễn ra</p>
              <p className="text-xl font-black text-slate-900">2</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-slate-50/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600">
              <CircleOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">Đã hết hạn</p>
              <p className="text-xl font-black text-slate-900">2</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-80 border-slate-200">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Tìm mã giảm giá..." 
                className="pl-9 h-10 border-slate-200 focus:bg-white focus:border-green-500 focus:ring-green-500/20"
              />
            </div>
          </div>
          
          <div className="flex text-sm font-medium text-slate-500 bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm">Tất cả</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Đang hoạt động</button>
            <button className="px-3 py-1.5 rounded-md hover:text-slate-900">Đã hết hạn</button>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-700">Mã & Giảm giá</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Điều kiện</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Hạn dùng</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Sử dụng</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_COUPONS.map((coupon) => (
                <TableRow key={coupon.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-slate-900 tracking-wider text-base">{coupon.code}</span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 w-fit">
                        Giảm {coupon.discount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
                      <span>Đơn tối thiểu: <span className="font-bold text-slate-900">{coupon.minOrder}</span></span>
                      <span className="capitalize">Loại: <span className="font-bold text-slate-900">{coupon.type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}</span></span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {coupon.expiryDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 w-32">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Đã dùng</span>
                        <span>{coupon.usageCount}/{coupon.maxUsage}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            (coupon.usageCount / coupon.maxUsage) > 0.8 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(coupon.usageCount / coupon.maxUsage) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.status === "active" && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold">Hoạt động</Badge>
                    )}
                    {coupon.status === "expired" && (
                      <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none font-bold">Hết hạn</Badge>
                    )}
                    {coupon.status === "scheduled" && (
                      <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 border-none font-bold">Lên lịch</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 font-medium border-slate-200">Sửa</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
