import React from "react";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

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
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Giá khóa học phải lớn hơn 0đ"),
  sections: z.array(sectionSchema).min(1, "Cần có ít nhất 1 chương học"),
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
      description: "",
      price: 0,
      sections: [{ title: "", lessons: [{ title: "" }] }],
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
          <Save size={18} /> Lưu & Xuất bản
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
        </form>
      </FormProvider>
    </div>
  );
}

function CourseStepper({ activeTab, onTabChange }) {
  const steps = [
    { id: "basic", label: "Thông tin cơ bản", step: 1 },
    { id: "curriculum", label: "Nội dung bài học", step: 2 },
    { id: "media", label: "Hình ảnh & Media", step: 3 },
    { id: "pricing", label: "Định giá & Cài đặt", step: 4 },
  ];

  const currentStepNum = steps.find((s) => s.id === activeTab)?.step || 1;

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto h-12">
      {steps.map((s, idx) => {
        const isActive = s.id === activeTab;
        const isCompleted = currentStepNum > s.step;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={s.id}>
            {/* Step Circle */}
            <div
              className="relative flex flex-col items-center group cursor-pointer"
              onClick={() => onTabChange(s.id)}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                  ${isActive
                    ? "bg-green-600 border-green-100 text-white shadow-md shadow-green-100 scale-110"
                    : isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300"
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

              {/* Label */}
              <span
                className={`
                  absolute -bottom-8 whitespace-nowrap text-[11px] font-bold transition-all duration-300
                  ${isActive ? "text-green-700" : isCompleted ? "text-green-600" : "text-slate-400"}
                `}
              >
                {s.label}
              </span>
            </div>

            {/* Connection Line Segment */}
            {!isLast && (
              <div className="flex-1 mx-2 h-[2px] bg-slate-200 relative rounded-full overflow-hidden">
                <div
                  className={`
                    absolute inset-0 bg-green-500 transition-all duration-700
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

function BasicInfoTab() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Thông Tin Nền Tảng</h3>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
          Tên Khóa Học <span className="text-red-500">*</span>
        </label>
        <Input
          className="h-11 border-slate-200 focus:border-green-500 font-medium"
          placeholder="Ví dụ: React Native Masterclass 2026..."
          {...register("title")}
        />
        {errors.title && <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
          Mô Tả Khóa Học (Tuỳ chọn)
        </label>
        <Textarea
          className="resize-none min-h-[120px] border-slate-200 focus:border-green-500"
          placeholder="Mô tả về lợi ích và mục tiêu của khóa học dành cho học viên..."
          {...register("description")}
        />
      </div>
    </div>
  );
}

function MediaTab() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Hình Ảnh & Media</h3>
        <p className="text-xs text-slate-500">Giới thiệu khóa học một cách trực quan để thu hút học viên.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
            Ảnh đại diện khóa học (Thumbnail)
          </label>
          <div className="aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 hover:bg-slate-100/50 hover:border-green-200 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-green-500 shadow-sm border border-slate-100 mb-2">
               <Plus className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-bold text-slate-500">Nhấn để tải lên (1280x720)</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
            Video giới thiệu (Promo Video)
          </label>
          <div className="aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 hover:bg-slate-100/50 hover:border-green-200 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-green-500 shadow-sm border border-slate-100 mb-2">
               <Plus className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-bold text-slate-500">Nhấn để tải video (MP4, max 50MB)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingTab() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Định Giá Sản Phẩm</h3>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
          Giá Bán (VNĐ) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            type="number"
            className="h-11 pl-4 pr-12 border-slate-200 focus:border-green-500 font-bold text-lg"
            placeholder="990000"
            {...register("price")}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
            đ
          </div>
        </div>
        {errors.price && <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">{errors.price.message}</p>}
        <p className="text-xs font-medium text-slate-400 pl-1">Bao gồm 10% phí nền tảng khi thanh toán.</p>
      </div>
    </div>
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
                    <span className="text-xs font-black text-green-600 uppercase tracking-widest">
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
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
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
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
            Danh Sách Bài Học ({fields.length})
          </label>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1.5 rounded-md transition-colors"
            onClick={() => append({ title: "" })}
          >
            <Plus size={14} /> Bài học mới
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((lesson, lessonIdx) => (
            <div
              key={lesson.id}
              className="group flex gap-3 items-start p-3 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-white hover:border-green-200 hover:shadow-sm transition-all"
            >
              <div className="pt-2.5 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500">
                <GripVertical size={16} />
              </div>

              <div className="flex-1 space-y-2">
                <Input
                  className="h-9 font-medium border-slate-200 bg-white"
                  placeholder={`Tên bài học ${lessonIdx + 1}`}
                  {...register(`sections.${sectionIndex}.lessons.${lessonIdx}.title`)}
                  autoComplete="off"
                />
                {errors.sections?.[sectionIndex]?.lessons?.[lessonIdx]?.title && (
                  <p className="text-xs font-bold text-red-500 pl-1">
                    {errors.sections[sectionIndex].lessons[lessonIdx].title.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(lessonIdx)}
                className="mt-0.5 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Xóa bài học"
              >
                <Trash2 size={16} />
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
