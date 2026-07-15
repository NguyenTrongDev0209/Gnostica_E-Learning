import React from 'react';
import { 
  Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, 
  DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription 
} from "@/components/ui/drawer";

export default function AppDrawer(props) {
  return <Drawer {...props} />;
}

export {
  DrawerPortal as AppDrawerPortal,
  DrawerOverlay as AppDrawerOverlay,
  DrawerTrigger as AppDrawerTrigger,
  DrawerClose as AppDrawerClose,
  DrawerContent as AppDrawerContent,
  DrawerHeader as AppDrawerHeader,
  DrawerFooter as AppDrawerFooter,
  DrawerTitle as AppDrawerTitle,
  DrawerDescription as AppDrawerDescription,
};
