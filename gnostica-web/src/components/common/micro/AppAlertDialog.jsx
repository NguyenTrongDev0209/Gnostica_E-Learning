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
  variant = "default",
  icon,
  size = "default",
  open,
  onOpenChange,
  contentClassName,
  ...props
}) {
  const IconComponent = icon !== undefined ? icon : alertIcons[variant];
  
  let actionVariant = "default";
  let actionClass = "rounded-md duration-300 transition-all font-semibold shadow-sm";

  if (variant === "destructive") {
    actionClass += " !bg-error hover:!bg-error/90 !text-white !border-none";
  } else if (variant === "success") {
    actionClass += " !bg-success hover:!bg-success/90 !text-white !border-none";
  } else if (variant === "warning") {
    actionClass += " !bg-warning hover:!bg-warning/90 !text-white !border-none";
  } else if (variant === "info") {
    actionClass += " !bg-info hover:!bg-info/90 !text-white !border-none";
  } else {
    actionClass += " bg-accent-gradient text-white border-none hover:brightness-110";
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} {...props}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent 
        size={size} 
        className={cn("rounded-lg duration-300 shadow-[var(--gnostica-shadow-xl)] border-border", contentClassName)}
      >
        <AlertDialogHeader>
          {IconComponent && (
            <AlertDialogMedia className={cn(
              "ring-4 ring-offset-0 rounded-full",
              variant === "destructive" && "bg-error/10 ring-error/10",
              variant === "warning" && "bg-warning/10 ring-warning/10",
              variant === "success" && "bg-success/10 ring-success/10",
              variant === "info" && "bg-info/10 ring-info/10",
              variant === "default" && "bg-muted ring-muted/50"
            )}>
              {IconComponent}
            </AlertDialogMedia>
          )}
          <AlertDialogTitle className="text-lg font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="bg-transparent border-t-0 pt-2">
          <AlertDialogCancel className="rounded-md hover:bg-muted duration-300 transition-colors shadow-sm font-medium">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            variant={actionVariant} 
            onClick={onConfirm}
            className={actionClass}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
