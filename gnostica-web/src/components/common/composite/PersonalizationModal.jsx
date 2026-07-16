import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    AppDialog,
    AppDialogContent,
    AppDialogHeader,
    AppDialogTitle,
    AppDialogDescription,
    AppDialogFooter,
} from "@/components/common/micro/AppDialog";
import { AppButton } from "@/components/common/micro/AppButton";
import AppBadge from "@/components/common/micro/AppBadge";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import categoryService from '@/services/course/categoryService';
import accountService from '@/services/user/accountService';
import authService from '@/services/auth/authService';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const levels = [
    { id: 'NEWBIE', name: 'Người mới', desc: 'Chưa biết gì về lĩnh vực này' },
    { id: 'BEGINNER', name: 'Sơ cấp', desc: 'Đã có kiến thức cơ bản' },
    { id: 'INTERMEDIATE', name: 'Trung cấp', desc: 'Muốn nâng cao kỹ năng chuyên sâu' },
    { id: 'ADVANCED', name: 'Cao cấp', desc: 'Nghiên cứu và tối ưu hóa' },
];

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
        if (forceOpen) {
            setIsOpen(true);
            fetchCategories();
            return;
        }

        // Chỉ hiện popup ở trang chủ hoặc khi mới login xong đối với USER bình thường
        const user = authService.getCurrentUser();
        if (user && user.onboardingCompleted === false && !isOpen) {
            // Không hiển thị cho Admin và Giảng viên
            if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR' || user.role === 'TEACHER') {
                return;
            }

            setIsOpen(true);
            fetchCategories();
        }
    }, [forceOpen, location.pathname]);

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryService.getAllCategories();
            // Xử lý linh hoạt theo cấu trúc trả về của API (có phân trang hoặc không)
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
            await accountService.updatePersonalization(user.email, {
                level: selectedLevel,
                categoryIds: selectedCategories
            });

            // Cập nhật lại user trong localStorage
            const updatedUser = { ...user, onboardingCompleted: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success("Tuyệt vời! Lộ trình của bạn đã sẵn sàng.");
            setIsOpen(false);
            window.location.reload(); // Refresh to update recommendations
        } catch (error) {
            toast.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppDialog open={isOpen} onOpenChange={handleClose}>
            <AppDialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground relative shrink-0">
                    <div className="relative z-10">
                        <AppDialogTitle className="text-3xl font-bold mb-2">Chào mừng bạn đến với Gnostica!</AppDialogTitle>
                        <AppDialogDescription className="text-primary-foreground/80 text-lg">
                            Hãy cho chúng tôi biết sở thích của bạn để cá nhân hóa trải nghiệm học tập.
                        </AppDialogDescription>
                    </div>
                    {/* Background circles for aesthetic */}
                    <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-[-10px] left-[10%] w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
                </div>

                <div className="p-6 sm:p-8 bg-card overflow-y-auto flex-1">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-foreground">1. Bạn quan tâm đến lĩnh vực nào?</h3>
                                <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">Bước 1/2</span>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`
                        cursor-pointer transition-all duration-300 rounded-xl p-4 border-2 flex flex-col items-center justify-center gap-2 text-center
                        ${selectedCategories.includes(cat.id)
                                                    ? 'border-primary bg-primary/5 shadow-md transform scale-[1.02]'
                                                    : 'border-border hover:border-primary/30 hover:bg-muted'}
                      `}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedCategories.includes(cat.id) ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                                                {selectedCategories.includes(cat.id) ? <Check className="w-5 h-5" /> : null}
                                            </div>
                                            <span className={`font-medium ${selectedCategories.includes(cat.id) ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {cat.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-foreground">2. Trình độ hiện tại của bạn?</h3>
                                <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">Bước 2/2</span>
                            </div>

                            <div className="space-y-3">
                                {levels.map((lvl) => (
                                    <AppCard
                                        key={lvl.id}
                                        onClick={() => setSelectedLevel(lvl.id)}
                                        className={`
                      cursor-pointer transition-all duration-300 border-2 shadow-none
                      ${selectedLevel === lvl.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/30 hover:bg-muted'}
                    `}
                                    >
                                        <AppCardContent className="p-4 flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedLevel === lvl.id ? 'border-primary bg-primary' : 'border-border/80'}`}>
                                                {selectedLevel === lvl.id && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${selectedLevel === lvl.id ? 'text-primary' : 'text-foreground'}`}>{lvl.name}</p>
                                                <p className="text-sm text-muted-foreground">{lvl.desc}</p>
                                            </div>
                                        </AppCardContent>
                                    </AppCard>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-10 flex justify-between gap-4">
                        {step === 2 && (
                            <AppButton
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="flex-1 py-6 text-lg border-2"
                            >
                                Quay lại
                            </AppButton>
                        )}
                        {step === 1 ? (
                            <AppButton
                                className="flex-2 py-6 text-lg w-full"
                                onClick={() => setStep(2)}
                                disabled={selectedCategories.length === 0}
                            >
                                Tiếp tục
                            </AppButton>
                        ) : (
                            <AppButton
                                className="flex-2 py-6 text-lg w-full"
                                disabled={!selectedLevel || saving}
                                onClick={handleComplete}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : "Hoàn tất"}
                            </AppButton>
                        )}
                    </div>
                </div>
            </AppDialogContent>
        </AppDialog>
    );
};

export default PersonalizationModal;
