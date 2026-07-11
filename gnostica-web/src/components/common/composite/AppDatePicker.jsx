import React, { forwardRef, useId } from 'react';
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AppButton } from "@/components/common/micro/AppButton";
import AppCalendar from "@/components/common/micro/AppCalendar";

/**
 * AppDatePicker
 * Component chọn ngày tháng hoàn chỉnh, tích hợp sẵn Label và Description.
 */
export const AppDatePicker = forwardRef(({
  id,
  label,
  description,
  error,
  date,
  onSelect,
  placeholder = "Chọn ngày...",
  disabled,
  containerClassName,
  className,
  appVariant = "default", // Mở rộng nếu cần đổi style popup
  ...props
}, ref) => {
  const generatedId = useId();
  const datePickerId = id || generatedId;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <Label 
          htmlFor={datePickerId} 
          className={cn("text-sm font-medium text-foreground", disabled && "opacity-50")}
        >
          {label}
        </Label>
      )}

      {description && (
        <p className={cn("text-[0.8rem] text-muted-foreground", disabled && "opacity-50")}>
          {description}
        </p>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <AppButton
            id={datePickerId}
            ref={ref}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal bg-muted border-border hover:bg-white hover:text-foreground transition-colors",
              !date && "text-muted-foreground",
              error && "border-error/20 focus-visible:ring-error",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: vi }) : placeholder}
          </AppButton>
        </PopoverTrigger>
        <PopoverContent 
          align="start" 
          className={cn(
            "w-auto p-0 border-none shadow-none bg-transparent", // Đặt nền trong suốt vì AppCalendar đã có nền và bo góc
            appVariant === "glass" && "bg-background/60 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-xl"
          )}
        >
          <AppCalendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
            className={appVariant === "glass" ? "bg-transparent border-none shadow-none" : ""}
            {...props}
          />
        </PopoverContent>
      </Popover>

      {error && <p className="text-error text-xs mt-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
});

AppDatePicker.displayName = "AppDatePicker";
export default AppDatePicker;
