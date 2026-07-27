import React, { useState, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput, InputGroupButton } from "@/components/ui/input-group";

const AppInput = forwardRef(({
  id,
  label,
  labelRight,
  icon: Icon,
  rightElement,
  error,
  containerClassName,
  labelClassName,
  className,
  ...props
}, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
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

      {/* Input Area */}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        )}
        
        <Input
          id={id}
          ref={ref}
          className={cn(
            "h-11 bg-card border-border focus:bg-card transition-colors",
            Icon ? "pl-9" : "",
            rightElement ? "pr-10" : "",
            error ? "border-error/20 focus:ring-red-500" : "",
            className
          )}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
});

AppInput.displayName = "AppInput";

export const AppPasswordInput = forwardRef(({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  strength,
  showStrength = false,
  forgotPasswordLink = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const labelRight = forgotPasswordLink ? (
    <Link
      to="/forgot-password"
      className="text-xs text-primary hover:underline font-medium"
    >
      Quên mật khẩu?
    </Link>
  ) : null;

  const rightElement = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center w-full h-full px-3"
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <AppInput
        id={id}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        label={label}
        labelRight={labelRight}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        icon={Lock}
        rightElement={rightElement}
        error={error}
        {...props}
      />

      {showStrength && value && strength && (
        <div className="mt-1 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex gap-1.5 mb-1.5">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                  strength.score >= level ? strength.color : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-[13px] font-medium">
            <span className="text-muted-foreground">Độ mạnh: </span>
            <span className={strength.text}>{strength.label}</span>
          </p>
        </div>
      )}
    </div>
  );
});

AppPasswordInput.displayName = "AppPasswordInput";

export const AppInputOTP = forwardRef(({
  id,
  label,
  description,
  error,
  maxLength = 6,
  containerClassName,
  labelClassName,
  ...props
}, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <Label htmlFor={id} className={cn("text-sm font-medium text-foreground", labelClassName)}>
          {label}
        </Label>
      )}
      {description && (
        <p className="text-[0.8rem] text-muted-foreground">{description}</p>
      )}

      <InputOTP id={id} ref={ref} maxLength={maxLength} {...props}>
        <InputOTPGroup className="gap-2">
          {Array.from({ length: maxLength }).map((_, i) => (
            <InputOTPSlot 
              key={i} 
              index={i} 
              className="h-14 w-12 rounded-xl border border-input bg-background text-lg font-semibold shadow-sm first:rounded-l-xl first:border-l last:rounded-r-xl" 
            />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {error && <p className="text-error text-xs mt-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
});

AppInputOTP.displayName = "AppInputOTP";

export const AppInputGroup = forwardRef(({
  id,
  label,
  description,
  error,
  leftAddon,
  rightAddon,
  leftButton,
  rightButton,
  containerClassName,
  labelClassName,
  ...props
}, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <Label htmlFor={id} className={cn("text-sm font-medium text-foreground", labelClassName)}>
          {label}
        </Label>
      )}
      {description && (
        <p className="text-[0.8rem] text-muted-foreground">{description}</p>
      )}

      <InputGroup className={cn("h-11 bg-card border-border focus-within:bg-card transition-colors", error && "border-error/20 focus-within:ring-red-500")}>
        {leftAddon && (
          <InputGroupAddon align="inline-start">
            <InputGroupText>{leftAddon}</InputGroupText>
          </InputGroupAddon>
        )}
        {leftButton && (
          <InputGroupAddon align="inline-start">
            {leftButton}
          </InputGroupAddon>
        )}
        
        <InputGroupInput id={id} ref={ref} {...props} />
        
        {rightAddon && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>{rightAddon}</InputGroupText>
          </InputGroupAddon>
        )}
        {rightButton && (
          <InputGroupAddon align="inline-end">
            {rightButton}
          </InputGroupAddon>
        )}
      </InputGroup>

      {error && <p className="text-error text-xs mt-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
});

AppInputGroup.displayName = "AppInputGroup";

export default AppInput;
export { AppInput as Input };
