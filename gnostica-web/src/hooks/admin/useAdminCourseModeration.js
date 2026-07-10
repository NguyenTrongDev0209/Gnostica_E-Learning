import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import adminCourseService from "@/services/admin/adminCourseService";
import { toast } from "sonner";

export default function useAdminCourseModeration(slug) {
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [activePreview, setActivePreview] = useState(null);

  const playerRef = useRef(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [isAiScanningInfo, setIsAiScanningInfo] = useState(false);
  const [isAiScanningFull, setIsAiScanningFull] = useState(false);

  const isEmbedLink = (url) => {
    if (!url) return false;
    const isDirectVideo = /\.(m3u8|mp4|mov|webm)($|\?)/i.test(url);
    if (isDirectVideo) return false;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (uuidRegex.test(url)) return true;
    if (url.includes("/")) {
      const parts = url.split("/");
      if (uuidRegex.test(parts[parts.length - 1])) return true;
    }
    const lowUrl = url.toLowerCase();
    return (lowUrl.includes("mediadelivery.net") || lowUrl.includes("bunny.net") || lowUrl.includes("vimeo.com")) && !lowUrl.includes("b-cdn.net");
  };

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
      try {
        playerRef.current.contentWindow?.postMessage(JSON.stringify({ type: "seek", value: seconds }), "*");
        playerRef.current.contentWindow?.postMessage(JSON.stringify({ type: "play" }), "*");
      } catch (e) {
        console.error("PostMessage seek error:", e);
      }
    } else {
      playerRef.current.currentTime = seconds;
      playerRef.current.play().catch(() => {});
    }
    toast.info(`Tua video đến ${timeString}`);
  };

  const handleTriggerAiScan = async (lessonId) => {
    if (!lessonId) return;
    try {
      setIsAiScanning(true);
      const res = await adminCourseService.triggerAiScan(lessonId);
      toast.success("Quét kiểm duyệt AI thành công!");
      const updatedCourse = await adminCourseService.getCourseForModeration(slug);
      setCourse(updatedCourse);
      if (activePreview && activePreview.data.id === lessonId) {
        setActivePreview(prev => ({
          ...prev,
          data: { ...prev.data, aiModerationReport: res.aiModerationReport }
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Có lỗi xảy ra khi quét AI.");
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleTriggerAiScanInfo = async () => {
    try {
      setIsAiScanningInfo(true);
      await adminCourseService.triggerAiScanInfo(slug);
      toast.success("Quét AI nội dung văn bản khóa học thành công!");
      const updatedCourse = await adminCourseService.getCourseForModeration(slug);
      setCourse(updatedCourse);
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi quét văn bản khóa học.");
    } finally {
      setIsAiScanningInfo(false);
    }
  };

  const handleTriggerAiScanFull = async () => {
    try {
      setIsAiScanningFull(true);
      const res = await adminCourseService.triggerAiScanFull(slug);
      toast.info(res.message || "Đang khởi động quy trình kiểm duyệt AI toàn diện trong nền...");
      setCourse(prev => ({ ...prev, aiModerationStatus: "SCANNING" }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi quét toàn diện khóa học.");
    } finally {
      setIsAiScanningFull(false);
    }
  };

  useEffect(() => {
    let intervalId;
    if (course?.aiModerationStatus === "SCANNING") {
      intervalId = setInterval(async () => {
        try {
          const updatedCourse = await adminCourseService.getCourseForModeration(slug);
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
      const res = await adminCourseService.getCourseForModeration(slug);
      setCourse(res);
      setActivePreview(null);
    } catch (err) {
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
      await adminCourseService.approveCourse(course.slug);
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
      await adminCourseService.rejectCourse(course.slug, rejectReason);
      toast.success("Đã từ chối phê duyệt khóa học.");
      setIsRejectModalOpen(false);
      navigate("/admin/course-moderation");
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi gửi từ chối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    course,
    loading,
    isSubmitting,
    isRejectModalOpen,
    setIsRejectModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    rejectReason,
    setRejectReason,
    activePreview,
    setActivePreview,
    playerRef,
    isAiScanning,
    isAiScanningInfo,
    isAiScanningFull,
    isEmbedLink,
    jumpToTime,
    handleTriggerAiScan,
    handleTriggerAiScanInfo,
    handleTriggerAiScanFull,
    focusAndPreviewLesson,
    handleApprove,
    handleConfirmReject
  };
}
