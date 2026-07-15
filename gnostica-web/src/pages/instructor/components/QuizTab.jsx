import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { AppButton } from "@/components/common/micro/AppButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Video, GripVertical, Trash2, Plus, PlayCircle, FileText, Check, Loader2, Sparkles, Database, CheckCircle2, ListOrdered, Search, Pencil, Clock, Save } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import questionService from "@/services/course/questionService";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};
export default function QuizTab({ courseId }) {
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
                <Input
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
                  <Select value={aiLevel} onValueChange={setAiLevel}>
                    <SelectTrigger className="w-full h-11 border-border bg-white text-xs font-bold focus:ring-indigo-500 focus:border-indigo-500">
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
            <Select value={manualLevel} onValueChange={setManualLevel}>
              <SelectTrigger className="w-[180px] h-10 border-border bg-white text-xs font-bold focus:ring-indigo-500 focus:border-indigo-500">
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
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 border-border text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-muted"
                />
              </div>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[110px] h-9 border-border bg-muted text-xs font-bold focus:ring-indigo-500 focus:border-indigo-500">
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

