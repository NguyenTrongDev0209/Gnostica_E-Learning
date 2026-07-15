import "react-quill-new/dist/quill.snow.css";
import React from "react";
import { useFormContext, useWatch, Controller, useFieldArray, FormProvider } from "react-hook-form";
import AppInput from "@/components/common/micro/AppInput";
import { Select as AppSelectRoot, SelectContent as AppSelectContent, SelectItem as AppSelectItem, SelectTrigger as AppSelectTrigger, SelectValue as AppSelectValue } from "@/components/common/micro/AppSelect";
import AppPopover, { AppPopoverContent, AppPopoverTrigger } from "@/components/common/micro/AppPopover";
import { AppAccordionRoot, AppAccordionContent, AppAccordionItem, AppAccordionTrigger } from "@/components/common/micro/AppAccordion";
import AppTextarea from "@/components/common/micro/AppTextarea";
import { AppDialogRoot, AppDialogContent, AppDialogTrigger } from "@/components/common/micro/AppDialog";
import { ChevronDown, ArrowLeft, ArrowRight, Video, GripVertical, Trash2, Plus, PlayCircle, FileText, Check, Loader2, Sparkles, Database, CheckCircle2, ListOrdered, Search, Pencil, ChevronRight, Clock, ShieldCheck, ShieldAlert, AlertTriangle, Save, CircleFadingArrowUp } from "lucide-react";
import ReactQuill from "react-quill-new";
import AppBadge from "@/components/common/micro/AppBadge";
import AppCard from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import { toast } from "sonner";
import questionService from "@/services/course/questionService";
import { useParams, useNavigate } from "react-router-dom";
import courseService from "@/services/course/courseService";
import useInstructorCourseForm from "@/hooks/course/useInstructorCourseForm";
import { Tabs as AppTabsRoot, TabsContent as AppTabsContent } from "@/components/common/micro/AppTabs";
import { courseSchema, viErrorMap } from "@/utils/validations/courseSchema";
import useCourseAiPreScan from "@/hooks/course/useCourseAiPreScan";

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};
const quillFormats = [
  "bold", "italic", "underline", "list", "bullet"
];

