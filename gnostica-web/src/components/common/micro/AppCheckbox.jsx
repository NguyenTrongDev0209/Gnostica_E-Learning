import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const checkboxVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      appVariant: {
        default: "data-checked:bg-primary data-checked:border-primary data-checked:text-primary-foreground",
        accent: "data-checked:bg-accent data-checked:border-accent data-checked:text-white aria-checked:border-accent",
        success: "data-checked:bg-success data-checked:border-success data-checked:text-white aria-checked:border-success",
        warning: "data-checked:bg-warning data-checked:border-warning data-checked:text-white aria-checked:border-warning",
        error: "data-checked:bg-error data-checked:border-error data-checked:text-white aria-checked:border-error",
        gradient: "data-checked:bg-accent-gradient data-checked:border-transparent data-checked:text-white aria-checked:border-primary",
      },
      appSize: {
        sm: "size-4 rounded-[4px] [&_[data-slot=checkbox-indicator]>svg]:size-3",
        default: "size-5 rounded-[6px] [&_[data-slot=checkbox-indicator]>svg]:size-3.5",
        lg: "size-6 rounded-[8px] border-2 [&_[data-slot=checkbox-indicator]>svg]:size-4",
      }
    },
    defaultVariants: {
      appVariant: "default",
      appSize: "default",
    }
  }
);

export const AppCheckbox = React.forwardRef(({
  className,
  appVariant,
  appSize,
  id,
  label,
  description,
  containerClassName,
  labelClassName,
  ...props
}, ref) => {
  const checkboxId = id || React.useId();
  
  const checkboxElement = (
    <Checkbox 
      id={checkboxId}
      ref={ref}
      className={cn(checkboxVariants({ appVariant, appSize, className }))}
      {...props} 
    />
  );

  // Render Checkbox with or without label/description
  if (!label && !description) {
    return checkboxElement;
  }

  return (
    <div className={cn("flex items-start gap-3 group", containerClassName)}>
      <div className="flex items-center shrink-0">
        {checkboxElement}
      </div>
      <div className={cn(
        "grid gap-1.5 leading-none",
        appSize === 'sm' ? "mt-0" : appSize === 'lg' ? "mt-[3px]" : "mt-[2px]"
      )}>
        {label && (
          <Label 
            htmlFor={checkboxId} 
            className={cn(
              "font-medium cursor-pointer text-foreground group-hover:text-primary transition-colors", 
              appSize === 'sm' ? "text-sm" : appSize === 'lg' ? "text-base" : "text-sm leading-tight",
              props.disabled && "opacity-50 cursor-not-allowed group-hover:text-foreground",
              labelClassName
            )}
          >
            {label}
          </Label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});

AppCheckbox.displayName = "AppCheckbox";
