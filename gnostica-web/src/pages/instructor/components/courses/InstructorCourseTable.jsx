import React from "react";
import AppTable from "@/components/common/AppTable";
import {
    Eye,
    EyeOff,
    Pencil,
    Trash2,
    MessageSquareWarning,
    Tag,
    Users,
    Star,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function InstructorCourseTable({
    courses,
    pagination,
    onPageChange,
    onEdit,
    onDelete,
    onToggleStatus,
    onViewRejectReason,
}) {
    const columns = [
        {
            header: "STT",
            className: "w-[60px] text-center",
            cellClassName: "text-center font-sans",
            render: (row, index) => (
                <span className="text-2xs font-bold text-muted-foreground tracking-tighter">
                    {(index + 1).toString().padStart(2, '0')}
                </span>
            ),
        },
        {
            header: "Khóa học",
            className: "text-center",
            render: (row) => (
                <div className="flex gap-4 items-center">
                    <div className="w-24 h-16 rounded-md overflow-hidden shrink-0 border border-border relative bg-muted flex items-center justify-center">
                        {row.thumbnail ? (
                            <img src={row.thumbnail} alt={row.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-300">
                                <Search className="w-5 h-5 mb-0.5 opacity-20" />
                                <span className="text-[7px] font-bold uppercase tracking-tighter opacity-40">No Image</span>
                            </div>
                        )}
                        {row.isVirtualDraft && (
                            <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                                <span className="text-[8px] font-black text-amber-700 bg-amber-100/90 px-1 py-0.5 rounded uppercase tracking-wider">
                                    Nháp
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground line-clamp-2" title={row.title}>
                            {row.title || <span className="italic text-muted-foreground">Chưa đặt tên</span>}
                        </span>
                        {row.isVirtualDraft ? (
                            <span className="text-xs text-amber-600 font-medium mt-1">Bản nháp chưa lưu</span>
                        ) : (
                            <span className="text-xs text-muted-foreground font-medium mt-1">ID: #{row.id}</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: "Giá và Trạng thái",
            render: (row) => (
                <div className="flex flex-col gap-1">
                    {row.isVirtualDraft ? (
                        <span className="text-sm text-muted-foreground italic">—</span>
                    ) : row.discount > 0 ? (
                        <>
                            <span className="font-black text-foreground leading-none">{formatPrice(row.salePrice)}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-muted-foreground line-through decoration-slate-300">
                                    {formatPrice(row.price)}
                                </span>
                                <span className="text-[9px] font-bold text-error bg-red-50 px-1 rounded">
                                    -{row.discount}%
                                </span>
                            </div>
                        </>
                    ) : (
                        <span className="font-black text-foreground">{formatPrice(row.price)}</span>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {row.isVirtualDraft ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                                Bản nháp mới
                            </span>
                        ) : (
                            <>
                                {row.status === 1 ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-success font-bold bg-green-50 px-1.5 py-0 rounded border border-success/20">Đang bán</span>
                                ) : row.status === 3 || row.status === "rejected" ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0 rounded border border-rose-200">Bị từ chối</span>
                                ) : row.status === 4 ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Chờ duyệt</span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold bg-secondary px-1.5 py-0 rounded border border-border">Ẩn</span>
                                )}
                                {row.hasUnsavedDraft && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-warning font-bold bg-orange-50 px-1.5 py-0 rounded border border-warning/20">
                                        Có bản nháp
                                        <span className="w-1 h-1 rounded-full bg-warning/10 text-warning animate-pulse ml-1" />
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: "Danh mục",
            className: "text-center",
            cellClassName: "text-center",
            render: (row) => row.isVirtualDraft ? (
                <span className="text-slate-300 text-sm">—</span>
            ) : (
                <span className="inline-flex items-center gap-1.5 font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full text-xs border border-indigo-100">
                    <Tag className="w-3 h-3" />
                    {row.categoryName || "Chưa phân loại"}
                </span>
            )
        },
        {
            header: "Thống kê",
            className: "text-center",
            render: (row) => row.isVirtualDraft ? (
                <div className="flex justify-center"><span className="text-slate-300 text-sm">—</span></div>
            ) : (
                <div className="flex justify-center gap-4 text-xs font-bold text-foreground">
                    <div className="flex flex-col items-center gap-1 bg-muted p-1.5 rounded-md border border-border min-w-[50px]">
                        <Users className="w-3.5 h-3.5 text-info" /> 0
                    </div>
                    <div className="flex flex-col items-center gap-1 bg-muted p-1.5 rounded-md border border-border min-w-[50px]">
                        <Star className="w-3.5 h-3.5 text-slate-300" /> --
                    </div>
                </div>
            )
        },
        {
            header: "Trạng thái",
            className: "text-center w-[120px]",
            cellClassName: "text-center",
            render: (row) => (!row.isVirtualDraft && (row.status === 1 || row.status === 2)) ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-lg transition-all mx-auto ${row.status === 1 ? "bg-green-50 text-success hover:bg-success/10" : "bg-muted text-muted-foreground hover:bg-secondary"}`}
                    onClick={() => onToggleStatus?.(row.id, row.status)}
                    title={row.status === 1 ? "Đang hiển thị (Nhấn để ẩn)" : "Đang ẩn (Nhấn để hiện)"}
                >
                    {row.status === 1 ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
                </Button>
            ) : !row.isVirtualDraft ? (
                <span className="text-slate-300 text-xs font-bold tracking-tighter opacity-60">—</span>
            ) : null
        },
        {
            header: "Thao tác",
            className: "text-center",
            cellClassName: "text-center",
            render: (row) => (
                <div className="flex justify-center items-center gap-2">
                    {(row.status === 3 || row.status === "rejected" || row.rejectReason) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-all"
                            title="Xem lý do từ chối"
                            onClick={() => onViewRejectReason?.(row)}
                        >
                            <MessageSquareWarning className="w-4.5 h-4.5" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-lg transition-all"
                        onClick={() => onEdit?.(row)}
                        title="Chỉnh sửa"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 bg-red-50 text-error hover:bg-error/10 rounded-lg transition-all"
                        onClick={() => onDelete?.(row)}
                        title="Xóa"
                    >
                        <Trash2 className="w-4.5 h-4.5" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <AppTable 
            columns={columns} 
            data={courses} 
            pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalElements: pagination.totalElements,
                onPageChange: onPageChange,
                zeroIndexed: true
            }}
            emptyState="Bạn chưa có khóa học nào."
            rowClassName={(row) => `hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0 ${row.isVirtualDraft ? "bg-amber-50/40 border-l-2 border-l-amber-400" : ""}`}
        />
    );
}
