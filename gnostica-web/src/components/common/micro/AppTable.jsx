import React from 'react';
import { ArrowUpDown } from 'lucide-react';
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
import { AppCheckbox } from "@/components/common/micro/AppCheckbox";

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
 * @param {Object} selection - Bật cột chọn dòng: { selectedRowKeys, onSelectionChange }
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
  selection,
  hideWrapperStyle = false,
  ...props
}) {
  const selectedRowKeys = selection?.selectedRowKeys ?? [];
  const selectionEnabled = Boolean(selection?.onSelectionChange);
  const visibleRowKeys = data.map((row, index) => rowKey(row, index));
  const allRowsSelected = visibleRowKeys.length > 0 && visibleRowKeys.every((key) => selectedRowKeys.includes(key));
  const someRowsSelected = !allRowsSelected && visibleRowKeys.some((key) => selectedRowKeys.includes(key));

  const toggleAllRows = (checked) => {
    const nextSelected = checked
      ? Array.from(new Set([...selectedRowKeys, ...visibleRowKeys]))
      : selectedRowKeys.filter((key) => !visibleRowKeys.includes(key));
    selection.onSelectionChange(nextSelected);
  };

  const toggleRow = (key, checked) => {
    const nextSelected = checked
      ? Array.from(new Set([...selectedRowKeys, key]))
      : selectedRowKeys.filter((selectedKey) => selectedKey !== key);
    selection.onSelectionChange(nextSelected);
  };

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
            {selectionEnabled && (
              <TableHead className="w-[52px] px-4 py-3 text-center">
                <AppCheckbox
                  aria-label="Chọn tất cả dòng đang hiển thị"
                  checked={allRowsSelected ? true : someRowsSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => toggleAllRows(Boolean(checked))}
                />
              </TableHead>
            )}
            {columns.map((col, index) => (
              <TableHead 
                key={col.key || col.accessor || index} 
                className={cn(
                  "py-3 px-4 font-semibold text-foreground align-middle text-center", 
                  col.className
                )} 
                style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
              >
                {col.sortable !== false && typeof col.header !== "function" && col.header !== "Thao tác" ? (
                  <div className={cn(
                    "flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors group select-none justify-center"
                  )}>
                    {col.header || col.label}
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                ) : (
                  typeof col.header === "function" ? col.header() : col.header || col.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length + (selectionEnabled ? 1 : 0)} className="h-24 text-center">
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
              <TableCell colSpan={columns.length + (selectionEnabled ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                {emptyState}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => {
              const currentRowKey = rowKey(row, rowIndex);
              const isRowSelected = selectedRowKeys.includes(currentRowKey);
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
                      isRowSelected && "bg-primary/5",
                      trClass
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectionEnabled && (
                      <TableCell className="w-[52px] px-4 py-3 text-center" onClick={(event) => event.stopPropagation()}>
                        <AppCheckbox
                          aria-label="Chọn dòng"
                          checked={isRowSelected}
                          onCheckedChange={(checked) => toggleRow(currentRowKey, Boolean(checked))}
                        />
                      </TableCell>
                    )}
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
                        style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
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
