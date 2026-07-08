import React from "react";
import useInstructorCourseForm from "@/hooks/course/useInstructorCourseForm";
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
  Pencil,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import courseService from "@/services/course/courseService";

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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import categoryService from "@/services/course/categoryService";

import CourseStepper from "@/pages/instructor/components/course-form/CourseStepper";
import BasicInfoTab from "@/pages/instructor/components/course-form/BasicInfoTab";
import QuizTab from "@/pages/instructor/components/course-form/QuizTab";
import CurriculumTab from "@/pages/instructor/components/course-form/CurriculumTab";
import SettingsTab from "@/pages/instructor/components/course-form/SettingsTab";


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
  aiModerationReport: z.any().nullable().optional(),
});

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function InstructorCourseForm() {
  const navigate = useNavigate();
  const [showAiReportModal, setShowAiReportModal] = React.useState(false);
  const [isPreScanning, setIsPreScanning] = React.useState(false);
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

  const overallAiReport = methods.watch("aiModerationReport");

  const handlePreScanWholeCourse = async () => {
    const curTitle = methods.getValues("title");
    const curDesc = methods.getValues("description");
    const sections = methods.getValues("sections") || [];
    
    if (!curTitle || curTitle.trim() === "") {
      toast.warning("Vui lòng nhập ít nhất tiêu đề khóa học trước khi quét thử!");
      return;
    }
    
    try {
      setIsPreScanning(true);
      toast.info("🚀 Đang trích xuất lời thoại video và tổng hợp dữ liệu...");

      // 1. Trích xuất trước lời thoại cho toàn bộ video (chạy song song để tối ưu tốc độ)
      const videoTranscriptMap = {};
      const transcriptPromises = [];

      sections.forEach((sect, sIdx) => {
        if (sect.lessons) {
          sect.lessons.forEach((less, lIdx) => {
            if (less.videoUrl) {
              const key = `${sIdx}-${lIdx}`;
              const p = courseService.getVideoTranscriptText(less.videoUrl)
                .then((res) => {
                  videoTranscriptMap[key] = res?.transcript || "[Không lấy được lời thoại]";
                })
                .catch(() => {
                  videoTranscriptMap[key] = "[Lỗi kết nối trích xuất lời thoại]";
                });
              transcriptPromises.push(p);
            }
          });
        }
      });

      // Chờ toàn bộ request trích xuất transcript hoàn tất
      if (transcriptPromises.length > 0) {
        await Promise.all(transcriptPromises);
      }

      // 2. Gom nhóm toàn bộ văn bản (Khóa học, Chương, Bài học, Quiz & Ngân hàng câu hỏi)
      let aggregatedText = "";
      aggregatedText += `[MÔ TẢ KHÓA HỌC]: ${curDesc || ""}\n\n`;
      
      sections.forEach((sect, sIdx) => {
        const sectTitle = sect.title || "";
        aggregatedText += `[CHƯƠNG ${sIdx + 1}]: ${sectTitle}\n`;
        
        if (sect.lessons) {
          sect.lessons.forEach((less, lIdx) => {
            const lessTitle = less.title || "";
            const lessContent = less.content || "";
            const videoKey = `${sIdx}-${lIdx}`;
            const videoTranscript = videoTranscriptMap[videoKey];

            aggregatedText += `  - [BÀI HỌC ${lIdx + 1}]: ${lessTitle}\n`;
            if (lessContent) {
              aggregatedText += `    [MÔ TẢ NỘI DUNG]: ${lessContent}\n`;
            }
            if (videoTranscript) {
              aggregatedText += `    [LỜI THOẠI CỦA VIDEO BÀI HỌC NÀY]:\n${videoTranscript}\n`;
            }
          });
        }

        // Thêm nội dung Quiz của chương (nếu có)
        if (sect.quiz) {
          aggregatedText += `  - [BÀI TRẮC NGHIỆM CHƯƠNG]: ${sect.quiz.title || "Chưa đặt tên"}\n`;
          if (sect.quiz.questions && sect.quiz.questions.length > 0) {
            sect.quiz.questions.forEach((q, qIdx) => {
              aggregatedText += `    + Câu hỏi ${qIdx + 1}: ${q.content}\n`;
              if (q.answers) {
                q.answers.forEach(a => {
                  aggregatedText += `      * ${a.content}${a.isCorrect ? " (Đúng)" : ""}\n`;
                });
              }
            });
          }
        }
        aggregatedText += "\n";
      });

      // Thêm nội dung Ngân hàng câu hỏi tổng thể
      const questionBank = methods.getValues("questionBank") || [];
      if (questionBank.length > 0) {
        aggregatedText += `[NGÂN HÀNG CÂU HỎI TỔNG THỂ]:\n`;
        questionBank.forEach((q, qIdx) => {
          aggregatedText += `  + Câu hỏi ${qIdx + 1}: ${q.content}\n`;
          if (q.answers) {
            q.answers.forEach(a => {
              aggregatedText += `    * ${a.content}${a.isCorrect ? " (Đúng)" : ""}\n`;
            });
          }
          if (q.explanation) {
            aggregatedText += `    * Giải thích: ${q.explanation}\n`;
          }
        });
      }

      toast.info("🧠 Đang kích hoạt AI phân tích toàn diện văn bản & lời thoại video...");

      // 3. Gửi một yêu cầu quét duy nhất cho AI đánh giá toàn bộ khóa học
      const res = await courseService.preScanCourseText(curTitle, aggregatedText);
      const reportString = typeof res === "string" ? res : JSON.stringify(res);
      methods.setValue("aiModerationReport", reportString, { shouldDirty: true });
      
      toast.success("🎉 Đã hoàn tất quét thử AI toàn bộ khóa học bao gồm cả lời thoại video!");
    } catch (e) {
      console.error("Pre-scan simulation failure:", e);
      toast.error("Gặp sự cố khi kết nối hệ thống quét AI.");
    } finally {
      setIsPreScanning(false);
    }
  };

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

      
      const isDirty = methods.formState.isDirty;

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
      
      const isDirty = methods.formState.isDirty;
      if (isDirty) {
        saveDraft(methods.getValues(), false);
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

      toast.success(isEditMode && slug !== "new" ? "Cập nhật khóa học thành công!" : "Lưu khóa học thành công!");
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

          {/* Right Buttons Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isSavingDraft && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium animate-pulse mr-2">
                <Save className="w-3.5 h-3.5" />
                <span>Đang lưu...</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
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
                  } catch(e) { return "text-muted-foreground border-border"; }
                })()
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Kết quả kiểm duyệt AI</span>
              <span className="md:hidden">AI Report</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-9 sm:h-10 px-3 sm:px-5 font-bold border-border text-muted-foreground hover:bg-muted shadow-none text-xs sm:text-sm"
              onClick={handleExitWithConfirmation}
            >
              Hủy
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isSavingDraft || isUploading}
              className="h-9 sm:h-10 px-3 sm:px-5 font-bold border-info/20 text-info hover:bg-blue-50 shadow-none text-xs sm:text-sm flex items-center gap-2"
              onClick={() => saveDraft(methods.getValues(), true)}
            >
              {isSavingDraft ? (
                <div className="w-4 h-4 border-2 border-info/20 border-t-transparent rounded-full animate-spin"></div>
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
              className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0"
            >
              <BasicInfoTab categories={categories} />
            </TabsContent>

            <TabsContent
              value="quiz"
              className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0"
            >
              <QuizTab courseId={methods.watch("id")} />
            </TabsContent>

            <TabsContent
              value="curriculum"
              className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0"
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
              className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm focus-visible:outline-none focus-visible:ring-0 mt-0"
            >
              <SettingsTab
                uploadVideoToBunny={uploadVideoToBunny}
                setActiveUploads={setActiveUploads}
              />
            </TabsContent>
          </Tabs>

          {/* Navigation Footer */}
          <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
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
                  className="flex items-center gap-2 h-11 px-8 rounded-lg font-bold bg-success text-white hover:bg-success/90 transition-all shadow-lg shadow-green-100"
                >
                  Tiếp theo <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAiReportModal(true)}
                    className={`h-11 px-6 rounded-xl font-bold border shadow-sm text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 ${
                      (() => {
                        try {
                          const rep = overallAiReport ? JSON.parse(overallAiReport) : null;
                          if (!rep) return "text-muted-foreground bg-muted border-border border-dashed";
                          const sc = rep.safetyScore ?? 100;
                          const hasV = rep.violations && rep.violations.length > 0;
                          if (sc < 70 || hasV) return "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 animate-pulse shadow-rose-100/40 shadow-lg";
                          return "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200";
                        } catch(e) { return "text-muted-foreground border-border"; }
                      })()
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Kết quả kiểm duyệt AI
                  </Button>

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

        {/* Upload Progress Overlay - Khôi phục tính năng hiển thị trạng thái xử lý */}
        {isUploading && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
            <div className="bg-muted text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10">
              <Loader2 className="w-6 h-6 animate-spin text-success" />
              <div className="flex-1">
                <p className="text-sm font-bold">{uploadStatus}</p>
                <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-success/10 text-success h-full transition-all duration-300"
                    style={{ width: '45%' }} // Tạm thời để tĩnh vì ta k tính tổng %, quan trọng là nhãn text
                  />
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

        {/* Modal khôi phục bản nháp */}
        {showDraftModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-50 text-info rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Phát hiện bản nháp!</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  Bạn có một bản lưu nháp chưa hoàn thành từ phiên làm việc trước. Bạn có muốn khôi phục lại dữ liệu này không?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-11 font-bold border-border"
                    onClick={() => {
                      setShowDraftModal(false);
                      localStorage.removeItem(`course_questions_${slug || 'new'}`);
                    }}
                  >
                    Bỏ qua
                  </Button>
                  <Button
                    className="h-11 font-bold bg-info text-white hover:bg-info/90"
                    onClick={restoreDraft}
                  >
                    Khôi phục ngay
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        {/* --- Elegant AI Audit Report Modal for Instructors --- */}
        <Dialog open={showAiReportModal} onOpenChange={setShowAiReportModal}>
          <DialogContent className="sm:max-w-[600px] rounded-2xl border border-border p-0 overflow-hidden shadow-2xl bg-white focus-visible:outline-none z-[9999]">
            {(() => {
              let report = null;
              try {
                if (overallAiReport) report = JSON.parse(overallAiReport);
              } catch(e) {}

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
                                    <Badge className={`h-4.5 px-2 py-0 text-[9px] font-black border-none uppercase tracking-wider ${v.severity === 'CRITICAL' || v.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {v.severity}
                                    </Badge>
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
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPreScanning}
                      onClick={handlePreScanWholeCourse}
                      className="h-10 px-4 border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 font-bold rounded-xl shadow-sm text-xs flex items-center gap-1.5 active:scale-95 transition-all"
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
                    </Button>
                    <Button 
                      onClick={() => setShowAiReportModal(false)}
                      className="h-10 px-5 bg-muted hover:bg-muted text-white font-bold rounded-xl shadow-md text-xs select-none active:scale-95 transition-transform"
                    >
                      Đóng báo cáo
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

      </FormProvider>
    </div>
  );
}

