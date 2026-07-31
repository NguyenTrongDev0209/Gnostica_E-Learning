import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    AppDialog,
    AppDialogContent,
    AppDialogTitle,
    AppDialogDescription,
} from "@/components/common/micro/AppDialog";
import { AppButton } from "@/components/common/micro/AppButton";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import categoryService from '@/services/course/categoryService';
import accountService from '@/services/user/accountService';
import authService from '@/services/auth/authService';
import { 
    Check, 
    Loader2, 
    Code, 
    Palette, 
    Megaphone, 
    Briefcase, 
    DollarSign, 
    Languages, 
    Brain, 
    Cpu, 
    Sparkles, 
    BookOpen,
    Layers
} from 'lucide-react';
import { toast } from 'sonner';

const levels = [
    { id: 'NEWBIE', name: 'Người mới bắt đầu', desc: 'Chưa từng có kinh nghiệm trong lĩnh vực này' },
    { id: 'BEGINNER', name: 'Sơ cấp', desc: 'Đã nắm được kiến thức nền tảng cơ bản' },
    { id: 'INTERMEDIATE', name: 'Trung cấp', desc: 'Muốn rèn luyện kỹ năng thực chiến chuyên sâu' },
    { id: 'ADVANCED', name: 'Cao cấp', desc: 'Nghiên cứu kiến thức nâng cao & tối ưu hóa' },
];

const getCategoryIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('lập trình') || n.includes('phần mềm') || n.includes('code') || n.includes('it')) return Code;
    if (n.includes('thiết kế') || n.includes('ui') || n.includes('ux') || n.includes('đồ họa')) return Palette;
    if (n.includes('marketing') || n.includes('truyền thông') || n.includes('seo')) return Megaphone;
    if (n.includes('kinh doanh') || n.includes('quản trị') || n.includes('sales')) return Briefcase;
    if (n.includes('tài chính') || n.includes('đầu tư') || n.includes('kế toán')) return DollarSign;
    if (n.includes('ngoại ngữ') || n.includes('tiếng') || n.includes('chứng chỉ')) return Languages;
    if (n.includes('phát triển') || n.includes('bản thân') || n.includes('kỹ năng')) return Brain;
    if (n.includes('nhân tạo') || n.includes('ai') || n.includes('dữ liệu')) return Cpu;
    return Sparkles;
};

