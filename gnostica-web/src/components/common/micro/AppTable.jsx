import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * AppTable (Micro) - Bảng hiển thị dữ liệu chuẩn cơ bản của Gnostica
 * 
 * @param {Array} columns - Định nghĩa cột: { key/accessor, label/header, render, className, cellClassName, width, align }
 * @param {Array} data - Dữ liệu bảng
 * @param {string} caption - Ghi chú dưới bảng (tùy chọn)
 * @param {boolean} isLoading - Trạng thái loading
 * @param {React.ReactNode|string} loadingState - Trạng thái tuỳ chỉnh khi loading
 * @param {React.ReactNode|string} emptyState - Trạng thái tuỳ chỉnh khi trống (Mặc định: "Không có dữ liệu.")
 * @param {Function|string} rowClassName - Class cho dòng (Nhận row và index nếu là function)
 * @param {Function} onRowClick - Hàm chạy khi click vào 1 dòng
 * @param {Function} rowKey - Hàm tạo khoá cho dòng
 * @param {Function} renderExpandedRow - Hàm render nội dung mở rộng cho dòng (trả về ReactNode)
 */
export default function AppTable({
  columns = [],
  data = [],
  caption,
  isLoading = false,
  loadingState,
  emptyState = "Không có dữ liệu.",
  className,
  rowClassName,
  onRowClick,
  rowKey = (row, index) => row?.id || index,
  renderExpandedRow,
  hideWrapperStyle = false,
  ...props
}) {
  return (
    <div className={cn(
      "w-full overflow-x-auto scrollbar-thin", 
      !hideWrapperStyle && "rounded-xl border glass shadow-sm",
      className
    )}>
      <Table {...props}>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow className="bg-primary/5 hover:bg-primary/10 transition-colors border-b border-border/50">
            {columns.map((col, index) => (
              <TableHead 
                key={col.key || col.accessor || index} 
                className={cn(
                  "py-3 px-4 font-semibold text-foreground align-middle", 
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.align === "left" && "text-left",
                  col.className
                )} 
                style={{ width: col.width }}
              >
                {typeof col.header === "function" ? col.header() : col.header || col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {loadingState || (
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-sm font-medium animate-pulse">Đang tải dữ liệu...</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : !data || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyState}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => {
              const trClass = typeof rowClassName === "function" 
                  ? rowClassName(row, rowIndex) 
                  : rowClassName || "";

              const expandedContent = renderExpandedRow ? renderExpandedRow(row, rowIndex) : null;

              return (
                <React.Fragment key={rowKey(row, rowIndex)}>
                  <TableRow 
                    className={cn(
                      "transition-colors duration-200 hover:bg-muted/30 border-b border-border/50 last:border-0",
                      onRowClick && "cursor-pointer",
                      trClass
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col, colIndex) => (
                      <TableCell 
                        key={col.key || col.accessor || colIndex} 
                        className={cn(
                          "py-3 px-4 align-middle", 
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.align === "left" && "text-left",
                          col.cellClassName
                        )}
                      >
                        {col.render ? col.render(row, rowIndex) : row[col.key || col.accessor]}
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
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
