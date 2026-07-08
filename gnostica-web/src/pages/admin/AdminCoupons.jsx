import React, { useState } from "react";
import { useCoupons } from "@/hooks/order/useCoupons";
import { CouponHeader } from "@/pages/admin/components/coupons/CouponHeader";
import { CouponStatsFilter } from "@/pages/admin/components/coupons/CouponStatsFilter";
import { CouponTable } from "@/pages/admin/components/coupons/CouponTable";
import { CouponFormModal } from "@/pages/admin/components/coupons/CouponFormModal";

export default function AdminCoupons() {
  const { coupons, isLoading, addCoupon, removeCoupon, toggleCouponStatus } = useCoupons();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = coupon.status === Number(statusFilter);
    }

    let matchesStartDate = true;
    if (startDateFilter && coupon.startDate) {
      const filterStart = new Date(startDateFilter);
      filterStart.setHours(0, 0, 0, 0);
      matchesStartDate = new Date(coupon.startDate) >= filterStart;
    }

    let matchesEndDate = true;
    if (endDateFilter && coupon.startDate) {
      const filterEnd = new Date(endDateFilter);
      filterEnd.setHours(23, 59, 59, 999);
      matchesEndDate = new Date(coupon.startDate) <= filterEnd;
    }

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <style>{`
        /* Hide spin-buttons for Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Hide spin-buttons for Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <CouponHeader onAddClick={() => setIsAddModalOpen(true)} />

      <CouponStatsFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        startDateFilter={startDateFilter}
        onStartDateChange={setStartDateFilter}
        endDateFilter={endDateFilter}
        onEndDateChange={setEndDateFilter}
        totalCount={coupons.length}
      />

      <CouponTable
        coupons={filteredCoupons}
        isLoading={isLoading}
        onDelete={removeCoupon}
        onToggleStatus={toggleCouponStatus}
      />

      <CouponFormModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSave={addCoupon}
      />
    </div>
  );
}
