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
  HelpCircle
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

// ── Component Hỗ Trợ: Giao Diện Làm Bài Quiz Cho Học Viên ──
function QuizArea({ quiz, existingResult, onBack, onQuizCompleted, onQuizReset }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scorePercent, setScorePercent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const questions = quiz?.questions || [];

  // Tải dữ liệu cũ nếu bài tập này học viên ĐÃ LÀM RỒI
  useEffect(() => {
      if (existingResult) {
          setIsSubmitted(true);
          setScorePercent(existingResult.point || 0);
          setCorrectCount(existingResult.correctAnswers || 0);
          setUserAnswers({});
      } else {
          // Nếu đổi qua quiz khác chưa làm, reset form
          setIsSubmitted(false);
          setScorePercent(0);
          setCorrectCount(0);
          setUserAnswers({});
      }
  }, [existingResult, quiz?.id]);

  if (!quiz || questions.length === 0) {
    return (
      <div className="w-full bg-white rounded-[40px] border border-slate-200 p-20 text-center shadow-sm">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100">
            <HelpCircle className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Chương học chưa có bài tập</h2>
        <p className="text-slate-500 font-bold mb-8">Bài quiz này hiện chưa chứa câu hỏi nào.</p>
        <Button onClick={onBack} className="rounded-xl font-bold">Quay lại xem Video</Button>
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

        window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (isSubmitted) {
    // Dùng static 80% để trang trí màu sắc UI, tuy nhiên ĐÃ LƯU thì Sidebar luôn được tick.
    const isPassed = scorePercent >= 80; 
    return (
      <div className="w-full bg-white rounded-[40px] border-[6px] border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-10 md:p-16 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
         <div className={`w-28 h-28 ${isPassed ? 'bg-emerald-50' : 'bg-orange-50'} rounded-full flex items-center justify-center mx-auto mb-8 border ${isPassed ? 'border-emerald-100' : 'border-orange-100'} shadow-inner relative`}>
            {isPassed ? <Trophy className="w-12 h-12 text-emerald-500" /> : <Award className="w-12 h-12 text-orange-500" />}
         </div>
         
         <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight mb-4">
             {isPassed ? "Hoàn Thành Xuất Sắc!" : "Cần Cố Gắng Thêm"}
         </h2>
         <p className="text-slate-500 text-lg font-bold max-w-md mx-auto mb-12">
             Bạn đã hoàn tất bài Quiz "{quiz.title}". Điểm số của bạn được hiển thị bên dưới.
         </p>

         <div className="flex items-center justify-center gap-12 mb-16 flex-wrap">
            <div className="text-center">
                <div className="text-[64px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-violet-600 mb-2">
                    {scorePercent}%
                </div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">ĐIỂM SỐ ĐẠT ĐƯỢC</div>
            </div>
            <div className="w-px h-16 bg-slate-200 hidden sm:block"></div>
            <div className="text-center">
                <div className="text-4xl font-black text-slate-800 mb-2">{correctCount}/{questions.length}</div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">CÂU TRẢ LỜI ĐÚNG</div>
            </div>
         </div>

         <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
               onClick={handleReset} 
               disabled={isSyncing}
               variant="outline" 
               className="rounded-2xl h-14 px-8 font-black border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-slate-700 shadow-sm"
            >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Làm Lại Bài Tập
            </Button>
            <Button onClick={onBack} className="rounded-2xl h-14 px-10 font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95">
                Quay Lại Bài Học
            </Button>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full">
        {/* Quiz Header Info */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] p-10 md:p-14 mb-10 text-white shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute right-20 bottom-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6">
                <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-black uppercase tracking-widest text-indigo-200 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> BÀI KIỂM TRA
                </div>
                <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                    {questions.length} CÂU HỎI
                </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black tracking-tight max-w-2xl leading-tight mb-6">
                {quiz.title}
            </h1>
            <p className="text-indigo-200/80 font-medium text-base max-w-xl mb-8">
                Hãy đọc kĩ từng câu hỏi và chọn đáp án đúng nhất. Sau khi chắc chắn, hãy nhấn nút Nộp bài ở phía cuối trang.
            </p>
            
            <div className="h-1.5 bg-white/10 rounded-full w-full max-w-xs overflow-hidden">
                <div 
                   className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-500"
                   style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}
                ></div>
            </div>
            <div className="mt-2 text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                TIẾN ĐỘ: ĐÃ CHỌN {Object.keys(userAnswers).length}/{questions.length} CÂU
            </div>
        </div>

        {/* Questions List */}
        <div className="space-y-10">
            {questions.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/30 transition-shadow duration-500">
                    <div className="flex items-start gap-6">
                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-indigo-600 shadow-inner">
                            {idx + 1}
                        </div>
                        <div className="flex-1 pt-2">
                            <h3 className="text-xl font-black text-slate-900 leading-relaxed mb-10" dangerouslySetInnerHTML={{ __html: q.content }}>
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                {(q.answers || []).map((opt) => {
                                    const isSelected = userAnswers[q.id] === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            disabled={isSyncing}
                                            onClick={() => handleOptionSelect(q.id, opt.id)}
                                            className={`w-full group flex items-center gap-5 p-6 text-left border-2 rounded-3xl transition-all duration-300 
                                                ${isSelected 
                                                    ? 'bg-indigo-50/50 border-indigo-500 shadow-md shadow-indigo-100 scale-[1.01]' 
                                                    : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 hover:scale-[0.995]'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 shrink-0 rounded-xl border-2 flex items-center justify-center font-black text-sm transition-colors
                                                ${isSelected 
                                                    ? 'border-indigo-600 bg-indigo-600 text-white' 
                                                    : 'border-slate-200 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-500'
                                                }`}>
                                                {opt.optionLabel || '?'}
                                            </div>
                                            <span className={`font-bold text-lg ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                                                {opt.answerText}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Final Submit CTA */}
        <div className="mt-16 p-10 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-indigo-600" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-2">Đã Hoàn Thành Tất Cả Câu Hỏi?</h4>
            <p className="text-slate-500 font-bold mb-10 max-w-sm">Hãy kiểm tra kĩ lại các lựa chọn của bạn trước khi nhấn nộp bài để tính điểm.</p>
            <Button 
                onClick={handleSubmitQuiz}
                disabled={isSyncing}
                className="h-16 px-14 rounded-[24px] bg-indigo-600 hover:bg-indigo-700 font-black text-lg shadow-2xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
            >
                {isSyncing ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
                NỘP BÀI VÀ CHẤM ĐIỂM
            </Button>
        </div>
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
  const completedLessonIds = lessonProgress
    .filter(lp => lp.isCompleted)
    .map(lp => lp.lessonId);

  const completedQuizIds = quizProgress.map(qp => qp.quizId);

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
    const libraryId = "635422";
    let baseUrl = "";
    
    if (uuidRegex.test(url)) {
      baseUrl = `https://player.mediadelivery.net/embed/${libraryId}/${url}`;
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
    if (uuidRegex.test(url)) return true;
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
            className="font-black px-8 py-6 rounded-2xl shadow-xl shadow-primary/20"
          >
            Đến trang khóa học
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/account/my-courses")}
            className="font-black px-8 py-6 rounded-2xl border-slate-200"
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
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-all text-slate-300 hover:text-white group"
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
            className="text-slate-300 hover:bg-slate-800 hover:text-white font-bold hidden lg:flex items-center gap-2 rounded-xl"
          >
            <LayoutDashboard className="w-4 h-4" />
            Giao diện
          </Button>
          <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-white/5">
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
                  <div className="w-full aspect-video rounded-[40px] overflow-hidden bg-black border-[6px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative group">
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
                    <div className="absolute top-8 left-8 px-5 py-3 rounded-3xl bg-black/50 backdrop-blur-2xl border border-white/20 text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                    <TabsList className="bg-white p-1.5 h-14 rounded-[20px] w-full sm:w-fit border border-slate-200 shadow-sm gap-1.5">
                      <TabsTrigger 
                        value="overview" 
                        className="rounded-[14px] h-full px-5 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300"
                      >
                        <Info className="w-4 h-4" /> Tổng quan
                      </TabsTrigger>
                      <TabsTrigger 
                        value="qa" 
                        className="rounded-[14px] h-full px-5 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300"
                      >
                        <MessageSquare className="w-4 h-4" /> Hỏi đáp
                      </TabsTrigger>
                      <TabsTrigger 
                        value="resources" 
                        className="rounded-[14px] h-full px-5 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300"
                      >
                        <FileText className="w-4 h-4" /> Tài liệu
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-10 outline-none">
                      <div className="bg-white rounded-[40px] p-10 md:p-14 border border-slate-200 shadow-sm leading-[1.8] text-slate-800">
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
                      <div className="bg-white rounded-[40px] p-16 border border-slate-200 shadow-sm text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                          <MessageSquare className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Tính năng Hỏi & Đáp</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-4 font-bold">
                            Tham gia thảo luận về bài học này. Giảng viên và cộng đồng luôn sẵn sàng hỗ trợ bạn 24/7!
                        </p>
                        <Button className="mt-10 font-black px-12 rounded-2xl h-14 text-sm uppercase tracking-widest shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">Đặt câu hỏi ngay</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="resources" className="mt-10 outline-none">
                       {currentSection?.attachments && currentSection.attachments.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentSection.attachments.map((file, i) => (
                              <div key={file.id || i} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-[28px] hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all group cursor-pointer duration-500">
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
                          <div className="bg-white rounded-[40px] p-16 border border-slate-200 shadow-sm text-center text-slate-400 font-black italic uppercase tracking-widest text-xs">
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
            <aside className="w-full lg:w-[380px] xl:w-[450px] shrink-0 border border-slate-200 rounded-[48px] bg-white overflow-hidden shadow-2xl flex flex-col">
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
                        <AccordionTrigger className="px-6 py-6 hover:bg-slate-50/50 hover:no-underline [&[data-state=open]]:bg-slate-50/80 rounded-[32px] transition-all font-black mx-2 mb-1">
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
                              const isCurrent = activeSectionIdx === sIdx && activeLessonIdx === lIdx;
                              const isCompleted = completedLessonIds.includes(lesson.id);
                              return (
                                <button
                                  key={lesson.id || lIdx}
                                  onClick={() => handleLessonSelect(sIdx, lIdx)}
                                  className={`flex items-start gap-4 px-6 py-5 transition-all text-left rounded-3xl border-2
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
                                className={`flex items-start gap-4 px-6 py-5 transition-all text-left rounded-3xl border-2 mt-1
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
