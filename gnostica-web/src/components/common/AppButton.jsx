import React from 'react'
import { Menu, X, User, BookOpen, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Nút outline với viền & chữ màu cam — dùng cho các hành động phụ (ví dụ: Kích hoạt)
export const SimpleButton = ({ children, className, variant = "default", size = "md", ...props }) => {
  const sizeClass = size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "btn-md";

  return (
    <Button
      variant={variant}
      className={cn(
        sizeClass,
        "bg-button-gradient text-primary-foreground hover:brightness-110 shadow-md font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

// Nút viền cam gradient, nền trắng, chữ cam gradient
export const OutlineGradientButton = ({ children, className, size = "md", ...props }) => {
  const sizeClass = size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "btn-md";

  return (
    <Button
      className={cn(
        sizeClass,
        "btn-outline-gradient hover:brightness-105 shadow-sm font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      <span className="text-gradient-button">
        {children}
      </span>
    </Button>
  )
}

// Nút không có nền (Ghost button) — dùng cho các hành động ít quan trọng hơn hoặc trên nền tối
export const GhostButton = ({ children, className, size = "md", ...props }) => {
  const sizeClass = size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "btn-md";

  return (
    <Button
      variant="ghost"
      className={cn(
        sizeClass,
        "text-muted-foreground hover:text-primary hover:bg-primary/5 font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

// Nút nền cam có icon bên trái + nhãn chữ — dùng cho hành động chính (ví dụ: Đăng nhập)
export const IconLabelButton = ({ children, icon: Icon, className, variant = "default", badge, ...props }) => {
  return (
    <Button
      variant={variant}
      className={cn(
        "relative h-auto min-h-9 md:w-auto px-0 md:px-3 flex flex-col items-center justify-center gap-0.5 bg-button-gradient bg-clip-border border-none hover:brightness-110 active:scale-95 transition-all text-primary-foreground font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      <div className="relative">
        {Icon && <Icon className="h-6 w-6" />}
        {badge > 0 && (
          <span className="absolute -top-1 -right-2 h-4 w-4 bg-error/10 text-error rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[11px] font-bold leading-tight">{children}</span>
    </Button>
  )
}

export const HorizontalIconLabelButton = ({ children, icon: Icon, className, variant = "default", ...props }) => {
  return (
    <Button
      variant={variant}
      className={cn(
        "h-10 w-10 p-0 aspect-square min-w-0 flex items-center justify-center bg-button-gradient bg-clip-border border-none hover:brightness-110 active:scale-95 transition-all text-primary-foreground shrink-0",
        "md:w-auto md:px-5 md:aspect-auto text-base font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-8 w-8 shrink-0" />}
      {children}
    </Button>
  )
}

// Nút icon vuông nền cam — dùng cho các icon đơn như giỏ hàng, thông báo. Hỗ trợ badge số
export const AppIconButton = ({ icon: Icon, className, variant = "ghost", badge, ...props }) => {
  return (
    <Button
      variant={variant}
      className={cn(
        "relative h-9 w-9 p-0 aspect-square min-w-0 flex items-center justify-center bg-button-gradient bg-clip-border border-none hover:brightness-110 hover:text-white active:scale-95 transition-all text-white shrink-0 shadow-sm",
        className
      )}
      {...props}
    >
      {Icon && <Icon size={20} strokeWidth={2} style={{ width: 20, height: 20 }} className="shrink-0" />}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-error/10 text-error rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-md animate-in zoom-in border-2 border-white/20">
          {badge}
        </span>
      )}
    </Button>
  )
}

// Nút chuyên dụng cho Header: Icon bọc trong ô vuông (style AppIconButton) và nhãn bên dưới
export const AppHeaderButton = ({ icon: Icon, label, badge, className, ...props }) => {
  return (
    <div className={cn("flex flex-col items-center gap-1.5 group cursor-pointer w-fit", className)}>
      <AppIconButton
        icon={Icon}
        badge={badge}
        className="!h-10 !w-10 !rounded-xl !bg-white/10 !text-white !border-white/10 hover:!bg-white hover:!text-primary transition-all duration-300 shadow-none group-hover:scale-105 active:scale-95"
        {...props}
      />
      {label && (
        <span className="text-[12px] font-bold uppercase tracking-widest text-white group-hover:text-white transition-all duration-300">
          {label}
        </span>
      )}
    </div>
  )
}

// Nút toggle hamburger menu (☰ / X) — dùng trên mobile để mở/đóng nav
// Phiệu ứng Biến hình cơ bản (Basic Morph) - Sạch sẽ và tinh tế
export const AppHamburgerButton = ({ isOpen, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Toggle menu"
      className={`relative w-10 h-10 flex flex-col items-center justify-center p-2 rounded-md hover:bg-white/10 active:scale-95 transition-all duration-300 group ${className}`}
    >
      <div className="relative w-5 h-4">
        <span
          className={`absolute block h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out ${isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
            }`}
        />
        <span
          className={`absolute top-1/2 -translate-y-1/2 block h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out ${isOpen ? "opacity-0 invisible" : "opacity-100 visible"
            }`}
        />
        <span
          className={`absolute block h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out ${isOpen ? "bottom-1/2 translate-y-1/2 -rotate-45" : "bottom-0"
            }`}
        />
      </div>
    </button>
  )
}

// Link điều hướng với hover màu cam — dùng trong nav header (desktop & mobile)
export const AppNavLink = ({ href = "#", children, onClick, className }) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`text-base font-medium hover:text-primary transition-colors ${className}`}
    >
      {children}
    </a>
  )
}

// Nút người dùng có dropdown: Hình viên thuốc, avatar trái, tên giữa, mũi tên phải
export const AppUserMenu = ({ user = { name: "Học viên", avatar: "https://github.com/shadcn.png" }, onLogout }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full p-1 pr-3 transition-all duration-300 group focus:outline-none h-[42px]">
          <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white/50 object-cover" />
          <span className="text-base font-bold text-white max-w-[140px] truncate">{user.name}</span>
          <ChevronDown className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={4} align="center" className="w-[220px] bg-white border-border shadow-xl rounded-lg p-2 animate-in fade-in slide-in-from-top-2 z-[200]">
        <DropdownMenuItem asChild className="px-4 py-2 cursor-pointer rounded-lg hover:bg-muted text-base font-semibold text-foreground focus:bg-muted focus:text-foreground">
          <Link to="/account" className="flex items-center gap-3">
            <User className="size-5 text-primary" />
            Tài khoản
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="px-4 py-2 cursor-pointer rounded-lg hover:bg-muted text-base font-semibold text-foreground focus:bg-muted focus:text-foreground">
          <Link to="/account/my-courses" className="flex items-center gap-3">
            <BookOpen className="size-5 text-emerald-500" />
            Khóa học
          </Link>
        </DropdownMenuItem>
        <div className="h-[2px] bg-secondary my-2 mx-2" />
        <DropdownMenuItem onClick={onLogout} className="px-4 py-2 cursor-pointer rounded-lg hover:bg-red-50 focus:bg-red-50 text-base font-bold text-error focus:text-error flex items-center gap-3">
          <LogOut className="size-5 text-error" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Nút danh mục khóa học: Nền cam, chữ trắng, không đổ bóng/transition theo yêu cầu
export const CategoryButton = ({ children, className, ...props }) => {
  return (
    <button
      className={cn(
        "flex items-center gap-3 px-6 h-11 bg-header-orange text-white rounded-lg font-bold uppercase border-2 border-white/20 focus:outline-none transition-all duration-300 hover:brightness-110 active:scale-95",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Logo thương hiệu: Sử dụng ảnh TechOne_Logo từ public folder
export const AppLogo = ({ src = "/Gnostica_Mark.webp", className }) => {
  return (
    <Link
      to="/"
      className={cn("flex items-center h-10 md:h-10 hover:opacity-90 transition-opacity", className)}
    >
      <img
        src={src}
        alt="Gnostica Logo"
        className="h-full w-auto object-contain"
      />
    </Link>
  )
}
