import React from "react";
import {
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/composite/DataTable";

const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export default function InstructorRevenueTable({
    transactions,
    pagination = { currentPage: 0, totalPages: 1, totalElements: 0 },
    onPageChange,
}) {
    const columns = [
        {
            header: "STT",
            className: "w-[60px] text-center",
            cellClassName: "text-center font-sans",
            render: (trx, index) => (
                <span className="text-2xs font-bold text-muted-foreground tracking-tighter">
                    {(index + 1).toString().padStart(2, '0')}
                </span>
            )
        },
        {
            header: "Mã GD & Thời gian",
            render: (trx) => (
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
            )
        },
        {
            header: "Nội dung",
            className: "max-w-[300px]",
            cellClassName: "max-w-[300px]",
            render: (trx) => (
                <span className="text-sm font-bold text-foreground line-clamp-1" title={trx.ref}>
                    {trx.ref || "Không có nội dung"}
                </span>
            )
        },
        {
            header: "Phát sinh",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => (
                <span className={`font-black text-sm ${trx.type === 1 ? "text-success" : "text-rose-600"}`}>
                    {trx.type === 1 ? "+" : "-"}{formatVND(trx.amount)}
                </span>
            )
        },
        {
            header: "Loại",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => (
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight py-0 bg-muted border-border text-muted-foreground">
                    {trx.paymentMethod === "REVENUE" ? "Thanh toán khóa học" :
                        trx.paymentMethod === "WITHDRAW" ? "Rút tiền mặt" : trx.paymentMethod}
                </Badge>
            )
        },
        {
            header: "Trạng thái",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => {
                if (trx.status === 1) return (
                    <Badge className="bg-green-50 text-success border-success/20 shadow-none hover:bg-green-50 text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Thành công
                    </Badge>
                );
                if (trx.status === 0) return (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none hover:bg-amber-50 text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Đang chờ
                    </Badge>
                );
                return (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 shadow-none hover:bg-rose-50 text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Thất bại
                    </Badge>
                );
            }
        }
    ];

    return (
        <div className="animate-fade-up">
            <DataTable 
                columns={columns}
                data={transactions}
                emptyState="Chưa có giao dịch nào được ghi nhận."
                pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalElements: pagination.totalElements || transactions?.length || 0,
                    onPageChange: onPageChange,
                    zeroIndexed: true // Instructor endpoints often use 0-indexed pages
                }}
            />
        </div>
    );
}
