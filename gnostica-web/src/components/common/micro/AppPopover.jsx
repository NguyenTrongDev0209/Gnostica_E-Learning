import React from 'react';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "@/components/ui/popover";

export default function AppPopover(props) {
  return <Popover {...props} />;
}

export {
  PopoverTrigger as AppPopoverTrigger,
  PopoverContent as AppPopoverContent,
  PopoverAnchor as AppPopoverAnchor,
};
