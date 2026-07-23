import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Star, Award, ArrowRight, ChevronRight, ChevronLeft, GraduationCap, Search, X, SlidersHorizontal, RotateCcw, Sparkles, Filter } from 'lucide-react';
import Skeleton from '@/components/common/micro/AppSkeleton';
import { useInstructorList } from '@/hooks/instructor/useInstructorList';
import useCategories from '@/hooks/course/useCategories';
import PageContainer from '@/components/common/core/PageContainer';
import AppSelect from '@/components/common/micro/AppSelect';

const fallbackAvatars = [
    "https://i.pravatar.cc/150?u=1",
    "https://i.pravatar.cc/150?u=2",
    "https://i.pravatar.cc/150?u=3",
    "https://i.pravatar.cc/150?u=4",
    "https://i.pravatar.cc/150?u=5"
];

const sortOptions = [
    { label: "Mặc định", value: "default" },
    { label: "Khóa học nhiều nhất", value: "most-courses" },
    { label: "Học viên đông nhất", value: "most-students" },
    { label: "Đánh giá cao nhất", value: "rating" },
    { label: "Tên (A - Z)", value: "name" },
];

const InstructorList = () => {
    const { instructors, loading } = useInstructorList();
    const { categories } = useCategories();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const categoryScrollRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const scrollCategories = (direction) => {
        if (categoryScrollRef.current) {
            const scrollAmount = direction === 'left' ? -260 : 260;
            categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Real-time filtering and sorting logic
    const filteredInstructors = useMemo(() => {
        let result = [...instructors];

        // Filter by Category
        if (selectedCategory) {
            const catQuery = selectedCategory.toLowerCase();
            result = result.filter(inst => {
                if (Array.isArray(inst.categories)) {
                    if (inst.categories.some(c => (c.name || c || '').toLowerCase().includes(catQuery))) return true;
                }
                if (Array.isArray(inst.courses)) {
                    if (inst.courses.some(c => (c.categoryName || c.category?.name || '').toLowerCase().includes(catQuery))) return true;
                }
                const text = `${inst.fullName || ''} ${inst.email || ''} ${inst.bio || ''} ${inst.specialty || ''} ${inst.role || ''}`.toLowerCase();
                return text.includes(catQuery);
            });
        }

        // Filter by Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(inst =>
                (inst.fullName || '').toLowerCase().includes(query) ||
                (inst.email || '').toLowerCase().includes(query) ||
                (inst.role || '').toLowerCase().includes(query)
            );
        }

        // Sorting
        if (sortBy === 'most-courses') {
            result.sort((a, b) => (b.coursesCount || 0) - (a.coursesCount || 0));
        } else if (sortBy === 'most-students') {
            result.sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0));
        } else if (sortBy === 'rating') {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'name') {
            result.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
        }

        return result;
    }, [instructors, searchQuery, sortBy, selectedCategory]);

    const resetFilters = () => {
        setSearchQuery("");
        setSortBy("default");
        setSelectedCategory(null);
    };

    return (
        <PageContainer className="bg-muted animate-in fade-in duration-500">
            {/* Modern Rich Split Hero Banner */}
            <section className="w-full bg-background pt-6 pb-8">
                <div className="app-container">
                    <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-slate-50 to-indigo-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-8 sm:p-12 lg:p-14 border border-border/80 shadow-md overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
                        
                        {/* Background Geometric Glow Accent */}
                        <div className="absolute -right-16 -top-16 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Left Content */}
                        <div className="flex-1 space-y-5 text-center lg:text-left z-10 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                                <GraduationCap className="w-4 h-4" />
                                <span>Gnostica Masters & Experts</span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                                Học hỏi từ những <span className="text-primary">Chuyên gia Hàng đầu</span>
                            </h1>

                            <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
                                Đội ngũ giảng viên được kiểm duyệt kỹ lưỡng, mang đến kiến thức thực chiến và lộ trình bài bản giúp bạn chinh phục mọi mục tiêu.
                            </p>

                            {/* Overlapping Instructor Avatars & Social Proof */}
                            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <div className="flex -space-x-3 overflow-hidden p-1">
                                    {(instructors.length > 0 ? instructors : fallbackAvatars).slice(0, 4).map((inst, i) => (
                                        <img
                                            key={inst.id || i}
                                            src={inst.avatar || fallbackAvatars[i % fallbackAvatars.length]}
                                            alt={inst.fullName || 'Giảng viên'}
                                            className="inline-block h-9 w-9 rounded-full ring-2 ring-background object-cover shadow-sm"
                                        />
                                    ))}
                                </div>
                                <div className="text-xs sm:text-sm font-medium text-foreground">
                                    <span className="text-primary font-bold">{instructors.length || '20'}+ Chuyên gia</span> đã sẵn sàng đồng hành
                                </div>
                            </div>
                        </div>

                        {/* Right Stat Cards Collage */}
                        <div className="w-full lg:w-auto flex justify-center z-10">
                            <div className="grid grid-cols-2 gap-4 w-full max-w-xs sm:max-w-sm">
                                <div className="bg-background/90 backdrop-blur-sm p-4 rounded-xl border border-border shadow-sm flex flex-col items-center text-center hover-lift">
                                    <Award className="w-7 h-7 text-primary mb-1.5" />
                                    <span className="text-xl font-extrabold text-foreground">100%</span>
                                    <span className="text-xs font-medium text-muted-foreground">Kiểm duyệt chất lượng</span>
                                </div>
                                <div className="bg-background/90 backdrop-blur-sm p-4 rounded-xl border border-border shadow-sm flex flex-col items-center text-center hover-lift">
                                    <Star className="w-7 h-7 text-amber-500 fill-amber-500 mb-1.5" />
                                    <span className="text-xl font-extrabold text-foreground">4.9/5</span>
                                    <span className="text-xs font-medium text-muted-foreground">Đánh giá trung bình</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Breadcrumb & Smart Search Filter Bar */}
            <div className="bg-white border-b border-border sticky top-[72px] z-40">
                <div className="app-container py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Breadcrumbs & Counter */}
                    <div className="flex items-center justify-between md:justify-start gap-4">
                        <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                            <Link to="/" className="hover:text-primary transition-colors font-medium">Trang chủ</Link>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground font-semibold">Danh sách giảng viên</span>
                        </div>
                        <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                            {loading ? 'Đang tải...' : `${filteredInstructors.length} chuyên gia`}
                        </span>
                    </div>

                    {/* Controls: Smart Search & Sorting */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input Box */}
                        <div className="relative flex-1 sm:w-64 min-w-[200px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm theo tên, email..."
                                className="w-full h-10 pl-9 pr-8 bg-muted/50 border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:bg-white transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="w-[180px]">
                            <AppSelect
                                options={sortOptions}
                                value={sortBy}
                                onValueChange={setSortBy}
                                placeholder="Sắp xếp..."
                                className="!h-10 text-xs rounded-xl"
                            />
                        </div>

                        {/* Reset Filter Button */}
                        {(searchQuery || sortBy !== 'default' || selectedCategory) && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-1.5 px-3 h-10 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Đặt lại bộ lọc"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Đặt lại</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Horizontal Category Marquee Strip with Navigation Buttons */}
            <div className="bg-white border-b border-border/80 py-3 shadow-xs">
                <div className="app-container flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground shrink-0 pr-3 border-r border-border">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Danh mục:</span>
                    </div>

                    {/* Scroll Left Button */}
                    <button
                        onClick={() => scrollCategories('left')}
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 text-muted-foreground shadow-xs transition-colors shrink-0"
                        title="Cuộn sang trái"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Scrollable Category Container */}
                    <div 
                        ref={categoryScrollRef} 
                        className="flex-1 overflow-x-auto scrollbar-hide flex items-center gap-2 py-0.5 scroll-smooth"
                    >
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                                selectedCategory === null
                                    ? "bg-primary text-white shadow-xs font-semibold scale-105"
                                    : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                            }`}
                        >
                            Tất cả chuyên môn
                        </button>

                        {categories.map((cat) => {
                            const catName = cat.name || cat.title || '';
                            const isSelected = selectedCategory === catName;
                            return (
                                <button
                                    key={cat.id || cat.slug || catName}
                                    onClick={() => setSelectedCategory(isSelected ? null : catName)}
                                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                                        isSelected
                                            ? "bg-primary text-white shadow-xs font-semibold scale-105"
                                            : "bg-white hover:bg-primary/5 text-foreground border border-border hover:border-primary/40"
                                    }`}
                                >
                                    <span>{catName}</span>
                                    {cat.coursesCount > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                            isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                        }`}>
                                            {cat.coursesCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Scroll Right Button */}
                    <button
                        onClick={() => scrollCategories('right')}
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 text-muted-foreground shadow-xs transition-colors shrink-0"
                        title="Cuộn sang phải"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <section className="flex-1 py-12 lg:py-16">
                <div className="app-container">
                    
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
                                    <div className="flex justify-center mb-2">
                                        <Skeleton className="w-24 h-24 rounded-full" />
                                    </div>
                                    <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-10 w-full rounded-lg mt-4" />
                                </div>
                            ))}
                        </div>
                    ) : filteredInstructors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredInstructors.map((instructor, idx) => {
                                const avatar = instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.fullName)}&background=random&color=fff`;
                                
                                return (
                                    <div 
                                        key={instructor.id}
                                        className="group relative bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-1"
                                    >
                                        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
                                        
                                        <div className="flex justify-center pt-8 pb-4 relative">
                                            <div className="relative">
                                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md relative z-10 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center bg-muted">
                                                    <img 
                                                        src={avatar} 
                                                        alt={instructor.fullName} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.fullName)}&background=random&color=fff` }}
                                                    />
                                                </div>
                                                <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white z-20 shadow-sm">
                                                    <Award className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-5 pb-5 text-center flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-foreground tracking-tight mb-1 group-hover:text-primary transition-colors">
                                                {instructor.fullName || 'Giảng viên chuyên gia'}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-normal mb-5 line-clamp-1">
                                                {instructor.email}
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-border/70 flex items-center justify-center gap-5 mb-5 text-xs text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <BookOpen className="w-4 h-4 text-primary" />
                                                    <span>{instructor.coursesCount} khóa</span>
                                                </div>
                                                <div className="w-[1px] h-4 bg-border"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-4 h-4 text-primary" />
                                                    <span>{instructor.studentsCount}+ học viên</span>
                                                </div>
                                            </div>

                                            <Link 
                                                to={`/profile/${instructor.id}`}
                                                className="w-full flex items-center justify-center gap-2 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-white text-sm font-semibold rounded-xl transition-all duration-300"
                                            >
                                                <span>Xem hồ sơ</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-border p-8 shadow-sm">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                                <Users className="w-9 h-9 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">
                                {searchQuery ? "Không tìm thấy giảng viên phù hợp" : "Chưa có giảng viên nào"}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                                {searchQuery 
                                    ? `Không tìm thấy chuyên gia nào khớp với từ khóa "${searchQuery}". Hãy thử tìm với từ khóa khác hoặc đặt lại bộ lọc.`
                                    : "Hệ thống hiện tại chưa có tài khoản nào được phân quyền Giảng viên. Quay lại sau nhé."
                                }
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>Đặt lại bộ lọc</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </PageContainer>
    );
};

export default InstructorList;
