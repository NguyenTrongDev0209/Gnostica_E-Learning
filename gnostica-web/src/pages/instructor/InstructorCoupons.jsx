import React, { useState } from "react";
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
import { useCoupons } from "@/hooks/admin/useCoupons";
import { CouponFormModal } from "@/components/pages/admin/coupons/CouponFormModal";

export default function InstructorCoupons() {
  const { coupons, isLoading, addCoupon, removeCoupon } = useCoupons({ mine: true });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = coupon.status === Number(statusFilter);
    }

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.status === 1).length,
    scheduled: coupons.filter(c => c.status === 0).length,
    expired: coupons.filter(c => c.status === 2).length
  };

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
        <Button
          onClick={() => setIsModalOpen(true)}
          className="font-bold flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-none"
        >
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
              <p className="text-xl font-black text-slate-900">{stats.total}</p>
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
              <p className="text-xl font-black text-slate-900">{stats.active}</p>
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
              <p className="text-xl font-black text-slate-900">{stats.scheduled}</p>
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
              <p className="text-xl font-black text-slate-900">{stats.expired}</p>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex text-sm font-medium text-slate-500 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md ${statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter("1")}
              className={`px-3 py-1.5 rounded-md ${statusFilter === "1" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => setStatusFilter("2")}
              className={`px-3 py-1.5 rounded-md ${statusFilter === "2" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
            >
              Đã hết hạn
            </button>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">Chưa có mã giảm giá nào</TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-slate-900 tracking-wider text-base">{coupon.code}</span>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 w-fit">
                          Giảm {coupon.discountPercent}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
                        <span>Đơn tối thiểu: <span className="font-bold text-slate-900">{formatVND(coupon.minDiscount)}</span></span>
                        <span>Giảm tối đa: <span className="font-bold text-slate-900">{formatVND(coupon.maxDiscount)}</span></span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                          <span>Đã dùng</span>
                          <span>{coupon.usedCount || 0}/{coupon.quantity}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${((coupon.usedCount || 0) / coupon.quantity) > 0.8 ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                            style={{ width: `${((coupon.usedCount || 0) / coupon.quantity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.status === 1 && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold">Hoạt động</Badge>
                      )}
                      {coupon.status === 2 && (
                        <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none font-bold">Hết hạn</Badge>
                      )}
                      {coupon.status === 0 && (
                        <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 border-none font-bold">Tạm ẩn</Badge>
                      )}
                      {coupon.status === 3 && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-bold">Hết lượt</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 font-medium border-slate-200">Sửa</Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50"
                          onClick={() => removeCoupon(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      <CouponFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={addCoupon}
      />
    </div>
  );
}
