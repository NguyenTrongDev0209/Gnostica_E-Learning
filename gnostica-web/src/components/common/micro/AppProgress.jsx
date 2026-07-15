import React from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * AppProgress - Thanh tiến trình chuẩn Gnostica
 * @param {string} indicatorClassName - Class cho thanh chạy bên trong (vd: bg-success)
 * @param {string} heightClass - Độ cao của thanh (mặc định h-3)
 */
export default function AppProgress({ 
  className, 
  heightClass = "h-3", 
  indicatorClassName, 
  value, 
  ...props 
}) {
  return (
    <Progress 
      value={value} 
      className={cn(
        "bg-muted overflow-hidden shadow-inner", 
        heightClass, 
        indicatorClassName && `[&>[data-slot=progress-indicator]]:${indicatorClassName}`,
        className
      )} 
      {...props} 
    />
  );
}
