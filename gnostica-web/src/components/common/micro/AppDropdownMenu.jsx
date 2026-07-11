import React from 'react';
import { cva } from 'class-variance-authority';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const dropdownVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      appVariant: {
        default: "rounded-xl",
        outline: "border border-border shadow-lg rounded-xl",
        glass: "bg-background/60 backdrop-blur-2xl border border-white/20 shadow-2xl dark:bg-black/60 rounded-xl overflow-hidden",
      }
    },
    defaultVariants: {
      appVariant: "default"
    }
  }
);

// We wrap DropdownMenuContent to apply variants
export const AppDropdownMenuContent = React.forwardRef(({ className, appVariant, ...props }, ref) => {
  return (
    <DropdownMenuContent
      ref={ref}
      className={cn(dropdownVariants({ appVariant }), className)}
      {...props}
    />
  );
});
AppDropdownMenuContent.displayName = "AppDropdownMenuContent";

export const AppDropdownMenuItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <DropdownMenuItem
      ref={ref}
      className={cn(
        "rounded-lg px-3 py-2.5 transition-colors cursor-pointer outline-none",
        "focus:!bg-primary/10 focus:!text-primary focus:*:[svg]:!text-primary",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuItem>
  );
});
AppDropdownMenuItem.displayName = "AppDropdownMenuItem";

export {
  DropdownMenu as AppDropdownMenuRoot,
  DropdownMenuTrigger as AppDropdownMenuTrigger,
  DropdownMenuSeparator as AppDropdownMenuSeparator,
  DropdownMenuLabel as AppDropdownMenuLabel,
  DropdownMenuGroup as AppDropdownMenuGroup,
  DropdownMenuShortcut as AppDropdownMenuShortcut,
  DropdownMenuSub as AppDropdownMenuSub,
  DropdownMenuSubTrigger as AppDropdownMenuSubTrigger,
  DropdownMenuSubContent as AppDropdownMenuSubContent,
};

/**
 * Data-Driven AppDropdownMenu
 */
export function AppDropdownMenu({
  trigger,
  items = [],
  label,
  appVariant = "glass",
  contentClassName,
  align = "end",
  ...props
}) {
  return (
    <DropdownMenu {...props}>
      {trigger && (
        <DropdownMenuTrigger asChild>
          {trigger}
        </DropdownMenuTrigger>
      )}
      <AppDropdownMenuContent appVariant={appVariant} align={align} className={contentClassName}>
        {label && (
          <>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {items.map((item, idx) => {
          if (item.type === 'separator') {
            return <DropdownMenuSeparator key={`sep-${idx}`} />;
          }
          if (item.type === 'label') {
            return <DropdownMenuLabel key={`lbl-${idx}`}>{item.label}</DropdownMenuLabel>;
          }
          return (
            <AppDropdownMenuItem
              key={item.id || idx}
              disabled={item.disabled}
              onClick={item.onClick}
              className={item.className}
            >
              {item.icon && <item.icon className="mr-2 size-4" />}
              <span>{item.label}</span>
              {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
            </AppDropdownMenuItem>
          );
        })}
      </AppDropdownMenuContent>
    </DropdownMenu>
  );
}
