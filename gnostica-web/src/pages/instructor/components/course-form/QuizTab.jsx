import React from "react";
import { useParams } from "react-router-dom";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Label } from "@/components/common/micro/AppLabel";
import AppInput from "@/components/common/micro/AppInput";
import AppSelect from "@/components/common/micro/AppSelect";
import { AppButton } from "@/components/common/micro/AppButton";
import { Database, CheckCircle2, FileText, Loader2, Sparkles, Pencil, Trash2, Check, Clock, Search, Plus, Save } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import questionService from "@/services/course/questionService";

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

export function QuizTab({ courseId }) {
  const { slug } = useParams();
  const { setValue, getValues, control } = useFormContext();
  const localStorageKey = `course_questions_${slug || 'new'}`;

  const [aiFile, setAiFile] = React.useState(null);
  const [aiQuestionCount, setAiQuestionCount] = React.useState(10);
  const [aiLevel, setAiLevel] = React.useState("medium");
  const isExcelFile = aiFile && (aiFile.name.toLowerCase().endsWith('.xlsx') || aiFile.name.toLowerCase().endsWith('.xls'));

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
  const confirmedBank = useWatch({ control, name: "questionBank" }) || [];
  const isBankConfirmed = JSON.stringify(draftQuestions) === JSON.stringify(confirmedBank);

  // Sync only to localStorage for persistent stage between tab switches
  React.useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(draftQuestions));
  }, [draftQuestions, localStorageKey]);

  // Load drafts from server on mount if localStorage is empty
  React.useEffect(() => {
    if (!courseId) return;
    const localQuestions = localStorage.getItem(localStorageKey);
    if (localQuestions && JSON.parse(localQuestions).length > 0) {
       return; 
    }

    const fetchQuestions = async () => {
      setIsFetchingDrafts(true);
      try {
        const questions = await questionService.getDraftQuestions(courseId);
        if (questions && questions.length > 0) {
          setDraftQuestions(questions);
          setValue("questionBank", questions);
        }
      } catch (err) {
        console.error("Lỗi khi tải câu hỏi:", err);
      } finally {
        setIsFetchingDrafts(false);
      }
    };
    fetchQuestions();
  }, [courseId, localStorageKey, setValue]);

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
  const [, setIsSavingDraft] = React.useState(false); // Fix undefined

  const handleCreateAI = async () => {
    if (!aiFile) {
      toast.error("Vui lòng tải lên tài liệu bài giảng trước khi tạo câu hỏi!");
      return;
    }
    if (!isExcelFile && (aiQuestionCount < 1 || aiQuestionCount > 100)) {
      toast.warning("Số lượng câu hỏi phải từ 1 đến 100!");
      return;
    }

    setIsGeneratingAi(true);
    toast.info("Đang phân tích tài liệu và sinh câu hỏi bằng AI...");

    try {
      const finalLevel = isExcelFile ? "mixed" : aiLevel;
      // Pass a large number or 0 if it's an excel file so backend processes all rows
      const finalCount = isExcelFile ? 1000 : aiQuestionCount;
      const generatedQuestions = await questionService.generateAiQuestions(courseId, aiFile, finalCount, finalLevel);
      if (generatedQuestions && generatedQuestions.length > 0) {
        // Find highest existing ID to continue numbering
        let highestId = draftQuestions.length > 0 ? Math.max(...draftQuestions.map(q => q.id)) : 0;

        const newQuestionsWithId = generatedQuestions.map(q => {
          highestId++;
          return { ...q, id: highestId };
        });

        setDraftQuestions(prev => [...prev, ...newQuestionsWithId]);
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
      toast.success("Đã cập nhật câu hỏi thành công!");
      setEditingQuestionId(null);
    } else {
      const newQuestion = {
        id: draftQuestions.length > 0 ? Math.max(...draftQuestions.map(q => q.id)) + 1 : 1,
        text: manualText,
        options: { ...manualOptions },
        correct: manualCorrect,
        level: manualLevel,
        explanation: manualExplanation
      };
      setDraftQuestions(prev => [...prev, newQuestion]);
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
      toast.success("Đã xóa câu hỏi!");
    }
  };

  const handleConfirmBank = async () => {
    if (draftQuestions.length === 0) {
      toast.warning("Ngân hàng câu hỏi đang trống!");
      return;
    }

    try {
      // Create a unique token to distinguish the draft in Redis
      const draftToken = Math.random().toString(36).substring(2, 15);
      
      // Save directly to backend redis if courseId exists (or just update local form)
      if (courseId) {
        try {
          await questionService.saveDraftQuestions(courseId, draftQuestions);
        } catch (redisErr) {
          console.warn("Redis backup failed (possibly concurrent auto-save). Proceeding with local confirm.", redisErr);
        }
      }
      
      setValue("questionBank", draftQuestions);
      setValue("draftToken", draftToken);
      toast.success(`Đã xác nhận duyệt thành công ${draftQuestions.length} câu hỏi! Các câu hỏi đã được đồng bộ.`);
    } catch (err) {
      console.error("Lỗi xác nhận ngân hàng câu hỏi:", err);
      toast.error("Không thể lưu ngân hàng câu hỏi!");
    }
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
          <Database className="w-5 h-5 text-success" />
          Tạo Ngân Hàng Câu Hỏi
        </h3>
        <p className="text-sm text-muted-foreground">
          Sử dụng AI để phân tích tài liệu bài giảng và tự động tạo ra ngân hàng câu hỏi.
        </p>
      </div>

      <div className="bg-muted border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <h4 className="text-md font-bold text-foreground mb-5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center text-xs font-bold">1</div>
          Tạo Question Bank bằng AI
        </h4>

        <div className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-3">
              <Label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                Upload tài liệu (PDF, DOCX, XLSX...)
              </Label>
              <div
                className="border-2 border-dashed border-success/40 bg-white rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-success/10/50 hover:border-success/40 transition-colors cursor-pointer group h-[220px] relative"
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.docx,.doc,.txt,.xlsx,.xls"
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
                    <div className="w-14 h-14 bg-success/10 text-success rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-success">{aiFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(aiFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-success/10 text-success/40 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:text-success transition-all">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-success">Kéo thả file vào đây hoặc nhấn để chọn</p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[280px]">
                      AI sẽ đọc và phân tích nội dung để tạo câu hỏi bám sát tài liệu bài giảng của bạn.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <Label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                Số lượng câu hỏi (Tối đa 100)
              </Label>
              <div className="h-[220px] flex flex-col justify-between">
                <AppInput
                  type="number"
                  value={isExcelFile ? "" : aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                  min={1}
                  max={100}
                  disabled={isExcelFile}
                  placeholder={isExcelFile ? "Tự động (theo file)" : ""}
                  className={`h-11 border-border font-bold ${isExcelFile ? "bg-muted cursor-not-allowed text-muted-foreground opacity-60" : "bg-white focus:border-success focus:ring-1 focus:ring-success"}`}
                />

                <div className="space-y-1.5 w-full">
                  <Label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Chọn cấp độ
                  </Label>
                  <AppSelect
                    value={isExcelFile ? "mixed" : aiLevel}
                    onValueChange={setAiLevel}
                    disabled={isExcelFile}
                    placeholder="Chọn cấp độ"
                    options={[
                      { value: 'easy', label: 'Dễ' },
                      { value: 'medium', label: 'Trung bình' },
                      { value: 'hard', label: 'Khó' },
                      { value: 'mixed', label: isExcelFile ? 'Hỗn hợp (Theo file)' : 'Hỗn hợp (Trộn cấp độ)' },
                    ]}
                  />
                </div>

                <AppButton appVariant="gradient"
                  type="button"
                  onClick={handleCreateAI}
                  disabled={isGeneratingAi}
                  className="w-full h-12 text-sm font-bold bg-success hover:bg-success/90 text-white rounded-lg gap-2 transition-all shadow-md shadow-success/20 disabled:opacity-70 disabled:cursor-not-allowed"
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

      <div id="manual-question-form" className="bg-white border border-border rounded-lg p-6 shadow-sm mt-8">
        <h4 className="text-md font-bold text-foreground mb-6 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-info/10 text-info text-info flex items-center justify-center text-xs font-bold">2</div>
            {editingQuestionId !== null ? "Hiệu Chỉnh Câu Hỏi" : "Thêm Câu Hỏi Thủ Công"}
          </div>
          {editingQuestionId !== null && (
            <span className="text-xs text-warning font-bold bg-warning/10 px-3 py-1.5 rounded-full border border-warning/30 animate-pulse">
              Đang chỉnh sửa câu hỏi #{editingQuestionId}
            </span>
          )}
        </h4>
        <div className="space-y-5 border-b border-border pb-6">
          <div className="space-y-2">
            <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Nội dung câu hỏi <span className="text-error">*</span>
            </Label>
            <div className="rounded-lg border border-border overflow-hidden focus-within:border-success focus-within:ring-1 focus-within:ring-success transition-all bg-white">
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
            <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Độ khó câu hỏi
            </Label>
            <AppSelect
  value={manualLevel}
  onValueChange={setManualLevel}
  placeholder="Chọn độ khó"
  options={[
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' },
  ]}
  triggerClassName="w-[180px] h-10 text-xs"
/>
          </div>
          <div className="space-y-3">
            <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Các đáp án & Chọn đáp án đúng <span className="text-error">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div key={opt} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${manualCorrect === opt ? 'border-success/30 bg-success/10/30' : 'border-border bg-muted'}`}>
                  <div className="pt-2.5">
                    <input
                      type="radio"
                      name="correctAnswer"
                      className="w-4 h-4 text-success focus:ring-success border-border cursor-pointer"
                      checked={manualCorrect === opt}
                      onChange={() => setManualCorrect(opt)}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${manualCorrect === opt ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {opt}
                    </span>
                    <AppInput
                      value={manualOptions[opt]}
                      onChange={(e) => setManualOptions({ ...manualOptions, [opt]: e.target.value })}
                      className={`h-10 pl-10 border-transparent bg-white shadow-sm focus:border-success focus:ring-1 focus:ring-success text-sm`}
                      placeholder={`Nhập đáp án ${opt}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Giải thích câu hỏi (Không bắt buộc)
            </Label>
            <textarea
              value={manualExplanation}
              onChange={(e) => setManualExplanation(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border p-3 bg-white focus:border-success focus:ring-1 focus:ring-success focus:outline-none text-sm text-foreground transition-all font-sans placeholder:text-muted-foreground"
              placeholder="Nhập giải thích chi tiết tại sao đáp án đúng là chính xác..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {editingQuestionId !== null && (
              <AppButton appVariant="ghostMuted" variant="ghost"
                type="button"
                onClick={handleCancelEdit}
                className="h-11 px-6 font-bold border border-border text-muted-foreground rounded-lg"
              >
                Hủy Chỉnh Sửa
              </AppButton>
            )}
            <AppButton appVariant="gradient"
              type="button"
              onClick={handleAddManual}
              className={`h-11 px-8 font-bold text-white rounded-lg gap-2 shadow-md border-none ${editingQuestionId !== null
                  ? 'bg-warning hover:bg-warning/80 shadow-warning/20'
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

      <div className="bg-white border border-border rounded-lg p-6 shadow-sm mt-8">
        <h4 className="text-md font-bold text-foreground mb-6 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center text-xs font-bold">3</div>
            Question Bank Preview
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border flex items-center gap-1.5">
            Tổng số câu hỏi: <span className="text-success font-bold">{draftQuestions.length}</span> câu
          </span>
        </h4>

        <div className="bg-white rounded-lg border border-border p-5 flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
            <div>
              <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                Danh sách câu hỏi
                <span className="bg-warning/10 text-warning text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Draft
                </span>
              </h5>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 w-full min-w-[200px] sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <AppInput
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  containerClassName="w-full"
                  className="pl-9 h-9 w-full border-border text-sm focus:ring-success focus:border-success bg-muted"
                />
              </div>
              <AppSelect
  value={filterLevel}
  onValueChange={setFilterLevel}
  placeholder="Độ khó"
  options={[
    { value: 'all', label: 'Tất cả' },
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' },
  ]}
  triggerClassName="w-[110px] h-9 text-xs"
/>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-[500px] max-h-[800px]">
            {filteredQuestions.length === 0 ? (
              <div className="h-full py-20 flex flex-col justify-center items-center text-muted-foreground">
                <p className="text-sm font-bold">Không tìm thấy câu hỏi nào phù hợp!</p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div key={q.id} className="border border-border rounded-lg p-4 hover:border-success/30 transition-colors bg-muted">
                  <div className="text-sm font-bold text-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: `Câu ${idx + 1}: ${q.text}` }} />

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isCorrect = q.correct === opt;
                      return (
                        <div key={opt} className={`flex items-start gap-2 px-3 py-2 rounded-md ${isCorrect ? 'bg-success/10 border border-success/30' : 'bg-white border border-border'}`}>
                          {isCorrect ? (
                            <span className="w-5 h-5 rounded bg-success/100 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded bg-success/10 text-success flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {opt}
                            </span>
                          )}
                          <span className={`text-xs ${isCorrect ? 'text-success font-bold' : 'text-muted-foreground'}`}>{q.options[opt]}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 p-3 bg-warning/10/50 border border-warning/20/60 rounded-lg text-xs text-warning leading-relaxed">
                      <span className="font-bold flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning/100 animate-pulse"></span>
                        Giải thích câu hỏi:
                      </span>
                      {q.explanation}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${q.level === 'easy' ? 'bg-success/10 text-success border border-success/20' :
                        q.level === 'medium' ? 'bg-warning/10 text-warning border border-warning/20' :
                          'bg-error/10 text-rose-700 border border-rose-100'
                      }`}>
                      {q.level === 'easy' ? 'Dễ' : q.level === 'medium' ? 'Trung bình' : 'Khó'}
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <AppButton appVariant="ghostMuted"
                        type="button"
                        onClick={() => handleStartEdit(q)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md bg-white border text-muted-foreground hover:text-warning hover:border-warning/30 transition-colors ${editingQuestionId === q.id ? 'border-warning bg-warning/10 text-warning ring-1 ring-warning' : 'border-border'
                          }`}
                      >
                        <Pencil size={14} />
                      </AppButton>
                      <AppButton appVariant="ghostMuted"
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-border text-muted-foreground hover:text-error hover:border-error/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </AppButton>
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
                  : "border-success/20 bg-success/10 text-success hover:bg-success/10"
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
