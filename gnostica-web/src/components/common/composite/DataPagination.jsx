import React from "react";
import AppPagination from "@/components/common/micro/AppPagination";
import AppSelect from "@/components/common/micro/AppSelect";

/**
 * DataPagination - Component hiển thị thông tin phân trang và số lượng bản ghi (composite)
 * 
 * @param {Object} props
 * @param {Object} props.pagination - Pagination data { currentPage, totalItems, totalPages, onPageChange, onPageSizeChange, pageSize, zeroIndexed }
 * @param {number} props.dataLength - Số lượng bản ghi hiện đang được hiển thị trên trang hiện tại
 */
export default function DataPagination({
    pagination,
    dataLength = 0,
}) {
    if (!pagination) return null;

    const isZeroIndexed = pagination.zeroIndexed || false;
    const maxPages = pagination.totalPages || 1;
    const currentPageForUI = pagination.currentPage + (isZeroIndexed ? 1 : 0);
    const totalItems = pagination.totalItems || pagination.totalElements || 0;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/30 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm font-medium text-foreground whitespace-nowrap">
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
                <p>Hiển thị {dataLength} / {totalItems.toLocaleString()} bản ghi</p>
            </div>
            
            <AppPagination 
                currentPage={currentPageForUI}
                totalPages={maxPages}
                onPageChange={(page) => pagination.onPageChange?.(isZeroIndexed ? page - 1 : page)}
                siblingCount={1}
                className="w-auto mx-0"
            />
        </div>
    );
}
