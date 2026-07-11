import React, { forwardRef, useId } from 'react';
import { cva } from 'class-variance-authority';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

// Các biến thể màu sắc giống AppCheckbox
const radioVariants = cva(
  "transition-all duration-200",
  {
    variants: {
      appVariant: {
        default: "data-checked:border-primary data-checked:bg-primary",
        success: "data-checked:border-success data-checked:bg-success focus-visible:ring-success/50",
        warning: "data-checked:border-warning data-checked:bg-warning focus-visible:ring-warning/50",
        error: "data-checked:border-error data-checked:bg-error focus-visible:ring-error/50",
        info: "data-checked:border-info data-checked:bg-info focus-visible:ring-info/50",
        accent: "data-checked:border-accent data-checked:bg-accent focus-visible:ring-accent/50",
      }
    },
    defaultVariants: {
      appVariant: "default",
    }
  }
);

export const AppRadioGroupItem = forwardRef(({ className, appVariant, ...props }, ref) => {
  return (
    <RadioGroupItem
      ref={ref}
      className={cn(radioVariants({ appVariant }), className)}
      {...props}
    />
  );
});

AppRadioGroupItem.displayName = "AppRadioGroupItem";

/**
 * Data-Driven AppRadioGroup
 * Tự động quản lý Layout Label và Description cho từng mục.
 */
export const AppRadioGroup = forwardRef(({
  id,
  label,
  options = [],
  appVariant = "default",
  orientation = "vertical", // 'vertical' | 'horizontal'
  error,
  className,
  containerClassName,
  ...props
}, ref) => {
  const generatedId = useId();
  const groupId = id || generatedId;

  return (
    <div className={cn("flex flex-col gap-3", containerClassName)}>
      {label && (
        <Label className="text-sm font-semibold text-foreground mb-1">
          {label}
        </Label>
      )}
      
      <RadioGroup
        ref={ref}
        id={groupId}
        className={cn(
          "gap-4",
          orientation === 'horizontal' ? "flex flex-row flex-wrap" : "flex flex-col",
          className
        )}
        {...props}
      >
        {options.map((option, idx) => {
          const optionId = `${groupId}-opt-${idx}`;
          return (
            <div key={option.value} className="flex gap-3">
              <AppRadioGroupItem 
                id={optionId} 
                value={option.value} 
                disabled={option.disabled}
                appVariant={option.appVariant || appVariant}
                className="mt-0.5" // Canh lề một chút để ngang bằng với text
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor={optionId}
                  className={cn(
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                    option.disabled && "opacity-50"
                  )}
                >
                  {option.label}
                </Label>
                {option.description && (
                  <p className="text-[0.8rem] text-muted-foreground">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </RadioGroup>

      {error && <p className="text-error text-xs animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
});

AppRadioGroup.displayName = "AppRadioGroup";
export default AppRadioGroup;
