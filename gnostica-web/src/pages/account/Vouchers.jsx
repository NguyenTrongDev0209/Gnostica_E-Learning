import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import { Ticket, Scissors, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useVouchers from "@/hooks/account/useVouchers";
import { GhostButton } from "@/components/common/micro/AppButton";

export default function Vouchers() {
  const { vouchers, loading, handleCopyCode } = useVouchers();

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Kho Voucher" }]} />

      <AppPageHeader
        icon={Ticket}
        title="Kho Voucher của bạn"
        description="Sử dụng các mã giảm giá này khi thanh toán để tiết kiệm chi phí học tập."
      />

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex border rounded-2xl overflow-hidden shadow-sm h-48 border-border">
              <div className="w-32 sm:w-40 flex items-center justify-center p-4 bg-muted shrink-0">
                <Skeleton className="w-16 h-16 rounded-full" />
              </div>
              <div className="flex-1 p-5 sm:p-6 bg-white space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
              </div>
            </div>
          ))
        ) : vouchers.length > 0 ? (
          vouchers.map((voucher) => {
            const isExpired = voucher.status === "expired";
            
            return (
              <div 
                key={voucher.id} 
                className={`flex border rounded-2xl overflow-hidden shadow-sm transition-transform hover:shadow-md ${isExpired ? 'border-border opacity-60' : 'border-border hover:scale-[1.01]'}`}
              >
                {/* Left Side: Ticket Stub & Value */}
                <div className={`w-32 sm:w-40 flex items-center justify-center p-4 relative shrink-0 bg-gradient-to-br ${voucher.color} text-white`}>
                  {/* Dashed edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-between overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full -mr-1 ${isExpired ? 'bg-muted' : 'bg-white'}`}></div>
                    ))}
                  </div>
                  
                  {/* Content */}
                  <div className="text-center z-10 w-full pl-2">
                    <Ticket className="w-8 h-8 opacity-90 mx-auto mb-2" />
                    <p className="font-black text-2xl leading-none mb-1 text-center w-full">{voucher.discount}</p>
                  </div>
                </div>

                {/* Right Side: Info & Coupon Code */}
                <div className="flex-1 p-5 sm:p-6 bg-white relative">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="font-bold text-lg text-foreground leading-tight">
                      {voucher.title}
                    </h3>
                    {isExpired ? (
                      <Badge className="bg-secondary text-muted-foreground border-none shrink-0 pointer-events-none text-[10px] font-bold">Hết hạn</Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shrink-0 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Khả dụng
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed line-clamp-2">
                    {voucher.desc}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mã code:</span>
                      <span className="font-mono font-black text-lg text-primary tracking-wider">{voucher.code}</span>
                    </div>
                    
                    {!isExpired && (
                      <GhostButton 
                        onClick={() => handleCopyCode(voucher.code)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-muted text-foreground text-sm font-bold rounded-xl transition-colors shrink-0"
                        aria-label="Sao chép mã"
                      >
                        <Scissors className="w-4 h-4" />
                        Sao chép
                      </GhostButton>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border border-dashed">
                    <p className={`text-xs font-medium ${isExpired ? 'text-error' : 'text-muted-foreground'}`}>
                      {isExpired ? 'Đã hết hạn: ' : 'HSD: '}{voucher.expiry}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
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
