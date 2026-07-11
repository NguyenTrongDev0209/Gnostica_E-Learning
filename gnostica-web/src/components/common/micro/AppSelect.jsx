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
  ...props
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled} {...props}>
      <SelectTrigger 
        aria-invalid={error}
        className={cn(
          "w-full !h-12 bg-card transition-all duration-300 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary),transparent_70%)] border",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper" className="shadow-none border border-border ring-0 rounded-xl bg-card">
        <SelectGroup className="p-1 space-y-1">
          {options.map((opt) => (
            <SelectItem 
              key={opt.value} 
              value={opt.value} 
              disabled={opt.disabled}
              className="rounded-lg cursor-pointer py-2.5 text-sm transition-colors focus:!bg-primary/10 focus:!text-primary focus:**:!text-primary data-[state=checked]:!text-primary data-[state=checked]:!bg-primary/10 data-[state=checked]:**:!text-primary data-[state=checked]:font-medium"
            >
              {opt.label}
            </SelectItem>
          ))}
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
