import React from 'react';
import { cva } from 'class-variance-authority';
import {
  Command,
  CommandDialog,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const commandVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      appVariant: {
        default: "",
        outline: "border border-border shadow-sm bg-card rounded-[8px]",
        glass: "bg-background/60 backdrop-blur-xl border border-white/20 shadow-lg dark:bg-black/60 rounded-[12px]",
      }
    },
    defaultVariants: {
      appVariant: "default"
    }
  }
);

export const AppCommand = React.forwardRef(({ className, appVariant, ...props }, ref) => {
  const [isKeyboard, setIsKeyboard] = React.useState(true);

  return (
    <div 
      className={cn("size-full overflow-hidden rounded-[inherit]", isKeyboard ? "is-keyboard" : "is-mouse")}
      onMouseMove={() => isKeyboard && setIsKeyboard(false)}
      onKeyDownCapture={() => !isKeyboard && setIsKeyboard(true)}
    >
      <Command
        ref={ref}
        className={cn(commandVariants({ appVariant }), className)}
        {...props}
      />
    </div>
  );
});
AppCommand.displayName = "AppCommand";

// --- Wrappers to apply custom App styling without modifying ui/command.jsx ---

export const AppCommandInput = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div data-slot="command-input-wrapper" className="p-2 pb-1">
      <InputGroup className="h-12! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-3!">
        <CommandPrimitive.Input
          ref={ref}
          data-slot="command-input"
          className={cn(
            "w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 bg-transparent",
            className
          )}
          {...props} 
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
});
AppCommandInput.displayName = "AppCommandInput";

export const AppCommandGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <CommandGroup
      ref={ref}
      className={cn(
        "p-1.5 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-2",
        className
      )}
      {...props}
    />
  );
});
AppCommandGroup.displayName = "AppCommandGroup";

export const AppCommandItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <CommandItem
      ref={ref}
      className={cn(
        "rounded-lg px-3 py-2.5 transition-colors cursor-pointer",
        // 1. Tắt hoàn toàn màu xám mặc định của hệ thống
        "data-selected:bg-transparent data-selected:text-foreground data-selected:*:[svg]:text-foreground",
        // 2. Màu highlight khi dùng chuột
        "hover:!bg-primary/10 hover:!text-primary hover:*:[svg]:!text-primary",
        // 3. Màu highlight khi dùng bàn phím (phục hồi)
        "[.is-keyboard_&]:data-selected:!bg-primary/10 [.is-keyboard_&]:data-selected:!text-primary [.is-keyboard_&]:data-selected:*:[svg]:!text-primary",
        className
      )}
      {...props}
    >
      {children}
    </CommandItem>
  );
});
AppCommandItem.displayName = "AppCommandItem";

// Component for a Data-Driven Command Palette Dialog
export function AppCommandPalette({
  open,
  onOpenChange,
  title = "Command Palette",
  placeholder = "Tìm kiếm nhanh...",
  groups = [],
  className,
  appVariant = "glass", // Default to glass for premium look
  ...props
}) {
  const [isKeyboard, setIsKeyboard] = React.useState(true);

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={onOpenChange} 
      title={title} 
      className={cn(
        appVariant === "glass" && "bg-background/60 backdrop-blur-2xl border-white/20 overflow-hidden",
        appVariant === "outline" && "border-border shadow-xl",
        isKeyboard ? "is-keyboard" : "is-mouse",
        className
      )} 
      onMouseMove={() => isKeyboard && setIsKeyboard(false)}
      onKeyDownCapture={() => !isKeyboard && setIsKeyboard(true)}
      {...props}
    >
      <AppCommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
        {groups.map((group, index) => (
          <React.Fragment key={index}>
            <AppCommandGroup heading={group.heading}>
              {group.items.map((item, itemIdx) => (
                <AppCommandItem
                  key={itemIdx}
                  onSelect={(val) => {
                    if (item.onSelect) item.onSelect(val);
                    if (onOpenChange) onOpenChange(false);
                  }}
                  disabled={item.disabled}
                >
                  {item.icon && <item.icon className="mr-2 size-4 text-muted-foreground" />}
                  <span>{item.label}</span>
                  {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                </AppCommandItem>
              ))}
            </AppCommandGroup>
            {index < groups.length - 1 && <CommandSeparator />}
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export {
  CommandList as AppCommandList,
  CommandEmpty as AppCommandEmpty,
  CommandShortcut as AppCommandShortcut,
  CommandSeparator as AppCommandSeparator,
  CommandDialog as AppCommandDialog
};
