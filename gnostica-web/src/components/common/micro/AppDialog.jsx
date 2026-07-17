import React from 'react';
import { cva } from 'class-variance-authority';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const dialogVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      appVariant: {
        default: "rounded-xl",
        outline: "border border-border shadow-lg rounded-xl",
        glass: "bg-background/60 backdrop-blur-2xl border border-white/20 shadow-2xl dark:bg-black/60 rounded-2xl",
      }
    },
    defaultVariants: {
      appVariant: "default"
    }
  }
);

// We export the standard primitives so users can build custom dialogs
export {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Dialog as AppDialogRoot,
  DialogTrigger as AppDialogTrigger,
  DialogHeader as AppDialogHeader,
  DialogTitle as AppDialogTitle,
  DialogDescription as AppDialogDescription,
  DialogFooter as AppDialogFooter,
  DialogClose as AppDialogClose,
};

export { AppDialogContent as DialogContent };

// We wrap DialogContent to apply our variants
export const AppDialogContent = React.forwardRef(({ className, appVariant, ...props }, ref) => {
  return (
    <DialogContent
      ref={ref}
      className={cn(dialogVariants({ appVariant }), className)}
      {...props}
    />
  );
});
AppDialogContent.displayName = "AppDialogContent";

/**
 * Data-Driven AppDialog
 * Dùng để hiển thị Dialog nhanh chóng mà không cần viết nhiều code lặp lại.
 */
export function AppDialog({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  appVariant = "glass",
  className,
  showCloseButton = true,
  ...props
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <AppDialogContent appVariant={appVariant} className={className} showCloseButton={showCloseButton}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="py-2">
          {children}
        </div>
        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </AppDialogContent>
    </Dialog>
  );
}
