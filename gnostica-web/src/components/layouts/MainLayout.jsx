import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Phone,
  Mail,
  MapPin
} from "lucide-react"
import {
  SimpleButton,
  OutlineGradientButton,
  AppIconButton,
  AppHamburgerButton,
  AppNavLink,
  AppLogo,
  GhostButton,
  AppHeaderButton
} from "@/components/common/AppButton"
import { Search, Heart, ChevronDown, LayoutGrid, Flame } from "lucide-react"
import AppSearchInput from "@/components/common/AppSearchInput"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const courseCategories = [
  { label: "Tất cả khóa học", href: "/courses" },
  { label: "Lập trình Web", href: "/courses/category/web-development" },
  { label: "Thiết kế UI/UX", href: "/courses/category/ui-ux-design" },
  { label: "Khoa học dữ liệu", href: "/courses/category/data-science" },
  { label: "Lập trình Di động", href: "/courses/category/mobile-dev" },
  { label: "An ninh mạng", href: "/courses/category/cyber-security" },
  { label: "Thiết kế Đồ họa", href: "/courses/category/graphic-design" },
  { label: "Kinh doanh", href: "/courses/category/business" },
  { label: "Marketing", href: "/courses/category/marketing" },
  { label: "Điện toán đám mây", href: "/courses/category/cloud-computing" },
  { label: "Trí tuệ nhân tạo", href: "/courses/category/artificial-intelligence" },
  { label: "Phát triển Game", href: "/courses/category/game-development" },
  { label: "Blockchain", href: "/courses/category/blockchain" },
  { label: "Marketing kỹ thuật số", href: "/courses/category/digital-marketing" },
  { label: "Sức khỏe & Đời sống", href: "/courses/category/health" },
  { label: "Ngoại ngữ", href: "/courses/category/language" },
]

