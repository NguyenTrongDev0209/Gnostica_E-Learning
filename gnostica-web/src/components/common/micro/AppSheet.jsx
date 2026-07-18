import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AppButton } from "@/components/common/micro/AppButton";

/**
 * AppSheet - Data-Driven Off-canvas / Drawer component
 * @param {ReactNode} trigger - Nút hoặc element dùng để mở Sheet (VD: <Button>Mở</Button>)
 * @param {string|ReactNode} title - Tiêu đề của Sheet
 * @param {string|ReactNode} description - Mô tả ngắn dưới tiêu đề
 * @param {ReactNode} children - Nội dung chính của Sheet
 * @param {ReactNode} footer - Nội dung phần footer (thường là các nút bấm)
 * @param {string} side - Vị trí xuất hiện: "top" | "bottom" | "left" | "right" (mặc định: "right")
 * @param {boolean} showCloseButton - Có hiển thị nút X để đóng không (mặc định: true)
 */
export default function AppSheet({
  trigger,
  title,
  description,
  children,
  footer,
  side = "right",
  showCloseButton = true,
  className,
  open,
  onOpenChange,
  ...props
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} {...props}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      
      <SheetContent side={side} showCloseButton={showCloseButton} className={cn("flex flex-col", className)}>
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        
        <div className="flex-1 overflow-y-auto py-4">
          {children}
        </div>

        {footer && (
          <SheetFooter>
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Re-export để người dùng có thể tự gọi các nút đóng bên trong nội dung
export {
  Sheet as AppSheetRoot,
  SheetContent as AppSheetContent,
  SheetDescription as AppSheetDescription,
  SheetHeader as AppSheetHeader,
  SheetTitle as AppSheetTitle,
  SheetTrigger as AppSheetTrigger,
  SheetFooter as AppSheetFooter,
  SheetClose as AppSheetClose,
};
