import React from "react";
import { MediaTab } from "./MediaTab";
import { PricingTab } from "./PricingTab";

export function SettingsTab({ uploadVideoToBunny, setActiveUploads }) {
  return (
    <div className="space-y-12">
      <MediaTab uploadVideoToBunny={uploadVideoToBunny} setActiveUploads={setActiveUploads} />
      <div className="border-t border-border"></div>
      <PricingTab />
    </div>
  );
}
