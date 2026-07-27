import "react-quill-new/dist/quill.snow.css";
import React from "react";
import { Label } from "@/components/common/micro/AppLabel";
import { Controller, FormProvider } from "react-hook-form";
import AppInput from "@/components/common/micro/AppInput";
import AppSelect, { Select as AppSelectRoot, SelectContent as AppSelectContent, SelectItem as AppSelectItem, SelectTrigger as AppSelectTrigger, SelectValue as AppSelectValue } from "@/components/common/micro/AppSelect";
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
import { useNavigate } from "react-router-dom";
import useInstructorCourseForm from "@/hooks/course/useInstructorCourseForm";
import { Tabs as AppTabsRoot, TabsContent as AppTabsContent } from "@/components/common/micro/AppTabs";
import { courseSchema, viErrorMap } from "@/utils/validations/courseSchema";
import { CourseStepper, CheckIcon, VideoProgressCircle } from './components/course-form/SharedUI';
import { CourseDraftModal } from './components/course-form/CourseDraftModal';
import { CourseAiReportModal } from './components/course-form/CourseAiReportModal';
import { BasicInfoTab } from './components/course-form/BasicInfoTab';
import { CurriculumTab } from './components/course-form/CurriculumTab';
import { SettingsTab } from './components/course-form/SettingsTab';
import { QuizTab } from './components/course-form/QuizTab';
import { CategoryCascader } from './components/course-form/CategoryCascader';
import { BackgroundVideoUploader } from './components/course-form/BackgroundVideoUploader';

export default function InstructorCourseForm() {
  const navigate = useNavigate();

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

  const onError = (errors) => {
    toast.error("Vui lòng kiểm tra lại thông tin trên form!");
    console.log("Validation Errors:", errors);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-2 sm:px-4 lg:px-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <AppButton appVariant="ghostMuted"
            type="button"
            onClick={handleExitWithConfirmation}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </AppButton>
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
              <span className="text-sm font-bold text-primary animate-pulse mb-1">
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
              className="h-9 sm:h-10 px-3 sm:px-5 font-bold border border-border text-muted-foreground hover:bg-muted shadow-none text-xs sm:text-sm"
              onClick={handleExitWithConfirmation}
            >
              Hủy
            </AppButton>

            <AppButton appVariant="ghostMuted" variant="ghost"
              type="button"
              disabled={isSavingDraft || isUploading}
              className="h-9 sm:h-10 px-3 sm:px-5 font-bold border border-info/20 text-info hover:bg-info/10 shadow-none text-xs sm:text-sm flex items-center gap-2"
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
            <AppTabsContent value="basic" className="w-full bg-white p-4 md:p-5 rounded-lg border border-border shadow-sm mt-0 min-h-[700px]">
              <BasicInfoTab categories={categories} />
            </AppTabsContent>

            <AppTabsContent value="quiz" className="w-full bg-white p-4 md:p-5 rounded-lg border border-border shadow-sm mt-0 min-h-[700px]">
              <QuizTab courseId={methods.watch("id")} />
            </AppTabsContent>

            <AppTabsContent value="curriculum" className="w-full bg-white p-4 md:p-5 rounded-lg border border-border shadow-sm mt-0 min-h-[700px]">
              <CurriculumTab uploadVideoToBunny={uploadVideoToBunny} setActiveUploads={setActiveUploads} />
            </AppTabsContent>

            <AppTabsContent value="settings" className="w-full bg-white p-4 md:p-5 rounded-lg border border-border shadow-sm mt-0 min-h-[700px]">
              <SettingsTab uploadVideoToBunny={uploadVideoToBunny} setActiveUploads={setActiveUploads} />
            </AppTabsContent>
          </AppTabsRoot>

          <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeTab !== "basic" && (
                <AppButton appVariant="ghostMuted"
                  type="button"
                  onClick={() => {
                    const sequence = ["basic", "quiz", "curriculum", "settings"];
                    const currentIdx = sequence.indexOf(activeTab);
                    if (currentIdx > 0) setActiveTab(sequence[currentIdx - 1]);
                  }}
                  className="flex items-center gap-2 h-11 px-5 rounded-lg font-bold text-muted-foreground hover:bg-success/10 hover:text-success transition-all"
                >
                  <ArrowLeft size={18} /> Quay lại
                </AppButton>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeTab !== "settings" ? (
                <AppButton appVariant="ghostMuted"
                  type="button"
                  onClick={() => {
                    const sequence = ["basic", "quiz", "curriculum", "settings"];
                    const currentIdx = sequence.indexOf(activeTab);
                    if (currentIdx < sequence.length - 1) setActiveTab(sequence[currentIdx + 1]);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 h-11 px-8 rounded-lg font-bold bg-success text-white hover:text-white hover:bg-success/90 transition-all shadow-lg shadow-success/20"
                >
                  Tiếp theo <ArrowRight size={18} />
                </AppButton>
              ) : (
                <>


                  <AppButton appVariant="ghostMuted"
                    type="button"
                    disabled={activeUploads > 0}
                    onClick={methods.handleSubmit(onSubmit, onError)}
                    className="flex items-center gap-2 h-11 px-8 rounded-lg font-bold bg-success text-white hover:text-white hover:bg-success/90 transition-all shadow-lg shadow-success/20 disabled:opacity-50"
                  >
                    <CircleFadingArrowUp size={18} /> {activeUploads > 0 ? "Đang tải video..." : "Xuất bản"}
                  </AppButton>
                </>
              )}
            </div>
          </div>
        </form>

        {isUploading && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
            <div className="bg-white dark:bg-slate-800 border border-border text-slate-800 dark:text-slate-100 p-4 rounded-lg shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold">{uploadStatus}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300 animate-[progress-indeterminate_1.5s_infinite_linear]" style={{ width: '100%' }} />
                </div>
              </div>
              {activeUploads > 0 && (
                <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
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
      </FormProvider>
    </div>
  );
}

