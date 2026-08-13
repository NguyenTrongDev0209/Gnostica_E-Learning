import React, { useState } from "react";
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
 * @param {Object} props.selection - Optional row selection: { selectedRowKeys, onSelectionChange }
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
    selection,
    ...props
}) {
    const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState([]);
    const isAdminTable = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
    const usesInternalSelection = selection === true || (selection === undefined && isAdminTable);
    const resolvedSelection = selection && selection !== true
        ? selection
        : usesInternalSelection
            ? { selectedRowKeys: internalSelectedRowKeys, onSelectionChange: setInternalSelectedRowKeys }
            : undefined;

    return (
        <div className={cn("w-full bg-white border border-border rounded-xl shadow-sm", className)}>
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
                selection={resolvedSelection}
                hideWrapperStyle={true}
                className="border-0 shadow-none rounded-none"
                {...props}
            />

            {/* Pagination & Display Info */}
            <DataPagination pagination={pagination} dataLength={data?.length || 0} />
        </div>
    );
}
