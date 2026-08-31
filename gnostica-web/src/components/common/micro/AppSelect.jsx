import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * AppSelect - Dropdown chọn giá trị chuẩn của Gnostica
 * 
 * @param {Array} options - Danh sách các mục: [{ label: "Tùy chọn 1", value: "opt1", disabled: false }]
 * @param {string} value - Giá trị đang được chọn
 * @param {Function} onValueChange - Hàm callback khi chọn (nhận vào value)
 * @param {string} placeholder - Text hiển thị khi chưa chọn gì
 * @param {string} label - Tiêu đề nhóm (tùy chọn)
 * @param {boolean} disabled - Khóa Select
 * @param {boolean} error - Trạng thái lỗi (viền đỏ)
 */
export default function AppSelect({
  options = [],
  value,
  onValueChange,
  placeholder = "Chọn một tùy chọn...",
  label,
  disabled = false,
  error = false,
  className,
  contentClassName,
  ...props
}) {
  const normalizedValue = value !== undefined && value !== null ? String(value) : "";
  const selectedOption = normalizedValue
    ? options.find((option) => option.value !== undefined && option.value !== null && String(option.value) === normalizedValue)
    : null;

  return (
    <Select value={normalizedValue} onValueChange={onValueChange} disabled={disabled} {...props}>
      <SelectTrigger 
        aria-invalid={error}
        className={cn(
          "w-full !h-11 bg-card transition-all duration-300 border font-sans",
          error && "border-error/50 ring-1 ring-error/20 focus:ring-error/30",
          className
        )}
      >
        {selectedOption ? (
          <span className="flex min-w-0 items-center gap-2 text-left">
            {selectedOption.imageUrl && (
              <img
                src={selectedOption.imageUrl}
                alt=""
                className="size-8 shrink-0 object-contain"
              />
            )}
            <span className="truncate">{selectedOption.label}</span>
          </span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent position="popper" className={cn("shadow-none border border-border ring-0 rounded-xl bg-card", contentClassName)}>
        <SelectGroup className="p-1 space-y-1">
          {options.length > 0 ? (
            options.map((opt) => {
              const strVal = opt.value !== undefined && opt.value !== null ? String(opt.value) : "";
              return (
                <SelectItem 
                  key={strVal || opt.label} 
                  value={strVal} 
                  disabled={opt.disabled}
                  className="rounded-lg cursor-pointer py-2.5 text-sm transition-colors focus:!bg-primary/10 focus:!text-primary focus:**:!text-primary data-[state=checked]:!text-primary data-[state=checked]:!bg-primary/10 data-[state=checked]:**:!text-primary data-[state=checked]:font-medium"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {opt.imageUrl && (
                      <img
                        src={opt.imageUrl}
                        alt=""
                        className="size-10 shrink-0 object-contain"
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>
                </SelectItem>
              );
            })
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center justify-center pointer-events-none">
              <span className="opacity-70">Không có dữ liệu</span>
            </div>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
};
