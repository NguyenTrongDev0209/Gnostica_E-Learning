import React from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * AppTabs - Tabs chuẩn của Gnostica
 * 
 * @param {Array} tabs - Danh sách tab: [{ value: "a", label: "A", content: <ContentA /> }]
 * @param {string} defaultValue - Tab mặc định được chọn
 * @param {string} value - Tab được chọn (dùng khi controlled)
 * @param {Function} onValueChange - Hàm callback khi chuyển tab
 */
export default function AppTabs({
  tabs = [],
  defaultValue,
  value,
  onValueChange,
  className,
  listClassName,
  ...props
}) {
  const initialValue = defaultValue || (tabs.length > 0 ? tabs[0].value : undefined);

  return (
    <Tabs 
      defaultValue={initialValue} 
      value={value} 
      onValueChange={onValueChange} 
      className={cn("w-full", className)}
      {...props}
    >
      <TabsList className={cn("inline-grid h-11 grid-flow-col auto-cols-fr items-center justify-center text-muted-foreground", listClassName)}>
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            disabled={tab.disabled}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-primary"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent 
          key={tab.value} 
          value={tab.value}
          className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
};
