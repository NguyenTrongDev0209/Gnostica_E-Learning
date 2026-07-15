import React from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

export default function AppHoverCard(props) {
  return <HoverCard {...props} />;
}

export {
  HoverCardTrigger as AppHoverCardTrigger,
  HoverCardContent as AppHoverCardContent,
};
