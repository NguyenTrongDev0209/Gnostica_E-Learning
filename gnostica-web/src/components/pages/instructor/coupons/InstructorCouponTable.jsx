import React from "react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Ticket,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
    return (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden animate-fade-up">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="border-b border-border">
                            <TableHead className="w-[60px] text-center py-4 font-semibold text-foreground">STT</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Mã & Giảm giá</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground">Điều kiện</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Hạn dùng</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Sử dụng</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Trạng thái</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground italic">
                                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        <span>Đang tải dữ liệu phiếu giảm giá...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : !Array.isArray(coupons) || coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground font-medium italic">
                                    Chưa có mã giảm giá nào được tạo.
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon, index) => (
                                <TableRow
                                    key={coupon.id}
                                    className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0"
                                >
                                    {/* Cột: STT */}
                                    <TableCell className="text-center font-sans">
                                        <span className="text-2xs font-bold text-muted-foreground tracking-tighter">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                    </TableCell>

                                    {/* Cột: Mã & Giảm giá */}
                                    <TableCell>
                                        <div className="flex flex-col items-center gap-2 p-1">
                                            <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-lg shadow-sm border border-slate-700">
                                                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                                                <span className="text-sm font-black tracking-widest font-mono">{coupon.code}</span>
                                            </div>
                                            <Badge className="bg-green-50 text-green-700 border-green-200 shadow-none hover:bg-green-100 text-[10px] font-black uppercase tracking-wider h-5 flex items-center gap-1">
                                                Giảm {coupon.discountPercent}%
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    {/* Cột: Điều kiện */}
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                Tối thiểu: <span className="text-slate-900">{formatVND(coupon.minDiscount)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                Tối đa: <span className="text-slate-900">{formatVND(coupon.maxDiscount)}</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Cột: Hạn dùng */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-black text-slate-800">
                                                {new Date(coupon.expiryDate).toLocaleDateString('vi-VN', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Cột: Sử dụng */}
                                    <TableCell>
                                        <div className="flex justify-center">
                                            <div className="flex flex-col gap-1.5 w-32">
                                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                    <span>Đã dùng</span>
                                                    <span>{coupon.usedCount || 0}/{coupon.quantity}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${((coupon.usedCount || 0) / coupon.quantity) > 0.8 ? 'bg-amber-500' : 'bg-primary'
                                                            }`}
                                                        style={{ width: `${Math.min(((coupon.usedCount || 0) / coupon.quantity) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Cột: Trạng thái */}
                                    <TableCell className="text-center">
                                        {coupon.status === 1 ? (
                                            <Badge className="bg-green-50 text-green-700 border-green-200 shadow-none hover:bg-green-50 text-[10px] font-black py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                                                <CheckCircle2 className="w-3 h-3" /> Hoạt động
                                            </Badge>
                                        ) : coupon.status === 2 ? (
                                            <Badge className="bg-slate-50 text-slate-500 border-slate-200 shadow-none hover:bg-slate-50 text-[10px] font-black py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                                                <Clock className="w-3 h-3" /> Hết hạn
                                            </Badge>
                                        ) : coupon.status === 0 ? (
                                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none hover:bg-blue-50 text-[10px] font-black py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                                                <XCircle className="w-3 h-3" /> Tạm ẩn
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none hover:bg-amber-50 text-[10px] font-black py-0.5 inline-flex items-center gap-1 uppercase tracking-tight">
                                                <XCircle className="w-3 h-3" /> Hết lượt
                                            </Badge>
                                        )}
                                    </TableCell>

                                    {/* Cột: Thao tác */}
                                    <TableCell className="text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3 font-bold text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-all flex items-center gap-1.5"
                                                onClick={() => onToggleStatus?.(coupon)}
                                            >
                                                <RotateCw className="w-3.5 h-3.5" />
                                                Đổi Trạng Thái
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 border border-rose-100 rounded-lg transition-all"
                                                onClick={() => onDelete?.(coupon.id)}
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Phân trang - Đồng bộ với DataTable style */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-slate-50/30">
                <p className="text-sm font-medium text-muted-foreground">
                    Hiển thị {coupons?.length || 0} / {(pagination.totalElements || coupons?.length || 0).toLocaleString()} phiếu giảm giá
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 font-semibold text-muted-foreground disabled:opacity-30 rounded-xl flex items-center gap-1"
                        onClick={() => onPageChange?.(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 0}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </Button>
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: pagination.totalPages || 1 }).map((_, idx) => {
                            const pageNum = idx;
                            const isActive = pagination.currentPage === pageNum;
                            return (
                                <span
                                    key={idx}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all cursor-pointer border ${isActive
                                            ? "bg-primary text-white border-primary shadow-sm"
                                            : "text-foreground bg-white border-border hover:bg-muted/50 hover:border-border"
                                        }`}
                                    onClick={() => onPageChange?.(pageNum)}
                                >
                                    {pageNum + 1}
                                </span>
                            );
                        })}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 font-semibold text-foreground hover:bg-white hover:shadow-sm hover:border hover:border-border rounded-xl transition-all flex items-center gap-1"
                        onClick={() => onPageChange?.(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= (pagination.totalPages || 1) - 1}
                    >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
