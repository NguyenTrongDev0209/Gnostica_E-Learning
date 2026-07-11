import React, { forwardRef } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const AppTextarea = forwardRef(({
  id,
  label,
  labelRight,
  error,
  containerClassName,
  labelClassName,
  className,
  description,
  ...props
}, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {/* Label Area */}
      {(label || labelRight) && (
        <div className="flex items-center justify-between">
          {label && (
            <Label 
              htmlFor={id} 
              className={cn("text-sm font-medium text-foreground", labelClassName)}
            >
              {label}
            </Label>
          )}
          {labelRight && (
            <div>{labelRight}</div>
          )}
        </div>
      )}

      {/* Description Area (optional, above textarea) */}
      {description && (
        <p className="text-[0.8rem] text-muted-foreground">{description}</p>
      )}

      {/* Textarea Area */}
      <Textarea
        id={id}
        ref={ref}
        className={cn(
          "min-h-20 bg-muted border-border focus:bg-background transition-colors resize-y",
          error ? "border-error/20 focus-visible:ring-error" : "focus-visible:ring-primary",
          className
        )}
        {...props}
      />

      {/* Error Message */}
      {error && <p className="text-error text-xs mt-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
});

AppTextarea.displayName = "AppTextarea";
export default AppTextarea;
