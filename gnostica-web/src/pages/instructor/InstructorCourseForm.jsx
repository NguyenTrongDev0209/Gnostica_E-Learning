import React from "react";
import useInstructorCourseForm from "@/hooks/course/useInstructorCourseForm";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CircleFadingArrowUp, Save, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import courseService from "@/services/course/courseService";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import CourseStepper from "@/pages/instructor/components/course-form/CourseStepper";
import BasicInfoTab from "@/pages/instructor/components/course-form/BasicInfoTab";
import QuizTab from "@/pages/instructor/components/course-form/QuizTab";
import CurriculumTab from "@/pages/instructor/components/course-form/CurriculumTab";
import SettingsTab from "@/pages/instructor/components/course-form/SettingsTab";

import { courseSchema, viErrorMap } from "@/utils/validations/courseSchema";
import useCourseAiPreScan from "@/pages/instructor/components/course-form/hooks/useCourseAiPreScan";
import CourseDraftModal from "@/pages/instructor/components/course-form/modals/CourseDraftModal";
import CourseAiReportModal from "@/pages/instructor/components/course-form/modals/CourseAiReportModal";

export default function InstructorCourseForm() {
  const navigate = useNavigate();
  const [showAiReportModal, setShowAiReportModal] = React.useState(false);

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
    uploadDocumentToCloudinary
  } = useInstructorCourseForm(courseSchema, viErrorMap);

  const { isPreScanning, handlePreScanWholeCourse } = useCourseAiPreScan(methods);

  const overallAiReport = methods.watch("aiModerationReport");
  const formData = methods.watch();

  React.useEffect(() => {
    const handleGlobalClick = async (e) => {
      if (isSubmittingRef.current) return;
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
            const idToUse = isEditMode ? (originalDataRef.current?.id?.toString() || "") : "";
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
  }, [saveDraft, methods]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(formData, false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [formData, saveDraft]);

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

      if (isEditMode && slug !== "new") {
        await courseService.updateCourse(slug, finalData);
      } else {
        await courseService.createCourse(finalData);
      }

      localStorage.removeItem(`course_questions_${slug || 'new'}`);
      toast.success(isEditMode && slug !== "new" ? "Cập nhật khóa học thành công!" : "Lưu khóa học thành công!");
      setTimeout(() => navigate("/instructor/courses"), 1500);
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(error.response?.data?.error || "Lỗi tải lên hoặc lưu khóa học.");
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

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
          <div className="px-6 mb-12">
            <CourseStepper activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="basic" className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm mt-0">
              <BasicInfoTab categories={categories} />
            </TabsContent>

            <TabsContent value="quiz" className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm mt-0">
              <QuizTab courseId={methods.watch("id")} />
            </TabsContent>

            <TabsContent value="curriculum" className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm mt-0">
              <CurriculumTab uploadVideoToBunny={uploadVideoToBunny} setActiveUploads={setActiveUploads} />
            </TabsContent>

            <TabsContent value="settings" className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm mt-0">
              <SettingsTab uploadVideoToBunny={uploadVideoToBunny} setActiveUploads={setActiveUploads} />
            </TabsContent>
          </Tabs>

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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAiReportModal(true)}
                    className="h-11 px-6 rounded-xl font-bold border shadow-sm text-xs sm:text-sm flex items-center gap-2"
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
