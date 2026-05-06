import React from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    LayoutGrid,
    Flame
} from "lucide-react"
import {
    AppHamburgerButton,
    AppLogo,
    AppUserMenu
} from "@/components/common/AppButton"
import AppSearchInput from "@/components/common/AppSearchInput"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"

const MainHeader = ({
    currentUser,
    handleLogout,
    isMenuOpen,
    setIsMenuOpen,
    isCoursesMobileOpen,
    setIsCoursesMobileOpen,
    flatCategories,
    categoryTree
}) => {
    // Hàm đệ quy để render menu danh mục đa cấp (Giới hạn tối đa 2 cấp)
    const renderCategoryItems = (items, depth = 1) => {
        return items.map((category) => {
            const hasSub = category.subcategories && category.subcategories.length > 0 && depth < 2;

            if (hasSub) {
                return (
                    <DropdownMenuSub key={category.id}>
                        <DropdownMenuSubTrigger className="px-4 py-2.5 hover:bg-header-bg hover:text-header-orange cursor-pointer font-bold text-sm">
                            <Link to={`/courses/category/${category.slug}`} className="flex-1">{category.name}</Link>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent
                                sideOffset={10}
                                alignOffset={-5}
                                className="bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.15)] min-w-[220px] p-1.5 animate-in slide-in-from-left-2 duration-200"
                            >
                                {renderCategoryItems(category.subcategories, depth + 1)}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                );
            }

            return (
                <DropdownMenuItem key={category.id} asChild className="px-4 py-2.5 hover:bg-header-bg hover:text-header-orange cursor-pointer font-bold text-sm">
                    <Link to={`/courses/category/${category.slug}`}>{category.name}</Link>
                </DropdownMenuItem>
            );
        });
    };

    return (
        <>
            {/* Main Sticky Header */}
            <header className="w-full sticky top-0 z-[100] shadow-md bg-primary-gradient text-white border-b border-white/10">
                <div className="app-container flex items-center justify-between py-[14px] gap-8">
                    {/* Logo */}
                    <div className="flex-1 flex items-center gap-4">
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
                    <div className="flex-[2] max-w-xl hidden lg:flex justify-center">
                        <AppSearchInput className="w-full" />
                    </div>

                    {/* User Actions */}
                    <div className="flex-1 flex items-center justify-end gap-1 md:gap-4">
                        {currentUser ? (
                            <AppUserMenu
                                user={{
                                    name: currentUser.fullName || currentUser.username || "Người dùng",
                                    avatar: currentUser.avatar || "https://github.com/shadcn.png"
                                }}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-5 h-[42px] transition-all duration-300 text-white font-bold text-base"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Content (Inside sticky header to stay visible) */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t border-header-orange/10 bg-header-bg px-4 pb-8 animate-in slide-in-from-top-4 duration-300">
                        <AppSearchInput className="mt-3 mb-2" />
                        <nav className="flex flex-col mt-4 text-header-text">
                            <Link to="/" className="py-3 border-b border-header-orange/5 font-bold text-lg">Trang chủ</Link>
                            <button
                                onClick={() => setIsCoursesMobileOpen(!isCoursesMobileOpen)}
                                className="w-full flex items-center justify-between py-3 border-b border-header-orange/5 font-bold text-lg"
                            >
                                Danh mục <ChevronDown className={isCoursesMobileOpen ? "rotate-180" : ""} />
                            </button>
                            {isCoursesMobileOpen && (
                                <div className="grid grid-cols-1 gap-1 ml-4 py-2">
                                    {flatCategories.filter(c => !c.parentId && !c.parent_id).slice(0, 10).map(c => (
                                        <Link key={c.id} to={`/courses/category/${c.slug}`} className="py-2 text-sm text-slate-600 font-bold">{c.name}</Link>
                                    ))}
                                </div>
                            )}
                            <Link to="/news" className="py-3 border-b border-header-orange/5 font-bold text-lg">Tin tức</Link>
                            <Link to="/promo" className="py-3 font-bold text-lg text-header-orange">Khuyến mãi Hot</Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* Secondary Header (Non-sticky Navigation) */}
            <div className="w-full bg-white shadow-sm relative z-40">
                <div className="app-container flex items-center justify-between py-0 h-14">
                    {/* Left: Category Button */}
                    <div className="flex-1 flex justify-start pl-8">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="btn-category-glow flex items-center gap-3 px-6 h-11 focus:outline-none">
                                    <LayoutGrid className="w-5 h-5 pointer-events-none" />
                                    <span className="pointer-events-none">Khóa học</span>
                                    <ChevronDown className="w-4 h-4 ml-1 pointer-events-none" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[280px] bg-white border-none shadow-2xl rounded-lg p-2 animate-in fade-in slide-in-from-top-2 z-[101]">
                                {renderCategoryItems(categoryTree)}
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

                        <Link to="/about" className="h-full flex items-center relative group px-4">
                            <span className="font-bold text-slate-700 group-hover:text-[#f15e2c] transition-colors">
                                Giới thiệu
                            </span>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#f15e2c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                        </Link>

                        <Link to="/instructors" className="h-full flex items-center relative group px-4">
                            <span className="font-bold text-slate-700 group-hover:text-[#f15e2c] transition-colors">
                                Giảng viên
                            </span>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#f15e2c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                        </Link>

                        <Link to="/forum" className="h-full flex items-center relative group px-4">
                            <span className="font-bold text-slate-700 group-hover:text-[#f15e2c] transition-colors">
                                Diễn đàn
                            </span>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#f15e2c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                        </Link>

                        <Link to="/promo" className="h-full flex items-center relative group px-4">
                            <span className="font-bold text-[#f15e2c] flex items-center gap-2">
                                <Flame className="w-4 h-4 fill-current" />
                                Khuyến mãi
                            </span>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#f15e2c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                        </Link>
                    </nav>

                    {/* Right: Placeholder */}
                    <div className="flex-1 hidden md:block"></div>
                </div>
            </div>
        </>
    );
};

export default MainHeader;
