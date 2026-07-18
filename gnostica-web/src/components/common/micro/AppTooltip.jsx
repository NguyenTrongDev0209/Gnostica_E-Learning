import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * AppTooltip - Tooltip chuẩn của Gnostica
 * 
 * @param {ReactNode} children - Thành phần được bọc (Trigger)
 * @param {ReactNode|string} content - Nội dung của tooltip
 * @param {number} delayDuration - Thời gian chờ hiển thị (ms), mặc định 300
 * @param {string} side - Vị trí hiển thị: "top", "bottom", "left", "right"
 */
export default function AppTooltip({
  children,
  content,
  delayDuration = 300,
  side = "top",
  className,
  ...props
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip {...props}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className={cn("glass font-medium z-[var(--z-tooltip)] px-3 py-2 text-sm", className)}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
};
