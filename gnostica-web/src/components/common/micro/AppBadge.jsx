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
        ? "!bg-success/10 !text-success hover:!bg-success/20 !border-transparent" 
        : "!bg-success !text-white hover:!bg-success/90 !border-transparent";
      break;
    case "warning":
      badgeClass += soft 
        ? "!bg-warning/10 !text-warning hover:!bg-warning/20 !border-transparent" 
        : "!bg-warning !text-warning-foreground hover:!bg-warning/90 !border-transparent";
      break;
    case "error":
    case "destructive":
      badgeClass += soft 
        ? "!bg-error/10 !text-error hover:!bg-error/20 !border-transparent" 
        : "!bg-error !text-white hover:!bg-error/90 !border-transparent";
      break;
    case "info":
      badgeClass += soft 
        ? "!bg-info/10 !text-info hover:!bg-info/20 !border-transparent" 
        : "!bg-info !text-white hover:!bg-info/90 !border-transparent";
      break;
    case "gradient":
      badgeClass += "bg-accent-gradient !text-white !border-transparent hover:brightness-110 shadow-sm";
      break;
    case "secondary":
      badgeClass += soft 
        ? "!bg-secondary/50 !text-secondary-foreground hover:!bg-secondary !border-transparent" 
        : "!bg-secondary !text-secondary-foreground hover:!bg-secondary/80 !border-transparent";
      break;
    case "outline":
      badgeClass += "!border-border !text-foreground hover:!bg-muted";
      break;
    case "primary":
    default:
      badgeClass += soft 
        ? "!bg-primary/10 !text-primary hover:!bg-primary/20 !border-transparent" 
        : "!bg-primary !text-primary-foreground hover:!bg-primary/90 !border-transparent shadow-sm";
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
