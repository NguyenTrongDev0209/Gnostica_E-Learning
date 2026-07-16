import { toast } from "sonner";
import React from "react";
import useInstructorCourseForm from "@/hooks/course/useInstructorCourseForm";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CircleFadingArrowUp, Save, Sparkles, Loader2 } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppButton } from "@/components/common/micro/AppButton";

import CourseStepper from "@/pages/instructor/components/CourseStepper";
import BasicInfoTab from "@/pages/instructor/components/BasicInfoTab";
import QuizTab from "@/pages/instructor/components/QuizTab";
import CurriculumTab from "@/pages/instructor/components/CurriculumTab";
import SettingsTab from "@/pages/instructor/components/SettingsTab";

import { courseSchema, viErrorMap } from "@/utils/validations/courseSchema";
import CourseDraftModal from "@/pages/instructor/components/CourseDraftModal";

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
      </FormProvider>
    </div>
  );
}
