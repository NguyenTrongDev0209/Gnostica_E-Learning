import React, { forwardRef, useId } from 'react';
import { cva } from 'class-variance-authority';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const switchVariants = cva(
  "",
  {
    variants: {
      appVariant: {
        default: "data-[state=checked]:bg-primary",
        success: "data-[state=checked]:bg-success focus-visible:ring-success/50",
        warning: "data-[state=checked]:bg-warning focus-visible:ring-warning/50",
        error: "data-[state=checked]:bg-error focus-visible:ring-error/50",
        info: "data-[state=checked]:bg-info focus-visible:ring-info/50",
        accent: "data-[state=checked]:bg-accent focus-visible:ring-accent/50",
      }
    },
    defaultVariants: {
      appVariant: "default",
    }
  }
);

/**
 * AppSwitch
 * Switch có nhãn, mô tả và hỗ trợ các biến thể màu sắc.
 */
export const AppSwitch = forwardRef(({
  id,
  label,
  description,
  appVariant = "default",
  className,
  containerClassName,
  ...props
}, ref) => {
  const generatedId = useId();
  const switchId = id || generatedId;

  return (
    <div className={cn("flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm", containerClassName)}>
      <div className="space-y-0.5">
        <Label
          htmlFor={switchId}
          className={cn(
            "text-base font-semibold cursor-pointer",
            props.disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
        </Label>
        {description && (
          <p className={cn("text-[0.8rem] text-muted-foreground", props.disabled && "opacity-50")}>
            {description}
          </p>
        )}
      </div>
      <Switch
        ref={ref}
        id={switchId}
        className={cn(switchVariants({ appVariant }), className)}
        {...props}
      />
    </div>
  );
});

AppSwitch.displayName = "AppSwitch";
export default AppSwitch;
