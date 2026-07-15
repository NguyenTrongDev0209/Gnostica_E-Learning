import React from 'react';
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * AppAccordion - Component mở rộng từ Shadcn Accordion
 * @param {Array} items - Mảng dữ liệu [{ value, title, content, icon, className, triggerClassName, contentClassName }]
 * @param {string} type - "single" hoặc "multiple"
 * @param {boolean} collapsible - Có cho phép thu gọn tất cả không
 * @param {string} variant - "default" | "separated"
 */
export default function AppAccordion({
  items = [],
  type = "single",
  collapsible = true,
  className,
  variant = "default",
  ...props
}) {
  return (
    <Accordion 
      type={type} 
      collapsible={type === "single" ? collapsible : undefined} 
      className={cn("w-full", className)} 
      {...props}
    >
      {items.map((item, index) => {
        const itemValue = item.value || `item-${index}`;
        return (
          <AccordionItem 
            key={itemValue} 
            value={itemValue}
            className={cn(
              variant === "separated" && "bg-card border border-border/50 rounded-lg mb-4 px-5 shadow-sm hover:shadow-md transition-all duration-300 data-[state=open]:border-primary/20",
              item.className
            )}
          >
            <AccordionTrigger className={cn(
              variant === "separated" && "hover:no-underline hover:text-primary transition-colors duration-300 py-4",
              item.triggerClassName
            )}>
              <div className="flex items-center gap-3 text-left">
                {item.icon && <span className="text-primary flex shrink-0 items-center justify-center p-2 rounded-lg bg-primary/10">{item.icon}</span>}
                <span className="font-semibold text-base">{item.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className={cn(
              variant === "separated" && "pb-5 text-muted-foreground leading-relaxed text-sm pt-1",
              item.contentClassName
            )}>
              {item.content}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  );
}
