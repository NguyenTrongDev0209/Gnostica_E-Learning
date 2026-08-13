import React from "react";
import { cn } from "@/lib/utils";

/**
 * PageContainer: Wrapper cốt lõi cho mọi trang.
 * Xử lý nền, chiều cao tối thiểu và hành vi hiển thị chung.
 */
export function PageContainer({ children, className, ...props }) {
  return (
    <div className={cn("min-h-screen flex flex-col w-full bg-background text-foreground", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * PageContainer.Header: Khu vực tiêu đề trang
 * Hỗ trợ Responsive Mobile-First, Clamp (cắt chữ dài), và Sticky.
 */
PageContainer.Header = function PageContainerHeader({ 
  title, 
  description, 
  actions, 
  sticky = false, 
  children, 
  className,
  ...props 
}) {
  return (
    <div 
      className={cn(
        "flex flex-col gap-4 mb-6 md:mb-8 md:flex-row md:items-end md:justify-between w-full transition-all", 
        sticky && "sticky top-0 z-[var(--z-sticky)] bg-background/90 backdrop-blur-md pb-4 pt-4 -mt-4 border-b border-border shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-2 w-full md:w-auto overflow-hidden">
        {children} {/* Thường dùng để nhúng Breadcrumb vào đây */}
        
        {title && (
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight clamp-2">
            {title}
          </h1>
        )}
        
        {description && (
          <p className="text-sm md:text-base text-muted-foreground clamp-2">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 md:gap-4 shrink-0 mt-2 md:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * PageContainer.Content: Khu vực chứa nội dung chính
 * Kế thừa class .app-container từ index.css để đồng bộ padding và max-width.
 */
PageContainer.Content = function PageContainerContent({ 
  children, 
  disableContainer = false, 
  className,
  ...props 
}) {
  return (
    <main 
      className={cn(
        "w-full flex-1 flex flex-col pb-12 gap-y-[var(--section-gap-sm)] md:gap-y-[var(--section-gap-md)]",
        !disableContainer && "app-container",
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
};

/**
 * PageContainer.Section: Khối chia nhỏ bên trong Content
 * Dành cho các khu vực nội dung riêng biệt (ví dụ: Biểu đồ, Danh sách, Form)
 */
PageContainer.Section = function PageContainerSection({ 
  title, 
  description, 
  action,
  children, 
  className,
  ...props 
}) {
  return (
    <section className={cn("w-full flex flex-col gap-4 md:gap-6", className)} {...props}>
      {(title || description || action) && (
        <div className="flex flex-col gap-1 border-b border-border pb-2">
          <div className="flex items-center justify-between w-full">
            {title && <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>}
            {action && <div>{action}</div>}
          </div>
          {description && <p className="text-sm md:text-base text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </section>
  );
};

export default PageContainer;
