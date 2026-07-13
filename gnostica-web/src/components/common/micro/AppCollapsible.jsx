import React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export default function AppCollapsible({
  className,
  ...props
}) {
  return (
    <Collapsible 
      className={cn("w-full space-y-2", className)} 
      {...props}
    />
  );
}

export { 
  CollapsibleTrigger as AppCollapsibleTrigger, 
  CollapsibleContent as AppCollapsibleContent 
};
