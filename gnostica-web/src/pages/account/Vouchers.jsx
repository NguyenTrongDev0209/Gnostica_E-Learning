import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Ticket, Scissors, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const VOUCHERS_DATA = [
  {
    id: "WELCOME50",
    code: "GNOSTICA50",
    title: "Giảm 50% cho người mới",
    desc: "Áp dụng cho đơn hàng đầu tiên. Không giới hạn giá trị tối đa.",
    expiry: "30/04/2026",
    status: "active",
    discount: "50%",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "MEMBER20",
    code: "MEMBER20",
    title: "Tri ân học viên cũ",
    desc: "Giảm trực tiếp 200.000đ cho các khóa học trên 1.000.000đ.",
    expiry: "15/05/2026",
    status: "active",
    discount: "200K",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "EXPIRED15",
    code: "FLASH15",
    title: "Flash Sale cuối tuần",
    desc: "Giảm 15% cho tất cả khóa học Lập trình.",
    expiry: "01/01/2026",
    status: "expired",
    discount: "15%",
    color: "from-slate-400 to-slate-500",
  },
];

export default function Vouchers() {
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã ${code}`);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" /> Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/account" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Tài khoản
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-semibold">Kho Voucher</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <Ticket className="w-7 h-7 text-primary" />
            Kho Voucher của bạn
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sử dụng các mã giảm giá này khi thanh toán để tiết kiệm chi phí học tập.
          </p>
        </div>
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {VOUCHERS_DATA.map((voucher) => {
          const isExpired = voucher.status === "expired";
          
          return (
            <div 
              key={voucher.id} 
              className={`flex border rounded-2xl overflow-hidden shadow-sm transition-transform hover:shadow-md ${isExpired ? 'border-slate-200 opacity-60' : 'border-slate-100 hover:scale-[1.01]'}`}
            >
              {/* Left Side: Ticket Stub & Value */}
              <div className={`w-32 sm:w-40 flex items-center justify-center p-4 relative shrink-0 bg-gradient-to-br ${voucher.color} text-white`}>
                {/* Dashed edge */}
                <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-between overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full -mr-1 ${isExpired ? 'bg-slate-50' : 'bg-white'}`}></div>
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
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">
                    {voucher.title}
                  </h3>
                  {isExpired ? (
                    <Badge className="bg-slate-100 text-slate-600 border-none shrink-0 pointer-events-none text-[10px] font-bold">Hết hạn</Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shrink-0 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Khả dụng
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-2">
                  {voucher.desc}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mã code:</span>
                    <span className="font-mono font-black text-lg text-primary tracking-wider">{voucher.code}</span>
                  </div>
                  
                  {!isExpired && (
                    <button 
                      onClick={() => handleCopyCode(voucher.code)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors shrink-0"
                      aria-label="Sao chép mã"
                    >
                      <Scissors className="w-4 h-4" />
                      Sao chép
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 border-dashed">
                  <p className={`text-xs font-medium ${isExpired ? 'text-red-400' : 'text-slate-400'}`}>
                    {isExpired ? 'Đã hết hạn: ' : 'HSD: '}{voucher.expiry}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
