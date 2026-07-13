import React from "react";
import { cn } from "@/lib/utils";
import AppTable from "@/components/common/micro/AppTable";
import AppPagination from "@/components/common/micro/AppPagination";
import AppSelect from "@/components/common/micro/AppSelect";

/**
 * Gnostica DataTable - Unified, premium, reusable table component with pagination.
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
 * @param {Function} props.renderExpandedRow - Render expanded content for row
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
    renderExpandedRow,
    ...props
}) {
    // Pagination logic
    const isZeroIndexed = pagination?.zeroIndexed || false;
    const maxPages = pagination?.totalPages || 1;
    const currentPageForUI = pagination ? pagination.currentPage + (isZeroIndexed ? 1 : 0) : 1;

    return (
        <div className={cn("w-full bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col", className)}>
            <div className="flex-1 overflow-hidden">
                <AppTable 
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    loadingState={loadingState}
                    emptyState={emptyState}
                    rowClassName={rowClassName}
                    onRowClick={onRowClick}
                    rowKey={rowKey}
                    renderExpandedRow={renderExpandedRow}
                    hideWrapperStyle={true}
                    className="border-0 shadow-none rounded-none"
                    {...props}
                />
            </div>

            {/* Pagination & Display Info */}
            {pagination && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/30 gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <span>Xem</span>
                            <AppSelect 
                                className="!h-9 w-[80px] rounded-lg"
                                value={pagination.pageSize ? pagination.pageSize.toString() : "10"}
                                onValueChange={(val) => pagination.onPageSizeChange?.(Number(val))}
                                options={[
                                    { label: "10", value: "10" },
                                    { label: "20", value: "20" },
                                    { label: "50", value: "50" },
                                    { label: "100", value: "100" },
                                ]}
                            />
                            <span>mục</span>
                        </div>
                        <p className="hidden sm:block text-muted-foreground/40">|</p>
                        <p>Hiển thị {data?.length || 0} / {(pagination.totalItems || pagination.totalElements || 0).toLocaleString()} bản ghi</p>
                    </div>
                    
                    <AppPagination 
                        currentPage={currentPageForUI}
                        totalPages={maxPages}
                        onPageChange={(page) => pagination.onPageChange?.(isZeroIndexed ? page - 1 : page)}
                        siblingCount={1}
                        className="w-auto mx-0"
                    />
                </div>
            )}
        </div>
    );
}
