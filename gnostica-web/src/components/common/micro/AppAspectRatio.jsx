import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

/**
 * AppAspectRatio - Component giữ tỷ lệ khung hình cố định cho ảnh/video
 * @param {number} ratio - Tỷ lệ tùy chỉnh (vd: 16/9, 4/3). Nếu truyền ratio thì sẽ ưu tiên hơn variant.
 * @param {string} variant - Cấu hình sẵn tỷ lệ: "video" (16:9), "square" (1:1), "portrait" (3:4), "widescreen" (21:9)
 * @param {boolean} rounded - Bật bo góc mặc định (rounded-lg theo index.css)
 */
export default function AppAspectRatio({
  ratio,
  variant = "video",
  rounded = true,
  children,
  className,
  ...props
}) {
  let finalRatio = ratio;
  
  if (!finalRatio) {
    switch (variant) {
      case "video": finalRatio = 16 / 9; break;
      case "square": finalRatio = 1; break;
      case "portrait": finalRatio = 3 / 4; break;
      case "widescreen": finalRatio = 21 / 9; break;
      case "standard": finalRatio = 4 / 3; break;
      default: finalRatio = 16 / 9;
    }
  }

  return (
    <div className={cn("w-full relative", rounded && "overflow-hidden rounded-lg", className)}>
      <AspectRatio ratio={finalRatio} {...props}>
        {/* React.cloneElement giúp tự động thêm class object-cover w-full h-full cho thẻ img nếu có */}
        {React.isValidElement(children) && children.type === 'img'
          ? React.cloneElement(children, {
              className: cn("w-full h-full object-cover", children.props.className),
            })
          : children}
      </AspectRatio>
    </div>
  );
}
