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
 * Gnostica AppTable - Unified, premium, reusable table component.
 * 
 * @param {Object} props
 * @param {Array} props.columns - Configuration for columns: { accessor/key, header, render, className, cellClassName, width }
 * @param {Array} props.data - Data to display
 * @param {string} props.className - Additional classes for the table container
 * @param {string|Function} props.rowClassName - Additional classes for each row. Can be a string or function(row, index).
 * @param {Function} props.onRowClick - Callback when a row is clicked
 * @param {React.ReactNode|string} props.emptyState - Component or string to show when data is empty
 * @param {boolean} props.isLoading - Whether the table is in a loading state
 * @param {React.ReactNode} props.loadingState - Component to show when loading
 * @param {Object} props.pagination - Pagination data { currentPage, totalItems, totalPages, onPageChange, zeroIndexed }
 * @param {Function} props.rowKey - Optional function to get row key. Defaults to row.id or index.
 */
export default function DataTable({
    columns = [],
    data = [],
    className,
    rowClassName,
    onRowClick,
    emptyState,
    isLoading,
    loadingState,
    pagination,
    rowKey = (row, index) => row?.id || index,
    ...props
}) {
    // Pagination logic
    const isZeroIndexed = pagination?.zeroIndexed || false;
    const offset = isZeroIndexed ? 0 : 1;
    const maxPages = pagination?.totalPages || 1;

    // Helper to render pagination numbers
    const renderPaginationNumbers = () => {
        // If it's zeroIndexed (e.g. Courses, Students), we show all pages or we can cap it. Let's cap to 5 like DataTable for consistency or allow overflow.
        // For simplicity and to match old DataTable behavior, we will cap at 5 pages.
        const length = Math.min(maxPages, 5);
        return Array.from({ length }).map((_, i) => {
            const pageNum = i + offset;
            const isActive = pagination.currentPage === pageNum;
            return (
                <span
                    key={pageNum}
                    className={cn(
                        "w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-sm font-semibold transition-all cursor-pointer border",
                        isActive
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "text-foreground bg-white border-border hover:bg-muted/50 hover:border-border"
                    )}
                    onClick={() => pagination.onPageChange?.(pageNum)}
                >
                    {isZeroIndexed ? pageNum + 1 : pageNum}
                </span>
            );
        });
    };

    return (
        <div className={cn("w-full bg-white border border-border rounded-xl shadow-sm overflow-hidden", className)}>
            <div className="overflow-x-auto scrollbar-thin">
                <Table {...props}>
                    <TableHeader className="bg-muted/50 border-b border-border">
                        <TableRow className="hover:bg-transparent border-none">
                            {columns.map((column, index) => (
                                <TableHead
                                    key={column.key || column.accessor || index}
                                    className={cn(
                                        "py-4 px-4 font-semibold text-sm text-foreground font-sans",
                                        column.className
                                    )}
                                    style={{ width: column.width }}
                                >
                                    {typeof column.header === "function" ? column.header() : column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center">
                                    {loadingState || (
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium animate-pulse">Đang tải dữ liệu...</span>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : !data || data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                    {emptyState || "Không có dữ liệu."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, rowIndex) => {
                                const trClass = typeof rowClassName === "function" 
                                    ? rowClassName(row, rowIndex) 
                                    : rowClassName || "";

                                const expandedContent = props.renderExpandedRow ? props.renderExpandedRow(row, rowIndex) : null;

                                return (
                                    <React.Fragment key={rowKey(row, rowIndex)}>
                                        <TableRow
                                            className={cn(
                                                "group transition-colors duration-200 hover:bg-muted/30 border-b border-border/50 last:border-0",
                                                onRowClick && "cursor-pointer",
                                                trClass
                                            )}
                                            onClick={() => onRowClick?.(row)}
                                        >
                                            {columns.map((column, colIndex) => (
                                                <TableCell
                                                    key={column.key || column.accessor || colIndex}
                                                    className={cn("py-4 px-4 align-middle", column.cellClassName)}
                                                >
                                                    {column.render ? column.render(row, rowIndex) : row[column.key || column.accessor]}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                        {expandedContent}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/30">
                    <p className="text-sm font-medium text-muted-foreground">
                        Hiển thị {data?.length || 0} / {(pagination.totalItems || pagination.totalElements || 0).toLocaleString()} bản ghi
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-3 font-semibold text-muted-foreground disabled:opacity-30 rounded-xl flex items-center gap-1"
                            onClick={() => pagination.onPageChange?.(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= (isZeroIndexed ? 0 : 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Trước
                        </Button>
                        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide">
                            {renderPaginationNumbers()}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-3 font-semibold text-foreground hover:bg-white hover:shadow-sm hover:border hover:border-border rounded-xl transition-all flex items-center gap-1"
                            onClick={() => pagination.onPageChange?.(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= (isZeroIndexed ? maxPages - 1 : maxPages)}
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
