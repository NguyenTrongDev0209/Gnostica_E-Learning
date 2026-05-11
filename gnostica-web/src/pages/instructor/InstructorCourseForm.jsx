import React from "react";
import useInstructorCourseForm from "@/hooks/admin/useInstructorCourseForm";
import {
  useForm,
  FormProvider,
  useFieldArray,
  useFormContext,
  useWatch,
  Controller,
} from "react-hook-form";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  ArrowLeft,
  ArrowRight,
  Video,
  CircleFadingArrowUp,
  ChevronRight,
  ChevronDown,
  Star,
  Users,
  PlayCircle,
  Clock,
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
  FileText,
  Database,
  CheckCircle2,
  ListOrdered,
  Search,
  Pencil
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import courseService from "../../services/courseService";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import categoryService from "@/services/categoryService";

// ==========================================
// CẤU CẤU HÌNH ĐỂ DUY TRÌ TIẾN TRÌNH TẢI VIDEO KHI CHUYỂN TAB
// ==========================================
const globalUploadProgress = {};
const uploadCallbacks = {};

// ==========================================
// THIẾT LẬP ZOD SCHEMA & ERROR MAP (VIỆT HÓA)
// ==========================================

const viErrorMap = (issue, ctx) => {
  // Việt hóa lỗi sai kiểu dữ liệu (Invalid input)
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === "null" || issue.received === "undefined") {
      return { message: "Trường này không được để trống" };
    }
    const typeMap = {
      string: "chuỗi ký tự",
      number: "con số",
      boolean: "giá trị đúng/sai",
      array: "danh sách",
      object: "đối tượng",
    };
    return {
      message: `Dữ liệu không hợp lệ (Mong đợi ${typeMap[issue.expected] || issue.expected}, nhưng nhận được ${typeMap[issue.received] || issue.received})`
    };
  }

  // Việt hóa lỗi bỏ trống (String, Array, Number)
  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === "string") return { message: "Vui lòng nhập thông tin này" };
    if (issue.type === "array") return { message: "Cần ít nhất một mục trong danh sách" };
    if (issue.type === "number") return { message: "Giá trị quá nhỏ" };
  }

  // Việt hóa lỗi sai giá trị Enum hoặc Union (Thường gây ra "Invalid input")
  if (issue.code === z.ZodIssueCode.invalid_enum_value || issue.code === z.ZodIssueCode.invalid_union) {
    return { message: "Lựa chọn không hợp lệ hoặc dữ liệu chưa đúng định dạng" };
  }

  // Mặc định trả về lỗi gốc nếu không khớp các trường hợp trên, cố gắng dịch "Required"
  return { message: ctx.defaultError === "Required" ? "Thông tin này là bắt buộc" : ctx.defaultError };
};

// Đăng ký Error Map cho toàn cục (Dùng cho z.parse bên ngoài)
z.setErrorMap(viErrorMap);

const lessonSchema = z.object({
  id: z.any().optional(),
  title: z.coerce.string({ required_error: "Tên bài học không được để trống" })
    .min(1, "Tên bài học không được để trống"),
  content: z.coerce.string({ required_error: "Mô tả bài học không được để trống" })
    .min(1, "Mô tả nội dung bài học không được để trống"),
  videoFile: z.any({ required_error: "Video bài học không được để trống" })
    .refine(val => val !== null && val !== undefined && val !== "", "Video bài học không được để trống"),
  videoUrl: z.string().optional(),
  status: z.coerce.number().default(1),
  createdAt: z.any().nullable().optional(),
  updatedAt: z.any().nullable().optional(),
});

const sectionSchema = z.object({
  id: z.any().optional(),
  title: z.coerce.string({ required_error: "Tên chương không được để trống" })
    .min(1, "Tên chương không được để trống"),
  lessons: z.preprocess(
    (val) => (Array.isArray(val) ? val : []),
    z.array(lessonSchema).min(1, "Chương này phải có ít nhất 1 bài học")
  ),
  attachments: z.any().nullable().optional(),
  status: z.coerce.number().default(1),
  createdAt: z.any().nullable().optional(),
  updatedAt: z.any().nullable().optional(),
  quiz: z.any().nullable().optional(),
});

