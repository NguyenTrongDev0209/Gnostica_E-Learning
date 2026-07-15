import React, { forwardRef, useId } from 'react';
import { cva } from 'class-variance-authority';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const sliderVariants = cva(
  "w-full",
  {
    variants: {
      appVariant: {
        default: "",
        success: "[&_[data-slot=slider-range]]:bg-success [&_[data-slot=slider-thumb]]:border-success [&_[data-slot=slider-thumb]]:ring-success/50",
        warning: "[&_[data-slot=slider-range]]:bg-warning [&_[data-slot=slider-thumb]]:border-warning [&_[data-slot=slider-thumb]]:ring-warning/50",
        error: "[&_[data-slot=slider-range]]:bg-error [&_[data-slot=slider-thumb]]:border-error [&_[data-slot=slider-thumb]]:ring-error/50",
        info: "[&_[data-slot=slider-range]]:bg-info [&_[data-slot=slider-thumb]]:border-info [&_[data-slot=slider-thumb]]:ring-info/50",
        accent: "[&_[data-slot=slider-range]]:bg-accent [&_[data-slot=slider-thumb]]:border-accent [&_[data-slot=slider-thumb]]:ring-accent/50",
      }
    },
    defaultVariants: {
      appVariant: "default",
    }
  }
);

/**
 * AppSlider
 * Slider kèm Label và hiển thị giá trị hiện tại.
 */
export const AppSlider = forwardRef(({
  id,
  label,
  description,
  appVariant = "default",
  className,
  containerClassName,
  showValue = true,
  valueSuffix = "",
  ...props
}, ref) => {
  const generatedId = useId();
  const sliderId = id || generatedId;

  // Nếu người dùng không pass value, fallback về defaultValue để hiển thị
  const displayValue = props.value ? props.value[0] : (props.defaultValue ? props.defaultValue[0] : 0);

  return (
    <div className={cn("flex flex-col gap-3", containerClassName)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <Label
              htmlFor={sliderId}
              className={cn("text-sm font-semibold", props.disabled && "opacity-50")}
            >
              {label}
            </Label>
          )}
          {showValue && (
            <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {displayValue}{valueSuffix}
            </span>
          )}
        </div>
      )}

      {description && (
        <p className={cn("text-[0.8rem] text-muted-foreground", props.disabled && "opacity-50")}>
          {description}
        </p>
      )}

      <div className="py-2">
        <Slider
          ref={ref}
          id={sliderId}
          className={cn(sliderVariants({ appVariant }), className)}
          {...props}
        />
      </div>
    </div>
  );
});

AppSlider.displayName = "AppSlider";
export default AppSlider;
