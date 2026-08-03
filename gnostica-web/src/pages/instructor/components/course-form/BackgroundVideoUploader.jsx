import React from "react";
import { toast } from "sonner";
import { Check, Video, X } from "lucide-react";
import { VideoProgressCircle } from "./SharedUI";
import courseService from "@/services/course/courseService";

const globalUploadProgress = {};
const uploadCallbacks = {};
const globalAbortControllers = {};
const globalCompletedUploads = {};

export function BackgroundVideoUploader({ label, value, onChange, onMetadata, onUploadStart, onUploadEnd, uploadVideoToBunny, id = "v-upload" }) {
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [processingProgress, setProcessingProgress] = React.useState(0);
  const [uploadPhase, setUploadPhase] = React.useState("idle"); // idle, uploading, processing, completed, done, error
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [completedVideoId, setCompletedVideoId] = React.useState(null);
  
  // Lưu lại giá trị video gốc ban đầu khi component mới render (để không xóa nhầm video đã publish)
  const originalValueRef = React.useRef(value);
  const hasNotifiedStartRef = React.useRef(false);

  // Effect để "kết nối" lại với tiến trình tải lên nếu có (khi quay lại tab)
  React.useEffect(() => {
    if (globalCompletedUploads[id]) {
      setCompletedVideoId(globalCompletedUploads[id]);
      delete globalCompletedUploads[id];
    }
  }, [id]);

  React.useEffect(() => {
    if (completedVideoId) {
      onChange(completedVideoId);
      setCompletedVideoId(null);
    }
  }, [completedVideoId, onChange]);

  React.useEffect(() => {
    // Đăng ký callback để nhận cập nhật tiến trình mới nhất
    uploadCallbacks[id] = (state) => {
      if (typeof state === 'number') {
         setUploadProgress(state);
      } else if (state) {
         setUploadProgress(state.upload || 0);
         setProcessingProgress(state.processing || 0);
         setUploadPhase(state.phase || "idle");
         if (state.phase === "done" || state.phase === "error") {
            setIsUploading(false);
            if (hasNotifiedStartRef.current) {
               onUploadEnd?.();
               hasNotifiedStartRef.current = false;
            }
            if (state.videoId) {
               setCompletedVideoId(state.videoId);
            }
         }
      }
    };

    // Nếu đang có tiến trình chạy ngầm, lấy giá trị hiện tại ngay lập tức
    if (globalUploadProgress[id] !== undefined) {
      if (!hasNotifiedStartRef.current) {
         onUploadStart?.();
         hasNotifiedStartRef.current = true;
      }
      const state = globalUploadProgress[id];
      if (typeof state === 'number') {
         setUploadProgress(state);
         setIsUploading(true);
      } else {
         setUploadProgress(state.upload || 0);
         setProcessingProgress(state.processing || 0);
         setUploadPhase(state.phase || "idle");
         setIsUploading(true);
      }
    }

    return () => {
      delete uploadCallbacks[id];
      if (hasNotifiedStartRef.current) {
         onUploadEnd?.();
         hasNotifiedStartRef.current = false;
      }
    };
  }, [id]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (onMetadata) {
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = objectUrl;

      try {
        const metadata = await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => resolve({
            durationSeconds: Math.max(0, Math.round(video.duration || 0)),
            width: video.videoWidth || null,
            height: video.videoHeight || null,
            fileSize: file.size,
            mimeType: file.type || null,
          });
          video.onerror = () => reject(new Error("Không thể đọc metadata video"));
        });
        onMetadata(metadata);
      } catch (metadataError) {
        console.warn("Không thể đọc metadata video:", metadataError);
      } finally {
        URL.revokeObjectURL(objectUrl);
        video.removeAttribute("src");
        video.load();
      }
    }

    // Lớp bảo vệ 2: Nếu người dùng đang thay thế một video trung gian (vừa tải lên trong phiên này nhưng chưa lưu)
    // thì gọi Bunny xóa video cũ đi để tránh sinh rác
    if (typeof value === 'string' && value !== originalValueRef.current) {
       courseService.deleteVideoFromBunny(value).catch(err => console.error("Không thể dọn rác video cũ", err));
    }

    try {
      onChange(file);

      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      setProcessingProgress(0);
      setUploadPhase("uploading");
      
      const updateGlobalState = (u, p, phase) => {
         globalUploadProgress[id] = { upload: u, processing: p, phase };
         if (uploadCallbacks[id]) {
            uploadCallbacks[id]({ upload: u, processing: p, phase });
         }
      };

      updateGlobalState(0, 0, "uploading");
      if (!hasNotifiedStartRef.current) {
         onUploadStart?.();
         hasNotifiedStartRef.current = true;
      }
      
      const abortController = new AbortController();
      globalAbortControllers[id] = abortController;

      // Bước 1: Tải video lên Bunny.net sử dụng TUS Protocol
      const videoId = await uploadVideoToBunny(file, file.name, (pct) => {
        setUploadProgress(pct);
        updateGlobalState(pct, 0, "uploading");
      }, abortController.signal);

      // Upload xong 100%, chuyển phase
      setUploadProgress(100);
      setUploadPhase("processing");
      updateGlobalState(100, 0, "processing");

      // Bước 2: Bỏ qua tạo phụ đề tự động theo yêu cầu của user, hoàn thành luôn
      setProcessingProgress(100);
      setUploadPhase("completed");
      updateGlobalState(100, 100, "completed");

      await new Promise(resolve => setTimeout(resolve, 800)); // Giữ trạng thái 100% cho sướng mắt

      globalCompletedUploads[id] = videoId;
      onChange(videoId);
    } catch (err) {
      if (err.message === "Upload cancelled by user") {
        console.log("Upload cancelled");
        return;
      }
      console.error("Upload error:", err);
      setError("Lỗi tải lên");
      toast.error(`Không thể tải lên ${label}`);
      if (uploadCallbacks[id]) uploadCallbacks[id]({ upload: 0, processing: 0, phase: "error" });
    } finally {
      setIsUploading(false);
      delete globalUploadProgress[id];
      delete globalAbortControllers[id];
      if (uploadCallbacks[id]) {
         const isSuccess = !!globalCompletedUploads[id];
         if (isSuccess) {
            uploadCallbacks[id]({ upload: 100, processing: 100, phase: "done", videoId: globalCompletedUploads[id] });
         } else {
            uploadCallbacks[id]({ upload: 0, processing: 0, phase: "error" });
         }
      }
    }
  };

  const handleCancelUpload = (e) => {
    e.stopPropagation();
    if (globalAbortControllers[id]) {
      globalAbortControllers[id].abort();
      delete globalAbortControllers[id];
    }
    setIsUploading(false);
    onChange(null);
    setUploadPhase("idle");
    delete globalUploadProgress[id];
    if (uploadCallbacks[id]) uploadCallbacks[id]({ upload: 0, processing: 0, phase: "idle" });
    onUploadEnd();
  };

  const isCompleted = value && typeof value === 'string' && !isUploading;
  const isCurrentlyUploading = isUploading || (value instanceof File);

  return (
    <div
      onClick={() => !isUploading && document.getElementById(id).click()}
      className={`relative aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all cursor-pointer group/upload
        ${isCompleted ? "border-success/20 bg-success/10" : isCurrentlyUploading ? "border-success/20 bg-success/10" : "border-border bg-muted hover:bg-secondary hover:border-success/20"}`}
    >
      <input
        type="file"
        id={id}
        className="hidden"
        accept="video/*"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {isCurrentlyUploading ? (
        <div className="flex flex-col items-center gap-2 relative w-full h-full justify-center">
           <div 
             className="absolute top-0 right-0 w-6 h-6 bg-error hover:bg-error/80 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md z-10 transition-colors"
             onClick={handleCancelUpload}
             title="Hủy tải lên"
           >
             <X size={14} strokeWidth={3} />
           </div>
           <VideoProgressCircle 
              key={uploadPhase}
              progress={uploadPhase === "uploading" ? uploadProgress : processingProgress} 
              size={80} 
           />
           <p className={`text-[10px] font-bold text-center leading-tight ${uploadPhase === "uploading" ? "text-foreground" : "text-success"}`}>
             {uploadPhase === "uploading" ? "ĐANG TIẾN HÀNH UPLOAD VIDEO..." : "ĐANG HOÀN TẤT..."}
           </p>
        </div>
      ) : isCompleted ? (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-success/10 text-success text-white flex items-center justify-center mb-2 shadow-sm">
            <Check className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-bold text-success uppercase tracking-tight">Tải lên hoàn tất</p>
          <p className="text-[9px] text-muted-foreground mt-1 truncate max-w-[150px]">ID: {value.substring(0, 12)}...</p>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-white text-slate-300 group-hover/upload:text-success flex items-center justify-center mb-2 shadow-sm border border-border transition-all">
            <Video size={20} />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground group-hover/upload:text-success transition-colors uppercase tracking-tight">
            Chạm để tải {label}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">MP4, MOV hoặc AVI</p>
        </>
      )}
    </div>
  );
}
