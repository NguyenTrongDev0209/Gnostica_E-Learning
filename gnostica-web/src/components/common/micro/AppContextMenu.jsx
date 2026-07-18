import React from 'react';
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, 
  ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, 
  ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, 
  ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, 
  ContextMenuSubTrigger, ContextMenuRadioGroup
} from "@/components/ui/context-menu";

export default function AppContextMenu(props) {
  return <ContextMenu {...props} />;
}

export {
  ContextMenuTrigger as AppContextMenuTrigger,
  ContextMenuContent as AppContextMenuContent,
  ContextMenuItem as AppContextMenuItem,
  ContextMenuCheckboxItem as AppContextMenuCheckboxItem,
  ContextMenuRadioItem as AppContextMenuRadioItem,
  ContextMenuLabel as AppContextMenuLabel,
  ContextMenuSeparator as AppContextMenuSeparator,
  ContextMenuShortcut as AppContextMenuShortcut,
  ContextMenuGroup as AppContextMenuGroup,
  ContextMenuPortal as AppContextMenuPortal,
  ContextMenuSub as AppContextMenuSub,
  ContextMenuSubContent as AppContextMenuSubContent,
  ContextMenuSubTrigger as AppContextMenuSubTrigger,
  ContextMenuRadioGroup as AppContextMenuRadioGroup,
};
