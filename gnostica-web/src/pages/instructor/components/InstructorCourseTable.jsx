import React from "react";
import DataTable from "@/components/common/composite/DataTable";
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
import { TableActionIconButton } from "@/components/common/micro/AppButton";

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
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-medium mt-1">ID: #{row.id}</span>
                                {row.hasDraftVersion && (
                                    <span className="text-[11px] text-error font-semibold mt-1 bg-error/10 px-2 py-0.5 w-max rounded-sm" title="Bản cập nhật của khóa học này đang chờ duyệt. Bạn có thể nhấn Chỉnh sửa để sửa tiếp.">Có bản cập nhật đang chờ duyệt của khóa học này</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: "Giá",
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
                        <Users className="w-3.5 h-3.5 text-info" /> {row.students || 0}
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
            render: (row) => (
                <div className="flex flex-col items-center gap-1.5">
                    {row.isVirtualDraft ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                            Bản nháp mới
                        </span>
                    ) : (
                        <>
                            {row.status === 3 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-success font-bold bg-green-50 px-1.5 py-0 rounded border border-success/20">Đang bán</span>
                            ) : row.status === 0 || row.status === "rejected" ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0 rounded border border-rose-200">Bị từ chối</span>
                            ) : row.status === 2 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Chờ duyệt</span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold bg-secondary px-1.5 py-0 rounded border border-border">Ẩn / Bản nháp</span>
                            )}
                            {row.hasUnsavedDraft && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-warning font-bold bg-orange-50 px-1.5 py-0 rounded border border-warning/20">
                                    Có bản nháp
                                    <span className="w-1 h-1 rounded-full bg-warning/10 text-warning animate-pulse ml-1" />
                                </span>
                            )}
                        </>
                    )}
                    {(!row.isVirtualDraft && (row.status === 3 || row.status === 1 || row.status === 4)) && (
                        <div className="mt-1">
                            <TableActionIconButton
                                icon={row.status === 3 ? Eye : EyeOff}
                                onClick={() => onToggleStatus?.(row.id, row.status)}
                                title={row.status === 3 ? "Đang hiển thị (Nhấn để ẩn)" : "Đang ẩn (Nhấn để hiện)"}
                            />
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Thao tác",
            className: "text-center",
            cellClassName: "text-center",
            render: (row) => (
                <div className="flex justify-center items-center gap-2">
                    {(row.status === 0 || row.status === "rejected") && (
                        <TableActionIconButton
                            icon={MessageSquareWarning}
                            colorVariant="error"
                            title="Xem lý do từ chối"
                            onClick={() => onViewRejectReason?.(row)}
                        />
                    )}
                    <TableActionIconButton
                        icon={Pencil}
                        onClick={() => onEdit?.(row)}
                        title="Chỉnh sửa"
                    />
                    <TableActionIconButton
                        icon={Trash2}
                        colorVariant="error"
                        onClick={() => onDelete?.(row)}
                        title="Xóa"
                    />
                </div>
            )
        }
    ];

    return (
        <DataTable 
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
