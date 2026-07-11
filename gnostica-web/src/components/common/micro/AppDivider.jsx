import React from 'react';
import { cn } from "@/lib/utils";

const AppDivider = ({ text = "Hoặc", className }) => {
  return (
    <div className={cn("flex items-center gap-3 my-6", className)}>
      <div className="flex-1 h-[1px] bg-muted"></div>
      <span className="text-xs text-muted-foreground font-medium px-1">{text}</span>
      <div className="flex-1 h-[1px] bg-muted"></div>
    </div>
  );
};

export default AppDivider;
