import React from 'react';
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Lấy chữ cái đầu của 2 từ đầu tiên trong tên để làm fallback
 */
const getInitials = (name) => {
  if (!name) return "U";
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * AppAvatar - Component hiển thị ảnh đại diện người dùng
 * @param {string} src - Đường dẫn ảnh
 * @param {string} fallback - Ký tự hiển thị nếu lỗi ảnh (VD: "AB")
 * @param {string} alt - Tên người dùng (dùng để auto generate fallback và làm tooltip)
 * @param {string} size - Kích thước ("sm" | "default" | "lg" | "xl" | "2xl")
 * @param {boolean} online - Hiển thị chấm xanh trạng thái online
 */
export default function AppAvatar({
  src,
  fallback,
  alt = "",
  size = "default",
  online = false,
  className,
  ...props
}) {
  const fallbackText = fallback || getInitials(alt);

  // Xử lý các size custom ngoài mặc định của Shadcn
  let sizeClass = "";
  let standardSize = size;
  
  if (size === "xl") {
    sizeClass = "size-16 text-xl";
    standardSize = undefined;
  } else if (size === "2xl") {
    sizeClass = "size-24 text-3xl";
    standardSize = undefined;
  }

  return (
    <Avatar size={standardSize} className={cn(sizeClass, className)} title={alt} {...props}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className={cn("font-medium", sizeClass)}>{fallbackText}</AvatarFallback>
      {online && (
        <AvatarBadge className="bg-success text-transparent border-background" />
      )}
    </Avatar>
  );
}

/**
 * AppAvatarGroup - Hiển thị danh sách avatar xếp chồng lên nhau
 * @param {Array} users - Mảng các object user: { src, name }
 * @param {number} max - Số lượng avatar tối đa được hiển thị
 * @param {string} size - Kích thước chung của các avatar trong nhóm
 */
export function AppAvatarGroup({
  users = [],
  max = 3,
  size = "default",
  className,
  ...props
}) {
  if (!users || users.length === 0) return null;

  const visibleUsers = users.slice(0, max);
  const hiddenCount = users.length - max;

  return (
    <AvatarGroup className={className} {...props}>
      {visibleUsers.map((user, i) => (
        <AppAvatar 
          key={i} 
          src={user.src} 
          alt={user.name || user.alt} 
          size={size} 
          className="border-2 border-background" // Viền để đè lên nhau đẹp hơn
        />
      ))}
      {hiddenCount > 0 && (
        <AvatarGroupCount className="border-2 border-background font-medium">
          +{hiddenCount}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount };
