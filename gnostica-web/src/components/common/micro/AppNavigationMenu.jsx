import React from 'react';
import { cva } from 'class-variance-authority';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const navigationMenuVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      appVariant: {
        default: "rounded-lg",
        glass: "bg-background/60 backdrop-blur-2xl border border-white/20 shadow-xl dark:bg-black/60 rounded-lg",
      }
    },
    defaultVariants: {
      appVariant: "glass"
    }
  }
);

/**
 * Data-Driven AppNavigationMenu
 * 
 * @param {Array} items - Array of navigation items
 *   Cấu trúc 1 item:
 *   - label: string (tên menu)
 *   - href: string (nếu chỉ là 1 link đơn thuần, không có dropdown)
 *   - content: ReactNode (nếu muốn render tuỳ biến hoàn toàn trong Mega-menu)
 *   - links: Array (nếu muốn render danh sách các link đơn giản)
 */
export default function AppNavigationMenu({
  items = [],
  appVariant = "glass",
  className,
  ...props
}) {
  return (
    <NavigationMenu className={className} {...props}>
      <NavigationMenuList>
        {items.map((item, idx) => (
          <NavigationMenuItem key={idx}>
            
            {/* Trường hợp 1: Có dropdown content tuỳ biến hoặc danh sách links */}
            {(item.content || item.links) ? (
              <>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary">
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  {/* Nếu dùng appVariant glass thì ta bọc thêm 1 div bên ngoài để hiệu ứng Glass hoạt động */}
                  <div className={cn(navigationMenuVariants({ appVariant }), "w-full md:w-auto p-4")}>
                    {item.content ? (
                      item.content
                    ) : (
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.links?.map((link, lIdx) => (
                          <li key={lIdx}>
                            <NavigationMenuLink asChild>
                              <a
                                href={link.href}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary",
                                  link.className
                                )}
                              >
                                <div className="text-sm font-medium leading-none">{link.title}</div>
                                {link.description && (
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1.5">
                                    {link.description}
                                  </p>
                                )}
                              </a>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              /* Trường hợp 2: Chỉ là 1 link bình thường */
              <NavigationMenuLink href={item.href} className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-primary/10 hover:text-primary")}>
                {item.label}
              </NavigationMenuLink>
            )}

          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export {
  NavigationMenu as AppNavigationMenuRoot,
  NavigationMenuList as AppNavigationMenuList,
  NavigationMenuItem as AppNavigationMenuItem,
  NavigationMenuContent as AppNavigationMenuContent,
  NavigationMenuTrigger as AppNavigationMenuTrigger,
  NavigationMenuLink as AppNavigationMenuLink,
  NavigationMenuIndicator as AppNavigationMenuIndicator,
  NavigationMenuViewport as AppNavigationMenuViewport,
};