const FooterBrand = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-1">
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gnostica</h2>
      <span className="text-sm text-primary font-bold tracking-tight uppercase">Nền tảng học tập thông minh</span>
    </div>

    <div className="w-40 h-[2px] bg-slate-800"></div>

    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
      Consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet
    </p>

    <div className="flex gap-4">
      {[
        { Icon: Facebook, color: 'bg-primary' },
        { Icon: Twitter, color: 'bg-slate-200 text-slate-600' },
        { Icon: Linkedin, color: 'bg-slate-200 text-slate-600' },
        { Icon: Send, color: 'bg-slate-200 text-slate-600' }
      ].map(({ Icon, color }, i) => (
        <div
          key={i}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border border-transparent hover:scale-110 ${color}`}
        >
          <Icon className="h-4 w-4 fill-current" />
        </div>
      ))}
    </div>
  </div>
)

const FooterLinks = ({ title, links }) => (
  <div className="flex flex-col gap-8">
    <h3 className="font-bold text-xl text-slate-900 tracking-tight">{title}</h3>
    <ul className="flex flex-col gap-5">
      {links.map((link) => (
        <li key={link}>
          <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-3 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
)


const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCoursesMobileOpen, setIsCoursesMobileOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full sticky top-0 z-50">
        {/* Top Row: Logo, Search, Actions */}
        <div className="bg-primary-gradient text-white border-b border-white/10">
          <div className="app-container flex items-center justify-between py-3 md:py-4 gap-8">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <AppHamburgerButton
                  isOpen={isMenuOpen}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white"
                />
              </div>
              <AppLogo src="/Gnostica_Mark.webp" />
            </div>

            {/* Search - Center */}
            <div className="flex-1 max-w-2xl hidden lg:block">
              <AppSearchInput />
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-1 md:gap-4">
              <Link to="/login">
                <AppHeaderButton 
                  icon={User} 
                  label="Đăng nhập"
                />
              </Link>
              <Link to="/wishlist">
                <AppHeaderButton 
                  icon={Heart} 
                  label="Yêu thích"
                />
              </Link>
              <Link to="/cart">
                <AppHeaderButton 
                  icon={ShoppingCart} 
                  label="Giỏ hàng"
                  badge={2} 
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Row: Navigation */}
        <div className="bg-white shadow-md relative z-40">
          <div className="app-container flex items-center justify-between py-0 h-14">
            {/* Left: Category Button */}
            <div className="flex-1 flex justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SimpleButton size="lg" className="rounded-lg font-bold uppercase tracking-wider">
                    <LayoutGrid className="w-5 h-5" />
                    Khóa học
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </SimpleButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[280px] bg-white border-none shadow-2xl rounded-sm p-2 animate-in fade-in slide-in-from-top-2">
                  {courseCategories.map((category) => (
                    <DropdownMenuItem key={category.label} asChild className="px-4 py-2 hover:bg-header-bg hover:text-header-orange cursor-pointer font-bold text-sm">
                      <Link to={category.href}>{category.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden lg:flex items-center h-full gap-2">
              <Link to="/" className="h-full flex items-center relative group px-4">
                <span className="font-bold text-slate-700 group-hover:text-[#f15e2c] transition-colors">
                  Trang chủ
                </span>
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#f15e2c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-full flex items-center relative group px-4 font-bold text-slate-700 hover:text-[#f15e2c] outline-none cursor-pointer">
                    <span className="flex items-center gap-1">
                      Sản phẩm
                      <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                    </span>
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#f15e2c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem>Sản phẩm mới</DropdownMenuItem>
                  <DropdownMenuItem>Khuyến mãi</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/news" className="h-full flex items-center relative group px-4">
                <span className="font-bold text-slate-700 group-hover:text-[#f15e2c] transition-colors">
                  Tin tức
                </span>
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#f15e2c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>

              <Link to="/promo" className="h-full flex items-center relative group px-4">
                <span className="font-bold text-[#f15e2c] flex items-center gap-2">
                  <Flame className="w-4 h-4 fill-current" />
                  Khuyến mãi Hot
                </span>
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#f15e2c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
            </nav>

            {/* Right: Placeholder for centering */}
            <div className="flex-1 hidden md:block"></div>
          </div>
        </div>

        {/* Mobile Menu Content (Keep existing logic but styled per new theme) */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-header-orange/10 bg-header-bg px-4 pb-8 animate-in slide-in-from-top-4 duration-300">
            <AppSearchInput className="mt-3 mb-2" />
            <nav className="flex flex-col mt-4">
              <Link to="/" className="py-3 border-b border-header-orange/5 font-bold text-lg text-header-text">Trang chủ</Link>
              <button
                onClick={() => setIsCoursesMobileOpen(!isCoursesMobileOpen)}
                className="w-full flex items-center justify-between py-3 border-b border-header-orange/5 font-bold text-lg text-header-text"
              >
                Danh mục <ChevronDown className={isCoursesMobileOpen ? "rotate-180" : ""} />
              </button>
              {isCoursesMobileOpen && (
                <div className="grid grid-cols-1 gap-1 ml-4 py-2">
                  {courseCategories.slice(0, 8).map(c => (
                    <Link key={c.label} to={c.href} className="py-2 text-sm text-slate-600 font-bold">{c.label}</Link>
                  ))}
                </div>
              )}
              <Link to="/news" className="py-3 border-b border-header-orange/5 font-bold text-lg text-header-text">Tin tức</Link>
              <Link to="/promo" className="py-3 font-bold text-lg text-header-orange">Khuyến mãi Hot</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white pt-6">
        {/* Subscribe Section */}
        <div className="app-container border-b border-slate-100 pb-6 mb-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
            <div className="flex flex-col md:flex-row items-baseline gap-4 md:gap-10 lg:w-3/5">
              <h2 className="text-3xl font-black text-slate-900">Subscribe</h2>
              <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim
              </p>
            </div>

            <div className="flex-1 w-full relative">
              <Input
                placeholder="Write Email"
                className="h-14 pl-6 pr-16 bg-slate-50 border-none rounded-sm placeholder:text-slate-400"
              />
              <Button className="absolute right-0 top-0 bottom-0 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm transition-all shadow-none">
                <Send className="h-5 w-5 fill-current" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="app-container pb-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-16 lg:gap-y-12 gap-x-10 items-start">
            {/* Brand */}
            <div className="lg:col-span-3 h-full">
              <FooterBrand />
            </div>

            {/* Links Group */}
            <div className="lg:col-span-6 flex flex-col gap-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <FooterLinks title="About" links={['Planning', 'Research', 'Consulting', 'Analysis']} />
                <FooterLinks title="Menu" links={['About', 'Blog', 'Service', 'Contact']} />
                <FooterLinks title="Services" links={['Logo', 'Web Design', 'Branding', 'Marketing']} />

                {/* Contact Column */}
                <div className="flex flex-col gap-8">
                  <h3 className="font-bold text-xl text-slate-900 tracking-tight">Contact</h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-900">Call :</span>
                      <a href="tel:+012345678900" className="text-sm text-slate-600 hover:text-primary transition-colors font-medium">
                        +0123 456 789 00
                      </a>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-900">Email :</span>
                      <a href="mailto:user@example.com" className="text-sm text-slate-600 hover:text-primary transition-colors font-medium">
                        user@example.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thank You Bar */}
              <div className="w-full py-5 px-6 border-2 border-slate-900 rounded-lg flex items-center justify-center bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]">
                <span className="text-slate-900 font-bold text-sm lg:text-[15px] text-center leading-relaxed">
                  Thank! You For Your Creative Business Landing Page
                </span>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-3 h-full flex flex-col justify-start">
              <div className="overflow-hidden shadow-sm border border-slate-100 aspect-square group">
                <img
                  src="/footer_map_location.png"
                  alt="Location Map"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full bg-[#11141D] text-white">
          <div className="h-[3px] w-full bg-primary"></div>
          <div className="app-container py-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-4 items-center">
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-primary font-bold">|</span>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Our History</a>
              <span className="text-primary font-bold">|</span>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">What We Do</a>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              © 2025 Example Text. All images are for demo purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
