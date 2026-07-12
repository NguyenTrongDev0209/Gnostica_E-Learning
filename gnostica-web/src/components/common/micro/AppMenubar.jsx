import React from 'react';
import { cva } from 'class-variance-authority';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from "@/components/ui/menubar";
import { cn } from "@/lib/utils";

const menubarVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      appVariant: {
        default: "rounded-lg",
        outline: "border border-border shadow-sm rounded-lg",
        glass: "bg-background/60 backdrop-blur-2xl border border-white/20 shadow-md dark:bg-black/60 rounded-lg",
      }
    },
    defaultVariants: {
      appVariant: "default"
    }
  }
);

// We wrap MenubarContent to apply appVariant styles
export const AppMenubarContent = React.forwardRef(({ className, appVariant, ...props }, ref) => {
  return (
    <MenubarContent
      ref={ref}
      className={cn(
        menubarVariants({ appVariant }),
        // Override the default hardcoded rounded-lg and bg-popover if glass is used
        appVariant === 'glass' && "bg-transparent shadow-xl", 
        className
      )}
      {...props}
    />
  );
});
AppMenubarContent.displayName = "AppMenubarContent";

export const AppMenubarSubContent = React.forwardRef(({ className, appVariant, ...props }, ref) => {
  return (
    <MenubarSubContent
      ref={ref}
      className={cn(
        menubarVariants({ appVariant }),
        appVariant === 'glass' && "bg-transparent shadow-xl",
        className
      )}
      {...props}
    />
  );
});
AppMenubarSubContent.displayName = "AppMenubarSubContent";

// Export the primitives if they want to build manually
export {
  Menubar as AppMenubarRoot,
  MenubarMenu as AppMenubarMenu,
  MenubarTrigger as AppMenubarTrigger,
  MenubarItem as AppMenubarItem,
  MenubarSeparator as AppMenubarSeparator,
  MenubarLabel as AppMenubarLabel,
  MenubarCheckboxItem as AppMenubarCheckboxItem,
  MenubarRadioGroup as AppMenubarRadioGroup,
  MenubarRadioItem as AppMenubarRadioItem,
  MenubarShortcut as AppMenubarShortcut,
  MenubarSub as AppMenubarSub,
  MenubarSubTrigger as AppMenubarSubTrigger,
};

/**
 * Render a single menu item recursively (handling SubMenus)
 */
function renderMenuItem(item, idx, appVariant) {
  if (item.type === 'separator') {
    return <MenubarSeparator key={`sep-${idx}`} />;
  }
  
  if (item.type === 'label') {
    return <MenubarLabel key={`lbl-${idx}`}>{item.label}</MenubarLabel>;
  }

  if (item.type === 'checkbox') {
    return (
      <MenubarCheckboxItem
        key={item.id || idx}
        checked={item.checked}
        disabled={item.disabled}
        onClick={item.onClick}
        className={item.className}
      >
        {item.label}
        {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
      </MenubarCheckboxItem>
    );
  }

  if (item.type === 'radio-group') {
    return (
      <MenubarRadioGroup key={`rg-${idx}`} value={item.value} onValueChange={item.onValueChange}>
        {item.options?.map((opt, oIdx) => (
          <MenubarRadioItem key={`ri-${oIdx}`} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </MenubarRadioItem>
        ))}
      </MenubarRadioGroup>
    );
  }

  if (item.sub) {
    return (
      <MenubarSub key={`sub-${idx}`}>
        <MenubarSubTrigger className={item.triggerClassName}>
          {item.icon && <item.icon className="mr-2 size-4" />}
          <span>{item.label}</span>
        </MenubarSubTrigger>
        <AppMenubarSubContent appVariant={appVariant}>
          {item.sub.map((subItem, sIdx) => renderMenuItem(subItem, sIdx, appVariant))}
        </AppMenubarSubContent>
      </MenubarSub>
    );
  }

  return (
    <MenubarItem
      key={item.id || idx}
      disabled={item.disabled}
      onClick={item.onClick}
      className={cn(
        "cursor-pointer focus:bg-primary/10 focus:text-primary focus:*:[svg]:text-primary",
        item.className
      )}
      inset={item.inset}
    >
      {item.icon && <item.icon className="mr-2 size-4" />}
      <span>{item.label}</span>
      {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
    </MenubarItem>
  );
}

/**
 * Data-Driven AppMenubar
 * 
 * @param {Array} menus - Array of menu objects { trigger: string, items: Array }
 */
export default function AppMenubar({
  menus = [],
  appVariant = "glass",
  className,
  ...props
}) {
  return (
    <Menubar className={cn(appVariant === 'glass' && "bg-background/40 backdrop-blur-md border-white/20", className)} {...props}>
      {menus.map((menu, idx) => (
        <MenubarMenu key={`menu-${idx}`}>
          <MenubarTrigger className="cursor-pointer data-[state=open]:bg-primary/10 data-[state=open]:text-primary">{menu.trigger}</MenubarTrigger>
          <AppMenubarContent appVariant={appVariant}>
            {menu.items?.map((item, itemIdx) => renderMenuItem(item, itemIdx, appVariant))}
          </AppMenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}
