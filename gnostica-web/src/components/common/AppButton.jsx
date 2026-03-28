import React from 'react'
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Nút outline với viền & chữ màu cam — dùng cho các hành động phụ (ví dụ: Kích hoạt)
export const SimpleButton = ({ children, className, variant = "default", ...props }) => {
  return (
    <Button
      variant={variant}
      className={cn(
        "px-4 h-[38px] bg-button-gradient text-primary-foreground hover:brightness-110 transition-all shadow-md active:scale-95 text-base font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

// Nút viền cam gradient, nền trắng, chữ cam gradient
export const OutlineGradientButton = ({ children, className, ...props }) => {
  return (
    <Button
      className={cn(
        "px-4 h-[38px] btn-outline-gradient hover:brightness-105 transition-all shadow-sm active:scale-95 text-base font-semibold tracking-tight",
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
export const GhostButton = ({ children, className, ...props }) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "px-4 h-11 text-slate-600 hover:text-primary hover:bg-primary/5 transition-all active:scale-95 text-base font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

// Nút nền cam có icon bên trái + nhãn chữ — dùng cho hành động chính (ví dụ: Đăng nhập)
export const IconLabelButton = ({ children, icon: Icon, className, variant = "default", ...props }) => {
  return (
    <Button
      variant={variant}
      className={`h-9 w-9 md:w-auto px-0 md:px-3 flex flex-col items-center justify-center gap-0.5 bg-button-gradient bg-clip-border border-none hover:brightness-110 active:scale-95 transition-all text-primary-foreground font-semibold tracking-tight ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-6 w-6" />}
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
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-md animate-in zoom-in border-2 border-white/20">
          {badge}
        </span>
      )}
    </Button>
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

import { Link } from 'react-router-dom'

// Logo thương hiệu: Sử dụng ảnh TechOne_Logo từ public folder
export const AppLogo = () => {
  return (
    <Link to="/" className="flex items-center h-10 md:h-10 hover:opacity-90 transition-opacity">
      <img
        src="/TechOne_Logo.png"
        alt="TechOne Logo"
        className="h-full w-auto object-contain"
      />
    </Link>
  )
}
