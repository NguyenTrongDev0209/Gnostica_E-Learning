import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

/**
 * AppPagination - Phân trang chuẩn của Gnostica
 * 
 * @param {number} currentPage - Trang hiện tại
 * @param {number} totalPages - Tổng số trang
 * @param {Function} onPageChange - Hàm callback khi đổi trang, nhận vào (pageNumber)
 * @param {number} siblingCount - Số trang hiển thị cạnh trang hiện tại (mặc định 1)
 */
export default function AppPagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}) {
  const generatePagination = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= Math.max(1, totalPages); i++) pages.push(i);
      return pages;
    }
    
    pages.push(1);
    
    const start = Math.max(2, currentPage - siblingCount);
    const end = Math.min(totalPages - 1, currentPage + siblingCount);
    
    if (start > 2) {
      pages.push("...");
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages - 1) {
      pages.push("...");
    }
    
    pages.push(totalPages);
    
    return pages;
  };

  const pages = generatePagination();

  return (
    <Pagination className={className} {...props}>
      <PaginationContent className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
            }}
            className={cn(
              "h-9 px-3 font-semibold text-muted-foreground hover:text-foreground hover:bg-white hover:shadow-sm hover:border hover:border-border rounded-xl transition-all",
              currentPage <= 1 ? "opacity-30 pointer-events-none" : "cursor-pointer"
            )}
            size="sm"
            text="Trước"
          />
        </PaginationItem>
        
        {pages.map((page, idx) => {
          if (page === "...") {
            return (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis className="w-9 h-9" />
              </PaginationItem>
            );
          }
          
          const isActive = page === currentPage;
          return (
            <PaginationItem key={page}>
              <PaginationLink 
                href="#" 
                isActive={isActive}
                onClick={(e) => {
                  e.preventDefault();
                  if (page !== currentPage && onPageChange) onPageChange(page);
                }}
                className={cn(
                  "w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-sm font-semibold transition-all cursor-pointer border",
                  isActive 
                    ? "bg-primary text-white border-primary shadow-sm hover:bg-primary/90 hover:text-white" 
                    : "text-foreground bg-white border-border hover:bg-muted/50 hover:border-border"
                )}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        
        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages && onPageChange) onPageChange(currentPage + 1);
            }}
            className={cn(
              "h-9 px-3 font-semibold text-muted-foreground hover:text-foreground hover:bg-white hover:shadow-sm hover:border hover:border-border rounded-xl transition-all",
              currentPage >= Math.max(1, totalPages) ? "opacity-30 pointer-events-none" : "cursor-pointer"
            )}
            size="sm"
            text="Sau"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
