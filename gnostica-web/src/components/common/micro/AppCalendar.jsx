import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tách CustomDropdown ra ngoài để tránh bị unmount/remount liên tục khi Calendar re-render
const CustomDropdown = ({ value, onChange, options, disabled }) => {
  return (
    <Select
      value={value?.toString()}
      onValueChange={(newVal) => {
        onChange?.({ target: { value: newVal } });
      }}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 border-none font-semibold w-fit px-2 hover:bg-accent focus:ring-0 bg-transparent text-foreground shadow-none">
        <SelectValue>{options?.find((o) => o.value?.toString() === value?.toString())?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent position="item-aligned" className="max-h-[224px] min-w-[100px] shadow-lg border-border rounded-xl bg-card">
        {options?.map((opt) => (
          <SelectItem 
            key={opt.value} 
            value={opt.value?.toString()}
            className="cursor-pointer transition-colors focus:!bg-primary/10 focus:!text-primary focus:**:!text-primary data-[state=checked]:!text-primary data-[state=checked]:!bg-primary/10 data-[state=checked]:**:!text-primary data-[state=checked]:font-medium"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

/**
 * AppCalendar - Lịch chọn ngày tiêu chuẩn của Gnostica
 * Tích hợp sẵn tiếng Việt và thiết kế Shadow / Border / Radius
 * 
 * @param {Date | Date[]} selected - Ngày hoặc danh sách ngày đang chọn
 * @param {Function} onSelect - Hàm bắt sự kiện khi chọn ngày
 * @param {string} mode - "single" (mặc định), "multiple" (nhiều ngày), "range" (khoảng ngày)
 */
export default function AppCalendar({
  mode = "single",
  selected,
  onSelect,
  className,
  ...props
}) {
  return (
    <Calendar
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      locale={vi}
      fixedWeeks={true}
      showOutsideDays={true}
      captionLayout="dropdown"
      startMonth={new Date(1950, 0)}
      endMonth={new Date(2100, 11)}
      components={{
        Dropdown: CustomDropdown,
      }}
      classNames={{
        caption_label: "hidden", // Ẩn label text mặc định vì Select đã hiển thị
        dropdowns: "flex items-center gap-1 relative z-50", // Khoảng cách giữa tháng và năm, đè lên nav
        dropdown_root: "relative z-50", // Đảm bảo nổi lên trên các thành phần absolute
      }}
      className={cn(
        "rounded-xl shadow-sm border border-border bg-card p-4 duration-300 w-fit", 
        // Ép tỷ lệ 4:3 cho các ô ngày (cả thẻ td và button bên trong)
        "[&_td]:!aspect-[4/3] [&_[data-day]]:!aspect-[4/3] [&_[data-day]]:w-12 [&_[data-day]]:h-auto",
        className
      )}
      {...props}
    />
  );
}
