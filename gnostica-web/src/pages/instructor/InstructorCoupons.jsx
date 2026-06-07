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
  Activity
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCoupons } from "@/hooks/admin/useCoupons";
import { CouponFormModal } from "@/components/pages/admin/coupons/CouponFormModal";
import InstructorCouponTable from "@/components/pages/instructor/coupons/InstructorCouponTable";

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
          <h1 className="text-h1 font-black text-slate-900 tracking-tight leading-none">Phiếu Giảm Giá</h1>
          <p className="text-sm font-medium text-slate-500">
            Tạo và quản lý các mã giảm giá để thúc đẩy doanh số bán khóa học của bạn.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="btn-md bg-primary hover:scale-[1.02] transition-all text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo Mã Giảm Giá Mới
        </Button>
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Tìm theo mã hoặc tên..."
              className="pl-11 h-11 border-border bg-white/50 backdrop-blur-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-10 w-px bg-border/60 hidden md:block" />
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
            <Filter className="w-3.5 h-3.5" />
            Bộ lọc
          </div>
        </div>

        <div className="flex bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-[14px] border border-slate-200/50 shadow-inner w-full md:w-auto">
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
                : "text-slate-500 hover:text-slate-900"
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
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Danh Sách Mã Giảm Giá</h2>
              <p className="text-xs font-bold text-slate-500">Quản lý các chương trình ưu đãi và chiến dịch của bạn.</p>
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
