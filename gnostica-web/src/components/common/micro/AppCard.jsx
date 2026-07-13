import React from 'react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AppCard({
  children,
  className,
  appVariant = "glass", // "default", "glass", "outline"
  ...props
}) {
  return (
    <Card 
      className={cn(
        "transition-all duration-300",
        appVariant === "glass" && "glass border-white/20 shadow-xl rounded-xl",
        appVariant === "outline" && "bg-transparent border-2 border-primary/20 shadow-none",
        appVariant === "default" && "bg-card shadow-sm rounded-xl border-border",
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  );
}

export { 
  CardHeader as AppCardHeader, 
  CardFooter as AppCardFooter, 
  CardTitle as AppCardTitle, 
  CardDescription as AppCardDescription, 
  CardContent as AppCardContent 
};
