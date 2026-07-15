import React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const resizableVariants = cva(
  "w-full h-full overflow-hidden transition-all duration-300",
  {
    variants: {
      appVariant: {
        default: "border rounded-xl bg-background",
        glass: "glass rounded-xl",
        "glass-dark": "glass-dark rounded-xl",
        glow: "border-glow rounded-xl bg-background",
        ghost: "bg-transparent",
      }
    },
    defaultVariants: {
      appVariant: "default"
    }
  }
);

/**
 * Hàm đệ quy render ResizablePanelGroup
 * @param {Object} groupData - Dữ liệu nhóm panel
 */
const renderGroup = (groupData) => {
  if (!groupData || !groupData.panels) return null;

  const { direction = "horizontal", panels = [], className, id } = groupData;

  return (
    <ResizablePanelGroup
      direction={direction}
      className={cn("w-full h-full", className)}
      id={id}
    >
      {panels.map((panel, idx) => {
        // Có hiển thị thanh kéo hay không (mặc định các panel đầu đều có thanh kéo ở sau, trừ cái cuối cùng)
        const isLast = idx === panels.length - 1;

        return (
          <React.Fragment key={panel.id || idx}>
            <ResizablePanel
              defaultSize={panel.defaultSize}
              minSize={panel.minSize}
              maxSize={panel.maxSize}
              collapsible={panel.collapsible}
              collapsedSize={panel.collapsedSize}
              className={panel.className}
            >
              {panel.group ? renderGroup(panel.group) : panel.content}
            </ResizablePanel>
            
            {/* Nếu không phải panel cuối cùng, hiển thị Handle (Thanh kéo) */}
            {!isLast && <ResizableHandle withHandle={panel.withHandle !== false} />}
          </React.Fragment>
        );
      })}
    </ResizablePanelGroup>
  );
};

/**
 * Data-Driven AppResizable
 * Hỗ trợ tạo cấu trúc layout chia màn hình, có thể lồng nhau (nested) đệ quy.
 *
 * @param {Object} layout - Object mô tả kiến trúc của group gốc
 *   Ví dụ:
 *   {
 *     direction: "horizontal", // "horizontal" | "vertical"
 *     panels: [
 *       { defaultSize: 20, content: <Sidebar /> },
 *       {
 *         defaultSize: 80, 
 *         group: {
 *           direction: "vertical",
 *           panels: [
 *             { defaultSize: 70, content: <Main /> },
 *             { defaultSize: 30, content: <Footer /> }
 *           ]
 *         }
 *       }
 *     ]
 *   }
 */
export default function AppResizable({ layout, appVariant = "default", className }) {
  if (!layout) return null;

  return (
    <div className={cn(resizableVariants({ appVariant }), className)}>
      {renderGroup(layout)}
    </div>
  );
}

// Export nguyên bản để dùng thủ công nếu muốn
export {
  ResizablePanelGroup as AppResizableGroup,
  ResizablePanel as AppResizablePanel,
  ResizableHandle as AppResizableHandle,
};
