import React from 'react';
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const appAlertVariants = cva(
  "transition-all duration-300 rounded-lg shadow-sm",
  {
    variants: {
      appVariant: {
        default: "bg-card text-card-foreground border-border",
        success: "bg-success/10 text-success border-success/30 [&_[data-slot=alert-title]]:text-success [&_[data-slot=alert-description]]:text-success/90",
        error: "bg-error/10 text-error border-error/30 [&_[data-slot=alert-title]]:text-error [&_[data-slot=alert-description]]:text-error/90",
        warning: "bg-warning/10 text-warning border-warning/30 [&_[data-slot=alert-title]]:text-warning [&_[data-slot=alert-description]]:text-warning/90",
        info: "bg-info/10 text-info border-info/30 [&_[data-slot=alert-title]]:text-info [&_[data-slot=alert-description]]:text-info/90",
      }
    },
    defaultVariants: {
      appVariant: "default",
    }
  }
)

const defaultIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: null
};

/**
 * AppAlert - Component mở rộng từ Shadcn Alert với các màu sắc chuẩn của Gnostica
 * @param {string} title - Tiêu đề alert
 * @param {ReactNode|string} description - Nội dung mô tả (hoặc truyền qua children)
 * @param {ReactNode} icon - Icon hiển thị (mặc định lấy theo variant)
 * @param {string} variant - "default" | "success" | "error" | "warning" | "info"
 * @param {ReactNode} action - Nút thao tác ở góc phải
 */
export default function AppAlert({
  title,
  description,
  children,
  icon: Icon,
  variant = "default",
  action,
  className,
  ...props
}) {
  const IconComponent = Icon === undefined ? defaultIcons[variant] : Icon;

  return (
    <Alert 
      variant="default" // Giữ nguyên default của Shadcn để tự custom bằng appAlertVariants
      className={cn(appAlertVariants({ appVariant: variant }), className)} 
      {...props}
    >
      {IconComponent && <IconComponent className="h-5 w-5" />}
      {title && <AlertTitle className="font-bold text-base">{title}</AlertTitle>}
      {(description || children) && (
        <AlertDescription className="text-sm">
          {description || children}
        </AlertDescription>
      )}
      {action && <AlertAction>{action}</AlertAction>}
    </Alert>
  );
}