const PersonalizationModal = ({ forceOpen, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Tự động khôi phục các danh mục và trình độ từ metadata trong Database của tài khoản
        const user = authService.getCurrentUser();
        if (user) {
            const savedCats = user.selectedCategories || user.categoryIds;
            if (Array.isArray(savedCats) && savedCats.length > 0) {
                setSelectedCategories(savedCats);
            }
            if (user.level) {
                setSelectedLevel(user.level);
            }
        }

        if (forceOpen) {
            setIsOpen(true);
            fetchCategories();
            return;
        }

        // Chỉ tự động hiển thị popup cho tài khoản Học viên (Student) chưa hoàn thành cá nhân hóa
        const rawRole = typeof user?.role === 'object' ? user?.role?.name : user?.role;
        const normalizedRole = String(rawRole || '').replace(/^ROLE_/, '').toUpperCase();
        const STUDENT_ROLES = ['STUDENT', 'USER', 'MEMBER', 'LEARNER'];
        const isStudent = STUDENT_ROLES.includes(normalizedRole);

        const isCompleted = user?.onboardingCompleted === true || user?.onboardingCompleted === 'true' || 
            (Array.isArray(user?.selectedCategories) && user?.selectedCategories.length > 0) ||
            (Array.isArray(user?.categoryIds) && user?.categoryIds.length > 0);

        if (user && isStudent && !isCompleted && !isOpen) {
            // Bỏ qua nếu người dùng của tài khoản này đã bấm tắt trong phiên làm việc hiện tại
            if (user.email && sessionStorage.getItem(`personalization_skipped_${user.email}`)) {
                return;
            }

            setIsOpen(true);
            fetchCategories();
        }
    }, [forceOpen, location.pathname]);

    const handleClose = () => {
        setIsOpen(false);
        const user = authService.getCurrentUser();
        if (user?.email) {
            sessionStorage.setItem(`personalization_skipped_${user.email}`, 'true');
        }
        sessionStorage.setItem('personalization_skipped', 'true');
        if (onClose) onClose();
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryService.getAllCategories();
            let categoriesList = [];
            if (response?.data?.content && Array.isArray(response.data.content)) {
                categoriesList = response.data.content;
            } else if (response?.data && Array.isArray(response.data)) {
                categoriesList = response.data;
            } else if (Array.isArray(response)) {
                categoriesList = response;
            }

            setCategories(categoriesList.filter(c => c.status));
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleComplete = async () => {
        if (!selectedLevel) {
            toast.error("Vui lòng chọn trình độ của bạn");
            return;
        }
        const user = authService.getCurrentUser();
        setSaving(true);
        try {
            // Gửi dữ liệu cá nhân hóa lên lưu trực tiếp vào trường metadata của DB trong backend
            await accountService.updatePersonalization(user.email, {
                level: selectedLevel,
                categoryIds: selectedCategories
            });

            // Cập nhật lại thông tin user trong bộ nhớ phiên làm việc
            const updatedUser = { 
                ...user, 
                onboardingCompleted: true,
                selectedCategories,
                categoryIds: selectedCategories,
                level: selectedLevel
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success("Tuyệt vời! Lộ trình của bạn đã được cập nhật.");
            setIsOpen(false);
            window.location.reload();
        } catch (error) {
            toast.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppDialog open={isOpen} onOpenChange={handleClose}>
            <AppDialogContent className="sm:max-w-[480px] w-[92vw] p-0 overflow-hidden rounded-2xl border-none shadow-2xl flex flex-col max-h-[85vh] [&_[data-slot=dialog-close]]:!bg-white/20 [&_[data-slot=dialog-close]]:!text-white [&_[data-slot=dialog-close]]:hover:!bg-white/30 [&_[data-slot=dialog-close]]:!rounded-full [&_[data-slot=dialog-close]]:!right-4 [&_[data-slot=dialog-close]]:!top-4 [&_[data-slot=dialog-close]]:!border-none [&_[data-slot=dialog-close]]:!size-7">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-primary via-primary/95 to-indigo-600 p-5 text-white relative shrink-0">
                    <div className="relative z-10 flex items-start justify-between gap-3 pr-6">
                        <div>
                            <AppDialogTitle className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-white">
                                Cá nhân hóa trải nghiệm
                            </AppDialogTitle>
                            <AppDialogDescription className="text-white/80 text-xs sm:text-sm font-normal leading-relaxed">
                                {step === 1 
                                    ? "Chọn những lĩnh vực bạn hứng thú để nhận gợi ý bài giảng phù hợp."
                                    : "Xác định trình độ học tập của bạn để xây dựng lộ trình chuẩn xác."}
                            </AppDialogDescription>
                        </div>
                        <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20">
                            {step}/2
                        </span>
                    </div>
                </div>

                {/* Body Content with Explicit Wheel Scroll Handler */}
                <div 
                    onWheel={(e) => {
                        e.currentTarget.scrollTop += e.deltaY;
                    }}
                    className="p-4 sm:p-5 bg-card max-h-[320px] sm:max-h-[360px] overflow-y-auto scrollbar-hide space-y-4 touch-pan-y overscroll-contain"
                >
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-primary" />
                                    <span>Lĩnh vực quan tâm ({selectedCategories.length} đã chọn)</span>
                                </h3>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {categories.map((cat) => {
                                        const isSelected = selectedCategories.includes(cat.id);
                                        const IconComp = getCategoryIcon(cat.name);

                                        return (
                                            <div
                                                key={cat.id}
                                                onClick={() => toggleCategory(cat.id)}
                                                className={`
                                                    relative cursor-pointer transition-all duration-200 rounded-xl p-3 border flex flex-col items-center justify-center gap-2 text-center group hover:-translate-y-0.5
                                                    ${isSelected
                                                        ? 'border-primary bg-primary/5 shadow-xs font-semibold'
                                                        : 'border-border/80 hover:border-primary/40 hover:bg-muted/50 text-foreground'}
                                                `}
                                            >
                                                {isSelected && (
                                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                    </span>
                                                )}
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                                                    isSelected ? 'bg-primary text-white shadow-xs' : 'bg-primary/10 text-primary'
                                                }`}>
                                                    <IconComp className="w-4 h-4" />
                                                </div>
                                                <span className={`text-xs leading-snug line-clamp-2 ${
                                                    isSelected ? 'font-bold text-primary' : 'font-medium text-foreground'
                                                }`}>
                                                    {cat.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <span>Trình độ kiến thức hiện tại</span>
                            </h3>

                            <div className="space-y-2.5">
                                {levels.map((lvl) => {
                                    const isSelected = selectedLevel === lvl.id;
                                    return (
                                        <div
                                            key={lvl.id}
                                            onClick={() => setSelectedLevel(lvl.id)}
                                            className={`
                                                cursor-pointer transition-all duration-200 p-3.5 rounded-xl border flex items-center gap-3.5
                                                ${isSelected
                                                    ? 'border-primary bg-primary/5 shadow-xs'
                                                    : 'border-border/80 hover:border-primary/40 hover:bg-muted/50'}
                                            `}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                                isSelected ? 'border-primary bg-primary text-white' : 'border-border'
                                            }`}>
                                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                            </div>
                                            <div>
                                                <p className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                    {lvl.name}
                                                </p>
                                                <p className="text-[11px] sm:text-xs text-muted-foreground">
                                                    {lvl.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-border/80 flex items-center justify-between gap-3 shrink-0">
                    {step === 2 && (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 h-10 px-4 text-xs font-semibold rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
                        >
                            Quay lại
                        </button>
                    )}
                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            disabled={selectedCategories.length === 0}
                            className="w-full h-10 px-4 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Tiếp tục ({selectedCategories.length})
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={!selectedLevel || saving}
                            onClick={handleComplete}
                            className="flex-2 w-full h-10 px-4 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Đang hoàn tất...</span>
                                </>
                            ) : (
                                <span>Hoàn tất cá nhân hóa</span>
                            )}
                        </button>
                    )}
                </div>
            </AppDialogContent>
        </AppDialog>
    );
};

export default PersonalizationModal;
