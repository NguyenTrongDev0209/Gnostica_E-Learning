import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Target, AlertTriangle, RefreshCw, XCircle, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Info, User, Trash, CornerDownRight, ChevronDown, ChevronUp, Send, MessageSquare, HelpCircle, Award } from "lucide-react";
import progressService from "@/services/course/progressService";
import commentService from "@/services/forum/commentService";
import useAuthStore from "@/store/useAuthStore";

export default function QuizArea({ quiz, existingResult, onBack, onQuizCompleted, onQuizReset }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scorePercent, setScorePercent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const quizTopRef = useRef(null);

  const questions = quiz?.questions || [];

  // Reset state khi đổi bài tập khác
  useEffect(() => {
      setUserAnswers({});
  }, [quiz?.id]);

  // Tải dữ liệu cũ nếu bài tập này học viên ĐÃ LÀM RỒI
  useEffect(() => {
      if (existingResult) {
          setIsSubmitted(true);
          setScorePercent(existingResult.point || 0);
          setCorrectCount(existingResult.correctAnswers || 0);
          if (quiz?.id) {
              const saved = localStorage.getItem(`quiz_answers_${quiz.id}`);
              if (saved) {
                  try {
                      setUserAnswers(JSON.parse(saved));
                  } catch (e) {}
              }
          }
      } else {
          setIsSubmitted(false);
          setScorePercent(0);
          setCorrectCount(0);
          setUserAnswers({});
      }
  }, [existingResult, quiz?.id]);

  if (!quiz || questions.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-border p-20 text-center shadow-sm">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100">
            <HelpCircle className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">Chương học chưa có bài tập</h2>
        <p className="text-muted-foreground font-bold mb-8">Bài quiz này hiện chưa chứa câu hỏi nào.</p>
        <Button onClick={onBack} className="rounded-lg font-bold">Quay lại xem Video</Button>
      </div>
    );
  }

  const handleOptionSelect = (qId, optId) => {
    if (isSubmitted || isSyncing) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(userAnswers).length === 0) {
        alert("Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài!");
        return;
    }
    
    setIsSyncing(true);
    try {
        let correct = 0;
        questions.forEach(q => {
            const selectedId = userAnswers[q.id];
            const correctOpt = q.answers?.find(a => a.isCorrect);
            if (selectedId && correctOpt && selectedId === correctOpt.id) {
                correct++;
            }
        });
        
        const finalScore = Math.round((correct / questions.length) * 100);

        // 1. Đẩy kết quả lên Server để lưu lịch sử và tính % khóa học
        await progressService.submitQuizResult(quiz.id, {
            point: finalScore * 1.0,
            totalQuestions: questions.length,
            correctAnswers: correct
        });

        // 2. Cập nhật state hiển thị local
        setCorrectCount(correct);
        setScorePercent(finalScore);
        setIsSubmitted(true);
        localStorage.setItem(`quiz_answers_${quiz.id}`, JSON.stringify(userAnswers));

        // 3. Thông báo cho cha để update UI sidebar dấu tick & tổng %
        if (onQuizCompleted) {
            onQuizCompleted(quiz.id, finalScore, correct, questions.length);
        }

        quizTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        alert("Đã xảy ra lỗi khi gửi bài làm, vui lòng thử lại sau!");
    } finally {
        setIsSyncing(false);
    }
  };

  const handleReset = async () => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa kết quả hiện tại để làm lại từ đầu không?")) return;

      setIsSyncing(true);
      try {
          // 1. Gọi Server xóa bản ghi kết quả
          await progressService.resetQuizResult(quiz.id);

          // 2. Reset state giao diện local
          setIsSubmitted(false);
          setUserAnswers({});
          setScorePercent(0);
          setCorrectCount(0);
          localStorage.removeItem(`quiz_answers_${quiz.id}`);

          // 3. Thông báo cho cha để gỡ dấu tick ở Sidebar
          if (onQuizReset) {
              onQuizReset(quiz.id);
          }
      } catch (err) {
          alert("Đã xảy ra lỗi khi reset bài tập. Vui lòng thử lại sau!");
      } finally {
          setIsSyncing(false);
      }
  };

  // ── CHỈNH SỬA GIAO DIỆN THEO MẪU ──
  const isPassed = scorePercent >= 50;

  return (
    <div ref={quizTopRef} className="w-full space-y-6 max-w-5xl mx-auto pb-12 pt-2">
        {/* Header Banner (Theo mẫu) */}
        <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200 shrink-0">
                    <Trophy className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-foreground leading-tight">
                        Bài kiểm tra Trắc nghiệm: {quiz.title}
                    </h2>
                    <p className="text-muted-foreground text-xs font-bold mt-1 flex items-center gap-1.5">
                        Bao gồm {questions.length} câu hỏi trắc nghiệm
                    </p>
                </div>
            </div>
            
            {/* Nút quay lại bài học */}
            <Button onClick={onBack} variant="ghost" className="font-extrabold text-xs gap-1 text-muted-foreground hover:bg-muted rounded-lg self-end sm:self-center">
                <ChevronLeft className="w-3.5 h-3.5" /> Quay lại xem Video
            </Button>
        </div>

        {/* Bảng kết quả điểm số (Hiện ra sau khi nộp bài) */}
        {isSubmitted && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-6 md:p-8 text-white shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 ${isPassed ? 'bg-emerald-500' : 'bg-warning/10 text-warning'} rounded-full flex items-center justify-center shadow-lg shrink-0`}>
                        {isPassed ? <Award className="w-8 h-8 text-white" /> : <HelpCircle className="w-8 h-8 text-white" />}
                    </div>
                    <div>
                        <h3 className="text-xl font-black leading-none">
                            {isPassed ? "Hoàn Thành Xuất Sắc!" : "Cần Cố Gắng Thêm"}
                        </h3>
                        <p className="text-indigo-200/80 text-sm font-medium mt-2">
                            Kết quả bài thi: <strong className="text-white font-black">{correctCount}/{questions.length}</strong> đáp án đúng (Đạt {scorePercent}%)
                        </p>
                        {!isPassed && (
                            <p className="text-warning/90 text-[13px] font-bold mt-1 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5" /> Bạn cần đạt từ 50% trở lên để vượt qua bài kiểm tra này.
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3 shrink-0">
                    <Button 
                       onClick={handleReset} 
                       disabled={isSyncing}
                       variant="outline" 
                       className="rounded-lg font-extrabold border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-2 text-xs h-11 px-5"
                    >
                        {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Làm lại bài thi
                    </Button>
                </div>
            </div>
        )}

        {/* Questions List (Theo mẫu mockup) */}
        <div className="space-y-5">
            {questions.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-xl p-6 md:p-8 border border-border/60 shadow-sm space-y-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-sm md:text-[15px] font-extrabold text-foreground leading-relaxed flex gap-1.5 items-start">
                        <span className="shrink-0">Câu {idx + 1}:</span>
                        <span dangerouslySetInnerHTML={{ __html: q.content }}></span>
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                        {(q.answers || []).map((opt, oIdx) => {
                            const optionLabel = opt.optionLabel || String.fromCharCode(65 + oIdx);
                            const isSelected = userAnswers[q.id] == opt.id; // Use loose comparison to avoid JS type mismatches
                            const isCorrect = opt.isCorrect;

                            let buttonClass = "w-full flex items-center justify-between p-4 text-left border rounded-lg transition-all duration-200 text-xs md:text-[13px] font-medium ";
                            let icon = null;

                            if (!isSubmitted) {
                                // CHẾ ĐỘ ĐANG LÀM BÀI
                                if (isSelected) {
                                    buttonClass += "bg-violet-50/50 border-violet-500 text-violet-900 font-bold shadow-sm";
                                } else {
                                    buttonClass += "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted hover:border-border";
                                }
                            } else {
                                // CHẾ ĐỘ XEM KẾT QUẢ
                                if (isSelected && isCorrect) {
                                    buttonClass += "bg-emerald-50/40 border-emerald-500 text-emerald-900 font-bold shadow-sm";
                                    icon = (
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm shrink-0">
                                            <CheckCircle2 className="w-3 h-3" /> Lựa chọn đúng
                                        </span>
                                    );
                                } else if (isSelected && !isCorrect) {
                                    buttonClass += "bg-rose-50/40 border-rose-500 text-rose-900 font-bold shadow-sm";
                                    icon = (
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm shrink-0">
                                            <XCircle className="w-3 h-3" /> Lựa chọn sai
                                        </span>
                                    );
                                } else {
                                    buttonClass += "bg-muted/20 border-border text-muted-foreground opacity-60";
                                }
                            }

                            return (
                                <button
                                    key={opt.id}
                                    disabled={isSyncing || isSubmitted}
                                    onClick={() => handleOptionSelect(q.id, opt.id)}
                                    className={buttonClass}
                                >
                                    <span className="pr-4">{optionLabel}. {opt.answerText}</span>
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                    {isSubmitted && q.answers.some(opt => opt.id == userAnswers[q.id] && opt.isCorrect) && q.explanation && (
                        <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm animate-in fade-in slide-in-from-top-2">
                            <p className="font-bold mb-1 flex items-center gap-1.5"><Info className="w-4 h-4" /> Giải thích:</p>
                            <div dangerouslySetInnerHTML={{ __html: q.explanation }}></div>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Nút Nộp bài ở cuối trang (Chỉ hiện khi chưa nộp) */}
        {!isSubmitted && (
            <div className="pt-4 flex justify-end">
                <Button 
                    onClick={handleSubmitQuiz}
                    disabled={isSyncing}
                    className="h-12 px-12 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-violet-100 transition-all hover:scale-[1.02] active:scale-95 gap-2"
                >
                    {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    NỘP BÀI THI VÀ CHẤM ĐIỂM
                </Button>
            </div>
        )}
    </div>
  );
}

// ── Component Hỗ Trợ: Giao Diện Hỏi Đáp Q&A ──
