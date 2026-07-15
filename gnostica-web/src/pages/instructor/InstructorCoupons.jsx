import React, { useState } from "react";
import {
  Plus,
  Search,
  Ticket,
  Calendar,
  Slash,
  CircleCheck,
  CircleOff,
  Clock,
  Filter,
  Activity,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AppButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/composite/DataTable";
import { useCoupons } from "@/hooks/order/useCoupons";
import { CouponFormModal } from "@/pages/admin/components/CouponFormModal";

const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

function InstructorCouponTable({
    coupons,
    isLoading,
    onToggleStatus,
    onDelete,
    pagination = { currentPage: 0, totalPages: 1, totalElements: 0 },
    onPageChange,
}) {
    const columns = [
        {
            header: "STT",
            className: "w-[60px] text-center",
            cellClassName: "text-center font-sans",
            render: (coupon, index) => (
                <span className="text-2xs font-bold text-muted-foreground tracking-tighter">
                    {(index + 1).toString().padStart(2, '0')}
                </span>
            )
        },
        {
            header: "Mã & Giảm giá",
            className: "text-center",
            render: (coupon) => (
                <div className="flex flex-col items-center gap-2 p-1">
                    <div className="flex items-center gap-1.5 bg-muted text-white px-3 py-1 rounded-lg shadow-sm border border-border">
                        <Ticket className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm font-black tracking-widest font-mono">{coupon.code}</span>
                    </div>
                    <Badge className="bg-green-50 text-success border-success/20 shadow-none hover:bg-success/10 text-[10px] font-black uppercase tracking-wider h-5 flex items-center gap-1">
                        Giảm {coupon.discountPercent}%
                    </Badge>
                </div>
            )
        },
        {
            header: "Điều kiện",
            render: (coupon) => (
                <div className="flex flex-col gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-muted" />
                        Tối thiểu: <span className="text-foreground">{formatVND(coupon.minDiscount)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-muted" />
                        Tối đa: <span className="text-foreground">{formatVND(coupon.maxDiscount)}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Hạn dùng",
            className: "text-center",
            cellClassName: "text-center",
            render: (coupon) => (
                <div className="flex flex-col items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-black text-foreground">
                        {new Date(coupon.expiryDate).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                    </span>
                </div>
            )
        },
        {
            header: "Sử dụng",
            className: "text-center",
            render: (coupon) => (
                <div className="flex justify-center">
                    <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                            <span>Đã dùng</span>
                            <span>{coupon.usedCount || 0}/{coupon.quantity}</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${((coupon.usedCount || 0) / coupon.quantity) > 0.8 ? 'bg-amber-500' : 'bg-primary'
                                    }`}
                                style={{ width: `${Math.min(((coupon.usedCount || 0) / coupon.quantity) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: "Trạng thái",
            className: "text-center",
            cellClassName: "text-center",
            render: (coupon) => {
                if (coupon.status === 1) return (
                    <Badge className="bg-green-50 text-success border-success/20 shadow-none hover:bg-green-50 text-[10px] font-black py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                        <CheckCircle2 className="w-3 h-3" /> Hoạt động
                    </Badge>
                );
                if (coupon.status === 2) return (
                    <Badge className="bg-muted text-muted-foreground border-border shadow-none hover:bg-muted text-[10px] font-black py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                        <Clock className="w-3 h-3" /> Hết hạn
                    </Badge>
                );
                if (coupon.status === 0) return (
                    <Badge className="bg-blue-50 text-info border-info/20 shadow-none hover:bg-blue-50 text-[10px] font-black py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                        <XCircle className="w-3 h-3" /> Tạm ẩn
                    </Badge>
                );
                return (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none hover:bg-amber-50 text-[10px] font-black py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                        <XCircle className="w-3 h-3" /> Hết lượt
                    </Badge>
                );
            }
        },
        {
            header: "Thao tác",
            className: "text-center",
            cellClassName: "text-center",
            render: (coupon) => (
                <div className="flex justify-center items-center gap-2">
                    <AppButton appVariant="ghostMuted" variant="ghost"
                        size="sm"
                        className="h-9 px-3 font-bold text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-all flex items-center gap-1.5"
                        onClick={() => onToggleStatus?.(coupon)}
                    >
                        <RotateCw className="w-3.5 h-3.5" />
                        Đổi Trạng Thái
                    </AppButton>
                    <TableActionIconButton
                        icon={Trash2}
                        colorVariant="error"
                        onClick={() => onDelete?.(coupon.id)}
                        title="Xóa"
                    />
                </div>
            )
        }
    ];

    return (
        <div className="animate-fade-up">
            <DataTable 
                columns={columns}
                data={coupons}
                isLoading={isLoading}
                loadingState={
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground italic h-40">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <span>Đang tải dữ liệu phiếu giảm giá...</span>
                    </div>
                }
                emptyState={
                    <span className="italic font-medium text-muted-foreground">Chưa có mã giảm giá nào được tạo.</span>
                }
                pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalElements: pagination.totalElements || coupons?.length || 0,
                    onPageChange: onPageChange,
                    zeroIndexed: true
                }}
            />
        </div>
    );
}

export default function InstructorCoupons() {
  const { coupons, isLoading, addCoupon, removeCoupon, toggleCouponStatus } = useCoupons({ mine: true });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    size: 10
  });

  const filteredCoupons = (Array.isArray(coupons) ? coupons : []).filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = coupon.status === Number(statusFilter);
    }

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: coupons?.length || 0,
    active: coupons?.filter(c => c.status === 1).length || 0,
    scheduled: coupons?.filter(c => c.status === 0).length || 0,
    expired: coupons?.filter(c => c.status === 2).length || 0
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="py-8 space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-foreground">
        <div className="space-y-1">
          <h1 className="text-h1 font-black text-foreground tracking-tight leading-none">Phiếu Giảm Giá</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Tạo và quản lý các mã giảm giá để thúc đẩy doanh số bán khóa học của bạn.
          </p>
        </div>
        <AppButton appVariant="gradient"
          onClick={() => setIsModalOpen(true)}
          className="btn-md bg-primary hover:scale-[1.02] transition-all text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo Mã Giảm Giá Mới
        </AppButton>
      </div>

      {/* Stats Summary (Standardized) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Tổng số mã", value: stats.total, icon: Ticket, color: "slate" },
          { label: "Đang hoạt động", value: stats.active, icon: CircleCheck, color: "green" },
          { label: "Sắp diễn ra", value: stats.scheduled, icon: Clock, color: "amber" },
          { label: "Đã hết hạn", value: stats.expired, icon: CircleOff, color: "rose" },
        ].map((stat, i) => (
          <Card key={i} className="group hover-lift border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative bg-white rounded-2xl">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-${stat.color}-50/50 group-hover:bg-${stat.color}-100/50 transition-colors duration-500`} />
            <CardContent className="p-6 flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 border border-${stat.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                <span className="text-2xl font-black text-foreground tracking-tight">{stat.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Actions (Glassmorphism) */}
      <div className="glass p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
        <div className="flex w-full md:w-auto items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Tìm theo mã hoặc tên..."
              className="pl-11 h-11 border-border bg-white/50 backdrop-blur-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-10 w-px bg-border/60 hidden md:block" />
          <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
            <Filter className="w-3.5 h-3.5" />
            Bộ lọc
          </div>
        </div>

        <div className="flex bg-secondary/80 backdrop-blur-sm p-1.5 rounded-[14px] border border-border/50 shadow-inner w-full md:w-auto">
          {[
            { id: "all", label: "Tất cả" },
            { id: "1", label: "Đang hoạt động" },
            { id: "2", label: "Đã hết hạn" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-black transition-all duration-200 uppercase tracking-tight ${statusFilter === tab.id
                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between glass p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight">Danh Sách Mã Giảm Giá</h2>
              <p className="text-xs font-bold text-muted-foreground">Quản lý các chương trình ưu đãi và chiến dịch của bạn.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-black text-muted-foreground bg-muted/80 p-2 rounded-xl border border-border/50">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <InstructorCouponTable
          coupons={filteredCoupons}
          isLoading={isLoading}
          onToggleStatus={toggleCouponStatus}
          onDelete={removeCoupon}
          pagination={{
            ...pagination,
            totalElements: filteredCoupons.length,
            totalPages: Math.ceil(filteredCoupons.length / pagination.size) || 1
          }}
          onPageChange={handlePageChange}
        />
      </div>

      <CouponFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={addCoupon}
      />
    </div>
  );
}
