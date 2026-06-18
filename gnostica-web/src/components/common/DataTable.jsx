import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

/**
 * Gnostica DataTable - A premium, reusable table component.
 * 
 * @param {Object} props
 * @param {Array} props.columns - Configuration for columns: { key, header, render, className }
 * @param {Array} props.data - Data to display
 * @param {string} props.className - Additional classes for the table container
 * @param {string} props.rowClassName - Additional classes for each row
 * @param {Function} props.onRowClick - Callback when a row is clicked
 * @param {React.ReactNode} props.emptyState - Component to show when data is empty
 * @param {boolean} props.isLoading - Whether the table is in a loading state
 * @param {React.ReactNode} props.loadingState - Component to show when loading
 * @param {Object} props.pagination - Pagination data { currentPage, totalItems, itemsPerPage, totalPages }
 * @param {Function} props.onPageChange - Callback when page changes
 */
export default function DataTable({
    columns,
    data,
    className,
    rowClassName,
    onRowClick,
    emptyState,
    isLoading,
    loadingState,
    pagination,
    onPageChange,
    ...props
}) {
    return (
        <div className={cn("w-full", className)}>
            <div className="border border-border rounded-t-xl overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                    <Table {...props}>
                        <TableHeader className="bg-muted/50 border-b border-border">
                            <TableRow className="hover:bg-transparent border-none">
                                {columns.map((column, index) => (
                                    <TableHead
                                        key={column.key || index}
                                        className={cn(
                                            "py-4 px-4 font-semibold text-sm text-foreground font-sans",
                                            column.className
                                        )}
                                    >
                                        {typeof column.header === "function" ? column.header() : column.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        {loadingState || <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                            Đang tải dữ liệu...
                                        </div>}
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-40 text-center">
                                        {emptyState || (
                                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                                <p className="text-sm font-medium">Không có dữ liệu để hiển thị</p>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <TableRow
                                        key={row.id || rowIndex}
                                        className={cn(
                                            "group transition-all duration-200 hover:bg-muted/50 border-b border-border/50 last:border-0",
                                            onRowClick && "cursor-pointer",
                                            rowClassName
                                        )}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {columns.map((column, colIndex) => (
                                            <TableCell
                                                key={column.key || colIndex}
                                                className={cn("py-4 px-4 align-middle", column.className)}
                                            >
                                                {column.render ? column.render(row, rowIndex) : row[column.key]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {pagination && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/30">
                    <p className="text-sm font-medium text-muted-foreground">
                        Hiển thị {data.length} / {pagination.totalItems.toLocaleString()} bản ghi
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-3 font-semibold text-muted-foreground disabled:opacity-30 rounded-xl flex items-center gap-1"
                            onClick={() => onPageChange?.(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Trước
                        </Button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: Math.min(pagination.totalPages || 1, 5) }).map((_, i) => {
                                const pageNum = i + 1;
                                const isActive = pagination.currentPage === pageNum;
                                return (
                                    <span
                                        key={pageNum}
                                        className={cn(
                                            "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all cursor-pointer border",
                                            isActive
                                                ? "bg-primary text-white border-primary shadow-sm"
                                                : "text-foreground bg-white border-border hover:bg-muted/50 hover:border-border"
                                        )}
                                        onClick={() => onPageChange?.(pageNum)}
                                    >
                                        {pageNum}
                                    </span>
                                );
                            })}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-3 font-semibold text-foreground hover:bg-white hover:shadow-sm hover:border hover:border-border rounded-xl transition-all flex items-center gap-1"
                            onClick={() => onPageChange?.(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                        >
                            Sau
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
