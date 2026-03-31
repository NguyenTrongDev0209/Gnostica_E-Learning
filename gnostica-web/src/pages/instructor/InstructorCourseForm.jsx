import React from "react";
import { useForm, FormProvider, useFieldArray, useFormContext, useWatch, Controller } from "react-hook-form";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, GripVertical, Save, ArrowLeft, ArrowRight, Video, CircleFadingArrowUp } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ==========================================
// THIẾT LẬP ZOD SCHEMA
// ==========================================
const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Tên bài học không được để trống"),
  videoUrl: z.string().optional(),
});

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Tên chương không được để trống"),
  lessons: z.array(lessonSchema).min(1, "Chương này phải có ít nhất 1 bài học"),
});

export const courseSchema = z.object({
  title: z.string().min(1, "Tên khóa học là bắt buộc"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  level: z.string().min(1, "Vui lòng chọn cấp độ"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Giá không hợp lệ"),
  sections: z.array(sectionSchema).min(1, "Cần có ít nhất 1 chương học"),
  thumbnail: z.any().optional(),
  promoVideo: z.any().optional(),
});

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function InstructorCourseForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("basic");

  const methods = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      level: "",
      description: "",
      price: 0,
      sections: [{ title: "", lessons: [{ title: "" }] }],
      thumbnail: null,
      promoVideo: null,
    },
  });

  const onSubmit = (data) => {
    console.log("Xử lý gọi API Submit:", data);
    toast.success("Đã lưu khóa học thành công!");
    // setTimeout(() => navigate("/instructor/courses"), 1500);
  };

  const onError = (errors) => {
    toast.error("Vui lòng kiểm tra lại thông tin trên form!");
    console.log(errors);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/instructor/courses")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tạo Mới Khóa Học</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Thiết lập thông tin nền tảng, thiết kế nội dung và định giá
            </p>
          </div>
        </div>
        <button
          onClick={methods.handleSubmit(onSubmit, onError)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold h-10 px-6 rounded-lg shadow-none transition-colors"
        >
          <Save size={18} /> Lưu nháp
        </button>
      </div>

      {/* Form Area */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
          <div className="px-6 mb-12">
            <CourseStepper activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="basic" className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0">
              <BasicInfoTab />
            </TabsContent>

            <TabsContent value="curriculum" className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0">
              <CurriculumTab />
            </TabsContent>

            <TabsContent value="media" className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0">
              <MediaTab />
            </TabsContent>

            <TabsContent value="pricing" className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0">
              <PricingTab />
            </TabsContent>
          </Tabs>

          {/* Navigation Footer */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeTab !== "basic" && (
                <button
                  type="button"
                  onClick={() => {
                    const sequence = ["basic", "curriculum", "media", "pricing"];
                    const currentIdx = sequence.indexOf(activeTab);
                    if (currentIdx > 0) setActiveTab(sequence[currentIdx - 1]);
                  }}
                  className="flex items-center gap-2 h-11 px-5 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  <ArrowLeft size={18} /> Quay lại
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeTab !== "pricing" ? (
                <button
                  type="button"
                  onClick={() => {
                    const sequence = ["basic", "curriculum", "media", "pricing"];
                    const currentIdx = sequence.indexOf(activeTab);
                    if (currentIdx < sequence.length - 1) setActiveTab(sequence[currentIdx + 1]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 h-11 px-8 rounded-lg font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-100"
                >
                  Tiếp theo <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={methods.handleSubmit(onSubmit, onError)}
                  className="flex items-center gap-2 h-11 px-8 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                >
                  <CircleFadingArrowUp size={18} /> Xuất bản
                </button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

function CourseStepper({ activeTab, onTabChange }) {
  const { control } = useFormContext();

  // Watch only necessary fields for performance
  const formValues =
    useWatch({
      control,
      name: ["title", "description", "sections", "thumbnail", "promoVideo", "price"],
    }) || [];

  const steps = React.useMemo(() => {
    // Basic Info Progress
    const basicFields = [formValues[0], formValues[1]];
    const basicFilled = basicFields.filter(f => f && f.length > 0).length;
    const basicPercent = (basicFilled / 2) * 100;

    // Curriculum Progress (at least one section with title)
    const sections = formValues[2] || [];
    const curriculumPercent = sections.some(s => s.title && s.title.length > 0) ? 100 : 0;

    // Media Progress (thumbnail and promoVideo)
    const mediaFields = [formValues[3], formValues[4]];
    const mediaFilled = mediaFields.filter(f => f !== null && f !== undefined).length;
    const mediaPercent = (mediaFilled / 2) * 100;

    // Pricing Progress
    const price = formValues[5];
    const pricingPercent = (price && price > 0) ? 100 : 0;

    return [
      { id: "basic", label: "Thông tin cơ bản", step: 1, progress: basicPercent },
      { id: "curriculum", label: "Nội dung bài học", step: 2, progress: curriculumPercent },
      { id: "media", label: "Hình ảnh & Media", step: 3, progress: mediaPercent },
      { id: "pricing", label: "Định giá & Cài đặt", step: 4, progress: pricingPercent },
    ];
  }, [formValues]);

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
                    className="text-green-500 transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Circle Content */}
                <div
                  className={`
                    w-[28px] h-[28px] rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300
                    ${isActive
                      ? "bg-green-600 text-white shadow-lg shadow-green-100 scale-105"
                      : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-white text-slate-300"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.step
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="absolute -bottom-6 whitespace-nowrap text-[11px] font-bold transition-all duration-300 text-center uppercase tracking-tighter">
                <p className={`${isActive ? "text-green-700 scale-110" : isCompleted ? "text-green-600" : "text-slate-400 opacity-60"}`}>
                  {s.label}
                </p>
              </div>
            </div>

            {/* Connection Line Segment */}
            {!isLast && (
              <div className="flex-1 mx-2 h-[2px] bg-slate-100 relative rounded-full overflow-hidden">
                <div
                  className={`
                    absolute inset-0 bg-green-500 transition-all duration-1000 ease-out
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

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

function BasicInfoTab() {
  const { register, control, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">THÔNG TIN CƠ BẢN</h3>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
          Tên Khóa Học <span className="text-red-500">*</span>
        </label>
        <Input
          className="h-11 border-slate-200 focus:border-green-500 font-medium"
          placeholder="Ví dụ: React Native Masterclass 2026..."
          {...register("title")}
        />
        {errors.title && <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Danh Mục <span className="text-red-500">*</span>
          </label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full !h-11 border-slate-200 focus:border-green-500 font-medium bg-white data-[state=open]:ring-1 data-[state=open]:ring-green-500">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="web-dev">Lập trình Web</SelectItem>
                  <SelectItem value="mobile-dev">Lập trình Mobile</SelectItem>
                  <SelectItem value="data-science">Khoa học dữ liệu</SelectItem>
                  <SelectItem value="design">Thiết kế UI/UX</SelectItem>
                  <SelectItem value="marketing">Marketing Online</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">{errors.categoryId.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Cấp Độ <span className="text-red-500">*</span>
          </label>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full !h-11 border-slate-200 focus:border-green-500 font-medium bg-white data-[state=open]:ring-1 data-[state=open]:ring-green-500">
                  <SelectValue placeholder="Chọn cấp độ" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="beginner">Người mới bắt đầu</SelectItem>
                  <SelectItem value="intermediate">Trung bình</SelectItem>
                  <SelectItem value="advanced">Nâng cao</SelectItem>
                  <SelectItem value="all">Dành cho mọi đối tượng</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.level && <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">{errors.level.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
          Mô Tả Khóa Học (Tuỳ chọn)
        </label>
        <div className="rounded-lg border border-slate-200 overflow-hidden focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all bg-white">
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
                className="[&_.ql-toolbar.ql-snow]:!border-0 [&_.ql-toolbar.ql-snow]:!border-b [&_.ql-toolbar.ql-snow]:!border-slate-200 [&_.ql-toolbar]:bg-slate-50/50 [&_.ql-container.ql-snow]:!border-0 [&_.ql-container]:min-h-[120px] [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-slate-700 font-sans"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

function MediaTab() {
  const { setValue, watch } = useFormContext();
  const thumbnail = watch("thumbnail");
  const promoVideo = watch("promoVideo");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Hình Ảnh & Media</h3>
        <p className="text-xs text-slate-500">Giới thiệu khóa học một cách trực quan để thu hút học viên.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Ảnh đại diện khóa học (Thumbnail)
          </label>
          <div
            onClick={() => setValue("thumbnail", thumbnail ? null : "mock-url", { shouldValidate: true })}
            className={`aspect-video rounded-xl bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all cursor-pointer group ${thumbnail ? "border-green-500 bg-green-50" : "border-slate-200 hover:bg-slate-100/50 hover:border-green-200"}`}
          >
            <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-green-500 shadow-sm border border-slate-100 mb-2 ${thumbnail ? "text-green-500" : ""}`}>
              {thumbnail ? <CheckIcon className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <p className="text-[11px] font-bold text-slate-500">{thumbnail ? "Đã tải lên" : "Nhấn để tải lên (1280x720)"}</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Video giới thiệu (Promo Video)
          </label>
          <div
            onClick={() => setValue("promoVideo", promoVideo ? null : "mock-url", { shouldValidate: true })}
            className={`aspect-video rounded-xl bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all cursor-pointer group ${promoVideo ? "border-green-500 bg-green-50" : "border-slate-200 hover:bg-slate-100/50 hover:border-green-200"}`}
          >
            <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-green-500 shadow-sm border border-slate-100 mb-2 ${promoVideo ? "text-green-500" : ""}`}>
              {promoVideo ? <CheckIcon className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <p className="text-[11px] font-bold text-slate-500">{promoVideo ? "Đã tải lên" : "Nhấn để tải video (MP4, max 50MB)"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingTab() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
          Định giá & Cài đặt
        </h3>
        <p className="text-xs text-slate-500">Thiết lập giá bán khóa học cho học viên.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
          Giá khóa học <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          inputMode="decimal"
          step="0.01"
          className="h-11 border-slate-200 focus:border-green-500 font-medium"
          placeholder="Ví dụ: 499000"
          {...register("price")}
        />
        {errors.price && (
          <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">{errors.price.message}</p>
        )}
      </div>
    </div>
  );
}

function CheckIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
  );
}



// ------------------------------------------
// XỬ LÝ NESTED TAB CHO CURRICULUM
// ------------------------------------------

function CurriculumTab() {
  const { control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Khung Chương Trình</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Xây dựng kiến trúc bài giảng rõ ràng, rành mạch.</p>
        </div>
        <button
          type="button"
          onClick={() => append({ title: "", lessons: [{ title: "" }] })}
          className="flex items-center gap-1.5 text-sm font-bold border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <Plus size={16} className="text-slate-600" /> Thêm Chương
        </button>
      </div>

      {errors.sections?.root && (
        <div className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
          {errors.sections.root.message}
        </div>
      )}

      {/* Dùng ScrollArea tạo workspace độc lập giúp đỡ vướng víu footer */}
      <ScrollArea className="h-[550px] pr-4">
        <Accordion type="multiple" defaultValue={[fields[0]?.id]} className="space-y-4">
          {fields.map((section, sectionIdx) => (
            <AccordionItem
              value={section.id}
              key={section.id}
              className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-sm"
            >
              <AccordionTrigger className="px-5 py-4 hover:bg-slate-100/50 hover:no-underline border-b border-transparent data-[state=open]:border-slate-200">
                <div className="flex items-center w-full pr-4 text-left">
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest">
                      Chương {sectionIdx + 1}
                    </span>
                    <span className="font-bold text-slate-900 line-clamp-1">
                      {/* Dùng UseWatch nếu muốn real-time title display, hiện tại dùng static or watch context. Để UX tối ưu nhất chúng ta cứ giữ tĩnh. */}
                      Nội dung chương
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Bạn chắc chắn muốn xóa chương này?")) {
                        remove(sectionIdx);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-5 bg-white">
                <SectionItem sectionIndex={sectionIdx} control={control} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}

// ------------------------------------------
// COMPONENT LESSON QUẢN LÝ ITEM CON
// ------------------------------------------
function SectionItem({ sectionIndex, control }) {
  const { register, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.lessons`,
  });

  return (
    <div className="space-y-6">
      {/* Tên Chương */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
          Tiêu đề chương <span className="text-red-500">*</span>
        </label>
        <Input
          className="h-10 border-slate-200 focus:border-green-500 font-bold shadow-sm"
          placeholder="Vd: Chương 1: Giới thiệu tổng quan"
          {...register(`sections.${sectionIndex}.title`)}
          autoComplete="off"
        />
        {errors.sections?.[sectionIndex]?.title && (
          <p className="text-xs font-bold text-red-500 mt-1 pl-1">
            {errors.sections[sectionIndex].title.message}
          </p>
        )}
      </div>

      {/* Danh sách Bài học */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Danh Sách Bài Học ({fields.length})
          </label>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1.5 rounded-md transition-colors"
            onClick={() => append({ title: "", videoUrl: "" })}
          >
            <Plus size={14} /> Bài học mới
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((lesson, lessonIdx) => (
            <div
              key={lesson.id}
              className="group flex gap-3 items-start p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white hover:border-green-200 hover:shadow-md transition-all duration-300"
            >
              <div className="pt-2.5 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500">
                <GripVertical size={18} />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Tiêu đề bài học</label>
                  <Input
                    className="h-9 font-bold border-slate-200 bg-white focus:ring-0 focus:border-green-500 transition-all"
                    placeholder={`Bài học ${lessonIdx + 1}`}
                    {...register(`sections.${sectionIndex}.lessons.${lessonIdx}.title`)}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Video URL (Gắn link mp4, yt)</label>
                  <div className="relative">
                    <Video className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                    <Input
                      className="h-9 pl-8 text-xs font-medium border-slate-200 bg-white focus:ring-0 focus:border-green-500 transition-all text-slate-600"
                      placeholder="https://example.com/video.mp4"
                      {...register(`sections.${sectionIndex}.lessons.${lessonIdx}.videoUrl`)}
                      autoComplete="off"
                    />
                  </div>
                </div>
                {errors.sections?.[sectionIndex]?.lessons?.[lessonIdx]?.title && (
                  <p className="text-xs font-bold text-red-500 pl-1 col-span-2">
                    {errors.sections[sectionIndex].lessons[lessonIdx].title.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(lessonIdx)}
                className="mt-5 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Xóa bài học"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {/* Error level Section (vd: chưa có lessons nào) */}
          {errors.sections?.[sectionIndex]?.lessons?.root && (
            <p className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded-md">
              {errors.sections[sectionIndex].lessons.root.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