export const courseSchema = z.object({
  title: z.preprocess((val) => (val === null || val === undefined ? "" : String(val)),
    z.string({ required_error: "Tên khóa học là bắt buộc" }).min(1, "Tên khóa học là bắt buộc")
  ),
  slug: z.preprocess((val) => (val === null || val === undefined ? "" : String(val)),
    z.string({ required_error: "Slug không được để trống" }).min(1, "Slug không được để trống")
  ),
  categoryId: z.preprocess((val) => (val === null || val === undefined ? "" : String(val)),
    z.string({ required_error: "Vui lòng chọn danh mục khóa học" }).min(1, "Vui lòng chọn danh mục khóa học")
  ),
  level: z.preprocess((val) => (val === null || val === undefined ? "" : String(val)),
    z.string({ required_error: "Vui lòng chọn cấp độ khó" }).min(1, "Vui lòng chọn cấp độ khó")
  ),
  description: z.preprocess((val) => (val === null || val === undefined ? "" : String(val)),
    z.string({ required_error: "Mô tả khóa học không được để trống" })
      .min(1, "Mô tả khóa học không được để trống")
      .refine(val => val.replace(/<[^>]*>?/gm, '').trim().length > 0, "Mô tả khóa học không được để trống")
  ),
  price: z.preprocess((val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Giá bán không được để trống" })
      .min(0, "Giá phải lớn hơn hoặc bằng 0")
  ),
  discount: z.coerce.number({ invalid_type_error: "Giảm giá phải là số" })
    .min(0, "Giảm giá không được nhỏ hơn 0")
    .max(100, "Giảm giá không được quá 100%")
    .default(0),
  status: z.coerce.number().default(1),
  sections: z.preprocess(
    (val) => (Array.isArray(val) ? val : []),
    z.array(sectionSchema).min(1, "Cần có ít nhất 1 chương học")
  ),
  thumbnail: z.any({ required_error: "Ảnh đại diện khóa học không được để trống" })
    .refine(val => val !== null && val !== undefined && val !== "", "Ảnh đại diện khóa học không được để trống"),
  promoVideo: z.any().nullable().optional(),
  createdAt: z.any().nullable().optional(),
  updatedAt: z.any().nullable().optional(),
  questionBank: z.any().nullable().optional(),
});

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function InstructorCourseForm() {
  const navigate = useNavigate();
  const {
    methods,
    isEditMode,
    slug,
    activeTab,
    setActiveTab,
    isUploading,
    setIsUploading,
    uploadStatus,
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
    isSubmittingRef,
    originalDataRef,
    uploadImageToCloudinary,
    uploadVideoToBunny,
    uploadDocumentToCloudinary,
    getAuthHeaders
  } = useInstructorCourseForm(courseSchema, viErrorMap);

  const {
    fields,
    append,
    remove,
    replace
  } = useFieldArray({
    control: methods.control,
    name: "sections",
  });

  // Watch và Trigger Autosave (giữ logic watch trong component để trigger useEffect)
  const formData = methods.watch();

  // Logic click toàn cục để xác nhận khi chuyển hướng (Navigation Guard)
  React.useEffect(() => {
    const handleGlobalClick = async (e) => {
      // Không cần kiểm tra nếu đang trong quá trình submit chính thức
      if (isSubmittingRef.current) return;

      // Tìm các thành phần có khả năng gây chuyển hướng
      const anchor = e.target.closest('a');
      const button = e.target.closest('button');

      const isNavAction =
        (anchor && anchor.getAttribute('href')) ||
        (button && (
          button.title === "Đăng xuất" ||
          button.title?.includes("Về trang chủ") ||
          button.innerText.includes("Tạo khóa học mới") ||
          button.closest('aside')
        ));

      if (!isNavAction) return;

      const currentData = methods.getValues();
      const isDirty = originalDataRef.current && JSON.stringify(currentData) !== originalDataRef.current;

      if (isDirty) {
        const confirmMsg = isEditMode
          ? "Bạn có các thay đổi chưa lưu. Bạn có chắc chắn muốn thoát và HỦY BỎ toàn bộ các thay đổi mới này để quay lại dữ liệu gốc không?"
          : "Bạn đang tạo khóa học mới nhưng chưa xuất bản. Bạn có chắc chắn muốn thoát và xóa bỏ bản nháp hiện tại không?";

        if (!window.confirm(confirmMsg)) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          try {
            const idToUse = isEditMode ? (currentData.id?.toString() || "") : "";
            const slugToUse = isEditMode ? (slug || "") : null;
            isSubmittingRef.current = true;
            courseService.deleteDraft({ courseId: idToUse, slug: slugToUse });
          } catch (err) {
            isSubmittingRef.current = true;
          }
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, [isEditMode, slug, methods, originalDataRef, isSubmittingRef]);

  // Cảnh báo khi đóng tab trình duyệt
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      const currentData = methods.getValues();
      const isDirty = originalDataRef.current && JSON.stringify(currentData) !== originalDataRef.current;
      if (isDirty) {
        saveDraft(currentData, false);
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveDraft, methods, originalDataRef]);

  // Autosave timer
  React.useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(formData, false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [formData, saveDraft]);

  // Thumbnail Auto-upload
  const watchThumbnail = methods.watch("thumbnail");
  React.useEffect(() => {
    if (watchThumbnail instanceof File) {
      const autoUploadThumbnail = async () => {
        try {
          setIsUploading(true);
          setUploadStatus("Đang tải lên ảnh đại diện...");
          const url = await uploadImageToCloudinary(watchThumbnail);
          methods.setValue("thumbnail", url);
          saveDraft({ ...methods.getValues(), thumbnail: url }, false);
        } catch (error) {
          toast.error("Không thể tải lên ảnh đại diện tự động");
        } finally {
          setIsUploading(false);
          setUploadStatus("");
        }
      };
      autoUploadThumbnail();
    }
  }, [watchThumbnail, methods, uploadImageToCloudinary, saveDraft, setIsUploading, setUploadStatus]);

  const onSubmit = async (data) => {
    try {
      setIsUploading(true);
      setUploadStatus("Đang kiểm tra dữ liệu...");

      if (data.thumbnail && data.thumbnail instanceof File) {
        setUploadStatus("Đang tải lên ảnh đại diện...");
        data.thumbnail = await uploadImageToCloudinary(data.thumbnail);
      }

      if (data.promoVideo && data.promoVideo instanceof File) {
        setUploadStatus("Đang hoàn tất tải video giới thiệu...");
        try {
          data.promoVideo = await uploadVideoToBunny(data.promoVideo, "Promo Video");
        } catch (vErr) {
          data.promoVideo = "upload-failed-promo";
        }
      }

      for (let sIdx = 0; sIdx < data.sections.length; sIdx++) {
        const section = data.sections[sIdx];
        if (section.attachments && section.attachments instanceof File) {
          setUploadStatus(`Đang xử lý tài liệu chương ${sIdx + 1}...`);
          try {
            section.attachments = await uploadDocumentToCloudinary(section.attachments);
          } catch (docErr) {
            section.attachments = null;
          }
        }

        for (let lIdx = 0; lIdx < section.lessons.length; lIdx++) {
          const lesson = section.lessons[lIdx];
          if (lesson.videoFile && lesson.videoFile instanceof File) {
            setUploadStatus(`Đang hoàn tất bài: ${lesson.title}`);
            try {
              lesson.videoUrl = await uploadVideoToBunny(lesson.videoFile, lesson.title);
              lesson.videoFile = lesson.videoUrl;
            } catch (vErr) {
              lesson.videoUrl = "upload-failed-lesson";
            }
          }
        }
      }

      setUploadStatus("Đang tiến hành xuất bản...");
      data.updatedAt = new Date().toISOString();
      isSubmittingRef.current = true;

      const sanitizeId = (id) => (typeof id === 'number' || (!isNaN(id) && id !== "")) ? Number(id) : null;

      const finalData = {
        ...data,
        categoryId: Number(data.categoryId),
        price: Number(data.price),
        questionBank: data.questionBank || [],
        sections: data.sections?.map(s => ({
          ...s,
          id: sanitizeId(s.id),
          lessons: s.lessons?.map(l => ({
            ...l,
            id: sanitizeId(l.id),
            videoUrl: typeof l.videoFile === "string" ? l.videoFile : l.videoUrl
          }))
        }))
      };

      let savedCourseId = finalData.id;
      if (isEditMode && slug !== "new") {
        const res = await courseService.updateCourse(slug, finalData);
        savedCourseId = res?.data?.id || res?.id || savedCourseId;
      } else {
        const res = await courseService.createCourse(finalData);
        savedCourseId = res?.data?.id || res?.id;
      }

      localStorage.removeItem(`course_questions_${slug || 'new'}`);

      toast.success(isEditMode ? "Cập nhật khóa học thành công!" : "Đã tải lên và lưu khóa học thành công!");
      setTimeout(() => navigate("/instructor/courses"), 1500);
    } catch (error) {
      console.error("Submit Error:", error);
      const errorMsg = error.response?.data?.error || error.message || "Lỗi trong quá trình tải lên hoặc lưu khóa học.";
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  const onError = (errors) => {
    toast.error("Vui lòng kiểm tra lại thông tin trên form!");
    console.log("Validation Errors:", errors);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExitWithConfirmation}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? "Chỉnh Sửa Khóa Học" : "Tạo Mới Khóa Học"}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Thiết lập thông tin nền tảng, thiết kế nội dung và định giá
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 transition-all">
          {(isUploading || activeUploads > 0) && (
            <div className="flex flex-col items-end mr-4">
              <span className="text-sm font-bold text-green-600 animate-pulse mb-1">
                {activeUploads > 0 ? `Đang tải ${activeUploads} video...` : uploadStatus}
              </span>
            </div>
          )}

          {/* Right Buttons Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isSavingDraft && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium animate-pulse mr-2">
                <Save className="w-3.5 h-3.5" />
                <span>Đang lưu...</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="h-9 sm:h-10 px-3 sm:px-5 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none text-xs sm:text-sm"
              onClick={handleExitWithConfirmation}
            >
              Hủy
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isSavingDraft || isUploading}
              className="h-9 sm:h-10 px-3 sm:px-5 font-bold border-blue-200 text-blue-600 hover:bg-blue-50 shadow-none text-xs sm:text-sm flex items-center gap-2"
              onClick={() => saveDraft(methods.getValues(), true)}
            >
              {isSavingDraft ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={16} />
              )}
              Lưu bản nháp
            </Button>

          </div>
        </div>
      </div>

      {/* Form Area */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
          <div className="px-6 mb-12">
            <CourseStepper activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent
              value="basic"
              className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0"
            >
              <BasicInfoTab categories={categories} />
            </TabsContent>

            <TabsContent
              value="quiz"
              className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0"
            >
              <QuizTab courseId={methods.watch("id")} />
            </TabsContent>

            <TabsContent
              value="curriculum"
              className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0"
            >
              <CurriculumTab
                uploadVideoToBunny={uploadVideoToBunny}
                setActiveUploads={setActiveUploads}
                fields={fields}
                append={append}
                remove={remove}
              />
            </TabsContent>

            <TabsContent
              value="settings"
              className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0"
            >
              <SettingsTab
                uploadVideoToBunny={uploadVideoToBunny}
                setActiveUploads={setActiveUploads}
              />
            </TabsContent>
          </Tabs>

          {/* Navigation Footer */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeTab !== "basic" && (
                <button
                  type="button"
                  onClick={() => {
                    const sequence = [
                      "basic",
                      "quiz",
                      "curriculum",
                      "settings",
                    ];
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
              {activeTab !== "settings" ? (
                <button
                  type="button"
                  onClick={() => {
                    const sequence = [
                      "basic",
                      "quiz",
                      "curriculum",
                      "settings",
                    ];
                    const currentIdx = sequence.indexOf(activeTab);
                    if (currentIdx < sequence.length - 1)
                      setActiveTab(sequence[currentIdx + 1]);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 h-11 px-8 rounded-lg font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-100"
                >
                  Tiếp theo <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={activeUploads > 0}
                  onClick={methods.handleSubmit(onSubmit, onError)}
                  className="flex items-center gap-2 h-11 px-8 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                >
                  <CircleFadingArrowUp size={18} /> {activeUploads > 0 ? "Đang tải video..." : "Xuất bản"}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Upload Progress Overlay - Khôi phục tính năng hiển thị trạng thái xử lý */}
        {isUploading && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10">
              <Loader2 className="w-6 h-6 animate-spin text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-bold">{uploadStatus}</p>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-green-400 h-full transition-all duration-300"
                    style={{ width: '45%' }} // Tạm thời để tĩnh vì ta k tính tổng %, quan trọng là nhãn text
                  />
                </div>
              </div>
              {activeUploads > 0 && (
                <div className="bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-400 uppercase">
                  {activeUploads} Files
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal khôi phục bản nháp */}
        {showDraftModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Phát hiện bản nháp!</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Bạn có một bản lưu nháp chưa hoàn thành từ phiên làm việc trước. Bạn có muốn khôi phục lại dữ liệu này không?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-11 font-bold border-slate-200"
                    onClick={() => setShowDraftModal(false)}
                  >
                    Bỏ qua
                  </Button>
                  <Button
                    className="h-11 font-bold bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={restoreDraft}
                  >
                    Khôi phục ngay
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
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
      name: [
        "title",
        "description",
        "sections",
        "thumbnail",
        "promoVideo",
        "price",
      ],
    }) || [];

  const steps = React.useMemo(() => {
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
        progress: 0,
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
                  className={`${isActive ? "text-green-700 scale-110" : isCompleted ? "text-green-600" : "text-slate-400 opacity-60"}`}
                >
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={() => {
            if (!open) setActiveParent(null);
          }}
          className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-orange-500 data-[state=open]:ring-1 data-[state=open]:ring-orange-500 transition-all font-sans"
        >
          <span className={value ? "text-slate-900" : "text-slate-500"}>
            {selectedName || "Chọn danh mục khóa học"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex flex-row items-start gap-1.5 border-none bg-transparent shadow-none" align="start" sideOffset={8}>
        {/* Cấp 1 */}
        <div className="w-[240px] max-h-[300px] overflow-y-auto py-2 bg-white rounded-md shadow-lg border border-slate-200">
          {categories.map(parent => {
            const hasChildren = parent.subcategories && parent.subcategories.filter(c => c.status).length > 0;
            const isActive = activeParent?.id === parent.id;
            return (
              <div
                key={parent.id}
                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${isActive ? "text-orange-500 bg-orange-50/50" : "text-slate-700 hover:text-orange-500 hover:bg-orange-50/50"}`}
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
          <div className="w-[240px] max-h-[300px] overflow-y-auto py-2 bg-white rounded-md shadow-lg border border-slate-200">
            {activeParent.subcategories.filter(c => c.status).map(child => (
              <div
                key={child.id}
                className="px-4 py-2.5 text-sm cursor-pointer text-slate-700 hover:text-orange-500 hover:bg-orange-50/50 transition-colors"
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
      </PopoverContent>
    </Popover>
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
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
          THÔNG TIN CƠ BẢN
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Tên Khóa Học <span className="text-red-500">*</span>
          </label>
          <Input
            className="h-11 border-slate-200 focus:border-green-500 font-medium"
            placeholder="Ví dụ: React Native Masterclass 2026..."
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <Input
            className="h-11 border-slate-200 bg-slate-50 font-medium cursor-not-allowed"
            placeholder="react-native-masterclass-2026"
            {...register("slug")}
            readOnly
          />
          {errors.slug && (
            <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">
              {errors.slug.message}
            </p>
          )}
        </div>
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
              <CategoryCascader
                categories={categories}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.categoryId && (
            <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Cấp Độ <span className="text-red-500">*</span>
          </label>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
          {errors.level && (
            <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">
              {errors.level.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Trạng Thái <span className="text-red-500">*</span>
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
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
                <SelectTrigger className={`w-full !h-11 border-slate-200 focus:border-green-500 font-medium ${isCategoryHidden ? 'bg-slate-50 opacity-80' : 'bg-white'}`}>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1" disabled={isCategoryHidden}>Hoạt động {isCategoryHidden && "(Danh mục cha đang ẩn)"}</SelectItem>
                  <SelectItem value="2">Ẩn</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
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
        {errors.description && (
          <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">{errors.description.message}</p>
        )}
      </div>
    </div>
  );
}

function SettingsTab({ uploadVideoToBunny, setActiveUploads }) {
  return (
    <div className="space-y-12">
      <MediaTab uploadVideoToBunny={uploadVideoToBunny} setActiveUploads={setActiveUploads} />
      <div className="border-t border-slate-100"></div>
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
  const [isFetchingDrafts, setIsFetchingDrafts] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
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
        const questions = await courseService.getDraftQuestions(courseId);
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
        await courseService.saveDraftQuestions(courseId, draftQuestions);
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
      const generatedQuestions = await courseService.generateAiQuestions(courseId, aiFile, aiQuestionCount, aiLevel);
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

  const handleStartEdit = (q) => {
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
        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" />
          Tạo Ngân Hàng Câu Hỏi
        </h3>
        <p className="text-sm text-slate-500">
          Sử dụng AI để phân tích tài liệu bài giảng và tự động tạo ra ngân hàng câu hỏi.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <h4 className="text-md font-bold text-slate-800 mb-5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</div>
          Tạo Question Bank bằng AI
        </h4>

        <div className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">
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
                    <p className="text-xs text-slate-500 mt-1">{(aiFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:text-indigo-500 transition-all">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-indigo-900">Kéo thả file vào đây hoặc nhấn để chọn</p>
                    <p className="text-xs text-slate-500 mt-2 max-w-[280px]">
                      AI sẽ đọc và phân tích nội dung để tạo câu hỏi bám sát tài liệu bài giảng của bạn.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                Số lượng câu hỏi (Tối đa 100)
              </label>
              <div className="h-[220px] flex flex-col justify-between">
                <Input
                  type="number"
                  value={aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                  min={1}
                  max={100}
                  className="h-11 border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold"
                />

                <div className="space-y-1.5 w-full">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Chọn cấp độ
                  </label>
                  <Select value={aiLevel} onValueChange={setAiLevel}>
                    <SelectTrigger className="w-full h-11 border-slate-200 bg-white text-xs font-bold focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Chọn cấp độ" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="easy">Dễ</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="hard">Khó</SelectItem>
                      <SelectItem value="mixed">Hỗn hợp (Trộn cấp độ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
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
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="manual-question-form" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-8">
        <h4 className="text-md font-bold text-slate-800 mb-6 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
            {editingQuestionId !== null ? "Hiệu Chỉnh Câu Hỏi" : "Thêm Câu Hỏi Thủ Công"}
          </div>
          {editingQuestionId !== null && (
            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 animate-pulse">
              Đang chỉnh sửa câu hỏi #{editingQuestionId}
            </span>
          )}
        </h4>
        <div className="space-y-5 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">
              Nội dung câu hỏi <span className="text-red-500">*</span>
            </label>
            <div className="rounded-xl border border-slate-200 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all bg-white">
              <ReactQuill
                theme="snow"
                value={manualText}
                onChange={setManualText}
                modules={quillModules}
                placeholder="Nhập nội dung câu hỏi (hỗ trợ định dạng và chèn ảnh)..."
                className="[&_.ql-toolbar.ql-snow]:!border-0 [&_.ql-toolbar.ql-snow]:!border-b [&_.ql-toolbar.ql-snow]:!border-slate-200 [&_.ql-toolbar]:bg-slate-50/50 [&_.ql-container.ql-snow]:!border-0 [&_.ql-container]:min-h-[100px] [&_.ql-editor]:min-h-[100px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-slate-700 font-sans"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">
              Độ khó câu hỏi
            </label>
            <Select value={manualLevel} onValueChange={setManualLevel}>
              <SelectTrigger className="w-[180px] h-10 border-slate-200 bg-white text-xs font-bold focus:ring-indigo-500 focus:border-indigo-500">
                <SelectValue placeholder="Chọn độ khó" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">
              Các đáp án & Chọn đáp án đúng <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div key={opt} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${manualCorrect === opt ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="pt-2.5">
                    <input
                      type="radio"
                      name="correctAnswer"
                      className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                      checked={manualCorrect === opt}
                      onChange={() => setManualCorrect(opt)}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${manualCorrect === opt ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {opt}
                    </span>
                    <Input
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
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">
              Giải thích câu hỏi (Không bắt buộc)
            </label>
            <textarea
              value={manualExplanation}
              onChange={(e) => setManualExplanation(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm text-slate-700 transition-all font-sans placeholder:text-slate-400"
              placeholder="Nhập giải thích chi tiết tại sao đáp án đúng là chính xác..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {editingQuestionId !== null && (
              <Button
                type="button"
                onClick={handleCancelEdit}
                variant="outline"
                className="h-11 px-6 font-bold border-slate-200 text-slate-600 rounded-xl"
              >
                Hủy Chỉnh Sửa
              </Button>
            )}
            <Button
              type="button"
              onClick={handleAddManual}
              className={`h-11 px-8 font-bold text-white rounded-xl gap-2 shadow-md ${editingQuestionId !== null
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
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
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-8">
        <h4 className="text-md font-bold text-slate-800 mb-6 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">3</div>
            Question Bank Preview
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-1.5">
            Tổng số câu hỏi: <span className="text-indigo-600 font-extrabold">{draftQuestions.length}</span> / 300 câu
          </span>
        </h4>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                Danh sách câu hỏi
                <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Draft
                </span>
              </h5>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                />
              </div>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[110px] h-9 border-slate-200 bg-slate-50 text-xs font-bold focus:ring-indigo-500 focus:border-indigo-500">
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-[500px] max-h-[800px]">
            {filteredQuestions.length === 0 ? (
              <div className="h-full py-20 flex flex-col justify-center items-center text-slate-400">
                <p className="text-sm font-bold">Không tìm thấy câu hỏi nào phù hợp!</p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div key={q.id} className="border border-slate-100 rounded-lg p-4 hover:border-indigo-200 transition-colors bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: `Câu ${idx + 1}: ${q.text}` }} />

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isCorrect = q.correct === opt;
                      return (
                        <div key={opt} className={`flex items-start gap-2 px-3 py-2 rounded-md ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-slate-200'}`}>
                          {isCorrect ? (
                            <span className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {opt}
                            </span>
                          )}
                          <span className={`text-xs ${isCorrect ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>{q.options[opt]}</span>
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
                        className={`w-8 h-8 flex items-center justify-center rounded-md bg-white border text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-colors ${editingQuestionId === q.id ? 'border-amber-500 bg-amber-50 text-amber-600 ring-1 ring-amber-500' : 'border-slate-200'
                          }`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="text-center pt-2 pb-2">
              <p className="text-[11px] text-slate-400 font-medium">Bạn có thể xem lại và chỉnh sửa trước khi xác nhận.</p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Button
              type="button"
              onClick={handleConfirmBank}
              disabled={isBankConfirmed || draftQuestions.length === 0}
              variant="outline"
              className={`w-full h-11 font-bold gap-2 disabled:opacity-75 disabled:cursor-not-allowed transition-all ${
                isBankConfirmed 
                  ? "border-slate-200 bg-slate-50 text-slate-400" 
                  : "border-green-200 bg-green-50/50 text-green-700 hover:bg-green-100 hover:text-green-800"
              }`}
            >
              {isBankConfirmed ? <Check size={18} /> : <CheckCircle2 size={18} />}
              {isBankConfirmed ? "Đã Xác Nhận Ngân Hàng Câu Hỏi" : "Xác Nhận Ngân Hàng Câu Hỏi"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaTab({ uploadVideoToBunny, setActiveUploads }) {
  const { setValue, watch, formState: { errors } } = useFormContext();
  const thumbnail = watch("thumbnail");
  const promoVideo = watch("promoVideo");

  return (
    <div className="space-y-8 w-full">
      <div>
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
          Hình Ảnh & Media
        </h3>
        <p className="text-xs text-slate-500">
          Giới thiệu khóa học một cách trực quan để thu hút học viên.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 text-center">
            Ảnh đại diện khóa học (Thumbnail) <span className="text-red-500">*</span>
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
            className={`aspect-video rounded-xl bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all cursor-pointer group ${thumbnail ? "border-green-500 bg-green-50" : "border-slate-200 hover:bg-slate-100/50 hover:border-green-200"}`}
          >
            {thumbnail && (thumbnail instanceof File || typeof thumbnail === "string") ? (
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <img
                  src={typeof thumbnail === "string" ? thumbnail : URL.createObjectURL(thumbnail)}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <p className="text-white text-xs font-bold px-3 py-1.5 bg-green-600 rounded-full">Đổi ảnh</p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-green-500 shadow-sm border border-slate-100 mb-2 ${thumbnail ? "text-green-500" : ""}`}
                >
                  {thumbnail ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-500">
                  {thumbnail ? "Đã chọn ảnh" : "Nhấn để tải lên (1280x720)"}
                </p>
                {thumbnail && (
                  <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[200px]">
                    {thumbnail.name || (typeof thumbnail === 'string' ? "Đã có ảnh" : "")}
                  </p>
                )}
              </>
            )}
          </div>
          {errors.thumbnail && (
            <p className="text-xs font-bold text-red-500 mt-1.5 pl-1 text-center">{errors.thumbnail.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 text-center">
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
            <p className="text-xs font-bold text-red-500 mt-1.5 pl-1 text-center">{errors.promoVideo.message}</p>
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
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
          Định giá & Cài đặt
        </h3>
        <p className="text-xs text-slate-500">
          Thiết lập giá bán và các chương trình ưu đãi cho học viên.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Ô nhập giá gốc - Format TRỰC TIẾP */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
              Giá bán thực tế (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Controller
                name="price"
                control={useFormContext().control}
                render={({ field }) => (
                  <Input
                    className="h-11 border-slate-200 focus:border-green-500 font-bold pl-10"
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₫</span>
            </div>
            {errors.price && (
              <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">{errors.price.message}</p>
            )}
          </div>

          {/* Ô hiển thị tổng tiền sau khi giảm */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-green-600 uppercase tracking-widest pl-1">
              Tổng tiền sau giảm (Hiển thị cho học viên)
            </label>
            <div className="relative">
              <Input
                className="h-11 border-green-100 bg-green-50/30 text-green-700 font-bold text-lg pl-10 cursor-not-allowed"
                value={new Intl.NumberFormat("vi-VN").format(finalPrice)}
                readOnly
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold text-sm">₫</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ô nhập % giảm giá */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
              Phần trăm giảm giá (%)
            </label>
            <div className="relative">
              <Input
                type="number"
                className="h-11 border-slate-200 focus:border-green-500 font-bold pl-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0 - 100"
                {...register("discount")}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium pl-1 italic">
              Giảm {discount}% tương đương giảm {new Intl.NumberFormat("vi-VN").format(price * discount / 100)}₫
            </p>
            {errors.discount && (
              <p className="text-xs font-bold text-red-500 mt-1.5 pl-1">{errors.discount.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className = "w-6 h-6" }) {
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

function CurriculumTab({ uploadVideoToBunny, setActiveUploads, fields, append, remove }) {
  const { control, watch, formState: { errors } } = useFormContext();
  const currentCourseStatus = watch("status") ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Khung Chương Trình
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">
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

      {/* Dùng div với overflow-y-auto đơn giản để đảm bảo cuộn luôn hoạt động */}
      <div className="max-h-[850px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
        <Accordion
          type="multiple"
          defaultValue={[fields[0]?.id]}
          className="space-y-4 pb-24"
        >
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
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0 bg-white border-t border-slate-50">
                <SectionItem
                  sectionIndex={sectionIdx}
                  control={control}
                  uploadVideoToBunny={uploadVideoToBunny}
                  setActiveUploads={setActiveUploads}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

// ------------------------------------------
// COMPONENT LESSON QUẢN LÝ ITEM CON
// ------------------------------------------
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

  const handleSaveQuiz = () => {
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

      {/* Attachments & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Tài liệu đính kèm (PDF, ZIP,...) (Nếu có)
          </label>
          <div className="flex flex-col gap-3">
            <Controller
              name={`sections.${sectionIndex}.attachments`}
              control={control}
              render={({ field }) => (
                field.value && typeof field.value === "string" ? (
                  <div className="flex items-center gap-2 p-2 border border-green-200 rounded-md bg-green-50/50 h-10">
                    <span className="text-xs text-green-700 font-bold flex-1 truncate">Đã có tài liệu</span>
                    <a href={field.value} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline px-2 border-r border-green-200">Xem file</a>
                    <button
                      type="button"
                      className="text-xs font-bold text-red-500 hover:text-red-700 px-2"
                      onClick={() => field.onChange(null)}
                    >
                      Đổi file khác
                    </button>
                  </div>
                ) : (
                  <Input
                    type="file"
                    className="h-10 text-xs pt-2 cursor-pointer w-full"
                    onChange={(e) => field.onChange(e.target.files[0])}
                  />
                )
              )}
            />
            {watch(`sections.${sectionIndex}.quiz.questionIds`)?.length > 0 ? (
              <Button
                type="button"
                onClick={() => setIsQuizModalOpen(true)}
                variant="outline"
                className="w-full h-10 border-emerald-300 text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 hover:text-emerald-800 font-bold gap-2 shadow-sm transition-all"
              >
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Đã có bài Quiz ({watch(`sections.${sectionIndex}.quiz.questionIds`).length} câu) - Chỉnh sửa</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setIsQuizModalOpen(true)}
                variant="outline"
                className="w-full h-10 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 font-bold gap-2 border-dashed"
              >
                <Database size={16} />
                Tạo bài Quiz cho chương này
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Trạng thái chương <span className="text-red-500">*</span>
          </label>
          <Controller
            name={`sections.${sectionIndex}.status`}
            control={control}
            render={({ field }) => (
              <Select
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
                <SelectTrigger className="h-10 border-slate-200 focus:border-green-500 font-medium bg-white">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1" disabled={currentCourseStatus === 2}>Hoạt động {currentCourseStatus === 2 && "(Bị khóa)"}</SelectItem>
                  <SelectItem value="2">Ẩn</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
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
              className="group flex gap-4 p-5 border border-slate-200 rounded-2xl bg-white hover:border-green-300 hover:shadow-lg transition-all duration-300 relative"
            >
              <div className="pt-1 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500">
                <GripVertical size={20} />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Information (Title + Description + Dates) */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                      Tiêu đề bài học <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="h-10 font-bold border-slate-200 focus:ring-0 focus:border-green-500 transition-all text-slate-800"
                      placeholder={`Ví dụ: Bài giảng số ${lessonIdx + 1}: Giới thiệu ngôn ngữ`}
                      {...register(`sections.${sectionIndex}.lessons.${lessonIdx}.title`)}
                      autoComplete="off"
                    />
                    {errors.sections?.[sectionIndex]?.lessons?.[lessonIdx]?.title && (
                      <p className="text-[10px] font-bold text-red-500 pl-1">{errors.sections[sectionIndex].lessons[lessonIdx].title.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                      Mô tả nội dung bài học
                    </label>
                    <Textarea
                      className="min-h-[80px] text-xs resize-none border-slate-200 focus:ring-0 focus:border-green-500"
                      placeholder="Một đoạn mô tả ngắn về những gì học viên sẽ được học trong bài này..."
                      {...register(`sections.${sectionIndex}.lessons.${lessonIdx}.content`)}
                    />
                    {errors.sections?.[sectionIndex]?.lessons?.[lessonIdx]?.content && (
                      <p className="text-[10px] font-bold text-red-500 pl-1">{errors.sections[sectionIndex].lessons[lessonIdx].content.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                      Trạng thái bài học <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name={`sections.${sectionIndex}.lessons.${lessonIdx}.status`}
                      control={control}
                      render={({ field }) => (
                        <Select
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
                          <SelectTrigger className="h-9 border-slate-200 focus:border-green-500 font-medium bg-white text-xs">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="1" disabled={currentSectionStatus === 2}>Hoạt động {currentSectionStatus === 2 && "(Bị khóa)"}</SelectItem>
                            <SelectItem value="2">Ẩn</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Right side: Video Upload Box */}
                <div className="space-y-1.5 flex flex-col justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
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
                    <p className="text-[10px] font-bold text-red-500 pl-1">{errors.sections[sectionIndex].lessons[lessonIdx].videoFile.message}</p>
                  )}
                </div>
              </div>

              {/* Nút Xóa bài học */}
              <button
                type="button"
                onClick={() => remove(lessonIdx)}
                className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-md z-30"
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
        <p className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded-md mt-2">
          {errors.sections[sectionIndex].lessons.root.message}
        </p>
      )}

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" />
                Tạo Bài Quiz - Chương {sectionIndex + 1}
              </h3>
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="p-6 flex flex-col flex-1 overflow-hidden space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[580px] overflow-hidden">
                {/* L Pane: Bài Quiz */}
                <div className="flex flex-col gap-4 overflow-hidden h-full">
                  <div className="space-y-2 shrink-0">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">
                      Tên bài Quiz <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Ví dụ: Kiểm tra kiến thức chương"
                      className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold bg-white"
                    />
                  </div>

                  <div className="border border-slate-200 rounded-xl flex flex-col flex-1 overflow-hidden bg-white shadow-sm">
                    <div className="bg-indigo-50/50 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-indigo-900 block">Nội dung bài Quiz</span>
                        <span className="text-[11px] text-indigo-600 font-bold">{selectedQuizQuestions.length} câu hỏi được chọn</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                      {selectedQuizQuestions.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center text-slate-400 border-dashed border-2 border-slate-200 rounded-xl p-8 bg-white">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <ListOrdered className="w-6 h-6 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-600">Chưa có câu hỏi nào</p>
                          <p className="text-xs mt-1 text-slate-400 text-center">Hãy tick chọn câu hỏi từ Ngân hàng bên phải.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedQuizQuestions.map((qId, idx) => {
                            const qDetails = bankQuestions.find(item => item.id === qId);
                            return (
                              <div key={qId} className="border border-indigo-500/20 rounded-lg p-3 bg-white shadow-sm flex items-center justify-between gap-3 hover:border-red-200 transition-colors">
                                <div className="flex gap-3 items-start flex-1">
                                  <div className="pt-0.5 shrink-0">
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-700 leading-relaxed">{qDetails?.text || "Đang tải câu hỏi..."}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedQuizQuestions(selectedQuizQuestions.filter(id => id !== qId))}
                                  className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
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
                  <div className="border border-slate-200 rounded-xl flex flex-col flex-1 overflow-hidden bg-white shadow-sm">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">Ngân Hàng Câu Hỏi</span>
                          <span className="text-[11px] text-slate-500 font-medium">Chọn câu hỏi để thêm</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <Input 
                            placeholder="Tìm kiếm theo từ khóa..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 h-8 text-xs border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500" 
                          />
                        </div>
                        <select 
                          value={filterLevel} 
                          onChange={(e) => setFilterLevel(e.target.value)}
                          className="w-[110px] h-8 border border-slate-200 bg-white text-xs font-bold rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm text-slate-700"
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
                        <div className="text-center py-8 text-xs text-slate-400">Không tìm thấy câu hỏi phù hợp trong ngân hàng.</div>
                      ) : (
                        filteredQuestions.map((q) => (
                          <div key={q.id} className="border border-slate-100 rounded-lg p-3 hover:border-indigo-200 transition-colors flex gap-3 cursor-pointer group bg-white">
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
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-700 leading-relaxed">{q.text}</p>

                              <div className="mt-3 grid grid-cols-1 gap-2">
                                {["A", "B", "C", "D"].map((opt) => {
                                  const isCorrect = q.correct === opt;
                                  return (
                                    <div key={opt} className={`flex items-start gap-2 px-2.5 py-1.5 rounded border ${
                                      isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold" : "bg-slate-50 border-slate-100 text-slate-600"
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
                                  q.level === "hard" ? "text-red-600 bg-red-50 border-red-100" :
                                  q.level === "medium" ? "text-amber-600 bg-amber-50 border-amber-100" :
                                  "text-green-600 bg-green-50 border-green-100"
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

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancelQuiz} className="h-11 px-6 font-bold border-slate-200 hover:bg-slate-100 text-slate-600">
                Hủy
              </Button>
              <Button type="button" onClick={handleSaveQuiz} className="h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md shadow-indigo-100">
                <Save size={16} />
                Lưu Bài Quiz
              </Button>
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
      <span className="absolute text-[10px] font-bold text-green-700">{progress}%</span>
    </div>
  );
}

function BackgroundVideoUploader({ label, value, onChange, onUploadStart, onUploadEnd, uploadVideoToBunny, id = "v-upload" }) {
  const [localProgress, setLocalProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Effect để "kết nối" lại với tiến trình tải lên nếu có (khi quay lại tab)
  React.useEffect(() => {
    // Đăng ký callback để nhận cập nhật tiến trình mới nhất
    uploadCallbacks[id] = (pct) => setLocalProgress(pct);

    // Nếu đang có tiến trình chạy ngầm, lấy giá trị hiện tại ngay lập tức
    if (globalUploadProgress[id] !== undefined) {
      setLocalProgress(globalUploadProgress[id]);
    }

    return () => {
      delete uploadCallbacks[id];
    };
  }, [id]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      onChange(file);

      setIsUploading(true);
      setError(null);
      setLocalProgress(0);
      globalUploadProgress[id] = 0;
      onUploadStart();

      const videoId = await uploadVideoToBunny(file, file.name, (pct) => {
        // Cập nhật state cục bộ (nếu component còn mount)
        setLocalProgress(pct);
        // Lưu vào biến toàn cục để các lần mount sau có thể lấy được
        globalUploadProgress[id] = pct;
        // Nếu có component nào đang mount với ID này, gọi callback của nó
        if (uploadCallbacks[id]) {
          uploadCallbacks[id](pct);
        }
      });

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
        ${isCompleted ? "border-green-500 bg-green-50/30" : isCurrentlyUploading ? "border-green-300 bg-green-50/10" : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 hover:border-green-300"}`}
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
        <div className="flex flex-col items-center">
          <VideoProgressCircle progress={localProgress} size={80} />
        </div>
      ) : isCompleted ? (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mb-2 shadow-sm">
            <Check className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-bold text-green-700 uppercase tracking-tight">Tải lên hoàn tất</p>
          <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[150px]">ID: {value.substring(0, 12)}...</p>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-white text-slate-300 group-hover/upload:text-green-500 flex items-center justify-center mb-2 shadow-sm border border-slate-100 transition-all">
            <Video size={20} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 group-hover/upload:text-green-600 transition-colors uppercase tracking-tight">
            Chạm để tải {label}
          </p>
          <p className="text-[9px] text-slate-400 mt-0.5">MP4, MOV hoặc AVI</p>
        </>
      )}

      {error && <p className="absolute bottom-2 text-[9px] font-bold text-red-500">{error}</p>}
    </div>
  );
}
