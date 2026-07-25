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
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { AppButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import AppBadge from "@/components/common/micro/AppBadge";
import DataTable from "@/components/common/composite/DataTable";
import { useCoupons } from "@/hooks/order/useCoupons";
import { CouponFormModal } from "@/pages/instructor/components/CouponFormModal";
import DataFilter from "@/components/common/composite/DataFilter";

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
                <span className="text-sm font-bold text-muted-foreground tracking-tighter">
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
                        <Ticket className="w-3.5 h-3.5 text-warning" />
                        <span className="text-sm font-bold tracking-widest font-mono">{coupon.code}</span>
                    </div>
                    <AppBadge className="bg-success/10 text-success border-success/20 shadow-none hover:bg-success/20 text-[10px] font-bold uppercase tracking-wider h-5 flex items-center gap-1">
                        Giảm {coupon.discountValue}%
                    </AppBadge>
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
                    <span className="text-xs font-semibold text-foreground">
                        {new Date(coupon.validUntil).toLocaleDateString('vi-VN', {
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
                        <div className="flex justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-tighter">
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
                    <AppBadge className="bg-success/10 text-success border-success/20 shadow-none hover:bg-success/20 text-[10px] font-bold py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                        <CheckCircle2 className="w-3 h-3" /> Hoạt động
                    </AppBadge>
                );
                if (coupon.status === 2) return (
                    <AppBadge className="bg-muted text-muted-foreground border-border shadow-none hover:bg-muted text-[10px] font-bold py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                        <Clock className="w-3 h-3" /> Hết hạn
                    </AppBadge>
                );
                if (coupon.status === 0) return (
                    <AppBadge className="bg-info/10 text-info border-info/20 shadow-none hover:bg-info/20 text-[10px] font-bold py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                        <XCircle className="w-3 h-3" /> Tạm ẩn
                    </AppBadge>
                );
                return (
                    <AppBadge className="bg-warning/10 text-warning border-warning/20 shadow-none hover:bg-warning/20 text-[10px] font-bold py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                        <XCircle className="w-3 h-3" /> Hết lượt
                    </AppBadge>
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
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
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

    let matchDate = true;
    if (dateRange?.from) {
      // Dựa vào ngày tạo (createdAt) hoặc validFrom của coupon
      const dateVal = coupon.validFrom || coupon.createdAt;
      if (dateVal) {
        const itemDate = new Date(dateVal);
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        const to = dateRange.to ? new Date(dateRange.to) : new Date(from);
        to.setHours(23, 59, 59, 999);
        matchDate = itemDate >= from && itemDate <= to;
      }
    }

    return matchesSearch && matchesStatus && matchDate;
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            Phiếu Giảm Giá
          </h1>
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
          { label: "Tổng số mã", value: stats.total, icon: Ticket, bgClass: "bg-primary/10", textClass: "text-primary", borderClass: "border-primary/20", circleClass: "bg-primary/10 opacity-50 group-hover:opacity-100" },
          { label: "Đang hoạt động", value: stats.active, icon: CircleCheck, bgClass: "bg-success-soft", textClass: "text-success", borderClass: "border-success/20", circleClass: "bg-success-soft opacity-50 group-hover:opacity-100" },
          { label: "Sắp diễn ra", value: stats.scheduled, icon: Clock, bgClass: "bg-warning-soft", textClass: "text-warning", borderClass: "border-warning/20", circleClass: "bg-warning-soft opacity-50 group-hover:opacity-100" },
          { label: "Đã hết hạn", value: stats.expired, icon: CircleOff, bgClass: "bg-error-soft", textClass: "text-error", borderClass: "border-error/20", circleClass: "bg-error-soft opacity-50 group-hover:opacity-100" },
        ].map((stat, i) => (
          <AppCard key={i} className="group hover-lift border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative bg-card rounded-2xl">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${stat.circleClass} transition-colors duration-500`} />
            <AppCardContent className="p-6 flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.bgClass} ${stat.textClass} border ${stat.borderClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                <span className="text-2xl font-semibold text-foreground tracking-tight">{stat.value}</span>
              </div>
            </AppCardContent>
          </AppCard>
        ))}
      </div>

      {/* Filters */}
      <DataFilter
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm theo mã hoặc tên..."
        dropdownChecklists={[
          {
            title: "Bộ lọc",
            items: [
              { label: "Đang hoạt động", value: "1" },
              { label: "Đã hết hạn", value: "2" }
            ],
            selectedItems: statusFilter,
            onItemToggle: (val) => setStatusFilter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
            onClear: () => setStatusFilter([])
          }
        ]}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        dateRangePlaceholder="Khoảng thời gian"
      />

      {/* Coupons Table Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between glass p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Danh Sách Mã Giảm Giá</h2>
              <p className="text-xs font-medium text-muted-foreground">Quản lý các chương trình ưu đãi và chiến dịch của bạn.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/80 p-2 rounded-xl border border-border/50">
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
