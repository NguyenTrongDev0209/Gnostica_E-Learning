import React, { forwardRef } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/**
 * AppToggleGroup - Nhóm nút bật/tắt chuẩn của Gnostica
 * 
 * @param {Array} items - Danh sách các nút: [{ value: "a", label: "A", ariaLabel: "Toggle A" }]
 * @param {string} type - Loại toggle: "single" hoặc "multiple"
 * @param {string|Array} value - Giá trị đang được chọn
 * @param {Function} onValueChange - Hàm callback khi thay đổi
 */
export const AppToggleGroup = forwardRef(({
  items = [],
  type = "single",
  value,
  onValueChange,
  className,
  itemClassName,
  ...props
}, ref) => {
  return (
    <ToggleGroup
      ref={ref}
      type={type}
      value={value}
      onValueChange={onValueChange}
      className={cn("justify-start", className)}
      {...props}
    >
      {items.map((item) => (
        <ToggleGroupItem 
          key={item.value} 
          value={item.value} 
          aria-label={item.ariaLabel || item.label}
          disabled={item.disabled}
          className={cn(
            "transition-all duration-300 rounded-lg font-medium hover:bg-muted data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
            itemClassName,
            item.className
          )}
        >
          {item.icon && <item.icon className="h-4 w-4 mr-2" />}
          {item.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
});

AppToggleGroup.displayName = "AppToggleGroup";

export {
  ToggleGroup,
  ToggleGroupItem
};
