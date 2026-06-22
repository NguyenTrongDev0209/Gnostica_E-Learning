import React from "react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export default function InstructorRevenueTable({
    transactions,
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
                            <TableHead className="py-4 font-semibold text-foreground">Mã GD & Thời gian</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground">Nội dung</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Phát sinh</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Loại</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!Array.isArray(transactions) || transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-medium">
                                    Chưa có giao dịch nào được ghi nhận.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((trx, index) => (
                                <TableRow
                                    key={trx.id}
                                    className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0"
                                >
                                    {/* Cột: STT */}
                                    <TableCell className="text-center font-sans">
                                        <span className="text-2xs font-bold text-muted-foreground tracking-tighter">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                    </TableCell>

                                    {/* Cột: Mã GD & Thời gian */}
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground flex items-center gap-1.5 capitalize">
                                                TRX-{trx.id}
                                                {trx.type === 1 ? (
                                                    <ArrowUpRight className="w-3 h-3 text-success" />
                                                ) : (
                                                    <ArrowDownRight className="w-3 h-3 text-rose-500" />
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-medium mt-0.5">
                                                {new Date(trx.createdAt).toLocaleString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Cột: Nội dung */}
                                    <TableCell className="max-w-[300px]">
                                        <span className="text-sm font-bold text-foreground line-clamp-1" title={trx.ref}>
                                            {trx.ref || "Không có nội dung"}
                                        </span>
                                    </TableCell>

                                    {/* Cột: Phát sinh */}
                                    <TableCell className="text-center">
                                        <span className={`font-black text-sm ${trx.type === 1 ? "text-success" : "text-rose-600"}`}>
                                            {trx.type === 1 ? "+" : "-"}{formatVND(trx.amount)}
                                        </span>
                                    </TableCell>

                                    {/* Cột: Loại */}
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight py-0 bg-muted border-border text-muted-foreground">
                                            {trx.paymentMethod === "REVENUE" ? "Thanh toán khóa học" :
                                                trx.paymentMethod === "WITHDRAW" ? "Rút tiền mặt" : trx.paymentMethod}
                                        </Badge>
                                    </TableCell>

                                    {/* Cột: Trạng thái */}
                                    <TableCell className="text-center">
                                        {trx.status === 1 ? (
                                            <Badge className="bg-green-50 text-success border-success/20 shadow-none hover:bg-green-50 text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Thành công
                                            </Badge>
                                        ) : trx.status === 0 ? (
                                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none hover:bg-amber-50 text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Đang chờ
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 shadow-none hover:bg-rose-50 text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                                                <XCircle className="w-3 h-3" /> Thất bại
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Phân trang - Đồng bộ với DataTable style */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground">
                    Hiển thị {transactions?.length || 0} / {(pagination.totalElements || transactions?.length || 0).toLocaleString()} giao dịch
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
