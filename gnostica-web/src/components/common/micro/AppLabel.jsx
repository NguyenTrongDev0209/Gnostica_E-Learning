import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const AppLabel = React.forwardRef(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("text-sm font-medium text-foreground", className)}
    {...props}
  />
));

AppLabel.displayName = "AppLabel";

export { AppLabel as Label };
export default AppLabel;
