import React from "react";
import { Link } from "react-router-dom";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import { Ticket } from "lucide-react";
import AppSkeleton from "@/components/common/micro/AppSkeleton";
import useVouchers from "@/hooks/account/useVouchers";
import VoucherCard from "@/components/common/composite/VoucherCard";

export default function VouchersPage() {
  const { vouchers, loading, handleCopyCode } = useVouchers();

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Kho giảm giá" }]} />

      <AppPageHeader
        icon={Ticket}
        title="Kho giảm giá của bạn"
        description="Sử dụng các mã giảm giá này khi thanh toán để tiết kiệm chi phí học tập."
      />

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex border rounded-2xl overflow-hidden shadow-sm h-48 border-border">
              <div className="w-32 sm:w-40 flex items-center justify-center p-4 bg-muted shrink-0">
                <AppSkeleton className="w-16 h-16 rounded-full" />
              </div>
              <div className="flex-1 p-5 sm:p-6 bg-white space-y-4">
                <AppSkeleton className="h-6 w-3/4" />
                <AppSkeleton className="h-4 w-full" />
                <AppSkeleton className="h-4 w-5/6" />
                <div className="flex justify-between items-center pt-2">
                  <AppSkeleton className="h-6 w-24" />
                  <AppSkeleton className="h-8 w-24 rounded-xl" />
                </div>
              </div>
            </div>
          ))
        ) : vouchers.length > 0 ? (
          vouchers.map((voucher) => (
            <VoucherCard 
              key={voucher.id} 
              voucher={voucher} 
              onCopyCode={handleCopyCode} 
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/50">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground mb-2">Chưa có voucher nào</h3>
            <p className="text-sm text-muted-foreground">Các mã giảm giá sẽ xuất hiện ở đây khi bạn được nhận.</p>
          </div>
        )}
      </div>
    </div>
  );
}
