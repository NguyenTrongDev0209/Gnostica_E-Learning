import React, { useState } from "react";
import { useCoupons } from "@/hooks/admin/useCoupons";
import { CouponHeader } from "@/components/pages/admin/coupons/CouponHeader";
import { CouponStatsFilter } from "@/components/pages/admin/coupons/CouponStatsFilter";
import { CouponTable } from "@/components/pages/admin/coupons/CouponTable";
import { CouponFormModal } from "@/components/pages/admin/coupons/CouponFormModal";

export default function AdminCoupons() {
  const { coupons, isLoading, addCoupon, removeCoupon } = useCoupons();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        totalCount={coupons.length} 
      />
      
      <CouponTable 
        coupons={filteredCoupons} 
        isLoading={isLoading} 
        onDelete={removeCoupon} 
      />
      
      <CouponFormModal 
        isOpen={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
        onSave={addCoupon} 
      />
    </div>
  );
}
