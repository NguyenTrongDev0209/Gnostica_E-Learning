import React from "react";

export default function AppPageHeader({ icon: Icon, iconNode, title, description, actions, titleClassName = "font-bold" }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className={`text-2xl ${titleClassName} text-foreground flex items-center gap-3`}>
          {iconNode ? iconNode : Icon && <Icon className="w-7 h-7 text-primary" />}
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
