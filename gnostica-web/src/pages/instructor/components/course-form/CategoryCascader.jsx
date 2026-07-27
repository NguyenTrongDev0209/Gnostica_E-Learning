import React from "react";
import AppPopover, { AppPopoverContent, AppPopoverTrigger } from "@/components/common/micro/AppPopover";
import { AppButton } from "@/components/common/micro/AppButton";
import { ChevronDown, ChevronRight } from "lucide-react";

export function CategoryCascader({ categories, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [activeParent, setActiveParent] = React.useState(null);

  let selectedName = "";
  if (value) {
    const valStr = value.toString();
    for (const p of categories) {
      if (p.id.toString() === valStr) { selectedName = p.name; break; }
      const child = p.subcategories?.find(c => c.id.toString() === valStr);
      if (child) {
        selectedName = child.name;
        break;
      }
    }
  }

  return (
    <AppPopover open={open} onOpenChange={setOpen}>
      <AppPopoverTrigger asChild>
        <AppButton appVariant="ghostMuted"
          type="button"
          onClick={() => {
            if (!open) setActiveParent(null);
          }}
          className="flex h-11 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm font-medium focus:outline-none hover:border-success/50 focus:border-success focus:ring-1 focus:ring-success/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-success data-[state=open]:ring-1 data-[state=open]:ring-success/30 transition-all font-sans"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {selectedName || "Chọn danh mục khóa học"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </AppButton>
      </AppPopoverTrigger>
      <AppPopoverContent className="w-auto p-0 flex flex-row items-start gap-1.5 border-none bg-transparent shadow-none" align="start" sideOffset={8}>
        {/* Cấp 1 */}
        <div className="w-[240px] max-h-[300px] overflow-y-auto py-2 bg-white rounded-md shadow-lg border border-border">
          {categories.map(parent => {
            const hasChildren = parent.subcategories && parent.subcategories.filter(c => c.status).length > 0;
            const isActive = activeParent?.id === parent.id;
            return (
              <div
                key={parent.id}
                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${isActive ? "text-warning bg-success/10" : "text-foreground hover:text-warning hover:bg-success/10"}`}
                onMouseEnter={() => setActiveParent(parent)}
                onClick={() => {
                  if (!hasChildren) {
                    onChange(parent.id.toString());
                    setOpen(false);
                  } else {
                    setActiveParent(parent);
                  }
                }}
              >
                <span>{parent.name}</span>
                {hasChildren && <ChevronRight className="h-4 w-4 opacity-70" />}
              </div>
            );
          })}
        </div>

        {/* Cấp 2 */}
        {activeParent && activeParent.subcategories && activeParent.subcategories.filter(c => c.status).length > 0 && (
          <div className="w-[240px] max-h-[300px] overflow-y-auto py-2 bg-white rounded-md shadow-lg border border-border">
            {activeParent.subcategories.filter(c => c.status).map(child => (
              <div
                key={child.id}
                className="px-4 py-2.5 text-sm cursor-pointer text-foreground hover:text-warning hover:bg-success/10 transition-colors"
                onClick={() => {
                  onChange(child.id.toString());
                  setOpen(false);
                }}
              >
                {child.name}
              </div>
            ))}
          </div>
        )}
      </AppPopoverContent>
    </AppPopover>
  );
}
