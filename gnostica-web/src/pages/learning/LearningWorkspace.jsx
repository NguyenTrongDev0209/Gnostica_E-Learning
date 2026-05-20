import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  MessageSquare,
  Info,
  FileText,
  MoreVertical,
  LayoutDashboard,
  Loader2,
  Download,
  Trophy,
  Award,
  HelpCircle,
  XCircle,
  Send,
  Trash,
  User,
  CornerDownRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import courseService from "@/services/courseService";
import enrollmentService from "@/services/enrollmentService";
import commentService from "@/services/commentService";
import authService from "@/services/authService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ── Component Hỗ Trợ: Giao Diện Làm Bài Quiz Cho Học Viên ──
function QuizArea({ quiz, existingResult, onBack, onQuizCompleted, onQuizReset }) {
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
      } else {
          setIsSubmitted(false);
          setScorePercent(0);
          setCorrectCount(0);
      }
  }, [existingResult]);

  if (!quiz || questions.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100">
            <HelpCircle className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Chương học chưa có bài tập</h2>
        <p className="text-slate-500 font-bold mb-8">Bài quiz này hiện chưa chứa câu hỏi nào.</p>
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
        await courseService.submitQuizResult(quiz.id, {
            point: finalScore * 1.0,
            totalQuestions: questions.length,
            correctAnswers: correct
        });

        // 2. Cập nhật state hiển thị local
        setCorrectCount(correct);
        setScorePercent(finalScore);
        setIsSubmitted(true);

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
          await courseService.resetQuizResult(quiz.id);

          // 2. Reset state giao diện local
          setIsSubmitted(false);
          setUserAnswers({});
          setScorePercent(0);
          setCorrectCount(0);

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
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200 shrink-0">
                    <Trophy className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                        Bài kiểm tra Trắc nghiệm: {quiz.title}
                    </h2>
                    <p className="text-slate-500 text-xs font-bold mt-1 flex items-center gap-1.5">
                        Bao gồm {questions.length} câu hỏi trắc nghiệm
                    </p>
                </div>
            </div>
            
            {/* Nút quay lại bài học */}
            <Button onClick={onBack} variant="ghost" className="font-extrabold text-xs gap-1 text-slate-500 hover:bg-slate-50 rounded-lg self-end sm:self-center">
                <ChevronLeft className="w-3.5 h-3.5" /> Quay lại xem Video
            </Button>
        </div>

        {/* Bảng kết quả điểm số (Hiện ra sau khi nộp bài) */}
        {isSubmitted && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-6 md:p-8 text-white shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 ${isPassed ? 'bg-emerald-500' : 'bg-orange-500'} rounded-full flex items-center justify-center shadow-lg shrink-0`}>
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
                            <p className="text-orange-300/90 text-[13px] font-bold mt-1 flex items-center gap-1.5">
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
                <div key={q.id} className="bg-white rounded-xl p-6 md:p-8 border border-slate-200/60 shadow-sm space-y-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-sm md:text-[15px] font-extrabold text-slate-900 leading-relaxed flex gap-1.5 items-start">
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
                                    buttonClass += "bg-slate-50/40 border-slate-200/60 text-slate-600 hover:bg-slate-50 hover:border-slate-300";
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
                                    buttonClass += "bg-slate-50/20 border-slate-100 text-slate-400 opacity-60";
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
function LessonQA({ lesson }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collapsedComments, setCollapsedComments] = useState(new Set());
  const currentUser = authService.getCurrentUser();

  const toggleCollapse = (id) => {
    setCollapsedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const fetchComments = useCallback(async () => {
    if (!lesson?.id) return;
    setLoading(true);
    try {
      const data = await commentService.getCommentsByThreadId(`lesson_${lesson.id}`);
      setComments(data || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  }, [lesson?.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    if (!content.trim() || !currentUser?.email) return;

    setIsSubmitting(true);
    try {
      await commentService.addComment({
        content,
        objectId: `lesson_${lesson.id}`,
        userEmail: currentUser.email,
        parentId
      });
      if (parentId) {
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
      fetchComments();
    } catch (error) {
      alert(error?.response?.data || "Đã xảy ra lỗi khi gửi bình luận.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      await commentService.deleteComment(id, currentUser.email);
      fetchComments();
    } catch (error) {
      alert("Xóa bình luận thất bại.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-4 ${isReply ? 'mt-4' : 'mt-6 pt-6 border-t border-slate-100'}`}>
      <Avatar className="w-10 h-10 border border-slate-200 shrink-0">
        <AvatarImage src={comment.account?.avatar} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {comment.account?.fullName?.charAt(0) || <User className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 relative group">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-slate-900">{comment.account?.fullName || "Người dùng"}</span>
            <span className="text-xs text-slate-400 font-medium">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{comment.content}</p>
          
          {currentUser?.email === comment.account?.email && (
            <button 
              onClick={() => handleDelete(comment.id)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-2 ml-2">
          <button 
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
          >
            <CornerDownRight className="w-3.5 h-3.5" /> Phản hồi
          </button>
          {comment.replies && comment.replies.length > 0 && (
            <button 
              onClick={() => toggleCollapse(comment.id)}
              className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
            >
              {collapsedComments.has(comment.id) ? (
                <><ChevronDown className="w-3.5 h-3.5" /> Hiển thị {comment.replies.length} phản hồi</>
              ) : (
                <><ChevronUp className="w-3.5 h-3.5" /> Ẩn phản hồi</>
              )}
            </button>
          )}
        </div>

        {replyingTo === comment.id && (
          <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Viết phản hồi..."
              className="flex-1 text-sm rounded-md border-slate-200 focus:border-primary focus:ring-primary/20"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={isSubmitting || !replyContent.trim()} className="rounded-md px-4">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && !collapsedComments.has(comment.id) && (
          <div className="pl-4 border-l-2 border-slate-100 mt-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-primary" /> Thảo luận bài học
      </h3>

      <form onSubmit={(e) => handleSubmit(e, null)} className="mb-8">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12 border border-slate-200 shrink-0">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {currentUser?.fullName?.charAt(0) || <User className="w-6 h-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Bạn có câu hỏi gì về bài học này?"
              className="w-full rounded-2xl border-slate-200 focus:border-primary focus:ring-primary/20 min-h-[100px] p-4 text-sm resize-y shadow-sm"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()} 
              className="absolute bottom-3 right-3 rounded-xl gap-2 h-9 px-4 shadow-md font-bold"
            >
              Gửi <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-8 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map(c => renderComment(c, false))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Chưa có bình luận nào.</p>
          <p className="text-sm mt-1 opacity-80">Hãy là người đầu tiên đặt câu hỏi!</p>
        </div>
      )}
    </div>
  );
}

export default function LearningWorkspace() {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const targetLessonSlug = searchParams.get("lesson");
  const isRestart = searchParams.get("restart") === "true";
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [activeViewMode, setActiveViewMode] = useState("video"); // 'video' | 'quiz'
  const [lessonProgress, setLessonProgress] = useState([]);
  const [quizProgress, setQuizProgress] = useState([]); // Track existing quiz results
  const [currentTime, setCurrentTime] = useState(0);

  // === REFS để tránh stale closure trong interval/listener ===
  const currentTimeRef = useRef(0);
  const currentLessonRef = useRef(null);
  const completedIdsRef = useRef([]);
  const hasEndedRef = useRef(false); // Chặn gọi completed nhiều lần

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      try {
        setCheckingEnrollment(true);
        const access = await enrollmentService.checkEnrollment(slug);
        setIsEnrolled(access.isEnrolled);

        if (access.isEnrolled) {
          await fetchCourseData();
        } else {
          setLoading(false);
        }
      } catch (err) {
        setIsEnrolled(false);
        setLoading(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    if (slug) {
      checkAccessAndFetch();
    }
  }, [slug]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, progressData] = await Promise.all([
        courseService.getCourseBySlug(slug),
        courseService.getCourseProgress(slug)
      ]);
      
      // Lấy tất cả Module và Lesson (kể cả ẩn hoặc xóa mềm) cho người dùng đã mua khóa học
      const activeModules = courseData.modules || [];
      
      if (activeModules.length === 0) {
          navigate("/404");
          return;
      }

      setCourse({ ...courseData, modules: activeModules });
      
      // Nhận data gộp: { lessons: [], quizzes: [] }
      const lessonsList = progressData?.lessons || [];
      setLessonProgress(lessonsList);
      setQuizProgress(progressData?.quizzes || []);

      // Khôi phục phiên học: 
      // 1. Ưu tiên lesson trong URL
      // 2. Sau đó mới đến bài học vừa xem gần nhất trong DB
      let lessonFound = false;
      if (targetLessonSlug) {
           activeModules.forEach((mod, sIdx) => {
              const lIdx = mod.lessons.findIndex(l => String(l.id) === targetLessonSlug);
              if (lIdx !== -1) {
                  setActiveSectionIdx(sIdx);
                  setActiveLessonIdx(lIdx);
                  lessonFound = true;
              }
          });
      }

      if (!lessonFound && lessonsList && lessonsList.length > 0) {
          const lastActive = [...lessonsList]
              .filter(p => p.updatedAt)
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
          
          if (lastActive) {
              activeModules.forEach((mod, sIdx) => {
                  const lIdx = mod.lessons.findIndex(l => l.id === lastActive.lessonId);
                  if (lIdx !== -1) {
                      setActiveSectionIdx(sIdx);
                      setActiveLessonIdx(lIdx);
                  }
              });
          }
      }
    } catch (err) {
      navigate("/404");
    } finally {
      setLoading(false);
    }
  };

  // === Derived values ===
  const completedLessonIds = lessonProgress.filter(lp => lp.isCompleted).map(lp => lp.lessonId);
  const completedQuizIds = quizProgress.filter(qp => qp.point >= 50).map(qp => qp.quizId);

  const currentSection = course?.modules?.[activeSectionIdx];
  const currentLesson = currentSection?.lessons?.[activeLessonIdx];
  
  const currentLessonProgress = lessonProgress.find(lp => lp.lessonId === currentLesson?.id);
  const startAtTime = isRestart ? 0 : (currentLessonProgress?.lastWatchedTime || 0);

  // === Sync quiz results callbacks ===
  const onQuizCompleted = (quizId, point, correctAnswers, totalQuestions) => {
      setQuizProgress(prev => {
          const exists = prev.some(q => q.quizId === quizId);
          if (exists) {
              return prev.map(q => q.quizId === quizId ? { ...q, point, correctAnswers, totalQuestions } : q);
          }
          return [...prev, { quizId, point, correctAnswers, totalQuestions, completedAt: new Date().toISOString() }];
      });
  };

  const onQuizReset = (quizId) => {
      setQuizProgress(prev => prev.filter(q => q.quizId !== quizId));
  };

  // === Đồng bộ refs mỗi khi giá trị thay đổi ===
  useEffect(() => { currentLessonRef.current = currentLesson; }, [currentLesson]);
  useEffect(() => { completedIdsRef.current = completedLessonIds; }, [completedLessonIds]);

  const handleLessonSelect = (sectionIdx, lessonIdx) => {
    setActiveSectionIdx(sectionIdx);
    setActiveLessonIdx(lessonIdx);
    setActiveViewMode("video");
  };

  const handleQuizSelect = (sectionIdx) => {
      setActiveSectionIdx(sectionIdx);
      setActiveViewMode("quiz");
  };

  const handleNextLesson = useCallback(() => {
    if (!course?.modules) return;

    const section = course.modules[activeSectionIdx];
    const lessons = section?.lessons || [];

    if (activeLessonIdx < lessons.length - 1) {
      // Còn bài trong chương hiện tại
      setActiveLessonIdx(activeLessonIdx + 1);
    } else if (activeSectionIdx < course.modules.length - 1) {
      // Hết bài trong chương hiện tại, sang chương tiếp theo
      setActiveSectionIdx(activeSectionIdx + 1);
      setActiveLessonIdx(0);
    }
  }, [course, activeSectionIdx, activeLessonIdx]);

  const markLessonComplete = useCallback(async (lessonId) => {
    if (completedIdsRef.current.includes(lessonId)) return;
    try {
        await courseService.markLessonCompleted(lessonId);
        setLessonProgress(prev => {
            const existing = prev.find(p => p.lessonId === lessonId);
            if (existing) {
                return prev.map(p => p.lessonId === lessonId ? { ...p, isCompleted: true } : p);
            }
            return [...prev, { lessonId, isCompleted: true, lastWatchedTime: 0 }];
        });
    } catch (err) {
    }
  }, []);

  const handleLessonEnded = useCallback(async () => {
    const lesson = currentLessonRef.current;
    if (!lesson) return;
    
    // Nếu bài học đã có tích xanh rồi, chúng ta chỉ cần chuyển bài
    if (completedIdsRef.current.includes(lesson.id)) {
        handleNextLesson();
        return;
    }

    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    
    try {
        // Gọi API lưu trạng thái hoàn thành
        await markLessonComplete(lesson.id);
        // Sau khi lưu xong, tự động chuyển bài sau 1 giây để người dùng kịp thấy tích xanh
        setTimeout(() => {
            handleNextLesson();
        }, 1000);
    } catch (err) {
        // Dù lỗi lưu nhưng vẫn chuyển bài để không làm gián đoạn trải nghiệm học
        handleNextLesson();
    }
  }, [markLessonComplete, handleNextLesson]);

  // === Reset trạng thái ended khi đổi bài ===
  useEffect(() => {
    hasEndedRef.current = false;
    currentTimeRef.current = 0;
    setCurrentTime(0);
  }, [currentLesson?.id]);

  // Video URL handling logic
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    let libraryId = "655066"; // default legacy fallback
    let videoId = url;
    let baseUrl = "";
    
    // Resilient dynamic check: Check if the url is a composite string format: "libraryId/videoId"
    if (url.includes("/")) {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1];
      if (uuidRegex.test(lastPart)) {
        videoId = lastPart;
        // Extra safety: Only assign libraryId if there's a non-empty value before the slash
        const secondToLast = parts[parts.length - 2];
        if (secondToLast && secondToLast.length > 2) {
          libraryId = secondToLast;
        }
      }
    }

    if (uuidRegex.test(videoId)) {
      baseUrl = `https://player.mediadelivery.net/embed/${libraryId}/${videoId}`;
    } else if (url.includes("video.bunny.net/play/") || url.includes("video.bunny.net/embed/")) {
      baseUrl = url.replace(/video\.bunny\.net\/(play|embed)\//, "player.mediadelivery.net/embed/");
    } else {
      baseUrl = url.replace("iframe.mediadelivery.net", "player.mediadelivery.net");
    }

    const separator = baseUrl.includes("?") ? "&" : "?";
    let finalUrl = `${baseUrl}${separator}playerjs=1&content_ended=1`;
    
    if (startAtTime > 0) {
        finalUrl += `&t=${startAtTime}`;
    }
    
    return finalUrl;
  };

  const isEmbedLink = (url) => {
    if (!url) return false;
    const isDirectVideo = /\.(m3u8|mp4|mov|webm)($|\?)/i.test(url);
    if (isDirectVideo) return false;

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    // Check direct UUID
    if (uuidRegex.test(url)) return true;
    // Check composite libraryId/videoId format
    if (url.includes("/")) {
      const parts = url.split("/");
      if (uuidRegex.test(parts[parts.length - 1])) return true;
    }

    const lowUrl = url.toLowerCase();
    return (lowUrl.includes("mediadelivery.net") || lowUrl.includes("bunny.net") || lowUrl.includes("vimeo.com")) && !lowUrl.includes("b-cdn.net");
  };

  const embedUrl = getEmbedUrl(currentLesson?.videoUrl);
  const useIframe = isEmbedLink(currentLesson?.videoUrl);

  // === CORE: Polling thời gian + Auto-sync + Auto-complete ===
  const durationRef = useRef(0);

  useEffect(() => {
    if (!currentLesson || loading) return;
    const lessonId = currentLesson.id;

    // 1. Khởi tạo tiến độ ngay lập tức nếu bài học chưa có trong DB
    const hasProgress = lessonProgress.some(lp => lp.lessonId === lessonId);
    if (!hasProgress) {
        courseService.updateLastWatchedTime(lessonId, 0);
        setLessonProgress(prev => [...prev, { 
            lessonId, isCompleted: false, lastWatchedTime: 0, 
            updatedAt: new Date().toISOString() 
        }]);
    }

    // 2. Lắng nghe postMessage responses từ Iframe
    const handleMessage = (event) => {
        try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            if (!data || data.context !== 'player.js') return;
            
            if (data.event === 'ready') {
                const iframe = document.getElementById('bunny-video-player');
                if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage(JSON.stringify({
                        context: 'player.js', method: 'addEventListener', value: 'ended'
                    }), '*');
                    iframe.contentWindow.postMessage(JSON.stringify({
                        context: 'player.js', method: 'addEventListener', value: 'timeupdate'
                    }), '*');
                }
            }

            // Phản hồi từ poll getCurrentTime
            if (data.event === 'getCurrentTime' && data.value != null) {
                const time = typeof data.value === 'number' ? data.value : parseFloat(data.value) || 0;
                if (time > 0) {
                    currentTimeRef.current = time;
                    setCurrentTime(time);
                }
            }

            // Phản hồi từ poll getDuration
            if (data.event === 'getDuration' && data.value != null) {
                const dur = typeof data.value === 'number' ? data.value : parseFloat(data.value) || 0;
                if (dur > 0) {
                    durationRef.current = dur;
                }
            }

            // Sự kiện timeupdate (nếu Bunny gửi)
            if (data.event === 'timeupdate') {
                const seconds = data.value?.seconds ?? data.value ?? 0;
                if (typeof seconds === 'number' && seconds > 0) {
                    currentTimeRef.current = seconds;
                    setCurrentTime(seconds);
                }
                if (data.value?.duration) {
                    durationRef.current = data.value.duration;
                }
            }

            // Sự kiện kết thúc (nếu Bunny gửi)
            if (data.event === 'ended' || data.event === 'finish') {
                handleLessonEnded();
            }
        } catch (e) {
            // Bỏ qua lỗi parse
        }
    };

    window.addEventListener('message', handleMessage);

    // 3. POLLING: Mỗi 2s, hỏi iframe currentTime + duration + kiểm tra kết thúc
    const pollInterval = setInterval(() => {
        const iframe = document.getElementById('bunny-video-player');
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(JSON.stringify({
                context: 'player.js', method: 'getCurrentTime'
            }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({
                context: 'player.js', method: 'getDuration'
            }), '*');
        }

        // === TỰ ĐỘNG HOÀN THÀNH: So sánh thời gian hiện tại vs tổng thời lượng ===
        const ct = currentTimeRef.current;
        const dur = durationRef.current;
        if (dur > 0 && ct > 0 && ct >= dur - 2 && !hasEndedRef.current) {
            handleLessonEnded();
        }
    }, 2000);

    // 4. AUTO-SYNC: Mỗi 10s, gửi thời gian hiện tại lên server
    const syncInterval = setInterval(() => {
        if (currentTimeRef.current > 0) {
            courseService.updateLastWatchedTime(lessonId, currentTimeRef.current);
        }
    }, 10000);

    return () => {
        window.removeEventListener('message', handleMessage);
        clearInterval(pollInterval);
        clearInterval(syncInterval);
        durationRef.current = 0;
    };
  }, [currentLesson?.id, loading]);


  if (checkingEnrollment || (loading && !course)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100 shadow-inner">
          <Info className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Truy cập bị từ chối</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 font-bold">
          Bạn chưa sở hữu khóa học này hoặc phiên thanh toán chưa được xác nhận. Vui lòng mua khóa học để bắt đầu học tập.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate(`/course/${slug}`)}
            className="font-black px-8 py-6 rounded-xl shadow-xl shadow-primary/20"
          >
            Đến trang khóa học
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/account/my-courses")}
            className="font-black px-8 py-6 rounded-xl border-slate-200"
          >
            Khóa học của tôi
          </Button>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const allLessons = course.modules.flatMap((section) => section.lessons);
  const totalLessonsCount = allLessons.length;
  const progressValue = totalLessonsCount > 0 
    ? Math.round((completedLessonIds.length / totalLessonsCount) * 100) 
    : 0;

  const handlePrevLesson = () => {
    if (activeLessonIdx > 0) {
      setActiveLessonIdx(activeLessonIdx - 1);
    } else if (activeSectionIdx > 0) {
      const prevSectionIdx = activeSectionIdx - 1;
      setActiveSectionIdx(prevSectionIdx);
      setActiveLessonIdx(course.modules[prevSectionIdx].lessons.length - 1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* ── Header ── */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 z-50 shrink-0 shadow-lg border-b border-white/5">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate("/account/my-courses")}
            className="p-2.5 hover:bg-slate-800 rounded-lg transition-all text-slate-300 hover:text-white group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <PlayCircle className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-extrabold text-sm md:text-base truncate max-w-[200px] lg:max-w-md hidden sm:block tracking-tight text-slate-100">
                {course.title}
            </h1>
          </div>
        </div>

        <div className="flex-1 max-w-xl px-12 hidden md:block">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Tiến độ hoàn thành</span>
                <span>{completedLessonIds.length}/{totalLessonsCount} BÀI HỌC</span>
            </div>
            <Progress value={progressValue} className="h-2 bg-slate-800 [&>div]:bg-primary shadow-inner" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-800 hover:text-white font-bold hidden lg:flex items-center gap-2 rounded-lg"
          >
            <LayoutDashboard className="w-4 h-4" />
            Giao diện
          </Button>
          <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-lg border border-white/5">
            <button
              onClick={handlePrevLesson}
              disabled={activeSectionIdx === 0 && activeLessonIdx === 0}
              className="p-1.5 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition-all text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextLesson}
              disabled={
                activeSectionIdx === course?.modules?.length - 1 &&
                activeLessonIdx === (currentSection?.lessons?.length || 0) - 1
              }
              className="p-1.5 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition-all text-slate-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <div className="w-full mx-auto max-w-screen-2xl px-4 md:px-10 xl:px-16 py-8">
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* ── Left: Video + Info ── */}
            <div className="flex-1 min-w-0">
              {activeViewMode === "video" ? (
                <>
                  {/* Video Player Section */}
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border-[6px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative group">
                    {useIframe ? (
                      <iframe
                        id="bunny-video-player"
                        width="100%"
                        height="100%"
                        src={`${embedUrl}&autoplay=true`}
                        title={currentLesson?.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    ) : (
                      <video
                        src={currentLesson?.videoUrl}
                        controls
                        autoPlay
                        onEnded={handleLessonEnded}
                        onTimeUpdate={(e) => {
                            const time = e.target.currentTime;
                            setCurrentTime(time);
                            currentTimeRef.current = time;
                        }}
                        className="w-full h-full"
                      >
                        Trình duyệt không hỗ trợ phát video.
                      </video>
                    )}
                    <div className="absolute top-8 left-8 px-5 py-3 rounded-lg border border-white/20 text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-[10px] font-black text-primary mb-1 uppercase tracking-[0.25em] italic">Gnostica Learning</p>
                      <h3 className="text-sm font-black">{currentLesson?.title}</h3>
                    </div>
                  </div>

                  {/* Lesson Title Section */}
                  <div className="mt-10 mb-10 pl-2">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-[1.15] tracking-tight">
                      {currentLesson?.title}
                    </h2>
                    <div className="flex items-center gap-4 mt-5">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-black rounded-full uppercase tracking-widest border border-primary/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Phần {activeSectionIdx + 1}
                        </div>
                        <Separator orientation="vertical" className="h-4 bg-slate-300" />
                        <p className="text-slate-400 font-bold italic text-sm tracking-tight capitalize">
                          {currentSection?.title}
                        </p>
                    </div>
                  </div>

                  {/* Tabs Container */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-white p-1.5 h-14 rounded-xl w-full sm:w-fit border border-slate-200 shadow-sm gap-1.5">
                      <TabsTrigger 
                        value="overview" 
                        className="rounded-lg h-full px-5 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300"
                      >
                        <Info className="w-4 h-4" /> Tổng quan
                      </TabsTrigger>
                      <TabsTrigger 
                        value="qa" 
                        className="rounded-lg h-full px-5 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300"
                      >
                        <MessageSquare className="w-4 h-4" /> Hỏi đáp
                      </TabsTrigger>
                      <TabsTrigger 
                        value="resources" 
                        className="rounded-lg h-full px-5 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300"
                      >
                        <FileText className="w-4 h-4" /> Tài liệu
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-10 outline-none">
                      <div className="bg-white rounded-xl p-10 md:p-14 border border-slate-200 shadow-sm leading-[1.8] text-slate-800">
                        <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
                            <div className="w-2.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                            Nội dung bài học
                        </h3>
                        <div 
                          className="prose prose-slate max-w-none text-slate-600 font-bold text-lg"
                          dangerouslySetInnerHTML={{ __html: currentLesson?.content }}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="qa" className="mt-10 outline-none">
                      <LessonQA lesson={currentLesson} />
                    </TabsContent>

                    <TabsContent value="resources" className="mt-10 outline-none">
                       {currentSection?.attachments && currentSection.attachments.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentSection.attachments.map((file, i) => (
                              <div key={file.id || i} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all group cursor-pointer duration-500">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                                    <FileText className="w-7 h-7" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[15px] font-black text-slate-900 truncate max-w-[200px] mb-1">
                                        {file.fileUrl.split('/').pop() || `Tài liệu ${i + 1}`}
                                    </p>
                                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
                                        {file.fileType || "DOCUMENT"} • FILE DOWNLOAD
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-12 h-12 rounded-2xl hover:bg-primary/10 text-primary border border-transparent hover:border-primary/20"
                                    onClick={() => window.open(file.fileUrl, '_blank')}
                                >
                                  <Download className="w-6 h-6" />
                                </Button>
                              </div>
                            ))}
                          </div>
                       ) : (
                          <div className="bg-white rounded-xl p-16 border border-slate-200 shadow-sm text-center text-slate-400 font-black italic uppercase tracking-widest text-xs">
                            Chương này chưa tải lên tài liệu tham khảo.
                          </div>
                       )}
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <QuizArea 
                   quiz={currentSection?.quiz} 
                   existingResult={quizProgress.find(qp => qp.quizId === currentSection?.quiz?.id)}
                   onQuizCompleted={onQuizCompleted}
                   onQuizReset={onQuizReset}
                   onBack={() => setActiveViewMode("video")} 
                />
              )}
            </div>

            {/* ── Right: Course Playlist Sidebar ── */}
            <aside className="w-full lg:w-[380px] xl:w-[450px] shrink-0 border border-slate-200 rounded-xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex flex-col gap-1">
                    <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[11px]">Nội dung khóa học</h3>
                    <p className="text-[10px] font-black text-slate-400">DANH SÁCH BÀI GIẢNG DÀNH CHO BẠN</p>
                </div>
                <div className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                    {course?.modules?.length || 0} CHƯƠNG
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-hide py-2">
                <Accordion type="multiple" defaultValue={[`section-${activeSectionIdx}`]}>
                  {course.modules.map((section, sIdx) => {
                    const isActiveSection = activeSectionIdx === sIdx;
                    return (
                      <AccordionItem
                        key={section.id || sIdx}
                        value={`section-${sIdx}`}
                        className={`border-b-0 px-2 last:mb-0`}
                      >
                        <AccordionTrigger className="px-6 py-6 hover:bg-slate-50/50 hover:no-underline [&[data-state=open]]:bg-slate-50/80 rounded-xl transition-all font-black mx-2 mb-1">
                          <div className="flex flex-col items-start gap-1 text-left min-w-0">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">
                              Phần {sIdx + 1}
                            </span>
                            <span className="font-black text-slate-900 text-[16px] truncate w-full tracking-tight">
                              {section.title}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-1 px-4">
                          <div className="flex flex-col gap-1">
                            {section.lessons.map((lesson, lIdx) => {
                              const isCurrent = activeViewMode === "video" && activeSectionIdx === sIdx && activeLessonIdx === lIdx;
                              const isCompleted = completedLessonIds.includes(lesson.id);
                              return (
                                <button
                                  key={lesson.id || lIdx}
                                  onClick={() => handleLessonSelect(sIdx, lIdx)}
                                  className={`flex items-start gap-4 px-6 py-5 transition-all text-left rounded-lg border-2
                                    ${isCurrent 
                                        ? "bg-primary shadow-xl shadow-primary/20 border-primary text-white" 
                                        : "hover:bg-slate-50 border-transparent text-slate-700 hover:scale-[0.98]"}`}
                                >
                                  <div className="mt-1.5 shrink-0">
                                    {isCompleted ? (
                                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                      </div>
                                    ) : isCurrent ? (
                                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                        <PlayCircle className="w-3.5 h-3.5 text-primary" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-primary/50 transition-colors bg-white shadow-inner" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-[14px] font-black leading-snug break-words ${isCurrent ? "text-white" : "text-slate-800"}`}>
                                      {lesson.title}
                                    </p>
                                    <div className={`flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest ${isCurrent ? "text-white/80" : "text-slate-400"}`}>
                                      <PlayCircle className="w-3 h-3" />
                                      <span>Nội dung bài học</span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                            
                            {/* Thêm Render Quiz của Chương */}
                            {section.quiz && (
                              <button
                                onClick={() => handleQuizSelect(sIdx)}
                                className={`flex items-start gap-4 px-6 py-5 transition-all text-left rounded-lg border-2 mt-1
                                  ${(activeSectionIdx === sIdx && activeViewMode === "quiz")
                                      ? "bg-indigo-600 shadow-xl shadow-indigo-200 border-indigo-600 text-white" 
                                      : "hover:bg-slate-50 border-transparent text-slate-700 hover:scale-[0.98]"}`}
                              >
                                <div className="mt-1.5 shrink-0">
                                   {completedQuizIds.includes(section.quiz.id) ? (
                                       <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-100">
                                          <CheckCircle2 className="w-3 h-3 text-white" />
                                       </div>
                                   ) : (
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${(activeSectionIdx === sIdx && activeViewMode === "quiz") ? 'bg-white' : 'bg-indigo-100'} shadow-sm`}>
                                         <FileText className={`w-3 h-3 ${(activeSectionIdx === sIdx && activeViewMode === "quiz") ? 'text-indigo-600' : 'text-indigo-600'}`} />
                                      </div>
                                   )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[14px] font-black leading-snug ${(activeSectionIdx === sIdx && activeViewMode === "quiz") ? "text-white" : "text-slate-800"}`}>
                                    {section.quiz.title || "Bài tập cuối chương"}
                                  </p>
                                  <div className={`flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest ${(activeSectionIdx === sIdx && activeViewMode === "quiz") ? "text-white/80" : "text-indigo-500"}`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Bài kiểm tra kiến thức</span>
                                  </div>
                                </div>
                              </button>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </div>
  );
}
