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
import useAuthStore from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import QuizArea from "@/components/pages/learning/QuizArea";
import LessonQA from "@/components/pages/learning/LessonQA";


// ── Component Hỗ Trợ: Giao Diện Làm Bài Quiz Cho Học Viên ──
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
  const [certifiUrl, setCertifiUrl] = useState(null);
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
      setCertifiUrl(progressData?.certifiUrl || null);

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

    if (activeViewMode === "video") {
      if (activeLessonIdx < lessons.length - 1) {
        // Còn bài trong chương hiện tại
        setActiveLessonIdx(activeLessonIdx + 1);
      } else if (section.quiz) {
        // Hết bài trong chương, nhưng có quiz -> chuyển sang quiz
        setActiveViewMode("quiz");
      } else if (activeSectionIdx < course.modules.length - 1) {
        // Hết bài, không có quiz -> sang chương tiếp theo
        setActiveSectionIdx(activeSectionIdx + 1);
        setActiveLessonIdx(0);
        setActiveViewMode("video");
      }
    } else if (activeViewMode === "quiz") {
      if (activeSectionIdx < course.modules.length - 1) {
        // Đang ở quiz, sang chương tiếp theo
        setActiveSectionIdx(activeSectionIdx + 1);
        setActiveLessonIdx(0);
        setActiveViewMode("video");
      }
    }
  }, [course, activeSectionIdx, activeLessonIdx, activeViewMode]);

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
        <p className="text-muted-foreground font-medium animate-pulse">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-error/20 shadow-inner">
          <Info className="w-10 h-10 text-error" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">Truy cập bị từ chối</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 font-bold">
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
            className="font-black px-8 py-6 rounded-xl border-border"
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
    if (activeViewMode === "quiz") {
      setActiveViewMode("video");
      setActiveLessonIdx((currentSection?.lessons?.length || 1) - 1);
    } else if (activeLessonIdx > 0) {
      setActiveLessonIdx(activeLessonIdx - 1);
    } else if (activeSectionIdx > 0) {
      const prevSectionIdx = activeSectionIdx - 1;
      setActiveSectionIdx(prevSectionIdx);
      const prevSection = course.modules[prevSectionIdx];
      if (prevSection?.quiz) {
        setActiveViewMode("quiz");
      } else {
        setActiveViewMode("video");
        setActiveLessonIdx((prevSection?.lessons?.length || 1) - 1);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* ── Header ── */}
      <header className="h-16 bg-muted text-white flex items-center justify-between px-6 z-50 shrink-0 shadow-lg border-b border-white/5">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate("/account/my-courses")}
            className="p-2.5 hover:bg-muted rounded-lg transition-all text-slate-300 hover:text-white group"
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
            <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>Tiến độ hoàn thành</span>
                <span>{completedLessonIds.length}/{totalLessonsCount} BÀI HỌC</span>
            </div>
            <Progress value={progressValue} className="h-2 bg-muted [&>div]:bg-primary shadow-inner" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-muted hover:text-white font-bold hidden lg:flex items-center gap-2 rounded-lg"
          >
            <LayoutDashboard className="w-4 h-4" />
            Giao diện
          </Button>
          {progressValue === 100 && certifiUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/certificate/${certifiUrl}`, '_blank')}
              className="text-amber-500 border-amber-500 hover:bg-amber-500/10 hover:text-amber-400 font-bold hidden lg:flex items-center gap-2 rounded-lg ml-2"
            >
              <Award className="w-4 h-4" /> Xem chứng chỉ
            </Button>
          )}
          <div className="flex items-center gap-1.5 bg-muted p-1.5 rounded-lg border border-white/5">
            <button
              onClick={handlePrevLesson}
              disabled={activeSectionIdx === 0 && activeLessonIdx === 0}
              className="p-1.5 hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition-all text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextLesson}
              disabled={
                activeSectionIdx === (course?.modules?.length || 1) - 1 &&
                (
                  (activeViewMode === "video" && activeLessonIdx === (currentSection?.lessons?.length || 1) - 1 && !currentSection?.quiz) ||
                  (activeViewMode === "quiz")
                )
              }
              className="p-1.5 hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition-all text-slate-300"
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
                    <h2 className="text-2xl md:text-3xl font-black text-foreground leading-[1.15] tracking-tight">
                      {currentLesson?.title}
                    </h2>
                    <div className="flex items-center gap-4 mt-5">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-black rounded-full uppercase tracking-widest border border-primary/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Phần {activeSectionIdx + 1}
                        </div>
                        <Separator orientation="vertical" className="h-4 bg-muted" />
                        <p className="text-muted-foreground font-bold italic text-sm tracking-tight capitalize">
                          {currentSection?.title}
                        </p>
                    </div>
                  </div>

                  {/* Tabs Container */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-white p-1.5 h-14 rounded-xl w-full sm:w-fit border border-border shadow-sm gap-1.5">
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
                      <div className="bg-white rounded-xl p-10 md:p-14 border border-border shadow-sm leading-[1.8] text-foreground">
                        <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
                            <div className="w-2.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                            Nội dung bài học
                        </h3>
                        <div 
                          className="prose prose-slate max-w-none text-muted-foreground font-bold text-lg"
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
                              <div key={file.id || i} className="flex items-center justify-between p-6 bg-white border border-border rounded-xl hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all group cursor-pointer duration-500">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-primary border border-border group-hover:bg-primary group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                                    <FileText className="w-7 h-7" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[15px] font-black text-foreground truncate max-w-[200px] mb-1">
                                        {file.fileUrl.split('/').pop() || `Tài liệu ${i + 1}`}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">
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
                          <div className="bg-white rounded-xl p-16 border border-border shadow-sm text-center text-muted-foreground font-black italic uppercase tracking-widest text-xs">
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
            <aside className="w-full lg:w-[380px] xl:w-[450px] shrink-0 border border-border rounded-xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 border-b border-border flex items-center justify-between bg-muted">
                <div className="flex flex-col gap-1">
                    <h3 className="font-black text-foreground uppercase tracking-[0.2em] text-[11px]">Nội dung khóa học</h3>
                    <p className="text-[10px] font-black text-muted-foreground">DANH SÁCH BÀI GIẢNG DÀNH CHO BẠN</p>
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
                        <AccordionTrigger className="px-6 py-6 hover:bg-muted hover:no-underline [&[data-state=open]]:bg-muted/80 rounded-xl transition-all font-black mx-2 mb-1">
                          <div className="flex flex-col items-start gap-1 text-left min-w-0">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">
                              Phần {sIdx + 1}
                            </span>
                            <span className="font-black text-foreground text-[16px] truncate w-full tracking-tight">
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
                                        : "hover:bg-muted border-transparent text-foreground hover:scale-[0.98]"}`}
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
                                      <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-primary/50 transition-colors bg-white shadow-inner" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-[14px] font-black leading-snug break-words ${isCurrent ? "text-white" : "text-foreground"}`}>
                                      {lesson.title}
                                    </p>
                                    <div className={`flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest ${isCurrent ? "text-white/80" : "text-muted-foreground"}`}>
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
                                      : "hover:bg-muted border-transparent text-foreground hover:scale-[0.98]"}`}
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
                                  <p className={`text-[14px] font-black leading-snug ${(activeSectionIdx === sIdx && activeViewMode === "quiz") ? "text-white" : "text-foreground"}`}>
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
