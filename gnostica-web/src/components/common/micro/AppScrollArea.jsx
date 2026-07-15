import React from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * AppScrollArea - Micro component cho vùng cuộn tùy biến
 * @param {string|number} maxHeight - Chiều cao tối đa (ví dụ: "300px", 400)
 * @param {string|number} maxWidth - Chiều rộng tối đa (ví dụ: "100%", 500)
 * @param {boolean} hideScrollbar - Có ẩn thanh cuộn không (mặc định: false)
 * @param {string} orientation - "vertical" | "horizontal" | "both" (mặc định: "vertical")
 */
export default function AppScrollArea({ 
  children, 
  className, 
  maxHeight, 
  maxWidth, 
  hideScrollbar = false,
  orientation = "vertical",
  ...props 
}) {
  const style = {};
  if (maxHeight) style.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
  if (maxWidth) style.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;

  return (
    <ScrollArea 
      className={cn("w-full rounded-md", className)} 
      style={style}
      hideScrollbar={hideScrollbar}
      {...props}
    >
      {children}
      
      {orientation === "horizontal" || orientation === "both" ? (
        <ScrollBar orientation="horizontal" className={hideScrollbar ? "hidden" : ""} />
      ) : null}
    </ScrollArea>
  );
}
