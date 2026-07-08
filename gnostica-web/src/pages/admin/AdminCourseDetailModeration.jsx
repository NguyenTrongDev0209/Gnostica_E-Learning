import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  PlayCircle,
  FileText,
  Video,
  Tag,
  BookOpen,
  Layers,
  ChevronRight,
  ExternalLink,
  Trophy,
  Loader2,
  Globe,
  Download,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import courseService from "@/services/course/courseService";
import { toast } from "sonner";

// Shared Components
import CourseRejectModal from "@/components/modals/CourseRejectModal";
import InstructorProfileModal from "@/components/modals/InstructorProfileModal";

export default function AdminCourseDetailModeration() {
  const { slug } = useParams(); // Slug routing provided by privateRoutes
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [activePreview, setActivePreview] = useState(null);

  // --- AI ASSISTED MODERATION LOGIC ---
  const playerRef = useRef(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [isAiScanningInfo, setIsAiScanningInfo] = useState(false);
  const [isAiScanningFull, setIsAiScanningFull] = useState(false);

  const jumpToTime = (timeString) => {
    if (!playerRef.current) {
      toast.error("Vui lòng phát Video trước khi tua tới thời gian!");
      return;
    }
    
    const parts = timeString.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    }

    const isEmbed = isEmbedLink(activePreview?.data?.videoUrl);

    if (isEmbed) {
      // Bunny.net iframe seek trigger via postMessage
      try {
        playerRef.current.contentWindow?.postMessage(
          JSON.stringify({ type: "seek", value: seconds }), 
          "*"
        );
        playerRef.current.contentWindow?.postMessage(
          JSON.stringify({ type: "play" }), 
          "*"
        );
      } catch (e) {
        console.error("PostMessage seek error:", e);
      }
    } else {
      // HTML5 video player seek trigger
      playerRef.current.currentTime = seconds;
      playerRef.current.play().catch(() => {});
    }
    toast.info(`Tua video đến ${timeString}`);
  };

  const handleTriggerAiScan = async (lessonId) => {
    if (!lessonId) return;
    try {
      setIsAiScanning(true);
      const res = await courseService.triggerAiScan(lessonId);
      toast.success("Quét kiểm duyệt AI thành công!");
      
      // Fetch latest state
      const updatedCourse = await courseService.getCourseForModeration(slug);
      setCourse(updatedCourse);
      
      // Update UI preview payload actively
      if (activePreview && activePreview.data.id === lessonId) {
        setActivePreview(prev => ({
          ...prev,
          data: {
            ...prev.data,
            aiModerationReport: res.aiModerationReport
          }
        }));
      }
    } catch (err) {
      console.error("AI Scan failed:", err);
      toast.error(err.response?.data?.error || "Có lỗi xảy ra khi quét AI.");
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleTriggerAiScanInfo = async () => {
    try {
      setIsAiScanningInfo(true);
      await courseService.triggerAiScanInfo(slug);
      toast.success("Quét AI nội dung văn bản khóa học thành công!");
      const updatedCourse = await courseService.getCourseForModeration(slug);
      setCourse(updatedCourse);
    } catch (err) {
      console.error("AI Text Scan failed:", err);
      toast.error(err.response?.data?.error || "Lỗi quét văn bản khóa học.");
    } finally {
      setIsAiScanningInfo(false);
    }
  };

  const handleTriggerAiScanFull = async () => {
    try {
      setIsAiScanningFull(true);
      const res = await courseService.triggerAiScanFull(slug);
      toast.info(res.message || "Đang khởi động quy trình kiểm duyệt AI toàn diện trong nền...");
      
      // Update local state to show SCANNING
      setCourse(prev => ({ ...prev, aiModerationStatus: "SCANNING" }));
    } catch (err) {
      console.error("AI Full Scan failed:", err);
      toast.error(err.response?.data?.error || "Lỗi quét toàn diện khóa học.");
    } finally {
      setIsAiScanningFull(false);
    }
  };

  // --- POLLING LOGIC FOR ASYNC AI SCAN ---
  useEffect(() => {
    let intervalId;
    if (course?.aiModerationStatus === "SCANNING") {
      intervalId = setInterval(async () => {
        try {
          const updatedCourse = await courseService.getCourseForModeration(slug);
          if (updatedCourse.aiModerationStatus !== "SCANNING") {
            setCourse(updatedCourse);
            if (updatedCourse.aiModerationStatus === "COMPLETED") {
              toast.success("Kiểm duyệt AI toàn diện đã hoàn tất!");
            } else {
              toast.error("Kiểm duyệt AI gặp lỗi trong quá trình xử lý nền.");
            }
            clearInterval(intervalId);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [course?.aiModerationStatus, slug]);

  const focusAndPreviewLesson = (lesson, mod) => {
    setActivePreview({
      type: "lesson",
      data: lesson,
      moduleAttachments: mod?.attachments?.filter(a => !a.deleted) || []
    });
    window.scrollTo({ top: 180, behavior: "smooth" });
    toast.info(`Chuyển chế độ xem: ${lesson.title}`);
  };

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const res = await courseService.getCourseForModeration(slug);
      setCourse(res);
      setActivePreview(null); // Reset preview to introductory Promo video on load
    } catch (err) {
      console.error("Fetch course detail error:", err);
      toast.error("Không thể tải nội dung chi tiết của khóa học.");
      navigate("/admin/course-moderation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchCourseDetail();
    }
  }, [slug]);

  const handleApprove = async () => {
    if (!course) return;
    if (!window.confirm(`Phê duyệt và công khai khóa học "${course.title}" lên hệ thống?`)) return;
    
    try {
      setIsSubmitting(true);
      await courseService.approveCourse(course.slug);
      toast.success("Phê duyệt thành công!");
      navigate("/admin/course-moderation");
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi xảy ra trong quá trình phê duyệt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Vui lòng nhập phản hồi lý do từ chối.");
      return;
    }
    try {
      setIsSubmitting(true);
      await courseService.rejectCourse(course.slug, rejectReason);
      toast.success("Đã từ chối phê duyệt khóa học.");
      setIsRejectModalOpen(false);
      navigate("/admin/course-moderation");
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi gửi từ chối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 4:
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 font-bold gap-1 text-[11px] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>{" "}
            Chờ duyệt
          </Badge>
        );
      case 1:
        return (
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 font-bold text-[11px] shadow-sm">
            Đã duyệt
          </Badge>
        );
      case 3:
        return (
          <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-200 font-bold text-[11px] shadow-sm">
            Bị từ chối
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground hover:bg-muted border-border font-bold text-[11px] shadow-sm">
            Khác
          </Badge>
        );
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatFriendlyDate = (dateStr) => {
     if (!dateStr) return "Chưa cập nhật";
     const d = new Date(dateStr);
     return d.toLocaleDateString("vi-VN");
  };

  const formatCourseLevel = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner": return "Người mới bắt đầu";
      case "intermediate": return "Trung bình";
      case "advanced": return "Nâng cao";
      case "all": return "Dành cho mọi đối tượng";
      default: return level || "Chưa xác định";
    }
  };

  // Safely extract non-deleted modules
  const validModules = course?.modules?.filter((m) => !m.deleted) || [];
  const totalLessons = validModules.reduce((sum, mod) => sum + (mod.lessons?.filter(l => !l.deleted).length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold">Đang biên dịch dữ liệu khóa học...</p>
      </div>
    );
  }

  if (!course) return null;

  // Prepare Instructor Info from course user entity
  const instructorInfo = {
      name: course.instructorName || "Giảng viên Gnostica",
      avatar: course.instructorAvatar,
      email: course.instructorEmail || "N/A",
      phone: course.instructorPhone || "---",
      cccd: "---",
      address: "Việt Nam",
      joinedDate: formatFriendlyDate(course.instructorCreatedAt),
      job: "Đối tác giảng dạy",
      bio: "Giảng viên độc lập liên kết với nền tảng giáo dục trực tuyến Gnostica.",
      bankName: "Ngân hàng đã đăng ký",
      bankNumber: "---",
      bankHolder: (course.instructorName || "").toUpperCase(),
      courses: 1,
      students: "--",
      rating: "5.0"
  };

  // Video URL handling logic for BunnyNet Embed support
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
    return `${baseUrl}${separator}playerjs=1&content_ended=1`;
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

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-border/60 shadow-sm sticky top-4 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/course-moderation")}
            className="h-10 w-10 rounded-xl shrink-0 border-border hover:bg-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                ID: {course.id}
              </span>
              {getStatusBadge(course.status)}
            </div>
            <h1 className="text-xl font-black text-foreground tracking-tight truncate leading-tight">
              {course.title || "Chưa đặt tên"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-14 md:ml-0">
          {course.status === 4 && (
            <>
              <Button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isSubmitting}
                variant="outline"
                className="font-bold text-rose-600 border-rose-200 bg-white hover:bg-rose-50 hover:text-rose-700 transition-all h-10 px-5"
              >
                Từ chối kiểm duyệt
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={isSubmitting}
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2 border-none px-6 h-10"
              >
                <CheckCircle2 className="w-4.5 h-4.5" /> Phê duyệt khóa học
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: Course detail, description, active video preview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Media Content Preview Window */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted">
              <h2 className="font-extrabold text-foreground flex items-center gap-2">
                {activePreview ? (
                  <>
                    {activePreview.type === "lesson" && (
                      <Video className="w-5 h-5 text-info" />
                    )}
                    {activePreview.type === "quiz" && (
                      <Trophy className="w-5 h-5 text-violet-500" />
                    )}
                    Xem trước: {activePreview.data.title || "Nội dung bài"}
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5 text-indigo-500" /> Video giới thiệu (Promo Video)
                  </>
                )}
              </h2>
              {activePreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-indigo-600 font-bold hover:bg-indigo-50 gap-1 text-xs"
                  onClick={() => setActivePreview(null)}
                >
                  Xem Promo Video
                </Button>
              )}
            </div>
            <div className="p-6">
              {activePreview ? (
                /* DYNAMIC RENDER OF PREVIEW CONTENT */
                <div className="space-y-4 animate-in fade-in duration-300">
                  {activePreview.type === "lesson" ? (
                    <div className="space-y-4">
                      {activePreview.data.videoUrl ? (
                        <div className="aspect-video rounded-xl bg-slate-950 overflow-hidden shadow-lg border border-border relative">
                          {/* Video Player Integration supporting IFrame and Native */}
                          {isEmbedLink(activePreview.data.videoUrl) ? (
                            <iframe
                              ref={playerRef}
                              width="100%"
                              height="100%"
                              src={`${getEmbedUrl(activePreview.data.videoUrl)}&autoplay=true`}
                              title={activePreview.data.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            ></iframe>
                          ) : (
                            <video 
                              ref={playerRef}
                              src={activePreview.data.videoUrl} 
                              controls 
                              className="w-full h-full object-contain" 
                              poster={course.thumbnail}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="min-h-[300px] bg-secondary flex items-center justify-center rounded-xl text-muted-foreground">
                           Chưa upload video cho bài học này
                        </div>
                      )}
                      <Tabs defaultValue="content" className="w-full mt-2">
                        <TabsList className="grid w-full grid-cols-2 mb-4 bg-secondary p-1 rounded-xl h-11">
                          <TabsTrigger value="content" className="font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Tóm tắt bài giảng
                          </TabsTrigger>
                          <TabsTrigger value="attachments" className="font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            Tài liệu chương
                            {activePreview.moduleAttachments?.length > 0 && (
                              <Badge className="h-4 px-1.5 py-0 text-[10px] bg-indigo-100 hover:bg-indigo-100 text-indigo-700 border-none font-bold">
                                {activePreview.moduleAttachments.length}
                              </Badge>
                            )}
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                          <div className="p-5 bg-muted border border-border/60 rounded-xl min-h-[120px]">
                             <h4 className="font-black text-foreground text-[13px] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-info" /> Chi tiết bài giảng:
                             </h4>
                             <div 
                               className="text-muted-foreground text-sm leading-relaxed prose prose-slate max-w-none prose-sm" 
                               dangerouslySetInnerHTML={{__html: activePreview.data.content || "<p className='italic text-muted-foreground'>Không có tóm tắt mô tả kèm theo.</p>"}} 
                             />
                          </div>
                        </TabsContent>

                        <TabsContent value="attachments" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                          {activePreview.moduleAttachments && activePreview.moduleAttachments.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                              {activePreview.moduleAttachments.map((file, i) => (
                                <div 
                                  key={file.id || i} 
                                  className="flex items-center justify-between p-4 bg-white border border-border rounded-xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[13px] font-bold text-foreground truncate leading-tight">
                                        {file.fileUrl?.split('/').pop()?.split('_').slice(1).join('_') || file.fileUrl?.split('/').pop() || `Tài liệu đính kèm #${i + 1}`}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                                        {file.fileType || "DOCUMENT"}
                                      </p>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-lg border border-border bg-muted hover:bg-indigo-50 hover:text-indigo-600 shrink-0"
                                    onClick={() => window.open(file.fileUrl, '_blank')}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-10 text-center border border-dashed border-border/80 bg-muted/40 rounded-xl flex flex-col items-center justify-center animate-in fade-in duration-200">
                              <FileText className="w-8 h-8 text-slate-300 mb-2" />
                              <p className="text-muted-foreground text-xs font-bold italic">
                                Chương này hiện chưa đính kèm tài liệu tham khảo nào.
                              </p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    /* RENDERING REAL QUIZ QUESTIONS FROM BACKEND */
                    <div className="min-h-[350px] bg-gradient-to-br from-violet-50 to-white border border-violet-100 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4 border-b border-violet-100 pb-3">
                        <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-foreground leading-tight">
                            Bài kiểm tra Trắc nghiệm: {activePreview.data.title}
                          </h3>
                          <p className="text-[11px] text-muted-foreground font-bold mt-0.5">
                            Bao gồm {activePreview.data.questions?.length || 0} câu hỏi trắc nghiệm
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                         {activePreview.data.questions && activePreview.data.questions.length > 0 ? (
                            activePreview.data.questions.map((q, idx) => (
                               <div key={q.id || idx} className="p-4 bg-white border border-border rounded-xl text-sm">
                                  <p className="font-bold text-foreground">Câu {idx + 1}: {q.content}</p>
                                  {/* Rendering choices safely using standard answerText field */}
                                  <div className="mt-3 space-y-2 opacity-80">
                                     {q.answers && q.answers.map((ans, aIdx) => (
                                        <div key={ans.id || aIdx} className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex justify-between items-center ${ans.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-muted border-border text-muted-foreground'}`}>
                                           <span>{ans.optionLabel ? `${ans.optionLabel}. ` : ""}{ans.answerText || ans.content}</span>
                                           {ans.isCorrect && <CheckCircle2 className="w-3 h-3" />}
                                        </div>
                                     ))}
                                  </div>
                               </div>
                            ))
                         ) : (
                            <p className="text-center italic text-muted-foreground py-10 font-medium">Bài trắc nghiệm này hiện chưa được cấu hình câu hỏi.</p>
                         )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* PROMO INTRO VIDEO VIEW */
                <div className="aspect-video rounded-xl bg-slate-950 overflow-hidden shadow-lg border border-border relative group">
                   {course.promoVideo ? (
                      isEmbedLink(course.promoVideo) ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`${getEmbedUrl(course.promoVideo)}&autoplay=true`}
                          title="Promo Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      ) : (
                        <video 
                          src={course.promoVideo} 
                          controls 
                          className="w-full h-full object-contain"
                          poster={course.thumbnail}
                        />
                      )
                   ) : course.thumbnail ? (
                      <>
                        <img
                          src={course.thumbnail}
                          alt="Thumbnail"
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Badge className="bg-black/70 border border-white/20 py-2 px-4 text-white text-xs font-bold uppercase">Giảng viên chưa cung cấp Video giới thiệu</Badge>
                        </div>
                      </>
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                         Không có tài nguyên Media đại diện
                      </div>
                   )}
                </div>
              )}
            </div>
          </div>

          {/* Course Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Giá Niêm yết
                </p>
                <p className="text-xl font-black text-foreground">
                  {formatCurrency(course.price || 0)}
                </p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Cấp độ
                </p>
                <p className="text-lg font-extrabold text-foreground">{formatCourseLevel(course.level)}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Danh mục
                </p>
                <p className="text-base font-bold text-foreground line-clamp-1">
                  {course.categoryName || "Chưa phân loại"}
                </p>
              </div>
            </div>
          </div>

          {/* Detail Description Content */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border bg-muted flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" />
              <h2 className="font-extrabold text-foreground">
                Nội dung & Mô tả chi tiết khóa học
              </h2>
            </div>
            <div className="p-6 font-medium text-muted-foreground leading-relaxed">
              {course.description ? (
                 <div 
                   className="prose max-w-none prose-slate" 
                   dangerouslySetInnerHTML={{__html: course.description}} 
                 />
              ) : (
                 <p className="italic text-muted-foreground text-sm">Tác giả chưa cập nhật mô tả bằng chữ cho khóa học này.</p>
              )}
            </div>
          </div>

          {/* --- CENTER FOR AI SURVEILLANCE AND INSIGHTS (MASTER DASHBOARD) --- */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/40 to-violet-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-black text-foreground text-[15px] tracking-tight uppercase">
                    AI hỗ trợ duyệt bài nhanh chống
                  </h2>
                  <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest mt-0.5">
                    Bảo vệ tiêu chuẩn chất lượng và pháp luật
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
                {/* 1. COMPREHENSIVE COURSE AI MODERATION */}
                <div className="space-y-4 focus-visible:ring-0 outline-none mt-0">
                  {(() => {
                    let report = null;
                    try {
                      if (course.aiModerationReport) {
                        report = JSON.parse(course.aiModerationReport);
                      }
                    } catch (e) { console.error("Failed to parse course AI report:", e); }

                    if (course.aiModerationStatus === "SCANNING") {
                      return (
                        <div className="p-12 border-2 border-dashed border-indigo-200 bg-indigo-50/20 rounded-3xl flex flex-col items-center justify-center text-center gap-6 animate-pulse">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                            <Sparkles className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-black text-lg text-indigo-900 uppercase tracking-tight">Đang kiểm duyệt toàn diện...</h4>
                            <p className="text-sm text-muted-foreground max-w-[450px] font-medium leading-relaxed">
                              Hệ thống AI đang đọc toàn bộ nội dung, nghe video và phân tích các bài trắc nghiệm. 
                              Bạn có thể làm việc khác, kết quả sẽ tự động cập nhật khi hoàn tất.
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (!report) {
                      return (
                        <div className="p-10 border border-dashed border-border bg-muted/30 rounded-2xl flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
                          <div className="p-4.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 animate-pulse shadow-inner">
                            <Sparkles className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-black text-sm text-foreground uppercase tracking-wide">Chưa có báo cáo AI tổng quát</h4>
                            <p className="text-[12px] text-muted-foreground max-w-[420px] font-medium leading-relaxed">
                              Kích hoạt AI để thẩm định toàn bộ khóa học: từ tiêu đề, mô tả, nội dung bài giảng đến cả các bài trắc nghiệm tréo ngoe.
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <Button 
                              onClick={handleTriggerAiScanFull}
                              disabled={isAiScanningFull || isAiScanningInfo}
                              className="h-10 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black flex items-center gap-2.5 shadow-lg shadow-indigo-100 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                              {isAiScanningFull ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                              {isAiScanningFull ? "Đang quét toàn diện..." : "Kích hoạt Kiểm duyệt AI TOÀN DIỆN ngay"}
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    const score = report.safetyScore ?? 100;
                    let scoreBg = "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200/60";
                    let scoreText = "Nội dung chữ an toàn";
                    let ShieldIcon = ShieldCheck;
                    if (score < 80) {
                      scoreBg = "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-200/60";
                      scoreText = "Văn bản có nghi vấn";
                      ShieldIcon = AlertTriangle;
                    }
                    if (score < 50) {
                      scoreBg = "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 border-rose-200/60";
                      scoreText = "Phát hiện lỗi nghiêm trọng";
                      ShieldIcon = ShieldAlert;
                    }

                    return (
                      <div className="space-y-5 animate-in fade-in duration-300 mt-0">
                        <div className="flex flex-col sm:flex-row gap-5 p-5 bg-white border border-border/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                          <div className={`flex-shrink-0 w-full sm:w-36 h-28 rounded-2xl flex flex-col items-center justify-center border shadow-inner ${scoreBg}`}>
                            <span className="text-4xl font-black tracking-tighter leading-none">{score}%</span>
                            <span className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-85">CHỈ SỐ AN TOÀN</span>
                          </div>
                          <div className="flex-1 flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-1.5 text-foreground font-extrabold text-[13px] uppercase tracking-wider">
                              <ShieldIcon className="w-4.5 h-4.5 text-indigo-600" />
                              Đánh giá văn bản: <span className="text-indigo-700 font-black">{scoreText}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium mt-2.5 bg-muted p-3 rounded-xl border border-border italic shadow-sm">
                              "{report.assessment}"
                            </p>
                          </div>
                          <div className="sm:shrink-0 self-center flex gap-2 pt-2 sm:pt-0">
                            <Button 
                              onClick={handleTriggerAiScanFull}
                              disabled={isAiScanningFull || isAiScanningInfo}
                              className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md shadow-indigo-100 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                              {isAiScanningFull ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                              QUÉT LẠI TOÀN DIỆN
                            </Button>
                          </div>
                        </div>

                        {/* Text Violations Details */}
                        {report.violations && report.violations.length > 0 ? (
                          <div className="space-y-2.5 mt-4">
                            <h5 className="text-[11px] font-black text-foreground uppercase tracking-widest px-1 flex items-center gap-1.5">
                              ⚠️ Chi tiết phát hiện vi phạm ({report.violations.length})
                            </h5>
                            <div className="space-y-2">
                              {report.violations.map((v, idx) => {
                                let badgeStyle = "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
                                if (v.severity === "WARNING") badgeStyle = "bg-amber-100 text-amber-700 ring-1 ring-amber-200";

                                return (
                                  <div key={idx} className="p-5 bg-white border-2 border-rose-100 rounded-2xl flex flex-col gap-2 shadow-sm hover:border-rose-300 transition-colors group/violation">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm">
                                          <ShieldAlert className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-black text-rose-800 uppercase tracking-tight">
                                          {v.type === "EXTERNAL_MARKETING" ? "📢 Kéo khách ngoài / Quảng cáo" : "🗣️ Lỗi từ ngữ / Pháp lý"}
                                        </span>
                                      </div>
                                      <Badge className={`h-5 px-2.5 py-0 text-[10px] font-black uppercase border-none tracking-widest ${badgeStyle}`}>
                                        {v.severity}
                                      </Badge>
                                    </div>
                                    <div className="mt-1 relative">
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-full opacity-20"></div>
                                      <p className="text-[13px] font-bold text-foreground pl-4 py-1 leading-relaxed italic">
                                        "{v.content}"
                                      </p>
                                    </div>
                                    <p className="text-xs text-foreground font-bold leading-relaxed mt-1 flex items-start gap-2 bg-muted p-3 rounded-xl border border-border">
                                      <span className="shrink-0 text-rose-500 mt-0.5">📌</span> 
                                      <span>Giải thích: <span className="font-medium text-muted-foreground">{v.explanation}</span></span>
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 text-center border border-emerald-100 bg-emerald-50/5 rounded-2xl flex flex-col items-center justify-center gap-1 mt-2 shadow-inner">
                            <CheckCircle2 className="w-7 h-7 text-emerald-500 animate-bounce" />
                            <p className="text-emerald-800 text-xs font-black uppercase tracking-wide mt-1">Nội dung chữ sạch & an toàn</p>
                            <p className="text-muted-foreground text-[10px] font-medium">Không phát hiện quảng cáo ngoài, số điện thoại hay ngôn từ nhạy cảm trong Tiêu đề & Mô tả.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Sticky Curriculum Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[100px]">
          {/* Instructor Contact Info Profile */}
          <div className="bg-white p-5 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4">
            <div className="relative shrink-0 flex items-center justify-center">
              {course.instructorAvatar ? (
                <img
                  src={course.instructorAvatar}
                  alt="avt"
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-muted-foreground font-bold shadow-sm">
                   GV
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow">
                <CheckCircle2 className="w-3 h-3 fill-white text-emerald-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                Tác giả học liệu
              </p>
              <p className="text-[15px] font-black text-foreground truncate">
                {course.instructorName || "Giảng viên Gnostica"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileModalOpen(true)}
              className="font-bold text-xs rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors shrink-0"
            >
              Hồ sơ
            </Button>
          </div>

          {/* Dynamic Curriculum Component Area */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm flex flex-col overflow-hidden max-h-[calc(100vh-200px)]">
            <div className="p-5 bg-muted text-white flex-shrink-0">
              <h3 className="font-black flex items-center gap-2.5 tracking-tight text-[17px]">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Chương trình đào tạo
              </h3>
              <p className="text-muted-foreground text-xs font-bold mt-1 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> {validModules.length} Chương • {totalLessons} Bài giảng
              </p>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 bg-muted scrollbar-thin">
              {validModules.length > 0 ? (
                <Accordion
                  type="multiple"
                  defaultValue={[`mod-${validModules[0]?.id}`]}
                  className="w-full space-y-3"
                >
                  {validModules.map((mod, index) => {
                     const validLessons = mod.lessons?.filter(l => !l.deleted) || [];
                     return (
                        <AccordionItem
                          key={mod.id}
                          value={`mod-${mod.id}`}
                          className="border border-border rounded-xl overflow-hidden shadow-sm bg-white transition-all duration-200"
                        >
                          <AccordionTrigger className="px-4 py-3.5 hover:no-underline hover:bg-muted font-extrabold text-foreground text-left text-sm leading-tight">
                            <span className="truncate max-w-[90%]">
                              {mod.title}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-2 pb-2 pt-0 space-y-1">
                             {/* 1. RENDER LESSONS */}
                             {validLessons.map((les, lIdx) => (
                                <div
                                  key={les.id}
                                  onClick={() => {
                                     setActivePreview({ 
                                       type: "lesson", 
                                       data: les,
                                       moduleAttachments: mod.attachments
                                     });
                                     window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all group/item border ${activePreview?.type === "lesson" && activePreview.data.id === les.id ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'border-transparent hover:bg-muted text-muted-foreground'}`}
                                >
                                   <div className="flex items-center gap-2 min-w-0">
                                      <Video className={`w-3.5 h-3.5 shrink-0 ${activePreview?.type === "lesson" && activePreview.data.id === les.id ? 'text-indigo-600' : 'text-info opacity-70'}`} />
                                      <span className={`text-xs truncate font-bold ${activePreview?.type === "lesson" && activePreview.data.id === les.id ? 'text-indigo-950' : 'text-foreground'}`}>
                                         {lIdx + 1}. {les.title}
                                      </span>
                                   </div>
                                   <ChevronRight className={`w-3 h-3 transition-all opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5`} />
                                </div>
                             ))}

                             {/* 3. RENDER QUIZ */}
                             {mod.quiz && (
                                <div
                                  onClick={() => {
                                     setActivePreview({ type: "quiz", data: mod.quiz });
                                     window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all group/item border ${activePreview?.type === "quiz" && activePreview.data.id === mod.quiz.id ? 'bg-violet-50 border-violet-200 text-violet-900' : 'border-transparent hover:bg-muted text-muted-foreground'}`}
                                >
                                   <div className="flex items-center gap-2 min-w-0">
                                      <Trophy className="w-3.5 h-3.5 text-violet-600 opacity-80 shrink-0" />
                                      <span className="text-xs truncate font-black text-violet-700 uppercase tracking-wide">
                                         Quiz: {mod.quiz.title || "Kiểm tra kiến thức"}
                                      </span>
                                   </div>
                                   <ChevronRight className="w-3 h-3 transition-all opacity-0 group-hover/item:opacity-100" />
                                </div>
                             )}
                          </AccordionContent>
                        </AccordionItem>
                     );
                  })}
                </Accordion>
              ) : (
                <p className="text-center text-muted-foreground italic text-xs font-medium py-10">Khóa học này hiện chưa có chương trình học nào.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <CourseRejectModal
         isOpen={isRejectModalOpen}
         onClose={setIsRejectModalOpen}
         courseName={course.title}
         rejectReason={rejectReason}
         setRejectReason={setRejectReason}
         onConfirm={handleConfirmReject}
      />

      <InstructorProfileModal 
         isOpen={isProfileModalOpen}
         onClose={setIsProfileModalOpen}
         instructor={instructorInfo}
      />
    </div>
  );
}
