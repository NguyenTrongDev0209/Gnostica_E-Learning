import React from "react";
import {
    Calendar,
    Trash2,
    Ticket,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCw,
} from "lucide-react";
import { GhostButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import { Badge } from "@/components/ui/badge";
import AppTable from "@/components/common/composite/AppTable";

const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export default function InstructorCouponTable({
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
                    <GhostButton
                        size="sm"
                        className="h-9 px-3 font-bold text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-all flex items-center gap-1.5"
                        onClick={() => onToggleStatus?.(coupon)}
                    >
                        <RotateCw className="w-3.5 h-3.5" />
                        Đổi Trạng Thái
                    </GhostButton>
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
            <AppTable 
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
