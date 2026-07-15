import React from "react";
import { cn } from "@/lib/utils";
import AppTable from "@/components/common/micro/AppTable";
import DataPagination from "@/components/common/composite/DataPagination";

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
            <DataPagination pagination={pagination} dataLength={data?.length || 0} />
        </div>
    );
}
