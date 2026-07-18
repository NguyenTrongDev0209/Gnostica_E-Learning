import React from 'react';
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * AppSeparator - Micro component cho các đường kẻ phân cách
 * @param {string} text - Văn bản hiển thị ở giữa đường phân cách (tùy chọn)
 * @param {string} orientation - "horizontal" | "vertical" (mặc định: "horizontal")
 */
export default function AppSeparator({ text, orientation = "horizontal", className, ...props }) {
  if (text && orientation === "horizontal") {
    return (
      <div className={cn("flex items-center gap-3 my-6", className)} {...props}>
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium px-1 uppercase tracking-wider">{text}</span>
        <Separator className="flex-1" />
      </div>
    );
  }

  return (
    <Separator 
      orientation={orientation} 
      className={cn(orientation === "horizontal" ? "my-4" : "mx-4", className)} 
      {...props} 
    />
  );
}
