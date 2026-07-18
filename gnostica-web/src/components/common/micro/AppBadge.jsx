import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * AppBadge - Wrapper cho Badge với hệ thống màu Semantic của Gnostica
 * @param {string} variant - "primary" | "secondary" | "success" | "warning" | "error" | "info" | "outline" | "gradient"
 * @param {boolean} soft - Dùng nền mờ (10%) và chữ màu đậm thay vì nền đặc
 * @param {ReactNode} icon - Icon hiển thị bên trái nội dung
 */
export default function AppBadge({
  variant = "primary",
  soft = false,
  icon: Icon,
  className,
  children,
  ...props
}) {
  let badgeClass = "duration-300 font-semibold px-2.5 py-0.5 ";

  // Dùng !important (!bg-...) để đảm bảo ghi đè thành công màu mặc định của Shadcn
  // do tailwind-merge đôi khi không nhận diện được CSS variables mới trong v4
  switch (variant) {
    case "success":
      badgeClass += soft 
        ? "!bg-success-soft !text-success hover:opacity-80 !border-transparent" 
        : "!bg-success !text-white hover:opacity-90 !border-transparent";
      break;
    case "warning":
      badgeClass += soft 
        ? "!bg-warning-soft !text-warning-foreground hover:opacity-80 !border-transparent" 
        : "!bg-warning !text-warning-foreground hover:opacity-90 !border-transparent";
      break;
    case "error":
    case "destructive":
      badgeClass += soft 
        ? "!bg-error-soft !text-error hover:opacity-80 !border-transparent" 
        : "!bg-error !text-white hover:opacity-90 !border-transparent";
      break;
    case "info":
      badgeClass += soft 
        ? "!bg-info-soft !text-info hover:opacity-80 !border-transparent" 
        : "!bg-info !text-white hover:opacity-90 !border-transparent";
      break;
    case "gradient":
      badgeClass += "bg-accent-gradient !text-white !border-transparent hover:brightness-110 shadow-sm";
      break;
    case "secondary":
      badgeClass += soft 
        ? "!bg-muted !text-secondary-foreground hover:opacity-80 !border-transparent" 
        : "!bg-secondary !text-secondary-foreground hover:opacity-90 !border-transparent";
      break;
    case "outline":
      badgeClass += "!border-border !text-foreground hover:!bg-muted";
      break;
    case "primary":
    default:
      badgeClass += soft 
        ? "!bg-primary-50 !text-primary hover:opacity-80 !border-transparent" 
        : "!bg-primary !text-primary-foreground hover:opacity-90 !border-transparent shadow-sm";
      break;
  }

  return (
    <Badge 
      variant="default" // Force default để lấy base styles, sau đó tự override màu
      className={cn(badgeClass, className)} 
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </Badge>
  );
}

export { AppBadge as Badge };
