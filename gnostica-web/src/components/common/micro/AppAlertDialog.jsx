import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Trash2, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const alertIcons = {
  destructive: <Trash2 className="text-error" />,
  warning: <AlertTriangle className="text-warning" />,
  info: <Info className="text-info" />,
  success: <CheckCircle2 className="text-success" />,
  default: null
};

/**
 * AppAlertDialog - Wrapper cho AlertDialog với giao diện chuẩn của Gnostica
 * @param {ReactNode} trigger - Element dùng để click mở dialog (nếu không truyền, tự kiểm soát qua open/onOpenChange)
 * @param {string} title - Tiêu đề
 * @param {ReactNode|string} description - Mô tả chi tiết
 * @param {string} confirmText - Chữ trên nút xác nhận
 * @param {string} cancelText - Chữ trên nút hủy
 * @param {Function} onConfirm - Hàm gọi khi nhấn xác nhận
 * @param {string} variant - "default" | "destructive" | "warning" | "info" | "success"
 */
export default function AppAlertDialog({
  trigger,
  title = "Bạn có chắc chắn không?",
  description = "Hành động này không thể hoàn tác.",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  hideCancel = false,
  variant = "default",
  confirmVariant,
  icon,
  mediaClassName,
  confirmClassName,
  size = "default",
  layout = "default",
  open,
  isOpen,
  onOpenChange,
  onClose,
  contentClassName,
  ...props
}) {
  const actualOpen = open !== undefined ? open : isOpen;
  const actualOnOpenChange = onOpenChange || (onClose ? (val) => !val && onClose() : undefined);
  const actualVariant = variant !== "default" ? variant : (confirmVariant || "default");
  const IconComponent = icon !== undefined ? icon : alertIcons[actualVariant];
  const isCentered = layout === "centered";
  
  let actionVariant = "default";
  let actionClass = "rounded-md duration-300 transition-all font-semibold shadow-sm";

  if (actualVariant === "destructive") {
    actionClass += " !bg-error hover:!bg-error/90 !text-white !border-none";
  } else if (actualVariant === "success") {
    actionClass += " !bg-success hover:!bg-success/90 !text-white !border-none";
  } else if (actualVariant === "warning") {
    actionClass += " !bg-warning hover:!bg-warning/90 !text-white !border-none";
  } else if (actualVariant === "info") {
    actionClass += " !bg-info hover:!bg-info/90 !text-white !border-none";
  } else {
    actionClass += " bg-accent-gradient text-white border-none hover:brightness-110";
  }

  return (
    <AlertDialog open={actualOpen} onOpenChange={actualOnOpenChange} {...props}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent 
        size={size} 
        data-layout={layout}
        className={cn(
          "rounded-lg duration-300 shadow-[var(--gnostica-shadow-xl)] border-border",
          isCentered && "w-[calc(100%-2rem)] !max-w-[390px] sm:!max-w-[390px] rounded-2xl p-5 sm:p-5",
          contentClassName
        )}
      >
        <AlertDialogHeader className={cn(
          isCentered && "items-center text-center sm:!grid-rows-[auto_auto_1fr] sm:!place-items-center sm:!text-center"
        )}> 
          {IconComponent && (
            <AlertDialogMedia className={cn(
              "ring-4 ring-offset-0 rounded-full",
              isCentered && "sm:!row-span-1",
              variant === "destructive" && "bg-error/10 ring-error/10",
              variant === "warning" && "bg-warning/10 ring-warning/10",
              variant === "success" && "bg-success/10 ring-success/10",
              variant === "info" && "bg-info/10 ring-info/10",
              variant === "default" && "bg-muted ring-muted/50",
              mediaClassName
            )}>
              {IconComponent}
            </AlertDialogMedia>
          )}
          <AlertDialogTitle className={cn("text-lg font-bold", isCentered && "mt-1 sm:!col-start-auto")}>{title}</AlertDialogTitle>
          <AlertDialogDescription className={cn("text-sm leading-relaxed", isCentered && "max-w-[290px]")}> 
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className={cn(
          "bg-transparent border-t-0 pt-2",
          isCentered && "!mx-0 !mb-0 !grid !gap-2 !rounded-none !border-0 !bg-transparent !p-0",
          isCentered && (hideCancel ? "!grid-cols-1 sm:!grid-cols-1" : "!grid-cols-2 sm:!grid-cols-2")
        )}>
          {!hideCancel && (
            <AlertDialogCancel className={cn(
              "rounded-md hover:bg-muted duration-300 transition-colors shadow-sm font-medium",
              isCentered && "!order-1 m-0 h-10 w-full border-border"
            )}>
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction 
            variant={actionVariant} 
            onClick={onConfirm}
            className={cn(actionClass, isCentered && "!order-2 m-0 h-10 w-full", confirmClassName)}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
};
