import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import instructorService from '@/services/instructor/instructorService';
import { toast } from 'sonner';
import { Button } from "@/components/common/micro/AppButton";
import Input from "@/components/common/micro/AppInput";
import Textarea from "@/components/common/micro/AppTextarea";
import Label from "@/components/common/micro/AppLabel";
import { AppCheckbox as Checkbox } from "@/components/common/micro/AppCheckbox";
import PageContainer from '@/components/common/core/PageContainer';
import { Card, CardContent } from "@/components/common/micro/AppCard";
import {
    Loader2,
    UploadCloud,
    X,
    FileText,
    Image as ImageIcon,
    CheckCircle2,
    User,
    Smartphone,
    CreditCard,
    GraduationCap,
    BookOpen,
    ShieldCheck,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
    { id: 1, title: 'Thông tin cá nhân', icon: User },
    { id: 2, title: 'Hồ sơ pháp lý', icon: CreditCard },
    { id: 3, title: 'Bằng cấp & CV', icon: GraduationCap },
    { id: 4, title: 'Kế hoạch & Điều khoản', icon: BookOpen }
];

function InstructorApplicationStepper({ currentStep, embedded, onStepSelect }) {
    const radius = embedded ? 14 : 17;
    const size = embedded ? 42 : 48;
    const strokeWidth = embedded ? 4.5 : 5;
    const circumference = 2 * Math.PI * radius;
    const lineProgress = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className={embedded ? "mb-6 px-4 pb-3" : "mb-12 px-8 pb-4"}>
            <div className={`relative mx-auto grid w-full grid-cols-4 ${embedded ? "h-20 max-w-2xl" : "h-24 max-w-4xl"}`}>
                <div className={`absolute left-[12.5%] right-[12.5%] rounded-full bg-secondary ${embedded ? "top-[20px] h-[3px]" : "top-[25px] h-[3px]"}`}>
                    <div
                        className="h-full rounded-full bg-success transition-all duration-700 ease-out"
                        style={{ width: `${lineProgress}%` }}
                    />
                </div>
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const isAvailable = step.id <= currentStep;
                    const progress = isCompleted ? 100 : isActive ? 35 : 0;
                    const offset = circumference - (progress / 100) * circumference;

                    return (
                        <button
                            key={step.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => onStepSelect(step.id)}
                            className={`relative z-10 flex min-w-0 flex-col items-center text-center group ${isAvailable ? "cursor-pointer" : "cursor-not-allowed"}`}
                        >
                            <span className="relative flex items-center justify-center rounded-full bg-card" style={{ width: size, height: size }}>
                                <svg
                                    className="absolute inset-0 -rotate-90 transform transition-transform duration-300 group-hover:scale-105"
                                    width={size}
                                    height={size}
                                    viewBox={`0 0 ${size} ${size}`}
                                >
                                    <circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                        className="text-secondary"
                                    />
                                    <circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        className="text-success transition-all duration-500 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <span
                                    className={`
                                        z-10 flex items-center justify-center rounded-full font-bold transition-all duration-300
                                        ${embedded ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm"}
                                        ${isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                            : isCompleted
                                                ? "bg-success text-success-foreground"
                                                : "bg-card text-muted-foreground shadow-sm"}
                                    `}
                                >
                                    {isCompleted ? <ShieldCheck className={embedded ? "h-4 w-4" : "h-5 w-5"} /> : <Icon className={embedded ? "h-4 w-4" : "h-5 w-5"} />}
                                </span>
                            </span>

                            <span
                                className={`
                                    mt-2 block w-full px-1 text-center font-medium leading-snug text-muted-foreground transition-colors duration-300
                                    ${embedded ? "max-w-[132px] text-sm" : "max-w-[160px] text-sm"}
                                `}
                                title={step.title}
                            >
                                {step.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

const ApplyInstructor = ({ embedded = false, onSubmitted } = {}) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm({
        defaultValues: {
            idCardFront: '',
            idCardBack: '',
            cvUrl: '',
            degreeUrls: '',
            certificateUrls: '',
            contactPhone: '',
            courseOutline: ''
        }
    });

    const [files, setFiles] = useState({
        idCardFront: null,
        idCardBack: null,
        cvUrl: null,
        degreeUrls: [],
        certificateUrls: []
    });
    const [agreedTerms, setAgreedTerms] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Đăng ký các field ẩn vào react-hook-form để đảm bảo data trong onSubmit đầy đủ
    useEffect(() => {
        register('idCardFront', { required: "Vui lòng tải lên ảnh CCCD mặt trước" });
        register('idCardBack', { required: "Vui lòng tải lên ảnh CCCD mặt sau" });
        register('cvUrl', { required: "Vui lòng tải lên CV của bạn" });
        register('degreeUrls', { required: "Vui lòng tải lên ít nhất một bằng cấp" });
        register('certificateUrls'); // Optional chứng chỉ
    }, [register]);

    const handleFileChange = async (e, field) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        if (field === 'degreeUrls' || field === 'certificateUrls') {
            toast.info(`Đang xử lý ${selectedFiles.length} tệp...`);

            const uploadPromises = selectedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                let endpoint = '/upload/image';
                if (file.type === 'application/pdf') {
                    endpoint = '/upload/document';
                }

                try {
                    const res = await instructorService.uploadDocument(endpoint, formData);
                    return { name: file.name, url: res.url, type: file.type };
                } catch (err) {
                    toast.error(`Lỗi tải tệp: ${file.name}`);
                    return null;
                }
            });

            const results = (await Promise.all(uploadPromises)).filter(r => r !== null);

            if (results.length > 0) {
                const currentUrls = watch(field) ? watch(field).split(',').filter(u => u) : [];
                const newUrls = results.map(r => r.url);
                const updatedUrls = [...currentUrls, ...newUrls];

                setValue(field, updatedUrls.join(','), { shouldValidate: true });
                setFiles(prev => ({
                    ...prev,
                    [field]: [...prev[field], ...results]
                }));
                toast.success(`Đã tải thành công ${results.length} tệp`);
            }
            e.target.value = null;
            return;
        }

        const file = selectedFiles[0];
        if (field === 'cvUrl' && file.type !== 'application/pdf') {
            toast.error("CV/Resume phải là định dạng PDF");
            e.target.value = null;
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        let endpoint = '/upload/image';
        if (field === 'cvUrl') {
            endpoint = '/upload/document';
        }

        try {
            toast.info(`Đang tải ${file.name}...`);
            const res = await instructorService.uploadDocument(endpoint, formData);
            setValue(field, res.url, { shouldValidate: true });
            setFiles(prev => ({ ...prev, [field]: file }));
            toast.success("Tải tệp thành công");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Lỗi khi tải tệp");
        }
    };

    const removeFile = (index, field) => {
        const currentFiles = [...files[field]];
        currentFiles.splice(index, 1);

        const updatedUrls = currentFiles.map(f => f.url).join(',');
        setValue(field, updatedUrls, { shouldValidate: true });
        setFiles(prev => ({ ...prev, [field]: currentFiles }));
    };

    
    const createApplicationMutation = useMutation({
        mutationFn: (data) => instructorService.createApplication(data),
        onSuccess: () => {
            toast.success("Nộp đơn thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.");
            if (onSubmitted) {
                onSubmitted();
            } else {
                navigate('/');
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Lỗi hệ thống khi gửi đơn");
        }
    });

    const onSubmit = async (data) => {
        if (!agreedTerms) {
            toast.error("Bạn chưa đồng ý với điều khoản dịch vụ");
            return;
        }

        createApplicationMutation.mutate({
            email: currentUser.email,
            idCardFront: data.idCardFront,
            idCardBack: data.idCardBack,
            contactPhone: data.contactPhone,
            cvUrl: data.cvUrl,
            degreeUrls: data.degreeUrls,
            courseOutline: data.courseOutline || ''
        });
    };
    

    const validateStep = async () => {
        let fieldsToValidate = [];
        if (currentStep === 1) fieldsToValidate = ['contactPhone'];
        if (currentStep === 2) fieldsToValidate = ['idCardFront', 'idCardBack'];
        if (currentStep === 3) fieldsToValidate = ['cvUrl', 'degreeUrls'];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep(prev => prev + 1);
        } else {
            toast.warning("Vui lòng hoàn thành các thông tin bắt buộc");
        }
    };

    if (!currentUser) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium text-lg">Vui lòng đăng nhập để tiếp tục</p>
            <Button onClick={() => navigate('/login')}>Đăng nhập ngay</Button>
        </div>
    );

    const Container = embedded ? "div" : PageContainer;

    return (
        <Container className={embedded ? "overflow-x-hidden px-0 pb-1" : "py-12 px-4 sm:px-6"}>
            <div className={embedded ? "mx-auto max-w-full overflow-x-hidden" : "max-w-4xl mx-auto"}>
                {/* Header */}
                <div className={embedded ? "text-center mb-4 px-8" : "text-center mb-10"}>
                    <h1 className={embedded ? "text-xl font-bold text-foreground tracking-tight mb-1.5" : "text-4xl font-extrabold text-foreground tracking-tight mb-3"}>
                        Trở thành Giảng viên Gnostica
                    </h1>
                    <p className={embedded ? "text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed" : "text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"}>
                        Chia sẻ kiến thức của bạn với cộng đồng hơn 50.000 học viên năng động.
                        Quy trình xét duyệt nhanh chóng trong vòng 48 giờ.
                    </p>
                </div>

                {/* Progress Stepper */}
                <InstructorApplicationStepper
                    currentStep={currentStep}
                    embedded={embedded}
                    onStepSelect={(stepId) => {
                        if (stepId <= currentStep) setCurrentStep(stepId);
                    }}
                />

                <Card className={embedded ? "border border-border/60 shadow-none overflow-hidden bg-card" : "border-none shadow-xl overflow-hidden bg-card/80 backdrop-blur-sm"}>
                    <CardContent className={embedded ? "p-4 sm:p-6" : "p-8 sm:p-10"}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <AnimatePresence mode="wait">
                                {/* STEP 1: Basic Info */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className={embedded ? "space-y-5" : "space-y-8"}
                                    >
                                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4 py-1">
                                            <h2 className={embedded ? "text-xl font-bold text-foreground tracking-tight" : "text-2xl font-bold text-foreground tracking-tight"}>Hồ sơ cá nhân công khai</h2>
                                        </div>

                                        <div className={embedded ? "grid grid-cols-1 md:grid-cols-2 gap-5" : "grid grid-cols-1 md:grid-cols-2 gap-8"}>
                                            <div className="space-y-2.5">
                                                <Label className="text-muted-foreground font-bold ml-1">Họ và tên hiển thị</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input value={currentUser.fullName} disabled className="pl-10 h-12 bg-muted border-border font-semibold cursor-not-allowed opacity-80" />
                                                </div>
                                            </div>
                                            <div className="space-y-2.5">
                                                <Label className="text-muted-foreground font-bold ml-1">Địa chỉ Email</Label>
                                                <div className="relative">
                                                    <CheckCircle2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-success" />
                                                    <Input title="Email đã được xác thực" value={currentUser.email} disabled className="pl-10 h-12 bg-muted border-border font-semibold cursor-not-allowed opacity-80" />
                                                </div>
                                            </div>
                                            <div className="space-y-2.5 md:col-span-2">
                                                <Label className="text-muted-foreground font-bold ml-1 flex items-center gap-1.5">
                                                    Số điện thoại chính xác <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    icon={Smartphone}
                                                    {...register('contactPhone', {
                                                        required: "Số điện thoại là bắt buộc",
                                                        pattern: {
                                                            value: /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/,
                                                            message: "Định dạng số điện thoại Việt Nam không hợp lệ"
                                                        }
                                                    })}
                                                    placeholder="Nhập số điện thoại để chúng tôi liên hệ phỏng vấn"
                                                    className={`pl-10 h-14 text-lg border ring-offset-background focus-visible:ring-0 transition-all ${errors.contactPhone ? 'border-destructive/50 bg-error-soft' : 'border-border focus:border-primary/40 focus:bg-card'}`}
                                                />
                                                {errors.contactPhone && <p className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-left-2">{errors.contactPhone.message}</p>}
                                                <p className="text-muted-foreground text-xs ml-1">Chúng tôi sẽ bảo mật số điện thoại này và chỉ dùng cho mục đích xác thực hồ sơ.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 2: Legal Documents */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center gap-3 border-l-4 border-info pl-4 py-1">
                                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Xác thực danh tính</h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-muted-foreground font-bold flex items-center gap-2">
                                                    CCCD Mặt trước <span className="text-destructive">*</span>
                                                </Label>
                                                <div className={`relative border border-dashed rounded-2xl transition-all duration-300 h-48 group overflow-hidden
                                                    ${watch('idCardFront') ? 'border-success/40 bg-success-soft' : 'border-border hover:border-primary/40 hover:bg-muted/40'}`}
                                                >
                                                    {watch('idCardFront') ? (
                                                        <div className="flex flex-col items-center justify-center h-full gap-3">
                                                            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center text-success">
                                                                <CheckCircle2 className="w-8 h-8" />
                                                            </div>
                                                            <p className="text-sm font-bold text-foreground truncate w-full text-center px-4">Đã chọn CCCD mặt trước</p>
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => { setValue('idCardFront', ''); setFiles(p => ({ ...p, idCardFront: null })) }} className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10">Thay đổi</Button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer gap-3">
                                                            <UploadCloud className="w-10 h-10 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                                                            <p className="text-sm text-muted-foreground text-center">Chụp hoặc chọn ảnh rõ nét</p>
                                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'idCardFront')} />
                                                        </label>
                                                    )}
                                                </div>
                                                {errors.idCardFront && <p className="text-destructive text-xs font-semibold">{errors.idCardFront.message}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-muted-foreground font-bold flex items-center gap-2">
                                                    CCCD Mặt sau <span className="text-destructive">*</span>
                                                </Label>
                                                <div className={`relative border border-dashed rounded-2xl transition-all duration-300 h-48 group overflow-hidden
                                                    ${watch('idCardBack') ? 'border-success/40 bg-success-soft' : 'border-border hover:border-primary/40 hover:bg-muted/40'}`}
                                                >
                                                    {watch('idCardBack') ? (
                                                        <div className="flex flex-col items-center justify-center h-full gap-3">
                                                            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center text-success">
                                                                <CheckCircle2 className="w-8 h-8" />
                                                            </div>
                                                            <p className="text-sm font-bold text-foreground truncate w-full text-center px-4">Đã chọn CCCD mặt sau</p>
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => { setValue('idCardBack', ''); setFiles(p => ({ ...p, idCardBack: null })) }} className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10">Thay đổi</Button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer gap-3">
                                                            <UploadCloud className="w-10 h-10 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                                                            <p className="text-sm text-muted-foreground text-center">Chụp hoặc chọn ảnh rõ nét</p>
                                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'idCardBack')} />
                                                        </label>
                                                    )}
                                                </div>
                                                {errors.idCardBack && <p className="text-destructive text-xs font-semibold">{errors.idCardBack.message}</p>}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3: Degrees & CV */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center gap-3 border-l-4 border-warning pl-4 py-1">
                                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Kinh nghiệm & Bằng cấp</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-muted-foreground font-bold flex items-center gap-2">
                                                CV / Resume chuyên môn <span className="text-destructive">*</span>
                                            </Label>
                                            <div className={`p-6 border rounded-2xl transition-all duration-300 flex items-center gap-5
                                                ${watch('cvUrl') ? 'border-success/40 bg-success-soft' : 'border-border bg-background hover:bg-muted'}`}
                                            >
                                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm 
                                                    ${watch('cvUrl') ? 'bg-success-soft text-success' : 'bg-card text-muted-foreground/50'}`}>
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    {watch('cvUrl') ? (
                                                        <p className="font-bold text-foreground truncate">{files.cvUrl?.name || "Tệp CV đã sẵn sàng"}</p>
                                                    ) : (
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-muted-foreground">Thêm tệp PDF kinh nghiệm</p>
                                                            <p className="text-xs text-muted-foreground">Dung lượng tối đa 10MB</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <label
                                                    htmlFor="instructor-cv-file"
                                                    className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl px-6 font-bold shadow-sm transition-colors
                                                        ${watch('cvUrl')
                                                            ? 'border border-border bg-card text-foreground hover:bg-muted'
                                                            : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                                                >
                                                    {watch('cvUrl') ? "Thay đổi" : "Chọn tệp"}
                                                </label>
                                                <input
                                                    id="instructor-cv-file"
                                                    type="file"
                                                    accept="application/pdf"
                                                    className="sr-only"
                                                    onChange={(e) => handleFileChange(e, 'cvUrl')}
                                                />
                                            </div>
                                            {errors.cvUrl && <p className="text-destructive text-xs font-semibold ml-1">{errors.cvUrl.message}</p>}
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-muted-foreground font-bold flex items-center gap-2">
                                                Bằng cấp chuyên môn (Nhiều tệp) <span className="text-destructive">*</span>
                                            </Label>
                                            <p className="text-xs text-muted-foreground -mt-2">Ví dụ: Bằng Đại học, Cao đẳng, Thạc sĩ, Tiến sĩ...</p>
                                            <div className="flex items-center justify-center w-full group">
                                                <label className="flex flex-col items-center justify-center w-full h-40 border border-dashed border-border rounded-2xl cursor-pointer bg-muted/30 hover:bg-card hover:border-primary/30 transition-all duration-500 shadow-inner">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <UploadCloud className="w-12 h-12 mb-4 text-muted-foreground/30 group-hover:text-primary/40 group-hover:scale-110 transition-all duration-500" />
                                                        <p className="mb-2 text-base text-muted-foreground font-bold">Thêm bằng cấp (Ảnh/PDF)</p>
                                                        <p className="text-xs text-muted-foreground">Nhấp để chọn hoặc kéo thả nhiều tệp cùng lúc</p>
                                                    </div>
                                                    <input type="file" className="hidden" multiple accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'degreeUrls')} />
                                                </label>
                                            </div>
                                            {errors.degreeUrls && <p className="text-destructive text-xs font-semibold ml-1">{errors.degreeUrls.message}</p>}

                                            {files.degreeUrls.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                                    {files.degreeUrls.map((file, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ scale: 0.9, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className="flex items-center justify-between p-4 bg-card border border-border/70 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                                                        >
                                                            <div className="flex items-center space-x-4 overflow-hidden">
                                                                <div className={`p-2 rounded-lg 
                                                                    ${file.type === 'application/pdf' ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'}`}>
                                                                    {file.type === 'application/pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-sm font-bold text-foreground truncate max-w-[160px]" title={file.name}>{file.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{file.type.split('/')[1]}</p>
                                                                </div>
                                                            </div>
                                                            <button type="button" onClick={() => removeFile(index, 'degreeUrls')} className="p-2 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all opacity-0 group-hover:opacity-100">
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-muted-foreground font-bold flex items-center gap-2">
                                                Chứng chỉ liên quan (Nhiều tệp)
                                            </Label>
                                            <p className="text-xs text-muted-foreground -mt-2">Ví dụ: Chứng chỉ ngoại ngữ (IELTS, TOEIC), chứng chỉ sư phạm, chứng chỉ tin học...</p>
                                            <div className="flex items-center justify-center w-full group">
                                                <label className="flex flex-col items-center justify-center w-full h-40 border border-dashed border-border rounded-2xl cursor-pointer bg-muted/30 hover:bg-card hover:border-primary/30 transition-all duration-500 shadow-inner">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <UploadCloud className="w-12 h-12 mb-4 text-muted-foreground/30 group-hover:text-primary/40 group-hover:scale-110 transition-all duration-500" />
                                                        <p className="mb-2 text-base text-muted-foreground font-bold">Thêm chứng chỉ (Ảnh/PDF)</p>
                                                        <p className="text-xs text-muted-foreground">Nhấp để chọn hoặc kéo thả nhiều tệp cùng lúc</p>
                                                    </div>
                                                    <input type="file" className="hidden" multiple accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'certificateUrls')} />
                                                </label>
                                            </div>

                                            {files.certificateUrls.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                                    {files.certificateUrls.map((file, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ scale: 0.9, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className="flex items-center justify-between p-4 bg-card border border-border/70 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                                                        >
                                                            <div className="flex items-center space-x-4 overflow-hidden">
                                                                <div className={`p-2 rounded-lg 
                                                                    ${file.type === 'application/pdf' ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'}`}>
                                                                    {file.type === 'application/pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-sm font-bold text-foreground truncate max-w-[160px]" title={file.name}>{file.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{file.type.split('/')[1]}</p>
                                                                </div>
                                                            </div>
                                                            <button type="button" onClick={() => removeFile(index, 'certificateUrls')} className="p-2 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all opacity-0 group-hover:opacity-100">
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 4: Plan & Terms */}
                                {currentStep === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-10"
                                    >
                                        <div className="flex items-center gap-3 border-l-4 border-success pl-4 py-1">
                                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Kế hoạch khóa học & Cam kết</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-muted-foreground font-bold flex items-center gap-2">Mô tả tóm tắt nội dung bạn sẽ giảng dạy</Label>
                                                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full uppercase tracking-tighter">Gợi ý 200 - 500 từ</span>
                                            </div>
                                            <Textarea
                                                {...register('courseOutline')}
                                                placeholder="Bạn dự định dạy chủ đề gì? Cấu trúc bài học ra sao? Học viên sẽ nhận được giá trị gì sau khóa học của bạn?"
                                                rows={7}
                                                className="border border-border focus:border-success/40 focus:bg-card bg-background rounded-2xl p-5 text-base leading-relaxed transition-all resize-none shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-foreground rounded-3xl p-8 text-background/70 shadow-xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
                                                <div className="flex items-center gap-3 mb-6 text-background border-b border-background/10 pb-4">
                                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                                    <h3 className="font-bold text-lg uppercase tracking-widest">Quy tắc ứng xử giảng viên</h3>
                                                </div>
                                                <div className="space-y-4 h-56 overflow-y-auto pr-4 scrollbar-thin text-sm font-medium">
                                                    <div className="flex gap-4 p-4 rounded-2xl bg-background/5 hover:bg-background/10 transition-colors">
                                                        <span className="text-primary font-bold">01.</span>
                                                        <p>Cam kết tuyệt đối về tính trung thực của hồ sơ năng lực và các chứng chỉ chuyên môn cung cấp.</p>
                                                    </div>
                                                    <div className="flex gap-4 p-4 rounded-2xl bg-background/5 hover:bg-background/10 transition-colors">
                                                        <span className="text-primary font-bold">02.</span>
                                                        <p>Nội dung bài học phải tự biên soạn hoặc có bản quyền hợp pháp, không vi phạm sở hữu trí tuệ của bên thứ ba.</p>
                                                    </div>
                                                    <div className="flex gap-4 p-4 rounded-2xl bg-background/5 hover:bg-background/10 transition-colors">
                                                        <span className="text-primary font-bold">03.</span>
                                                        <p>Luôn duy trì thái độ chuyên nghiệp, hỗ trợ giải đáp thắc mắc của học viên trong vòng 24 - 48 giờ làm việc.</p>
                                                    </div>
                                                    <div className="flex gap-4 p-4 rounded-2xl bg-background/5 hover:bg-background/10 transition-colors">
                                                        <span className="text-primary font-bold">04.</span>
                                                        <p>Gnostica giữ quyền kiểm duyệt chất lượng kỹ thuật (âm thanh/hình ảnh) trước khi khóa học xuất bản chính thức.</p>
                                                    </div>
                                                    <div className="flex gap-4 p-4 rounded-2xl bg-background/5 hover:bg-background/10 transition-colors">
                                                        <span className="text-primary font-bold">05.</span>
                                                        <p>Thỏa thuận chia sẻ doanh thu và hoa hồng sẽ được quy định cụ thể trong hợp đồng điện tử sau khi hồ sơ được duyệt.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 bg-card p-6 rounded-2xl shadow-sm border border-border/70 group transition-all hover:border-primary/30">
                                                <Checkbox
                                                    id="terms"
                                                    checked={agreedTerms}
                                                    onCheckedChange={setAgreedTerms}
                                                    className="w-6 h-6 border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <label htmlFor="terms" className="text-sm sm:text-base font-bold text-foreground cursor-pointer select-none group-hover:text-primary transition-colors leading-tight">
                                                    Tôi đã đọc, hiểu rõ và cam kết tuân thủ các điều khoản trên
                                                </label>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions Navigation */}
                            <div className={embedded ? "mt-7 flex items-center justify-between gap-4 pt-6 border-t border-border" : "mt-12 flex items-center justify-between gap-4 pt-10 border-t border-border"}>
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        appVariant="ghostMuted"
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                        className="h-14 px-8 rounded-2xl font-bold border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground gap-2 min-w-[140px] shadow-sm"
                                    >
                                        <ChevronLeft className="w-5 h-5" /> Quay lại
                                    </Button>
                                )}

                                {currentStep < 4 ? (
                                    <Button
                                        type="button"
                                        onClick={validateStep}
                                        className="h-14 px-10 rounded-2xl font-bold ml-auto shadow-lg shadow-primary/20 gap-2 min-w-[140px]"
                                    >
                                        Tiếp tục <ChevronRight className="w-5 h-5" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={createApplicationMutation.isPending || !agreedTerms}
                                        className="h-14 px-12 rounded-2xl font-bold ml-auto shadow-xl shadow-primary/25 gap-2 min-w-[200px]"
                                    >
                                        {createApplicationMutation.isPending ? (
                                            <><Loader2 className="w-6 h-6 animate-spin" /> Đang gửi hồ sơ...</>
                                        ) : (
                                            <><CheckCircle2 className="w-6 h-6" /> Hoàn tất và Gửi đơn</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {!embedded && (
                    <p className="mt-10 text-center text-muted-foreground text-sm font-medium">
                        Bạn cần trợ giúp? Liên hệ ban đào tạo tại <a href="mailto:instructor@gnostica.edu.vn" className="text-primary hover:underline font-bold">instructor@gnostica.edu.vn</a>
                    </p>
                )}
            </div>
        </Container>
    );
};

export default ApplyInstructor;
