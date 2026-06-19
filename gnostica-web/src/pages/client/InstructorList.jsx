import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Star, Award, ArrowRight, ChevronRight, GraduationCap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstructorList } from '@/hooks/client/useInstructorList';

const fallbackAvatars = [
    "https://i.pravatar.cc/150?u=1",
    "https://i.pravatar.cc/150?u=2",
    "https://i.pravatar.cc/150?u=3",
    "https://i.pravatar.cc/150?u=4",
    "https://i.pravatar.cc/150?u=5"
];

const InstructorList = () => {
    const { instructors, loading } = useInstructorList();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-muted flex flex-col animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="relative w-full bg-muted pt-20 pb-24 lg:pt-28 lg:pb-32 overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-primary/20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-slate-900 to-slate-900 z-0"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-50"></div>
                
                <div className="app-container relative z-10">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                            <GraduationCap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-white/90">Gnostica Masters</span>
                        </div>
                    </div>
                    <div className="text-center max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
                            Đội ngũ Giảng viên <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Hàng đầu</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                            Học hỏi từ những chuyên gia có nhiều năm kinh nghiệm, luôn sẵn sàng truyền đạt kiến thức thực tế giúp bạn nhanh chóng đạt mục tiêu.
                        </p>
                    </div>
                </div>
            </section>

            {/* Breadcrumb & Filter Bar Placeholder */}
            <div className="bg-white border-b border-border sticky top-[72px] z-40 hidden md:block">
                <div className="app-container py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-foreground font-bold">Danh sách giảng viên</span>
                    </div>
                    <div className="text-sm font-bold text-foreground">
                        {loading ? 'Đang tải...' : `Hiển thị ${instructors.length} chuyên gia`}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="flex-1 py-16 lg:py-24">
                <div className="app-container">
                    
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
                                    <div className="flex justify-center mb-6">
                                        <Skeleton className="w-32 h-32 rounded-full" />
                                    </div>
                                    <Skeleton className="h-6 w-3/4 mx-auto mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-5/6 mx-auto mb-6" />
                                    <Skeleton className="h-10 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : instructors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {instructors.map((instructor, idx) => {
                                const avatar = instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.fullName)}&background=random&color=fff`;
                                
                                return (
                                    <div 
                                        key={instructor.id}
                                        className="group relative bg-white border border-border rounded-[28px] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
                                        style={{ animationFillMode: 'both', animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-slate-100 to-slate-200/50 -z-10 group-hover:from-primary/10 group-hover:to-orange-50 transition-colors duration-500"></div>
                                        
                                        <div className="flex justify-center pt-10 pb-6 relative">
                                            <div className="relative">
                                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center bg-muted">
                                                    <img 
                                                        src={avatar} 
                                                        alt={instructor.fullName} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.fullName)}&background=random&color=fff` }}
                                                    />
                                                </div>
                                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-info/10 text-info text-white rounded-full flex items-center justify-center border-2 border-white z-20 shadow-md">
                                                    <Award className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6 text-center flex-1 flex flex-col">
                                            <h3 className="text-[22px] font-black text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">
                                                {instructor.fullName || 'Giảng viên chuyên gia'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground font-medium mb-6 line-clamp-2">
                                                {instructor.email}
                                            </p>

                                            <div className="mt-auto pt-6 border-t border-border flex items-center justify-center gap-6 mb-6">
                                                <div className="flex flex-col items-center gap-1 group/stat">
                                                    <BookOpen className="w-5 h-5 text-muted-foreground group-hover/stat:text-primary transition-colors" />
                                                    <span className="text-[11px] font-bold text-muted-foreground">{instructor.coursesCount}</span>
                                                </div>
                                                <div className="w-[1px] h-8 bg-muted"></div>
                                                <div className="flex flex-col items-center gap-1 group/stat">
                                                    <Users className="w-5 h-5 text-muted-foreground group-hover/stat:text-primary transition-colors" />
                                                    <span className="text-[11px] font-bold text-muted-foreground">{instructor.studentsCount}+</span>
                                                </div>
                                                <div className="w-[1px] h-8 bg-muted"></div>
                                                <div className="flex flex-col items-center gap-1 group/stat">
                                                    <Star className="w-5 h-5 text-muted-foreground group-hover/stat:text-primary transition-colors" />
                                                    <span className="text-[11px] font-bold text-muted-foreground">{instructor.rating}</span>
                                                </div>
                                            </div>

                                            <Link 
                                                to={`/profile/${instructor.id}`}
                                                className="w-full flex items-center justify-center gap-2 h-12 bg-muted hover:bg-primary text-foreground hover:text-white font-bold rounded-full transition-all duration-300"
                                            >
                                                Xem hồ sơ <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
                                <Users className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">Chưa có giảng viên nào</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Hệ thống hiện tại chưa có tài khoản nào được phân quyền Giảng viên. Quay lại sau nhé.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default InstructorList;
