import React from "react";
import AppBadge from "@/components/common/micro/AppBadge";
import { Ticket, Scissors, CheckCircle2 } from "lucide-react";
import { AppButton } from "@/components/common/micro/AppButton";

export default function VoucherCard({ voucher, onCopyCode }) {
  const isExpired = voucher.status === "expired";
  
  return (
    <div 
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
          <h3 className="flex-1 min-w-0 font-bold text-lg text-foreground leading-6 line-clamp-2 h-12">
            {voucher.title}
          </h3>
          {isExpired ? (
            <AppBadge variant="secondary" soft className="shrink-0 pointer-events-none text-[10px]">Hết hạn</AppBadge>
          ) : (
            <AppBadge variant="success" soft icon={CheckCircle2} className="shrink-0 text-[10px]">
              Khả dụng
            </AppBadge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-6 leading-5 line-clamp-2 h-10">
          {voucher.desc}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mã giảm giá:</span>
            <span className="font-mono font-black text-lg text-primary tracking-wider">{voucher.code}</span>
          </div>
          
          {!isExpired && (
            <AppButton appVariant="ghostMuted" variant="ghost" size="icon"
              onClick={() => onCopyCode?.(voucher.code)}
              className="w-10 h-10 bg-secondary hover:bg-muted text-foreground rounded-xl transition-colors shrink-0"
              title="Sao chép mã giảm giá"
            >
              <Scissors className="w-5 h-5" />
            </AppButton>
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
}
