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
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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

  if (totalPages <= 1) return null;

  return (
    <Pagination className={className} {...props}>
      <PaginationContent className="bg-muted/30 p-1.5 rounded-xl border glass shadow-sm">
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
            }}
            className={cn(
              "rounded-lg transition-all duration-300 hover:bg-muted font-medium hover-lift",
              currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
            )}
            text="Trang trước"
          />
        </PaginationItem>
        
        {pages.map((page, idx) => {
          if (page === "...") {
            return (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
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
                  "rounded-lg transition-all duration-300 font-medium hover-lift",
                  isActive 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                    : "cursor-pointer hover:bg-muted"
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
              "rounded-lg transition-all duration-300 hover:bg-muted font-medium hover-lift",
              currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
            )}
            text="Trang sau"
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