function CourseStepper({ activeTab, onTabChange }) {
  const { control } = useFormContext();

  const watchedValues = useWatch({
    control,
    name: [
      "title",
      "description",
      "sections",
      "thumbnail",
      "promoVideo",
      "price",
      "questionBank",
    ],
  });

  const steps = React.useMemo(() => {
    const formValues = watchedValues || [];
    // Basic Info Progress
    const basicFields = [formValues[0], formValues[1]];
    const basicFilled = basicFields.filter((f) => f && f.length > 0).length;
    const basicPercent = (basicFilled / 2) * 100;

    // Curriculum Progress (at least one section with title)
    const sections = formValues[2] || [];
    const curriculumPercent = sections.some(
      (s) => s.title && s.title.length > 0,
    )
      ? 100
      : 0;

    // Media Progress (thumbnail and promoVideo)
    const mediaFields = [formValues[3], formValues[4]];
    const mediaFilled = mediaFields.filter(
      (f) => f !== null && f !== undefined,
    ).length;
    const mediaPercent = (mediaFilled / 2) * 100;

    // Pricing Progress
    const price = formValues[5];
    const pricingPercent = price && price > 0 ? 100 : 0;

    const settingsPercent = (mediaPercent + pricingPercent) / 2;

    // Quiz Progress
    const questionBank = formValues[6];
    const quizPercent = (questionBank && questionBank.length > 0) ? 100 : 0;

    return [
      {
        id: "basic",
        label: "Thông tin cơ bản",
        step: 1,
        progress: basicPercent,
      },
      {
        id: "quiz",
        label: "Ngân hàng câu hỏi",
        step: 2,
        progress: quizPercent,
      },
      {
        id: "curriculum",
        label: "Nội dung bài học",
        step: 3,
        progress: curriculumPercent,
      },
      {
        id: "settings",
        label: "Media & Định giá",
        step: 4,
        progress: settingsPercent,
      },
    ];
  }, [watchedValues]);

  const currentStepNum = steps.find((s) => s.id === activeTab)?.step || 1;

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto h-20">
      {steps.map((s, idx) => {
        const isActive = s.id === activeTab;
        const isCompleted = s.progress === 100;
        const isLast = idx === steps.length - 1;

        // SVG Circle properties
        const radius = 18;
        const circumference = 2 * Math.PI * radius;
        // Map 0-100 progress to stroke offset
        const offset = circumference - (s.progress / 100) * circumference;

        return (
          <React.Fragment key={s.id}>
            {/* Step Node with Circular Progress */}
            <div
              className="relative flex flex-col items-center justify-center group cursor-pointer"
              onClick={() => onTabChange(s.id)}
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform group-hover:scale-105 transition-transform duration-300">
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="text-success transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Circle Content */}
                <div
                  className={`
                    w-[28px] h-[28px] rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300
                    ${isActive
                      ? "bg-success/10 text-success text-white shadow-lg shadow-green-100 scale-105"
                      : isCompleted
                        ? "bg-success/10 text-success text-white"
                        : "bg-white text-slate-300"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    s.step
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="absolute -bottom-6 whitespace-nowrap text-[11px] font-bold transition-all duration-300 text-center uppercase tracking-tighter">
                <p
                  className={`${isActive ? "text-success scale-110" : isCompleted ? "text-success" : "text-muted-foreground opacity-60"}`}
                >
                  {s.label}
                </p>
              </div>
            </div>

            {/* Connection Line Segment */}
            {!isLast && (
              <div className="flex-1 mx-2 h-[2px] bg-secondary relative rounded-full overflow-hidden">
                <div
                  className={`
                    absolute inset-0 bg-success/10 text-success transition-all duration-1000 ease-out
                    ${currentStepNum > idx + 1 ? "w-full" : "w-0"}
                  `}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS CHO TỪNG TAB
// ==========================================

function CourseDraftModal({ showDraftModal, setShowDraftModal, slug, restoreDraft }) {
  if (!showDraftModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <AppCard className="w-full max-w-md shadow-2xl border-none overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 text-info rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Phát hiện bản nháp!</h3>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Bạn có một bản lưu nháp chưa hoàn thành từ phiên làm việc trước. Bạn có muốn khôi phục lại dữ liệu này không?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <AppButton appVariant="ghostMuted" variant="ghost"
              className="h-11 font-bold border-border"
              onClick={() => {
                setShowDraftModal(false);
                localStorage.removeItem(`course_questions_${slug || 'new'}`);
              }}
            >
              Bỏ qua
            </AppButton>
            <AppButton appVariant="gradient"
              className="h-11 font-bold bg-info text-white hover:bg-info/90 border-none"
              onClick={restoreDraft}
            >
              Khôi phục ngay
            </AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  );
}

function CourseAiReportModal({
  showAiReportModal,
  setShowAiReportModal,
  overallAiReport,
  isPreScanning,
  handlePreScanWholeCourse
}) {
  return (
    <AppDialogRoot open={showAiReportModal} onOpenChange={setShowAiReportModal}>
      <AppDialogContent className="sm:max-w-[600px] rounded-2xl border border-border p-0 overflow-hidden shadow-2xl bg-white focus-visible:outline-none z-[9999]">
        {(() => {
          let report = null;
          try {
            if (overallAiReport) report = JSON.parse(overallAiReport);
          } catch(err) { console.error("Error parsing ai report:", err); }

          const score = report?.safetyScore ?? 100;
          const hasViolations = report?.violations && report.violations.length > 0;
          const isCritical = score < 70 || report?.violations?.some(v => v.severity === 'CRITICAL' || v.severity === 'HIGH');
          
          let headerBg = "bg-gradient-to-br from-emerald-600 to-emerald-500 text-white";
          let ShieldIcon = ShieldCheck;
          let statusText = "Nội Dung Đạt Chuẩn An Toàn";

          if (isCritical) {
            headerBg = "bg-gradient-to-br from-rose-600 to-rose-500 text-white";
            ShieldIcon = ShieldAlert;
            statusText = "Phát Hiện Vi Phạm Tường Lửa";
          } else if (hasViolations || score < 90) {
            headerBg = "bg-gradient-to-br from-amber-500 to-orange-500 text-white";
            ShieldIcon = AlertTriangle;
            statusText = "Cần Xem Lại Nội Dung Nghi Vấn";
          }

          return (
            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
              <div className={`p-6 flex items-center gap-4 border-b border-white/10 shadow-sm shrink-0 ${headerBg}`}>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md shadow-inner shrink-0">
                  <ShieldIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight leading-none flex items-center gap-2">
                    {statusText}
                  </h3>
                  <p className="text-[10px] font-extrabold tracking-widest uppercase mt-2 opacity-90 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> CHỈ SỐ AN TOÀN AI: {score}%
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto scrollbar-thin bg-muted/30">
                {!report ? (
                  <div className="text-center py-12 px-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-violet-50 border border-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <Sparkles className="w-8 h-8 animate-bounce" />
                    </div>
                    <p className="font-black text-foreground text-[15px] uppercase tracking-wide">Chưa có dữ liệu quét AI</p>
                    <p className="text-muted-foreground text-xs mt-1.5 max-w-[320px] font-medium leading-relaxed">
                      Hệ thống Tường lửa AI sẽ tự động thẩm định Tiêu đề & Mô tả khóa học ngay khi bạn bấm nút <span className="font-bold text-info">"Lưu khóa học"</span> lần đầu tiên.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-2xl border border-border/60 shadow-sm">
                      <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase mb-2.5 pl-1">📝 Nhận xét tổng hợp từ Trợ lý AI</p>
                      <p className="text-xs text-foreground font-bold italic bg-muted p-3.5 rounded-xl border border-border leading-relaxed shadow-inner">
                        "{report.assessment}"
                      </p>
                    </div>

                    {report.violations && report.violations.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase pl-1 flex items-center gap-1.5">
                          ⚠️ Danh sách điểm cần sửa đổi ({report.violations.length})
                        </p>
                        <div className="space-y-3">
                          {report.violations.map((v, i) => (
                            <div key={i} className="p-4 bg-white rounded-2xl border border-border shadow-sm space-y-2.5 hover:shadow-md transition-all duration-300 group">
                              <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-black uppercase flex items-center gap-1 ${isCritical ? 'text-rose-700' : 'text-amber-700'}`}>
                                  {v.type === 'EXTERNAL_MARKETING' ? '📢 Quảng cáo / Kéo khách ngoài' : '🗣️ Từ ngữ vi phạm'}
                                </span>
                                <AppBadge className={`h-4.5 px-2 py-0 text-[9px] font-black border-none uppercase tracking-wider ${v.severity === 'CRITICAL' || v.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {v.severity}
                                </AppBadge>
                              </div>
                              <p className="text-xs font-bold text-foreground italic bg-muted p-2.5 rounded-xl border border-border leading-relaxed group-hover:bg-secondary transition-colors">
                                "{v.content}"
                              </p>
                              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5 flex items-start gap-1 pl-0.5">
                                <span className="font-extrabold text-foreground shrink-0">📌 Giải thích:</span> 
                                <span className="font-medium">{v.explanation}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-white rounded-2xl border border-emerald-100 flex flex-col items-center shadow-sm">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3 border border-emerald-100 shadow-inner">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-pulse" />
                        </div>
                        <p className="font-black text-emerald-800 uppercase tracking-wide text-[13px]">Văn bản sạch tuyệt đối!</p>
                        <p className="text-muted-foreground text-xs mt-1.5 font-medium max-w-[340px] leading-relaxed">
                          Trợ lý AI không phát hiện bất kỳ lỗi ngôn từ, kéo khách ngoài hay vi phạm chính sách nào. Bạn đã sẵn sàng gửi duyệt!
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-4 bg-white border-t border-border flex items-center justify-between gap-3 shrink-0">
                <AppButton appVariant="ghostMuted" variant="ghost"
                  type="button"
                  disabled={isPreScanning}
                  onClick={handlePreScanWholeCourse}
                  className="h-10 px-4 border border-violet-200 text-violet-700 bg-white hover:bg-violet-50 hover:text-violet-800 font-bold rounded-xl shadow-sm text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  {isPreScanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang quét toàn khóa...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                      <span>Quét thử toàn bộ khóa học</span>
                    </>
                  )}
                </AppButton>
                <AppButton appVariant="gradient" 
                  onClick={() => setShowAiReportModal(false)}
                  className="h-10 px-5 bg-muted hover:bg-secondary text-foreground font-bold rounded-xl shadow-md text-xs select-none active:scale-95 transition-transform border-none"
                >
                  Đóng báo cáo
                </AppButton>
              </div>
            </div>
          );
        })()}
      </AppDialogContent>
    </AppDialogRoot>
  );
}

function BasicInfoTab({ categories }) {
  const {
    register,
    control,
    setValue,
    getValues,
    replace,
    formState: { errors },
  } = useFormContext();

  const title = useWatch({ control, name: "title" });
  const categoryId = useWatch({ control, name: "categoryId" });
  const currentStatus = useWatch({ control, name: "status" });
  const aiModerationReport = useWatch({ control, name: "aiModerationReport" });

  // Logic tìm danh mục được chọn (bao gồm đệ quy cấp 2)
  const selectedCategory = React.useMemo(() => {
    if (!categoryId || !categories) return null;
    const searchId = categoryId.toString();
    for (const cat of categories) {
      if (cat.id.toString() === searchId) return cat;
      if (cat.subcategories) {
        const sub = cat.subcategories.find(s => s.id.toString() === searchId);
        if (sub) return sub;
      }
    }
    return null;
  }, [categoryId, categories]);

  const isCategoryHidden = selectedCategory && selectedCategory.status === false;

  // Nếu danh mục bị ẩn, ép buộc khóa học phải ẩn theo
  React.useEffect(() => {
    if (isCategoryHidden && currentStatus !== 2) {
      setValue("status", 2);

      // Đồng bộ xuống chương và bài học ngay lập tức
      const currentSections = getValues("sections") || [];
      const updatedSections = currentSections.map(s => ({
        ...s,
        status: 2,
        lessons: s.lessons?.map(l => ({ ...l, status: 2 })) || []
      }));
      setValue("sections", updatedSections, { shouldDirty: true });
      if (replace) replace(updatedSections);

      toast.info(`Danh mục "${selectedCategory.name}" đang ẩn, khóa học đã được chuyển sang trạng thái Ẩn để đồng bộ.`);
    }
  }, [isCategoryHidden, currentStatus, setValue, getValues, replace, selectedCategory]);

  React.useEffect(() => {
    // Chỉ thực hiện tạo slug và validate nếu title CÓ giá trị
    // Nếu title chưa được nhập lần nào hoặc bị xóa sạch, ta chỉ truyền giá trị "" mà KHÔNG validate
    if (title && typeof title === "string" && title.trim() !== "") {
      const generatedSlug = title.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      setValue("slug", generatedSlug, {
        shouldValidate: true,
        shouldDirty: true
      });
    } else {
      // Khi title rỗng, chỉ cập nhật giá trị slug về rỗng, không ép validate
      // Lỗi "bắt buộc" sẽ chỉ hiện ra khi người dùng bấm Lưu khóa học (Submit)
      setValue("slug", "", {
        shouldValidate: false,
        shouldDirty: true
      });
    }
  }, [title, setValue]);

  return (
    <div className="space-y-6 w-full">
      <div>
        <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 mb-4">
          THÔNG TIN CƠ BẢN
        </h3>
      </div>

      {aiModerationReport && (
        <div className="flex items-center gap-1.5 bg-violet-50/50 border border-violet-100/60 px-4 py-2 rounded-xl text-violet-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Mẹo: Bấm nút <span className="underline font-black decoration-2 decoration-violet-300 mx-0.5">"Kết quả kiểm duyệt AI"</span> ở góc trên hoặc dưới cùng màn hình để xem chi tiết thẩm định.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Tên Khóa Học <span className="text-error">*</span>
          </label>
          <AppInput
            className="h-11 border-border focus:border-success/20 font-medium"
            placeholder="Ví dụ: React Native Masterclass 2026..."
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Slug <span className="text-error">*</span>
          </label>
          <AppInput
            className="h-11 border-border bg-muted font-medium cursor-not-allowed"
            placeholder="react-native-masterclass-2026"
            {...register("slug")}
            readOnly
          />
          {errors.slug && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1">
              {errors.slug.message}
            </p>
          )}
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Danh Mục <span className="text-error">*</span>
          </label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <CategoryCascader
                categories={categories}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.categoryId && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Cấp Độ <span className="text-error">*</span>
          </label>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <AppSelectRoot onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <AppSelectTrigger className="w-full !h-11 border-border focus:border-success/20 font-medium bg-white data-[state=open]:ring-1 data-[state=open]:ring-green-500">
                  <AppSelectValue placeholder="Chọn cấp độ" />
                </AppSelectTrigger>
                <AppSelectContent className="bg-white">
                  <AppSelectItem value="beginner">Người mới bắt đầu</AppSelectItem>
                  <AppSelectItem value="intermediate">Trung bình</AppSelectItem>
                  <AppSelectItem value="advanced">Nâng cao</AppSelectItem>
                  <AppSelectItem value="all">Dành cho mọi đối tượng</AppSelectItem>
                </AppSelectContent>
              </AppSelectRoot>
            )}
          />
          {errors.level && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1">
              {errors.level.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Trạng Thái <span className="text-error">*</span>
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <AppSelectRoot
                onValueChange={(val) => {
                  const newStatus = Number(val);

                  // Chặn bật hoạt động nếu danh mục đang ẩn
                  if (isCategoryHidden && newStatus === 1) {
                    toast.warning("Danh mục của khóa học đang ẩn, không thể bật trạng thái Hoạt động.");
                    return;
                  }

                  field.onChange(newStatus);

                  // Logic Đồng bộ trạng thái: Course -> Module -> Lesson
                  const currentSections = getValues("sections") || [];
                  const updatedSections = currentSections.map(s => ({
                    ...s,
                    status: newStatus,
                    lessons: s.lessons?.map(l => ({
                      ...l,
                      status: newStatus
                    })) || []
                  }));

                  // setValue với shouldDirty giúp các Controller cấp sâu (lessons) nhận diện thay đổi
                  setValue("sections", updatedSections, { shouldDirty: true });
                  // replace giúp cập nhật ngay lập tức giao diện Accordion/FieldArray của chương
                  if (replace) replace(updatedSections);
                }}
                value={(field.value ?? 1).toString()}
                disabled={isCategoryHidden}
              >
                <AppSelectTrigger className={`w-full !h-11 border-border focus:border-success/20 font-medium ${isCategoryHidden ? 'bg-muted opacity-80' : 'bg-white'}`}>
                  <AppSelectValue placeholder="Chọn trạng thái" />
                </AppSelectTrigger>
                <AppSelectContent className="bg-white">
                  <AppSelectItem value="1" disabled={isCategoryHidden}>Hoạt động {isCategoryHidden && "(Danh mục cha đang ẩn)"}</AppSelectItem>
                  <AppSelectItem value="2">Ẩn</AppSelectItem>
                </AppSelectContent>
              </AppSelectRoot>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
          Mô Tả Khóa Học (Tuỳ chọn)
        </label>
        <div className="rounded-lg border border-border overflow-hidden focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all bg-white">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <ReactQuill
                theme="snow"
                value={field.value || ""}
                onChange={field.onChange}
                modules={quillModules}
                placeholder="Mô tả về lợi ích và mục tiêu của khóa học dành cho học viên..."
                className="[&_.ql-toolbar.ql-snow]:!border-0 [&_.ql-toolbar.ql-snow]:!border-b [&_.ql-toolbar.ql-snow]:!border-border [&_.ql-toolbar]:bg-muted [&_.ql-container.ql-snow]:!border-0 [&_.ql-container]:min-h-[120px] [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-foreground font-sans"
              />
            )}
          />
        </div>
        {errors.description && (
          <p className="text-xs font-bold text-error mt-1.5 pl-1">{errors.description.message}</p>
        )}
      </div>
    </div>
  );
}

function CurriculumTab({ uploadVideoToBunny, setActiveUploads, fields, append, remove }) {
  const { control, watch, formState: { errors } } = useFormContext();
  const currentCourseStatus = watch("status") ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Khung Chương Trình
          </h3>
          <p className="text-xs font-medium text-muted-foreground mt-1">
            Xây dựng kiến trúc bài giảng rõ ràng, rành mạch.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({
              title: "",
              status: currentCourseStatus,
              lessons: [{
                title: "",
                content: "",
                videoFile: null,
                status: currentCourseStatus,
                createdAt: new Date().toISOString(),
                updatedAt: null
              }],
              attachments: null,
              createdAt: new Date().toISOString(),
              updatedAt: null,
            })
          }
          className="flex items-center gap-1.5 text-sm font-bold border border-border px-3 py-1.5 rounded-lg bg-muted hover:bg-secondary transition-colors"
        >
          <Plus size={16} className="text-muted-foreground" /> Thêm Chương
        </button>
      </div>

      {errors.sections?.root && (
        <div className="text-sm font-bold text-error bg-red-50 border border-error/20 p-3 rounded-lg">
          {errors.sections.root.message}
        </div>
      )}

      {/* Dùng div với overflow-y-auto đơn giản để đảm bảo cuộn luôn hoạt động */}
      <div className="max-h-[850px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
        <AppAccordionRoot
          type="multiple"
          defaultValue={[fields[0]?.id]}
          className="space-y-4 pb-24"
        >
          {fields.map((section, sectionIdx) => (
            <AppAccordionItem
              value={section.id}
              key={section.id}
              className="border border-border rounded-xl bg-muted overflow-hidden shadow-sm"
            >
              <AppAccordionTrigger className="px-5 py-4 hover:bg-secondary hover:no-underline border-b border-transparent data-[state=open]:border-border">
                <div className="flex items-center w-full pr-4 text-left">
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-xs font-bold text-success uppercase tracking-widest">
                      Chương {sectionIdx + 1}
                    </span>
                    <span className="font-bold text-foreground line-clamp-1">
                      {/* Dùng UseWatch nếu muốn real-time title display, hiện tại dùng static or watch context. Để UX tối ưu nhất chúng ta cứ giữ tĩnh. */}
                      Nội dung chương
                    </span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault(); // Extra safety for accordion
                      if (confirm("Bạn chắc chắn muốn xóa chương này?")) {
                        remove(sectionIdx);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        if (confirm("Bạn chắc chắn muốn xóa chương này?")) {
                          remove(sectionIdx);
                        }
                      }
                    }}
                    className="p-2 text-muted-foreground hover:text-error hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </div>
                </div>
              </AppAccordionTrigger>
              <AppAccordionContent className="p-0 bg-white border-t border-slate-50">
                <SectionItem
                  sectionIndex={sectionIdx}
                  control={control}
                  uploadVideoToBunny={uploadVideoToBunny}
                  setActiveUploads={setActiveUploads}
                />
              </AppAccordionContent>
            </AppAccordionItem>
          ))}
        </AppAccordionRoot>
      </div>
    </div>
  );
}

// ------------------------------------------
// COMPONENT LESSON QUẢN LÝ ITEM CON
// ------------------------------------------

function SettingsTab({ uploadVideoToBunny, setActiveUploads }) {
  return (
    <div className="space-y-12">
      <MediaTab uploadVideoToBunny={uploadVideoToBunny} setActiveUploads={setActiveUploads} />
      <div className="border-t border-border"></div>
      <PricingTab />
    </div>
  );
}

function QuizTab({ courseId }) {
  const { slug } = useParams();
  const { setValue, getValues } = useFormContext();
  const localStorageKey = `course_questions_${slug || 'new'}`;

  const [aiFile, setAiFile] = React.useState(null);
  const [aiQuestionCount, setAiQuestionCount] = React.useState(10);
  const [aiLevel, setAiLevel] = React.useState("medium");
  
  const [draftQuestions, setDraftQuestions] = React.useState(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved && JSON.parse(saved).length > 0) {
      return JSON.parse(saved);
    }
    // Pre-populated from top-level course load or draft injection
    return getValues("questionBank") || [];
  });

  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false);
  const [, setIsFetchingDrafts] = React.useState(false);
  const [, setIsSavingDraft] = React.useState(false);
  const [isBankConfirmed, setIsBankConfirmed] = React.useState(() => {
    const confirmed = getValues("questionBank") || [];
    if (!draftQuestions || draftQuestions.length === 0) return false;
    // If in-memory draft exactly matches the globally confirmed list, restore confirmed state
    return JSON.stringify(draftQuestions) === JSON.stringify(confirmed);
  });

  // Sync only to localStorage for persistent stage between tab switches
  React.useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(draftQuestions));
  }, [draftQuestions, localStorageKey]);

  // Load drafts from server on mount if localStorage is empty
  React.useEffect(() => {
    if (!courseId) return;
    const localQuestions = localStorage.getItem(localStorageKey);
    if (localQuestions && JSON.parse(localQuestions).length > 0) return; // Prioritize local storage

    const fetchQuestions = async () => {
      setIsFetchingDrafts(true);
      try {
        const questions = await questionService.getDraftQuestions(courseId);
        if (questions && questions.length > 0) {
          setDraftQuestions(questions);
        }
      } catch (err) {
        console.error("Lỗi khi tải câu hỏi:", err);
      } finally {
        setIsFetchingDrafts(false);
      }
    };
    fetchQuestions();
  }, [courseId, localStorageKey]);

  // Auto save drafts to Redis as a double backup if courseId exists
  const initialMount = React.useRef(true);
  React.useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (!courseId) return;
    const saveTimer = setTimeout(async () => {
      setIsSavingDraft(true);
      try {
        await questionService.saveDraftQuestions(courseId, draftQuestions);
      } catch (err) {
        console.error("Lỗi tự động lưu nháp:", err);
      } finally {
        setIsSavingDraft(false);
      }
    }, 1500); // Debounce 1.5s
    return () => clearTimeout(saveTimer);
  }, [draftQuestions, courseId]);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterLevel, setFilterLevel] = React.useState("all");
  const [editingQuestionId, setEditingQuestionId] = React.useState(null);

  const [manualText, setManualText] = React.useState("");
  const [manualOptions, setManualOptions] = React.useState({ A: "", B: "", C: "", D: "" });
  const [manualCorrect, setManualCorrect] = React.useState("A");
  const [manualLevel, setManualLevel] = React.useState("medium");
  const [manualExplanation, setManualExplanation] = React.useState("");

  const handleCreateAI = async () => {
    if (!aiFile) {
      toast.error("Vui lòng tải lên tài liệu bài giảng trước khi tạo câu hỏi!");
      return;
    }
    if (aiQuestionCount < 1 || aiQuestionCount > 100) {
      toast.warning("Số lượng câu hỏi phải từ 1 đến 100!");
      return;
    }
    if (draftQuestions.length + aiQuestionCount > 300) {
      toast.error(`Không thể tạo thêm ${aiQuestionCount} câu hỏi! Ngân hàng câu hỏi chỉ chứa tối đa 300 câu (hiện tại đã có ${draftQuestions.length} câu).`);
      return;
    }

    setIsGeneratingAi(true);
    toast.info("Đang phân tích tài liệu và sinh câu hỏi bằng AI...");

    try {
      const generatedQuestions = await questionService.generateAiQuestions(courseId, aiFile, aiQuestionCount, aiLevel);
      if (generatedQuestions && generatedQuestions.length > 0) {
        // Find highest existing ID to continue numbering
        let highestId = draftQuestions.length > 0 ? Math.max(...draftQuestions.map(q => q.id)) : 0;

        const newQuestionsWithId = generatedQuestions.map(q => {
          highestId++;
          return { ...q, id: highestId };
        });

        setDraftQuestions(prev => [...prev, ...newQuestionsWithId]);
        setIsBankConfirmed(false);
        toast.success(`Đã tự động tạo và thêm thành công ${newQuestionsWithId.length} câu hỏi vào ngân hàng!`);
      } else {
        toast.warning("AI đã phân tích nhưng không tìm thấy dữ liệu để tạo câu hỏi.");
      }
    } catch (err) {
      console.error("Lỗi khi sinh câu hỏi AI:", err);
      toast.error(err.response?.data?.message || "Lỗi máy chủ khi sinh câu hỏi AI. Vui lòng thử lại!");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleStartEdit = ($2) => {
    setEditingQuestionId(q.id);
    setManualText(q.text);
    setManualOptions({ ...q.options });
    setManualCorrect(q.correct);
    setManualLevel(q.level);
    setManualExplanation(q.explanation || "");

    const formElement = document.getElementById("manual-question-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setManualText("");
    setManualOptions({ A: "", B: "", C: "", D: "" });
    setManualCorrect("A");
    setManualLevel("medium");
    setManualExplanation("");
    toast.info("Đã hủy chế độ chỉnh sửa câu hỏi.");
  };

  const handleAddManual = () => {
    if (!manualText.trim()) {
      toast.warning("Vui lòng nhập nội dung câu hỏi!");
      return;
    }
    if (!manualOptions.A.trim() || !manualOptions.B.trim() || !manualOptions.C.trim() || !manualOptions.D.trim()) {
      toast.warning("Vui lòng nhập đầy đủ nội dung cho cả 4 đáp án!");
      return;
    }

    if (editingQuestionId !== null) {
      setDraftQuestions(prev => prev.map(q => q.id === editingQuestionId ? {
        ...q,
        text: manualText,
        options: { ...manualOptions },
        correct: manualCorrect,
        level: manualLevel,
        explanation: manualExplanation
      } : q));
      setIsBankConfirmed(false);
      toast.success("Đã cập nhật câu hỏi thành công!");
      setEditingQuestionId(null);
    } else {
      if (draftQuestions.length >= 300) {
        toast.error("Ngân hàng câu hỏi chỉ chứa tối đa 300 câu!");
        return;
      }
      const newQuestion = {
        id: draftQuestions.length > 0 ? Math.max(...draftQuestions.map(q => q.id)) + 1 : 1,
        text: manualText,
        options: { ...manualOptions },
        correct: manualCorrect,
        level: manualLevel,
        explanation: manualExplanation
      };
      setDraftQuestions(prev => [...prev, newQuestion]);
      setIsBankConfirmed(false);
      toast.success("Đã thêm câu hỏi vào ngân hàng!");
    }

    // Reset manual form
    setManualText("");
    setManualOptions({ A: "", B: "", C: "", D: "" });
    setManualCorrect("A");
    setManualLevel("medium");
    setManualExplanation("");
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?")) {
      setDraftQuestions(prev => prev.filter(q => q.id !== id));
      setIsBankConfirmed(false);
      toast.success("Đã xóa câu hỏi!");
    }
  };

  const handleConfirmBank = () => {
    if (draftQuestions.length === 0) {
      toast.warning("Ngân hàng câu hỏi đang trống!");
      return;
    }
    if (draftQuestions.length > 300) {
      toast.error("Ngân hàng câu hỏi chỉ được chứa tối đa 300 câu!");
      return;
    }

    setValue("questionBank", draftQuestions);
    setIsBankConfirmed(true);
    toast.success(`Đã xác nhận duyệt thành công ${draftQuestions.length} câu hỏi! Tất cả các câu hỏi sẽ được lưu vào ngân hàng câu hỏi`);
  };

  // Filter preview questions
  const filteredQuestions = draftQuestions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || q.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-10 py-4 w-full">
      <div>
        <h3 className="text-xl font-bold text-foreground border-b border-border pb-3 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" />
          Tạo Ngân Hàng Câu Hỏi
        </h3>
        <p className="text-sm text-muted-foreground">
          Sử dụng AI để phân tích tài liệu bài giảng và tự động tạo ra ngân hàng câu hỏi.
        </p>
      </div>

      <div className="bg-muted border border-border rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <h4 className="text-md font-bold text-foreground mb-5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</div>
          Tạo Question Bank bằng AI
        </h4>

        <div className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-3">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                Upload tài liệu (PDF, DOCX,...)
              </label>
              <div
                className="border-2 border-dashed border-indigo-300 bg-white rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-indigo-50/50 hover:border-indigo-400 transition-colors cursor-pointer group h-[220px] relative"
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) { // 10MB
                        toast.error("Dung lượng file không được vượt quá 10MB");
                        return;
                      }
                      setAiFile(file);
                    }
                  }}
                />
                {aiFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-emerald-700">{aiFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(aiFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:text-indigo-500 transition-all">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-indigo-900">Kéo thả file vào đây hoặc nhấn để chọn</p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[280px]">
                      AI sẽ đọc và phân tích nội dung để tạo câu hỏi bám sát tài liệu bài giảng của bạn.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                Số lượng câu hỏi (Tối đa 100)
              </label>
              <div className="h-[220px] flex flex-col justify-between">
                <AppInput
                  type="number"
                  value={aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                  min={1}
                  max={100}
                  className="h-11 border-border bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold"
                />

                <div className="space-y-1.5 w-full">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Chọn cấp độ
                  </label>
                  <AppSelectRoot value={aiLevel} onValueChange={setAiLevel}>
                    <AppSelectTrigger className="w-full h-11 border-border bg-white text-xs font-bold focus:ring-indigo-500 focus:border-indigo-500">
                      <AppSelectValue placeholder="Chọn cấp độ" />
                    </AppSelectTrigger>
                    <AppSelectContent className="bg-white">
                      <AppSelectItem value="easy">Dễ</AppSelectItem>
                      <AppSelectItem value="medium">Trung bình</AppSelectItem>
                      <AppSelectItem value="hard">Khó</AppSelectItem>
                      <AppSelectItem value="mixed">Hỗn hợp (Trộn cấp độ)</AppSelectItem>
                    </AppSelectContent>
                  </AppSelectRoot>
                </div>

                <AppButton appVariant="gradient"
                  type="button"
                  onClick={handleCreateAI}
                  disabled={isGeneratingAi}
                  className="w-full h-12 text-sm font-bold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl gap-2 transition-all shadow-md shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Bắt Đầu Tạo Câu Hỏi Bằng AI
                    </>
                  )}
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="manual-question-form" className="bg-white border border-border rounded-2xl p-6 shadow-sm mt-8">
        <h4 className="text-md font-bold text-foreground mb-6 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-info/10 text-info text-info flex items-center justify-center text-xs font-bold">2</div>
            {editingQuestionId !== null ? "Hiệu Chỉnh Câu Hỏi" : "Thêm Câu Hỏi Thủ Công"}
          </div>
          {editingQuestionId !== null && (
            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 animate-pulse">
              Đang chỉnh sửa câu hỏi #{editingQuestionId}
            </span>
          )}
        </h4>
        <div className="space-y-5 border-b border-border pb-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Nội dung câu hỏi <span className="text-error">*</span>
            </label>
            <div className="rounded-xl border border-border overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all bg-white">
              <ReactQuill
                theme="snow"
                value={manualText}
                onChange={setManualText}
                modules={quillModules}
                placeholder="Nhập nội dung câu hỏi (hỗ trợ định dạng và chèn ảnh)..."
                className="[&_.ql-toolbar.ql-snow]:!border-0 [&_.ql-toolbar.ql-snow]:!border-b [&_.ql-toolbar.ql-snow]:!border-border [&_.ql-toolbar]:bg-muted [&_.ql-container.ql-snow]:!border-0 [&_.ql-container]:min-h-[100px] [&_.ql-editor]:min-h-[100px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-foreground font-sans"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Độ khó câu hỏi
            </label>
            <AppSelectRoot value={manualLevel} onValueChange={setManualLevel}>
              <AppSelectTrigger className="w-[180px] h-10 border-border bg-white text-xs font-bold focus:ring-indigo-500 focus:border-indigo-500">
                <AppSelectValue placeholder="Chọn độ khó" />
              </AppSelectTrigger>
              <AppSelectContent className="bg-white">
                <AppSelectItem value="easy">Dễ</AppSelectItem>
                <AppSelectItem value="medium">Trung bình</AppSelectItem>
                <AppSelectItem value="hard">Khó</AppSelectItem>
              </AppSelectContent>
            </AppSelectRoot>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Các đáp án & Chọn đáp án đúng <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div key={opt} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${manualCorrect === opt ? 'border-emerald-200 bg-emerald-50/30' : 'border-border bg-muted'}`}>
                  <div className="pt-2.5">
                    <input
                      type="radio"
                      name="correctAnswer"
                      className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-border cursor-pointer"
                      checked={manualCorrect === opt}
                      onChange={() => setManualCorrect(opt)}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${manualCorrect === opt ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                      {opt}
                    </span>
                    <AppInput
                      value={manualOptions[opt]}
                      onChange={(e) => setManualOptions({ ...manualOptions, [opt]: e.target.value })}
                      className={`h-10 pl-10 border-transparent bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm`}
                      placeholder={`Nhập đáp án ${opt}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Giải thích câu hỏi (Không bắt buộc)
            </label>
            <textarea
              value={manualExplanation}
              onChange={(e) => setManualExplanation(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border p-3 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm text-foreground transition-all font-sans placeholder:text-muted-foreground"
              placeholder="Nhập giải thích chi tiết tại sao đáp án đúng là chính xác..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {editingQuestionId !== null && (
              <AppButton appVariant="ghostMuted" variant="ghost"
                type="button"
                onClick={handleCancelEdit}
                className="h-11 px-6 font-bold border border-border text-muted-foreground rounded-xl"
              >
                Hủy Chỉnh Sửa
              </AppButton>
            )}
            <AppButton appVariant="gradient"
              type="button"
              onClick={handleAddManual}
              className={`h-11 px-8 font-bold text-white rounded-xl gap-2 shadow-md border-none ${editingQuestionId !== null
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
                  : 'bg-info hover:bg-info/90 shadow-blue-100'
                }`}
            >
              {editingQuestionId !== null ? (
                <>
                  <Save size={16} /> Cập Nhật Câu Hỏi
                </>
              ) : (
                <>
                  <Plus size={16} /> Thêm Vào Ngân Hàng
                </>
              )}
            </AppButton>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mt-8">
        <h4 className="text-md font-bold text-foreground mb-6 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">3</div>
            Question Bank Preview
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border flex items-center gap-1.5">
            Tổng số câu hỏi: <span className="text-indigo-600 font-extrabold">{draftQuestions.length}</span> / 300 câu
          </span>
        </h4>

        <div className="bg-white rounded-xl border border-border p-5 flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
            <div>
              <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                Danh sách câu hỏi
                <span className="bg-warning/10 text-warning text-warning text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Draft
                </span>
              </h5>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <AppInput
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 border-border text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-muted"
                />
              </div>
              <AppSelectRoot value={filterLevel} onValueChange={setFilterLevel}>
                <AppSelectTrigger className="w-[110px] h-9 border-border bg-muted text-xs font-bold focus:ring-indigo-500 focus:border-indigo-500">
                  <AppSelectValue placeholder="Độ khó" />
                </AppSelectTrigger>
                <AppSelectContent className="bg-white">
                  <AppSelectItem value="all">Tất cả</AppSelectItem>
                  <AppSelectItem value="easy">Dễ</AppSelectItem>
                  <AppSelectItem value="medium">Trung bình</AppSelectItem>
                  <AppSelectItem value="hard">Khó</AppSelectItem>
                </AppSelectContent>
              </AppSelectRoot>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-[500px] max-h-[800px]">
            {filteredQuestions.length === 0 ? (
              <div className="h-full py-20 flex flex-col justify-center items-center text-muted-foreground">
                <p className="text-sm font-bold">Không tìm thấy câu hỏi nào phù hợp!</p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div key={q.id} className="border border-border rounded-lg p-4 hover:border-indigo-200 transition-colors bg-muted">
                  <div className="text-sm font-bold text-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: `Câu ${idx + 1}: ${q.text}` }} />

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isCorrect = q.correct === opt;
                      return (
                        <div key={opt} className={`flex items-start gap-2 px-3 py-2 rounded-md ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-border'}`}>
                          {isCorrect ? (
                            <span className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {opt}
                            </span>
                          )}
                          <span className={`text-xs ${isCorrect ? 'text-emerald-700 font-bold' : 'text-muted-foreground'}`}>{q.options[opt]}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 p-3 bg-amber-50/50 border border-amber-100/60 rounded-xl text-xs text-amber-800 leading-relaxed">
                      <span className="font-bold flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Giải thích câu hỏi:
                      </span>
                      {q.explanation}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${q.level === 'easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        q.level === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                      {q.level === 'easy' ? 'Dễ' : q.level === 'medium' ? 'Trung bình' : 'Khó'}
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(q)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md bg-white border text-muted-foreground hover:text-amber-600 hover:border-amber-200 transition-colors ${editingQuestionId === q.id ? 'border-amber-500 bg-amber-50 text-amber-600 ring-1 ring-amber-500' : 'border-border'
                          }`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-border text-muted-foreground hover:text-error hover:border-error/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="text-center pt-2 pb-2">
              <p className="text-[11px] text-muted-foreground font-medium">Bạn có thể xem lại và chỉnh sửa trước khi xác nhận.</p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border">
            <AppButton appVariant="gradient"
              type="button"
              onClick={handleConfirmBank}
              disabled={isBankConfirmed || draftQuestions.length === 0}
              className={`w-full h-11 font-bold gap-2 disabled:opacity-75 disabled:cursor-not-allowed transition-all border ${
                isBankConfirmed 
                  ? "border-border bg-muted text-muted-foreground" 
                  : "border-success/20 bg-green-50 text-success hover:bg-success/10"
              }`}
            >
              {isBankConfirmed ? <Check size={18} /> : <CheckCircle2 size={18} />}
              {isBankConfirmed ? "Đã Xác Nhận Ngân Hàng Câu Hỏi" : "Xác Nhận Ngân Hàng Câu Hỏi"}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
}

const globalUploadProgress = {};
const uploadCallbacks = {};

function BackgroundVideoUploader({ label, value, onChange, onUploadStart, onUploadEnd, uploadVideoToBunny, id = "v-upload" }) {
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [processingProgress, setProcessingProgress] = React.useState(0);
  const [uploadPhase, setUploadPhase] = React.useState("idle"); // idle, uploading, processing, completed
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  // Lưu lại giá trị video gốc ban đầu khi component mới render (để không xóa nhầm video đã publish)
  const originalValueRef = React.useRef(value);

  // Effect để "kết nối" lại với tiến trình tải lên nếu có (khi quay lại tab)
  React.useEffect(() => {
    // Đăng ký callback để nhận cập nhật tiến trình mới nhất
    uploadCallbacks[id] = (state) => {
      if (typeof state === 'number') {
         setUploadProgress(state);
      } else if (state) {
         setUploadProgress(state.upload || 0);
         setProcessingProgress(state.processing || 0);
         setUploadPhase(state.phase || "idle");
      }
    };

    // Nếu đang có tiến trình chạy ngầm, lấy giá trị hiện tại ngay lập tức
    if (globalUploadProgress[id] !== undefined) {
      const state = globalUploadProgress[id];
      if (typeof state === 'number') {
         setUploadProgress(state);
      } else {
         setUploadProgress(state.upload || 0);
         setProcessingProgress(state.processing || 0);
         setUploadPhase(state.phase || "idle");
      }
    }

    return () => {
      delete uploadCallbacks[id];
    };
  }, [id]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Lớp bảo vệ 2: Nếu người dùng đang thay thế một video trung gian (vừa tải lên trong phiên này nhưng chưa lưu)
    // thì gọi Bunny xóa video cũ đi để tránh sinh rác
    if (typeof value === 'string' && value !== originalValueRef.current) {
       courseService.deleteVideoFromBunny(value).catch(err => console.error("Không thể dọn rác video cũ", err));
    }

    try {
      onChange(file);

      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      setProcessingProgress(0);
      setUploadPhase("uploading");
      
      const updateGlobalState = ($2) => {
         globalUploadProgress[id] = { upload: u, processing: p, phase };
         if (uploadCallbacks[id]) {
            uploadCallbacks[id]({ upload: u, processing: p, phase });
         }
      };

      updateGlobalState(0, 0, "uploading");
      onUploadStart();

      // Bước 1: Tải video lên Bunny.net sử dụng TUS Protocol
      const videoId = await uploadVideoToBunny(file, file.name, (pct) => {
        setUploadProgress(pct);
        updateGlobalState(pct, 0, "uploading");
      });

      // Upload xong 100%, chuyển phase
      setUploadProgress(100);
      setUploadPhase("processing");
      updateGlobalState(100, 0, "processing");

      // Bước 2: Bỏ qua tạo phụ đề tự động theo yêu cầu của user, hoàn thành luôn
      setProcessingProgress(100);
      setUploadPhase("completed");
      updateGlobalState(100, 100, "completed");

      await new Promise(resolve => setTimeout(resolve, 800)); // Giữ trạng thái 100% cho sướng mắt

      onChange(videoId);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Lỗi tải lên");
      toast.error(`Không thể tải lên ${label}`);
    } finally {
      setIsUploading(false);
      delete globalUploadProgress[id];
      onUploadEnd();
    }
  };

  const isCompleted = value && typeof value === 'string' && !isUploading;
  const isCurrentlyUploading = isUploading || (value instanceof File);

  return (
    <div
      onClick={() => !isUploading && document.getElementById(id).click()}
      className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all cursor-pointer group/upload
        ${isCompleted ? "border-success/20 bg-green-50/30" : isCurrentlyUploading ? "border-success/20 bg-green-50/10" : "border-border bg-muted hover:bg-secondary hover:border-success/20"}`}
    >
      <input
        type="file"
        id={id}
        className="hidden"
        accept="video/*"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {isCurrentlyUploading ? (
        <div className="flex flex-col items-center gap-2">
           <VideoProgressCircle 
              key={uploadPhase}
              progress={uploadPhase === "uploading" ? uploadProgress : processingProgress} 
              size={80} 
           />
           <p className={`text-[10px] font-bold text-center leading-tight animate-pulse ${uploadPhase === "uploading" ? "text-muted-foreground" : "text-success"}`}>
             {uploadPhase === "uploading" ? "ĐANG TIẾN HÀNH UPLOAD VIDEO..." : "ĐANG HOÀN TẤT..."}
           </p>
        </div>
      ) : isCompleted ? (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-success/10 text-success text-white flex items-center justify-center mb-2 shadow-sm">
            <Check className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-bold text-success uppercase tracking-tight">Tải lên hoàn tất</p>
          <p className="text-[9px] text-muted-foreground mt-1 truncate max-w-[150px]">ID: {value.substring(0, 12)}...</p>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-white text-slate-300 group-hover/upload:text-success flex items-center justify-center mb-2 shadow-sm border border-border transition-all">
            <Video size={20} />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground group-hover/upload:text-success transition-colors uppercase tracking-tight">
            Chạm để tải {label}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">MP4, MOV hoặc AVI</p>
        </>
      )}

      {error && <p className="absolute bottom-2 text-[9px] font-bold text-error">{error}</p>}
    </div>
  );
}

function CategoryCascader({ categories, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [activeParent, setActiveParent] = React.useState(null);

  let selectedName = "";
  if (value) {
    const valStr = value.toString();
    for (const p of categories) {
      if (p.id.toString() === valStr) { selectedName = p.name; break; }
      const child = p.subcategories?.find(c => c.id.toString() === valStr);
      if (child) {
        selectedName = child.name;
        break;
      }
    }
  }

  return (
    <AppPopover open={open} onOpenChange={setOpen}>
      <AppPopoverTrigger asChild>
        <button
          type="button"
          onClick={() => {
            if (!open) setActiveParent(null);
          }}
          className="flex h-11 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:border-warning/20 focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-warning/20 data-[state=open]:ring-1 data-[state=open]:ring-orange-500 transition-all font-sans"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {selectedName || "Chọn danh mục khóa học"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </AppPopoverTrigger>
      <AppPopoverContent className="w-auto p-0 flex flex-row items-start gap-1.5 border-none bg-transparent shadow-none" align="start" sideOffset={8}>
        {/* Cấp 1 */}
        <div className="w-[240px] max-h-[300px] overflow-y-auto py-2 bg-white rounded-md shadow-lg border border-border">
          {categories.map(parent => {
            const hasChildren = parent.subcategories && parent.subcategories.filter(c => c.status).length > 0;
            const isActive = activeParent?.id === parent.id;
            return (
              <div
                key={parent.id}
                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${isActive ? "text-warning bg-orange-50/50" : "text-foreground hover:text-warning hover:bg-orange-50/50"}`}
                onMouseEnter={() => setActiveParent(parent)}
                onClick={() => {
                  if (!hasChildren) {
                    onChange(parent.id.toString());
                    setOpen(false);
                  } else {
                    setActiveParent(parent);
                  }
                }}
              >
                <span>{parent.name}</span>
                {hasChildren && <ChevronRight className="h-4 w-4 opacity-70" />}
              </div>
            );
          })}
        </div>

        {/* Cấp 2 */}
        {activeParent && activeParent.subcategories && activeParent.subcategories.filter(c => c.status).length > 0 && (
          <div className="w-[240px] max-h-[300px] overflow-y-auto py-2 bg-white rounded-md shadow-lg border border-border">
            {activeParent.subcategories.filter(c => c.status).map(child => (
              <div
                key={child.id}
                className="px-4 py-2.5 text-sm cursor-pointer text-foreground hover:text-warning hover:bg-orange-50/50 transition-colors"
                onClick={() => {
                  onChange(child.id.toString());
                  setOpen(false);
                }}
              >
                {child.name}
              </div>
            ))}
          </div>
        )}
      </AppPopoverContent>
    </AppPopover>
  );
}

export function CheckIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

// ------------------------------------------
// XỬ LÝ NESTED TAB CHO CURRICULUM
// ------------------------------------------

function MediaTab({ uploadVideoToBunny, setActiveUploads }) {
  const { setValue, watch, formState: { errors } } = useFormContext();
  const thumbnail = watch("thumbnail");

  return (
    <div className="space-y-8 w-full">
      <div>
        <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 mb-4">
          Hình Ảnh & Media
        </h3>
        <p className="text-xs text-muted-foreground">
          Giới thiệu khóa học một cách trực quan để thu hút học viên.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 text-center">
            Ảnh đại diện khóa học (Thumbnail) <span className="text-error">*</span>
          </label>
          <input
            type="file"
            id="thumbnail-upload"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) setValue("thumbnail", file, { shouldValidate: true });
            }}
          />
          <div
            onClick={() => document.getElementById("thumbnail-upload").click()}
            className={`aspect-video rounded-xl bg-muted border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all cursor-pointer group ${thumbnail ? "border-success/20 bg-green-50" : "border-border hover:bg-secondary hover:border-success/20"}`}
          >
            {thumbnail && (thumbnail instanceof File || typeof thumbnail === "string") ? (
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <img
                  src={typeof thumbnail === "string" ? thumbnail : URL.createObjectURL(thumbnail)}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <p className="text-white text-xs font-bold px-3 py-1.5 bg-success/10 text-success rounded-full">Đổi ảnh</p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`w-12 h-12 rounded-full bg-white flex items-center justify-center text-muted-foreground group-hover:text-success shadow-sm border border-border mb-2 ${thumbnail ? "text-success" : ""}`}
                >
                  {thumbnail ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </div>
                <p className="text-[11px] font-bold text-muted-foreground">
                  {thumbnail ? "Đã chọn ảnh" : "Nhấn để tải lên (1280x720)"}
                </p>
                {thumbnail && (
                  <p className="text-[9px] text-muted-foreground mt-1 truncate max-w-[200px]">
                    {thumbnail.name || (typeof thumbnail === 'string' ? "Đã có ảnh" : "")}
                  </p>
                )}
              </>
            )}
          </div>
          {errors.thumbnail && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1 text-center">{errors.thumbnail.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 text-center">
            Video giới thiệu (Promo Video) (Nếu có)
          </label>
          <Controller
            name="promoVideo"
            render={({ field }) => (
              <BackgroundVideoUploader
                label="video giới thiệu"
                value={field.value}
                onChange={field.onChange}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadEnd={() => setActiveUploads(prev => prev - 1)}
                uploadVideoToBunny={uploadVideoToBunny}
                id="promo-video-uploader"
              />
            )}
          />
          {errors.promoVideo && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1 text-center">{errors.promoVideo.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingTab() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const price = watch("price") || 0;
  const discount = watch("discount") || 0;
  const finalPrice = price - (price * discount) / 100;

  return (
    <div className="space-y-8 py-4 w-full">
      <div>
        <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 mb-4">
          Định giá & Cài đặt
        </h3>
        <p className="text-xs text-muted-foreground">
          Thiết lập giá bán và các chương trình ưu đãi cho học viên.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Ô nhập giá gốc - Format TRỰC TIẾP */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Giá bán thực tế (VNĐ) <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Controller
                name="price"
                control={useFormContext().control}
                render={({ field }) => (
                  <AppInput
                    className="h-11 border-border focus:border-success/20 font-bold pl-10"
                    placeholder="Ví dụ: 500.000"
                    value={field.value ? new Intl.NumberFormat("vi-VN").format(field.value) : ""}
                    onChange={(e) => {
                      // Chỉ lấy số từ chuỗi nhập vào
                      const rawValue = e.target.value.replace(/\D/g, "");
                      field.onChange(rawValue ? Number(rawValue) : "");
                    }}
                  />
                )}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₫</span>
            </div>
            {errors.price && (
              <p className="text-xs font-bold text-error mt-1.5 pl-1">{errors.price.message}</p>
            )}
          </div>

          {/* Ô hiển thị tổng tiền sau khi giảm */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-success uppercase tracking-widest pl-1">
              Tổng tiền sau giảm (Hiển thị cho học viên)
            </label>
            <div className="relative">
              <AppInput
                className="h-11 border-success/20 bg-green-50/30 text-success font-bold text-lg pl-10 cursor-not-allowed"
                value={new Intl.NumberFormat("vi-VN").format(finalPrice)}
                readOnly
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-success font-bold text-sm">₫</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ô nhập % giảm giá */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Phần trăm giảm giá (%)
            </label>
            <div className="relative">
              <AppInput
                type="number"
                className="h-11 border-border focus:border-success/20 font-bold pl-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0 - 100"
                {...register("discount")}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">%</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium pl-1 italic">
              Giảm {discount}% tương đương giảm {new Intl.NumberFormat("vi-VN").format(price * discount / 100)}₫
            </p>
            {errors.discount && (
              <p className="text-xs font-bold text-error mt-1.5 pl-1">{errors.discount.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionItem({ sectionIndex, control, uploadVideoToBunny, setActiveUploads }) {
  const { slug } = useParams();
  const {
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();

  const localStorageKey = `course_questions_${slug || 'new'}`;

  const [isQuizModalOpen, setIsQuizModalOpen] = React.useState(false);
  const [quizTitle, setQuizTitle] = React.useState("");
  const [selectedQuizQuestions, setSelectedQuizQuestions] = React.useState([]);
  const [bankQuestions, setBankQuestions] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterLevel, setFilterLevel] = React.useState("all");


  // Load real bank questions and pre-populate quiz data when modal opens
  React.useEffect(() => {
    if (isQuizModalOpen) {
      // 1. Load ONLY CONFIRMED questions from top-level form state
      const confirmedBank = getValues("questionBank") || [];
      setBankQuestions(confirmedBank);

      // 2. Load existing quiz data from form state
      const savedQuiz = getValues(`sections.${sectionIndex}.quiz`);
      if (savedQuiz) {
        setQuizTitle(savedQuiz.title || "");
        setSelectedQuizQuestions(savedQuiz.questionIds || []);
      } else {
        setQuizTitle("");
        setSelectedQuizQuestions([]);
      }
    }
  }, [isQuizModalOpen, localStorageKey, sectionIndex, getValues]);

  const handleSaveQuiz = ($2) => {
    if (!quizTitle.trim()) {
      toast.error("Vui lòng nhập tên bài Quiz!");
      return;
    }
    if (selectedQuizQuestions.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 câu hỏi từ Ngân hàng!");
      return;
    }

    setValue(`sections.${sectionIndex}.quiz`, {
      title: quizTitle,
      duration: 15,
      passingScore: 8.0,
      maxAttempts: 3,
      questionIds: selectedQuizQuestions
    }, { shouldDirty: true });

    toast.success(`Đã lưu bài Quiz "${quizTitle}" vào Chương thành công!`);
    setIsQuizModalOpen(false);
  };

  const handleCancelQuiz = () => {
    if (quizTitle.trim() || selectedQuizQuestions.length > 0) {
      if (window.confirm("Bạn có chắc chắn muốn hủy? Mọi thay đổi sẽ không được lưu.")) {
        setIsQuizModalOpen(false);
        setQuizTitle("");
        setSelectedQuizQuestions([]);
      }
    } else {
      setIsQuizModalOpen(false);
    }
  };

  const currentCourseStatus = watch("status") ?? 1;
  const currentSectionStatus = watch(`sections.${sectionIndex}.status`) ?? 1;

  const filteredQuestions = bankQuestions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || q.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.lessons`,
  });

  return (
    /* Vùng cuộn cho TOÀN BỘ nội dung của một chương - pt-12 đảm bảo không bị Header che mất Label */
    <div className="max-h-[650px] overflow-y-auto px-6 pt-12 pb-12 custom-scrollbar space-y-7 overscroll-contain">
      <div className="h-2" /> {/* Spacer extra giúp né Header Accordion */}
      {/* Tên Chương */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
          Tiêu đề chương <span className="text-error">*</span>
        </label>
        <AppInput
          className="h-10 border-border focus:border-success/20 font-bold shadow-sm"
          placeholder="Vd: Chương 1: Giới thiệu tổng quan"
          {...register(`sections.${sectionIndex}.title`)}
          autoComplete="off"
        />
        {errors.sections?.[sectionIndex]?.title && (
          <p className="text-xs font-bold text-error mt-1 pl-1">
            {errors.sections[sectionIndex].title.message}
          </p>
        )}
      </div>

      {/* Attachments & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Tài liệu đính kèm (PDF, ZIP,...) (Nếu có)
          </label>
          <div className="flex flex-col gap-3">
            <Controller
              name={`sections.${sectionIndex}.attachments`}
              control={control}
              render={({ field }) => (
                field.value && typeof field.value === "string" ? (
                  <div className="flex items-center gap-2 p-2 border border-success/20 rounded-md bg-green-50/50 h-10">
                    <span className="text-xs text-success font-bold flex-1 truncate">Đã có tài liệu</span>
                    <a href={field.value} target="_blank" rel="noreferrer" className="text-xs text-info hover:underline px-2 border-r border-success/20">Xem file</a>
                    <button
                      type="button"
                      className="text-xs font-bold text-error hover:text-error px-2"
                      onClick={() => field.onChange(null)}
                    >
                      Đổi file khác
                    </button>
                  </div>
                ) : (
                  <AppInput
                    type="file"
                    className="h-10 text-xs pt-2 cursor-pointer w-full"
                    onChange={(e) => field.onChange(e.target.files[0])}
                  />
                )
              )}
            />
            {watch(`sections.${sectionIndex}.quiz.questionIds`)?.length > 0 ? (
              <AppButton appVariant="gradient"
                type="button"
                onClick={() => setIsQuizModalOpen(true)}
                className="w-full h-10 border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 font-bold gap-2 shadow-sm transition-all border"
              >
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Đã có bài Quiz ({watch(`sections.${sectionIndex}.quiz.questionIds`).length} câu) - Chỉnh sửa</span>
              </AppButton>
            ) : (
              <AppButton appVariant="gradient"
                type="button"
                onClick={() => setIsQuizModalOpen(true)}
                className="w-full h-10 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 font-bold gap-2 border-dashed bg-transparent shadow-none"
              >
                <Database size={16} />
                Tạo bài Quiz cho chương này
              </AppButton>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Trạng thái chương <span className="text-error">*</span>
          </label>
          <Controller
            name={`sections.${sectionIndex}.status`}
            control={control}
            render={({ field }) => (
              <AppSelectRoot
                onValueChange={(val) => {
                  const newStatus = Number(val);

                  // Ràng buộc Business: Nếu khóa học đang ẩn, không cho phép bật chương hoạt động
                  if (currentCourseStatus === 2 && newStatus === 1) {
                    toast.warning("Khóa học đang Ẩn, không thể bật trạng thái Hoạt động cho chương.");
                    return;
                  }

                  field.onChange(newStatus);

                  // Đồng bộ trạng thái từ Chương -> Bài học
                  const currentLessons = getValues(`sections.${sectionIndex}.lessons`) || [];
                  const updatedLessons = currentLessons.map(l => ({
                    ...l,
                    status: newStatus
                  }));

                  setValue(`sections.${sectionIndex}.lessons`, updatedLessons, { shouldDirty: true });
                }}
                value={(field.value ?? 1).toString()}
              >
                <AppSelectTrigger className="h-10 border-border focus:border-success/20 font-medium bg-white">
                  <AppSelectValue placeholder="Chọn trạng thái" />
                </AppSelectTrigger>
                <AppSelectContent className="bg-white">
                  <AppSelectItem value="1" disabled={currentCourseStatus === 2}>Hoạt động {currentCourseStatus === 2 && "(Bị khóa)"}</AppSelectItem>
                  <AppSelectItem value="2">Ẩn</AppSelectItem>
                </AppSelectContent>
              </AppSelectRoot>
            )}
          />
        </div>
      </div>

      {/* Danh sách Bài học */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Danh Sách Bài Học ({fields.length})
          </label>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-bold text-success hover:text-success bg-green-50 hover:bg-success/10 text-success px-2 py-1.5 rounded-md transition-colors"
            onClick={() => append({
              title: "",
              content: "",
              videoFile: null,
              status: currentSectionStatus,
              createdAt: new Date().toISOString(),
              updatedAt: null
            })}
          >
            <Plus size={14} /> Bài học mới
          </button>
        </div>

        <div className="space-y-6 pb-4 pt-2 border-t border-slate-50 mt-3">
          {fields.map((lesson, lessonIdx) => (
            <div
              key={lesson.id}
              className="group flex gap-4 p-5 border border-border rounded-2xl bg-white hover:border-success/20 hover:shadow-lg transition-all duration-300 relative"
            >


              <div className="pt-1 text-slate-300 cursor-grab active:cursor-grabbing hover:text-muted-foreground">
                <GripVertical size={20} />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Information (Title + Description + Dates) */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                      Tiêu đề bài học <span className="text-error">*</span>
                    </label>
                    <AppInput
                      className="h-10 font-bold border-border focus:ring-0 focus:border-success/20 transition-all text-foreground"
                      placeholder={`Ví dụ: Bài giảng số ${lessonIdx + 1}: Giới thiệu ngôn ngữ`}
                      {...register(`sections.${sectionIndex}.lessons.${lessonIdx}.title`)}
                      autoComplete="off"
                    />
                    {errors.sections?.[sectionIndex]?.lessons?.[lessonIdx]?.title && (
                      <p className="text-[10px] font-bold text-error pl-1">{errors.sections[sectionIndex].lessons[lessonIdx].title.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                      Mô tả nội dung bài học
                    </label>
                    <AppTextarea
                      className="min-h-[80px] text-xs resize-none border-border focus:ring-0 focus:border-success/20"
                      placeholder="Một đoạn mô tả ngắn về những gì học viên sẽ được học trong bài này..."
                      {...register(`sections.${sectionIndex}.lessons.${lessonIdx}.content`)}
                    />
                    {errors.sections?.[sectionIndex]?.lessons?.[lessonIdx]?.content && (
                      <p className="text-[10px] font-bold text-error pl-1">{errors.sections[sectionIndex].lessons[lessonIdx].content.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                      Trạng thái bài học <span className="text-error">*</span>
                    </label>
                    <Controller
                      name={`sections.${sectionIndex}.lessons.${lessonIdx}.status`}
                      control={control}
                      render={({ field }) => (
                        <AppSelectRoot
                          onValueChange={(val) => {
                            const newStatus = Number(val);

                            // Ràng buộc Business: Nếu chương đang ẩn, không cho phép bật bài học hoạt động
                            if (currentSectionStatus === 2 && newStatus === 1) {
                              toast.warning("Chương đang Ẩn, không thể bật trạng thái Hoạt động cho bài học.");
                              return;
                            }

                            field.onChange(newStatus);
                          }}
                          value={(field.value ?? 1).toString()}
                        >
                          <AppSelectTrigger className="h-9 border-border focus:border-success/20 font-medium bg-white text-xs">
                            <AppSelectValue placeholder="Chọn trạng thái" />
                          </AppSelectTrigger>
                          <AppSelectContent className="bg-white">
                            <AppSelectItem value="1" disabled={currentSectionStatus === 2}>Hoạt động {currentSectionStatus === 2 && "(Bị khóa)"}</AppSelectItem>
                            <AppSelectItem value="2">Ẩn</AppSelectItem>
                          </AppSelectContent>
                        </AppSelectRoot>
                      )}
                    />
                  </div>
                </div>

                {/* Right side: Video Upload Box */}
                <div className="space-y-1.5 flex flex-col justify-between">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                    Video bài học
                  </label>
                  <Controller
                    name={`sections.${sectionIndex}.lessons.${lessonIdx}.videoFile`}
                    control={control}
                    render={({ field }) => (
                      <BackgroundVideoUploader
                        label="video bài học"
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val);
                          setValue(`sections.${sectionIndex}.lessons.${lessonIdx}.videoUrl`, val);
                        }}
                        onUploadStart={() => setActiveUploads(prev => prev + 1)}
                        onUploadEnd={() => setActiveUploads(prev => prev - 1)}
                        uploadVideoToBunny={uploadVideoToBunny}
                        id={`lesson-v-${sectionIndex}-${lessonIdx}`}
                      />
                    )}
                  />
                  {errors.sections?.[sectionIndex]?.lessons?.[lessonIdx]?.videoFile && (
                    <p className="text-[10px] font-bold text-error pl-1">{errors.sections[sectionIndex].lessons[lessonIdx].videoFile.message}</p>
                  )}
                </div>
              </div>

              {/* Nút Xóa bài học */}
              <button
                type="button"
                onClick={() => remove(lessonIdx)}
                className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-white border border-border text-muted-foreground hover:text-error hover:border-error/20 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-md z-30"
                title="Xóa bài học"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Error level Section */}
      {errors.sections?.[sectionIndex]?.lessons?.root && (
        <p className="text-xs font-bold text-error bg-red-50 p-2 rounded-md mt-2">
          {errors.sections[sectionIndex].lessons.root.message}
        </p>
      )}

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-muted/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" />
                Tạo Bài Quiz - Chương {sectionIndex + 1}
              </h3>
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="p-6 flex flex-col flex-1 overflow-hidden space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[580px] overflow-hidden">
                {/* L Pane: Bài Quiz */}
                <div className="flex flex-col gap-4 overflow-hidden h-full">
                  <div className="space-y-2 shrink-0">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Tên bài Quiz <span className="text-error">*</span>
                    </label>
                    <AppInput
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Ví dụ: Kiểm tra kiến thức chương"
                      className="h-11 border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold bg-white"
                    />
                  </div>

                  <div className="border border-border rounded-xl flex flex-col flex-1 overflow-hidden bg-white shadow-sm">
                    <div className="bg-indigo-50/50 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-indigo-900 block">Nội dung bài Quiz</span>
                        <span className="text-[11px] text-indigo-600 font-bold">{selectedQuizQuestions.length} câu hỏi được chọn</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-muted">
                      {selectedQuizQuestions.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center text-muted-foreground border-dashed border-2 border-border rounded-xl p-8 bg-white">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                            <ListOrdered className="w-6 h-6 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-muted-foreground">Chưa có câu hỏi nào</p>
                          <p className="text-xs mt-1 text-muted-foreground text-center">Hãy tick chọn câu hỏi từ Ngân hàng bên phải.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedQuizQuestions.map((qId, idx) => {
                            const qDetails = bankQuestions.find(item => item.id === qId);
                            return (
                              <div key={qId} className="border border-indigo-500/20 rounded-lg p-3 bg-white shadow-sm flex items-center justify-between gap-3 hover:border-error/20 transition-colors">
                                <div className="flex gap-3 items-start flex-1">
                                  <div className="pt-0.5 shrink-0">
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-xs font-bold text-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: qDetails?.text || "Đang tải câu hỏi..." }} />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedQuizQuestions(selectedQuizQuestions.filter(id => id !== qId))}
                                  className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-error hover:bg-red-50 transition-all shrink-0"
                                  title="Xóa khỏi bài Quiz"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* R Pane: Question Bank */}
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="h-[24px] shrink-0"></div>
                  <div className="border border-border rounded-xl flex flex-col flex-1 overflow-hidden bg-white shadow-sm">
                    <div className="bg-muted px-4 py-3 border-b border-border flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-foreground block">Ngân Hàng Câu Hỏi</span>
                          <span className="text-[11px] text-muted-foreground font-medium">Chọn câu hỏi để thêm</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <AppInput 
                            placeholder="Tìm kiếm theo từ khóa..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 h-8 text-xs border-border bg-white focus:ring-indigo-500 focus:border-indigo-500" 
                          />
                        </div>
                        <select 
                          value={filterLevel} 
                          onChange={(e) => setFilterLevel(e.target.value)}
                          className="w-[110px] h-8 border border-border bg-white text-xs font-bold rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm text-foreground"
                        >
                          <option value="all">Tất cả độ khó</option>
                          <option value="easy">Dễ</option>
                          <option value="medium">Trung bình</option>
                          <option value="hard">Khó</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                      {filteredQuestions.length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">Không tìm thấy câu hỏi phù hợp trong ngân hàng.</div>
                      ) : (
                        filteredQuestions.map((q) => (
                          <div key={q.id} className="border border-border rounded-lg p-3 hover:border-indigo-200 transition-colors flex gap-3 cursor-pointer group bg-white">
                            <div className="pt-0.5">
                              <input
                                type="checkbox"
                                checked={selectedQuizQuestions.includes(q.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedQuizQuestions([...selectedQuizQuestions, q.id]);
                                  } else {
                                    setSelectedQuizQuestions(selectedQuizQuestions.filter(id => id !== q.id));
                                  }
                                }}
                                className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.text }} />

                              <div className="mt-3 grid grid-cols-1 gap-2">
                                {["A", "B", "C", "D"].map((opt) => {
                                  const isCorrect = q.correct === opt;
                                  return (
                                    <div key={opt} className={`flex items-start gap-2 px-2.5 py-1.5 rounded border ${
                                      isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold" : "bg-muted border-border text-muted-foreground"
                                    }`}>
                                      <span className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5 ${
                                        isCorrect ? "bg-emerald-500 text-white" : "bg-indigo-50 text-indigo-600"
                                      }`}>
                                        {isCorrect ? <Check size={10} strokeWidth={3} /> : opt}
                                      </span>
                                      <span className="text-[11px]">{q.options[opt]}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <span className={`text-[10px] border px-2 py-0.5 rounded font-bold uppercase ${
                                  q.level === "hard" ? "text-error bg-red-50 border-error/20" :
                                  q.level === "medium" ? "text-amber-600 bg-amber-50 border-amber-100" :
                                  "text-success bg-green-50 border-success/20"
                                }`}>
                                  {q.level === "hard" ? "Khó" : q.level === "medium" ? "Trung bình" : "Dễ"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted flex justify-end gap-3">
              <AppButton appVariant="ghostMuted" variant="ghost" type="button" onClick={handleCancelQuiz} className="h-11 px-6 font-bold border border-border bg-white hover:bg-secondary text-muted-foreground">
                Hủy
              </AppButton>
              <AppButton appVariant="gradient" type="button" onClick={handleSaveQuiz} className="h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md shadow-indigo-100 border-none">
                <Save size={16} />
                Lưu Bài Quiz
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoProgressCircle({ progress, size = 60 }) {
  const radius = size * 0.4;
  const stroke = size * 0.08;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#22c55e"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-success">{progress}%</span>
    </div>
  );
}




















export default function InstructorCourseForm() {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [showAiReportModal, setShowAiReportModal] = React.useState(false);

  const {
    methods,
    isEditMode,
    slug,
    activeTab,
    setActiveTab,
    isUploading,
    // eslint-disable-next-line no-unused-vars
    setIsUploading,
    uploadStatus,
    // eslint-disable-next-line no-unused-vars
    setUploadStatus,
    activeUploads,
    setActiveUploads,
    isSavingDraft,
    showDraftModal,
    setShowDraftModal,
    categories,
    saveDraft,
    restoreDraft,
    handleExitWithConfirmation,
    // eslint-disable-next-line no-unused-vars
    isSubmittingRef,
    uploadVideoToBunny,
    onSubmit
  } = useInstructorCourseForm(courseSchema, viErrorMap);

  const { isPreScanning, handlePreScanWholeCourse } = useCourseAiPreScan(methods);

  const overallAiReport = methods.watch("aiModerationReport");

  const onError = (errors) => {
    toast.error("Vui lòng kiểm tra lại thông tin trên form!");
    console.log("Validation Errors:", errors);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExitWithConfirmation}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {isEditMode ? "Chỉnh Sửa Khóa Học" : "Tạo Mới Khóa Học"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Thiết lập thông tin nền tảng, thiết kế nội dung và định giá
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 transition-all">
          {(isUploading || activeUploads > 0) && (
            <div className="flex flex-col items-end mr-4">
              <span className="text-sm font-bold text-success animate-pulse mb-1">
                {activeUploads > 0 ? `Đang tải ${activeUploads} video...` : uploadStatus}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {isSavingDraft && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium animate-pulse mr-2">
                <Save className="w-3.5 h-3.5" />
                <span>Đang lưu...</span>
              </div>
            )}

            <AppButton appVariant="ghostMuted" variant="ghost"
              type="button"
              onClick={() => setShowAiReportModal(true)}
              className={`h-9 sm:h-10 px-3 sm:px-5 rounded-xl font-bold border shadow-sm text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 shrink-0 ${
                (() => {
                  try {
                    const rep = overallAiReport ? JSON.parse(overallAiReport) : null;
                    if (!rep) return "text-muted-foreground bg-muted border-border border-dashed";
                    const sc = rep.safetyScore ?? 100;
                    const hasV = rep.violations && rep.violations.length > 0;
                    if (sc < 70 || hasV) return "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 animate-pulse shadow-rose-100/40 shadow-lg";
                    return "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200";
                  // eslint-disable-next-line no-unused-vars
                  } catch(e) { return "text-muted-foreground border-border"; }
                })()
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Kết quả kiểm duyệt AI</span>
              <span className="md:hidden">AI Report</span>
            </AppButton>

            <AppButton appVariant="ghostMuted" variant="ghost"
              type="button"
              className="h-9 sm:h-10 px-3 sm:px-5 font-bold border border-border text-muted-foreground hover:bg-muted shadow-none text-xs sm:text-sm"
              onClick={handleExitWithConfirmation}
            >
              Hủy
            </AppButton>

            <AppButton appVariant="ghostMuted" variant="ghost"
              type="button"
              disabled={isSavingDraft || isUploading}
              className="h-9 sm:h-10 px-3 sm:px-5 font-bold border border-info/20 text-info hover:bg-blue-50 shadow-none text-xs sm:text-sm flex items-center gap-2"
              onClick={() => saveDraft(methods.getValues(), true)}
            >
              {isSavingDraft ? (
                <div className="w-4 h-4 border-2 border-info/20 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={16} />
              )}
              Lưu bản nháp
            </AppButton>
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
          <div className="px-6 mb-12">
            <CourseStepper activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <AppTabsRoot value={activeTab} onValueChange={setActiveTab} className="w-full">
            <AppTabsContent value="basic" className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm mt-0">
              <BasicInfoTab categories={categories} />
            </AppTabsContent>

            <AppTabsContent value="quiz" className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm mt-0">
              <QuizTab courseId={methods.watch("id")} />
            </AppTabsContent>

            <AppTabsContent value="curriculum" className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm mt-0">
              <CurriculumTab uploadVideoToBunny={uploadVideoToBunny} setActiveUploads={setActiveUploads} />
            </AppTabsContent>

            <AppTabsContent value="settings" className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm mt-0">
              <SettingsTab uploadVideoToBunny={uploadVideoToBunny} setActiveUploads={setActiveUploads} />
            </AppTabsContent>
          </AppTabsRoot>

          <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeTab !== "basic" && (
                <button
                  type="button"
                  onClick={() => {
                    const sequence = ["basic", "quiz", "curriculum", "settings"];
                    const currentIdx = sequence.indexOf(activeTab);
                    if (currentIdx > 0) setActiveTab(sequence[currentIdx - 1]);
                  }}
                  className="flex items-center gap-2 h-11 px-5 rounded-lg font-bold text-muted-foreground hover:bg-secondary transition-all"
                >
                  <ArrowLeft size={18} /> Quay lại
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeTab !== "settings" ? (
                <button
                  type="button"
                  onClick={() => {
                    const sequence = ["basic", "quiz", "curriculum", "settings"];
                    const currentIdx = sequence.indexOf(activeTab);
                    if (currentIdx < sequence.length - 1) setActiveTab(sequence[currentIdx + 1]);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 h-11 px-8 rounded-lg font-bold bg-success text-white hover:bg-success/90 transition-all shadow-lg shadow-green-100"
                >
                  Tiếp theo <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <AppButton appVariant="ghostMuted" variant="ghost"
                    type="button"
                    onClick={() => setShowAiReportModal(true)}
                    className="h-11 px-6 rounded-xl font-bold border border-border shadow-sm text-xs sm:text-sm flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Kết quả kiểm duyệt AI
                  </AppButton>

                  <button
                    type="button"
                    disabled={activeUploads > 0}
                    onClick={methods.handleSubmit(onSubmit, onError)}
                    className="flex items-center gap-2 h-11 px-8 rounded-lg font-bold bg-success text-white hover:bg-success/90 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                  >
                    <CircleFadingArrowUp size={18} /> {activeUploads > 0 ? "Đang tải video..." : "Xuất bản"}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>

        {isUploading && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
            <div className="bg-muted text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10">
              <Loader2 className="w-6 h-6 animate-spin text-success" />
              <div className="flex-1">
                <p className="text-sm font-bold">{uploadStatus}</p>
                <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-success/10 text-success h-full transition-all duration-300" style={{ width: '45%' }} />
                </div>
              </div>
              {activeUploads > 0 && (
                <div className="bg-muted px-2 py-1 rounded text-[10px] font-bold text-muted-foreground uppercase">
                  {activeUploads} Files
                </div>
              )}
            </div>
          </div>
        )}

        <CourseDraftModal 
          showDraftModal={showDraftModal} 
          setShowDraftModal={setShowDraftModal} 
          slug={slug} 
          restoreDraft={restoreDraft} 
        />
        
        <CourseAiReportModal 
          showAiReportModal={showAiReportModal} 
          setShowAiReportModal={setShowAiReportModal} 
          overallAiReport={overallAiReport} 
          isPreScanning={isPreScanning} 
          handlePreScanWholeCourse={handlePreScanWholeCourse} 
        />
      </FormProvider>
    </div>
  );
}

