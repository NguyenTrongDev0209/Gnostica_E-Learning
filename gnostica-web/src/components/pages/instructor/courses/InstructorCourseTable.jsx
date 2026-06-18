import React from "react";
import {
    Eye,
    EyeOff,
    Pencil,
    Trash2,
    MessageSquareWarning,
    Tag,
    Users,
    Star,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

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
    return (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="border-b border-border">
                            <TableHead className="w-[60px] text-center py-4 font-semibold text-foreground">STT</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Khóa học</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground">Giá và Trạng thái</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Danh mục</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Thống kê</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center w-[120px]">Trạng thái</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground text-center">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    Bạn chưa có khóa học nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course, index) => (
                                <TableRow
                                    key={course.id}
                                    className={`hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0 ${course.isVirtualDraft ? "bg-amber-50/40 border-l-2 border-l-amber-400" : ""
                                        }`}
                                >
                                    {/* Cột: STT */}
                                    <TableCell className="text-center font-sans">
                                        <span className="text-2xs font-bold text-muted-foreground tracking-tighter">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                    </TableCell>

                                    {/* Cột: Khóa học */}
                                    <TableCell>
                                        <div className="flex gap-4 items-center">
                                            <div className="w-24 h-16 rounded-md overflow-hidden shrink-0 border border-border relative bg-muted flex items-center justify-center">
                                                {course.thumbnail ? (
                                                    <img
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-slate-300">
                                                        <Search className="w-5 h-5 mb-0.5 opacity-20" />
                                                        <span className="text-[7px] font-bold uppercase tracking-tighter opacity-40">No Image</span>
                                                    </div>
                                                )}
                                                {course.isVirtualDraft && (
                                                    <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                                                        <span className="text-[8px] font-black text-amber-700 bg-amber-100/90 px-1 py-0.5 rounded uppercase tracking-wider">
                                                            Nháp
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground line-clamp-2" title={course.title}>
                                                    {course.title || <span className="italic text-muted-foreground">Chưa đặt tên</span>}
                                                </span>
                                                {course.isVirtualDraft ? (
                                                    <span className="text-xs text-amber-600 font-medium mt-1">Bản nháp chưa lưu</span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground font-medium mt-1">ID: #{course.id}</span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Cột: Giá và Trạng thái */}
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {course.isVirtualDraft ? (
                                                <span className="text-sm text-muted-foreground italic">—</span>
                                            ) : course.discount > 0 ? (
                                                <>
                                                    <span className="font-black text-foreground leading-none">
                                                        {formatPrice(course.salePrice)}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-muted-foreground line-through decoration-slate-300">
                                                            {formatPrice(course.price)}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-error bg-red-50 px-1 rounded">
                                                            -{course.discount}%
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="font-black text-foreground">
                                                    {formatPrice(course.price)}
                                                </span>
                                            )}
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {course.isVirtualDraft ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                                                        Bản nháp mới
                                                    </span>
                                                ) : (
                                                    <>
                                                        {course.status === 1 ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-success font-bold bg-green-50 px-1.5 py-0 rounded border border-success/20">
                                                                Đang bán
                                                            </span>
                                                        ) : course.status === 3 || course.status === "rejected" ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0 rounded border border-rose-200">
                                                                Bị từ chối
                                                            </span>
                                                        ) : course.status === 4 ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                                                Chờ duyệt
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold bg-secondary px-1.5 py-0 rounded border border-border">
                                                                Ẩn
                                                            </span>
                                                        )}
                                                        {course.hasUnsavedDraft && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-warning font-bold bg-orange-50 px-1.5 py-0 rounded border border-warning/20">
                                                                Có bản nháp
                                                                <span className="w-1 h-1 rounded-full bg-warning/10 text-warning animate-pulse ml-1" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Cột: Danh mục */}
                                    <TableCell className="text-center">
                                        {course.isVirtualDraft ? (
                                            <span className="text-slate-300 text-sm">—</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full text-xs border border-indigo-100">
                                                <Tag className="w-3 h-3" />
                                                {course.categoryName || "Chưa phân loại"}
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Cột: Thống kê */}
                                    <TableCell>
                                        {course.isVirtualDraft ? (
                                            <div className="flex justify-center">
                                                <span className="text-slate-300 text-sm">—</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center gap-4 text-xs font-bold text-foreground">
                                                <div className="flex flex-col items-center gap-1 bg-muted p-1.5 rounded-md border border-border min-w-[50px]">
                                                    <Users className="w-3.5 h-3.5 text-info" />
                                                    0
                                                </div>
                                                <div className="flex flex-col items-center gap-1 bg-muted p-1.5 rounded-md border border-border min-w-[50px]">
                                                    <Star className="w-3.5 h-3.5 text-slate-300" />
                                                    --
                                                </div>
                                            </div>
                                        )}
                                    </TableCell>

                                    {/* Cột: Trạng thái toggle */}
                                    <TableCell className="text-center">
                                        {!course.isVirtualDraft && (course.status === 1 || course.status === 2) ? (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-9 w-9 rounded-lg transition-all mx-auto ${course.status === 1
                                                    ? "bg-green-50 text-success hover:bg-success/10 text-success hover:text-success"
                                                    : "bg-muted text-muted-foreground hover:bg-secondary hover:text-muted-foreground"
                                                    }`}
                                                onClick={() => onToggleStatus?.(course.id, course.status)}
                                                title={course.status === 1 ? "Đang hiển thị (Nhấn để ẩn)" : "Đang ẩn (Nhấn để hiện)"}
                                            >
                                                {course.status === 1 ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
                                            </Button>
                                        ) : !course.isVirtualDraft ? (
                                            <span className="text-slate-300 text-xs font-bold tracking-tighter opacity-60">—</span>
                                        ) : null}
                                    </TableCell>

                                    {/* Cột: Thao tác */}
                                    <TableCell className="text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            {(course.status === 3 || course.status === "rejected" || course.rejectReason) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-all"
                                                    title="Xem lý do từ chối"
                                                    onClick={() => onViewRejectReason?.(course)}
                                                >
                                                    <MessageSquareWarning className="w-4.5 h-4.5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-lg transition-all"
                                                onClick={() => onEdit?.(course)}
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 bg-red-50 text-error hover:bg-error/10 text-error hover:text-error rounded-lg transition-all"
                                                onClick={() => onDelete?.(course)}
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4.5 h-4.5" />
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground">
                    Hiển thị {courses.length} / {(pagination.totalElements || 0).toLocaleString()} khóa học
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
                            const pageNum = idx; // currentPage is 0-indexed in useInstructorCourses
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
