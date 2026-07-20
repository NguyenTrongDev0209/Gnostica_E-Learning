import React from "react";
import { useParams } from "react-router-dom";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { AppButton } from "@/components/common/micro/AppButton";
import { Label } from "@/components/common/micro/AppLabel";
import AppInput from "@/components/common/micro/AppInput";
import AppSelect from "@/components/common/micro/AppSelect";
import AppTextarea from "@/components/common/micro/AppTextarea";
import { CheckCircle2, Database, Plus, Trash2, GripVertical, Search, Check, Save, ListOrdered } from "lucide-react";
import { BackgroundVideoUploader } from "./BackgroundVideoUploader";

export function SectionItem({ sectionIndex, control, uploadVideoToBunny, setActiveUploads }) {
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
        <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
          Tiêu đề chương <span className="text-error">*</span>
        </Label>
        <AppInput
          className="h-12 border-border focus-visible:ring-success focus-visible:bg-white bg-muted font-medium "
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
          <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Tài liệu đính kèm (PDF, ZIP,...) (Nếu có)
          </Label>
          <div className="flex flex-col gap-3">
            <Controller
              name={`sections.${sectionIndex}.attachments`}
              control={control}
              render={({ field }) => (
                field.value && typeof field.value === "string" ? (
                  <div className="flex items-center gap-2 p-2 border border-success/20 rounded-md bg-success/10 h-10">
                    <span className="text-xs text-success font-bold flex-1 truncate">Đã có tài liệu</span>
                    <a href={field.value} target="_blank" rel="noreferrer" className="text-xs text-info hover:underline px-2 border-r border-success/20">Xem file</a>
                    <AppButton appVariant="ghostMuted"
                      type="button"
                      className="text-xs font-bold text-error hover:text-error px-2"
                      onClick={() => field.onChange(null)}
                    >
                      Đổi file khác
                    </AppButton>
                  </div>
                ) : (
                  <AppInput
                    type="file"
                    className="h-12 border-border focus-visible:ring-success focus-visible:bg-white bg-muted font-medium text-xs pt-2 cursor-pointer w-full"
                    onChange={(e) => field.onChange(e.target.files[0])}
                  />
                )
              )}
            />
            {watch(`sections.${sectionIndex}.quiz.questionIds`)?.length > 0 ? (
              <AppButton appVariant="gradient"
                type="button"
                onClick={() => setIsQuizModalOpen(true)}
                className="w-full h-10 border-success/30 text-success bg-success/10 hover:bg-success/20 hover:text-success font-bold gap-2 shadow-sm transition-all border"
              >
                <CheckCircle2 size={16} className="text-success" />
                <span>Đã có bài Quiz ({watch(`sections.${sectionIndex}.quiz.questionIds`).length} câu) - Chỉnh sửa</span>
              </AppButton>
            ) : (
              <AppButton appVariant="gradient"
                type="button"
                onClick={() => setIsQuizModalOpen(true)}
                className="w-full h-10 border-success/30 text-success hover:bg-success/10 hover:text-success font-bold gap-2 border-dashed bg-transparent shadow-none"
              >
                <Database size={16} />
                Tạo bài Quiz cho chương này
              </AppButton>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Trạng thái chương <span className="text-error">*</span>
          </Label>
          <Controller
            name={`sections.${sectionIndex}.status`}
            control={control}
            render={({ field }) => (
              <AppSelect
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
                placeholder="Chọn trạng thái"
                options={[
                  { value: "1", label: `Hoạt động ${currentCourseStatus === 2 ? "(Bị khóa)" : ""}`, disabled: currentCourseStatus === 2 },
                  { value: "2", label: "Ẩn" }
                ]}
                triggerClassName="h-10"
              />
            )}
          />
        </div>
      </div>

      {/* Danh sách Bài học */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Danh Sách Bài Học ({fields.length})
          </Label>
          <AppButton appVariant="ghostMuted"
            type="button"
            className="flex items-center gap-1.5 text-xs font-bold text-success hover:text-success bg-success/10 hover:bg-success/10 text-success px-2 py-1.5 rounded-md transition-colors"
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
          </AppButton>
        </div>

        <div className="space-y-6 pb-4 pt-2 border-t border-slate-50 mt-3">
          {fields.map((lesson, lessonIdx) => (
            <div
              key={lesson.id}
              className="group flex gap-4 p-5 border border-border rounded-lg bg-white hover:border-success/20 hover:shadow-lg transition-all duration-300 relative"
            >


              <div className="pt-1 text-slate-300 cursor-grab active:cursor-grabbing hover:text-muted-foreground">
                <GripVertical size={20} />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Information (Title + Description + Dates) */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                      Tiêu đề bài học <span className="text-error">*</span>
                    </Label>
                    <AppInput
                      className="h-12 border-border focus-visible:ring-success focus-visible:bg-white bg-muted font-medium "
                      placeholder={`Ví dụ: Bài giảng số ${lessonIdx + 1}: Giới thiệu ngôn ngữ`}
                      {...register(`sections.${sectionIndex}.lessons.${lessonIdx}.title`)}
                      autoComplete="off"
                    />
                    {errors.sections?.[sectionIndex]?.lessons?.[lessonIdx]?.title && (
                      <p className="text-[10px] font-bold text-error pl-1">{errors.sections[sectionIndex].lessons[lessonIdx].title.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                      Mô tả nội dung bài học
                    </Label>
                    <AppTextarea
                      className="min-h-[120px] resize-y border-border focus-visible:ring-success focus-visible:bg-white bg-muted font-medium p-4 leading-relaxed text-xs "
                      placeholder="Một đoạn mô tả ngắn về những gì học viên sẽ được học trong bài này..."
                      {...register(`sections.${sectionIndex}.lessons.${lessonIdx}.content`)}
                    />
                    {errors.sections?.[sectionIndex]?.lessons?.[lessonIdx]?.content && (
                      <p className="text-[10px] font-bold text-error pl-1">{errors.sections[sectionIndex].lessons[lessonIdx].content.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                      Trạng thái bài học <span className="text-error">*</span>
                    </Label>
                    <Controller
                      name={`sections.${sectionIndex}.lessons.${lessonIdx}.status`}
                      control={control}
                      render={({ field }) => (
                        <AppSelect
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
                          placeholder="Chọn trạng thái"
                          options={[
                            { value: "1", label: `Hoạt động ${currentSectionStatus === 2 ? "(Bị khóa)" : ""}`, disabled: currentSectionStatus === 2 },
                            { value: "2", label: "Ẩn" }
                          ]}
                          triggerClassName="h-9 text-xs"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Right side: Video Upload Box */}
                <div className="space-y-1.5 flex flex-col justify-between">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                    Video bài học
                  </Label>
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
              <AppButton appVariant="ghostMuted"
                type="button"
                onClick={() => remove(lessonIdx)}
                className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-white border border-border text-muted-foreground hover:text-error hover:border-error/20 hover:bg-error/10 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-md z-30"
                title="Xóa bài học"
              >
                <Trash2 size={14} />
              </AppButton>
            </div>
          ))}
        </div>
      </div>

      {/* Error level Section */}
      {errors.sections?.[sectionIndex]?.lessons?.root && (
        <p className="text-xs font-bold text-error bg-error/10 p-2 rounded-md mt-2">
          {errors.sections[sectionIndex].lessons.root.message}
        </p>
      )}

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-muted/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-success" />
                Tạo Bài Quiz - Chương {sectionIndex + 1}
              </h3>
              <AppButton appVariant="ghostMuted"
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </AppButton>
            </div>

            <div className="p-6 flex flex-col flex-1 overflow-hidden space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[580px] overflow-hidden">
                {/* L Pane: Bài Quiz */}
                <div className="flex flex-col gap-4 overflow-hidden h-full">
                  <div className="space-y-2 shrink-0">
                    <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Tên bài Quiz <span className="text-error">*</span>
                    </Label>
                    <AppInput
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Ví dụ: Kiểm tra kiến thức chương"
                      className="h-11 border-border focus:border-success focus:ring-1 focus:ring-success font-bold bg-white"
                    />
                  </div>

                  <div className="border border-border rounded-lg flex flex-col flex-1 overflow-hidden bg-white shadow-sm">
                    <div className="bg-success/10/50 px-4 py-3 border-b border-success/20 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-success block">Nội dung bài Quiz</span>
                        <span className="text-[11px] text-success font-bold">{selectedQuizQuestions.length} câu hỏi được chọn</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-muted">
                      {selectedQuizQuestions.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center text-muted-foreground border-dashed border-2 border-border rounded-lg p-8 bg-white">
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
                              <div key={qId} className="border border-success/20 rounded-lg p-3 bg-white shadow-sm flex items-center justify-between gap-3 hover:border-error/20 transition-colors">
                                <div className="flex gap-3 items-start flex-1">
                                  <div className="pt-0.5 shrink-0">
                                    <div className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-xs font-bold text-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: qDetails?.text || "Đang tải câu hỏi..." }} />
                                  </div>
                                </div>
                                <AppButton appVariant="ghostMuted"
                                  type="button"
                                  onClick={() => setSelectedQuizQuestions(selectedQuizQuestions.filter(id => id !== qId))}
                                  className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-error hover:bg-error/10 transition-all shrink-0"
                                  title="Xóa khỏi bài Quiz"
                                >
                                  <Trash2 size={13} />
                                </AppButton>
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
                  <div className="border border-border rounded-lg flex flex-col flex-1 overflow-hidden bg-white shadow-sm">
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
                            className="pl-8 h-8 text-xs border-border bg-white focus:ring-success focus:border-success" 
                          />
                        </div>
                        <select 
                          value={filterLevel} 
                          onChange={(e) => setFilterLevel(e.target.value)}
                          className="w-[110px] h-8 border border-border bg-white text-xs font-bold rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-success cursor-pointer shadow-sm text-foreground"
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
                          <div key={q.id} className="border border-border rounded-lg p-3 hover:border-success/30 transition-colors flex gap-3 cursor-pointer group bg-white">
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
                                className="w-4 h-4 rounded border-border text-success focus:ring-success cursor-pointer"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.text }} />

                              <div className="mt-3 grid grid-cols-1 gap-2">
                                {["A", "B", "C", "D"].map((opt) => {
                                  const isCorrect = q.correct === opt;
                                  return (
                                    <div key={opt} className={`flex items-start gap-2 px-2.5 py-1.5 rounded border ${
                                      isCorrect ? "bg-success/10 border-success/30 text-success font-bold" : "bg-muted border-border text-muted-foreground"
                                    }`}>
                                      <span className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5 ${
                                        isCorrect ? "bg-success/100 text-white" : "bg-success/10 text-success"
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
                                  q.level === "hard" ? "text-error bg-error/10 border-error/20" :
                                  q.level === "medium" ? "text-warning bg-warning/10 border-warning/20" :
                                  "text-success bg-success/10 border-success/20"
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
              <AppButton appVariant="gradient" type="button" onClick={handleSaveQuiz} className="h-11 px-8 font-bold bg-success hover:bg-success text-white gap-2 shadow-md shadow-success/20 border-none">
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
