import React, { forwardRef } from 'react';
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

/**
 * AppToggle - Nút bật/tắt chuẩn của Gnostica
 */
export const AppToggle = forwardRef(({
  className,
  variant,
  size,
  children,
  ...props
}, ref) => {
  return (
    <Toggle
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-300 rounded-lg font-medium hover:bg-muted data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
        className
      )}
      {...props}
    >
      {children}
    </Toggle>
  );
});

AppToggle.displayName = "AppToggle";
export default AppToggle;
