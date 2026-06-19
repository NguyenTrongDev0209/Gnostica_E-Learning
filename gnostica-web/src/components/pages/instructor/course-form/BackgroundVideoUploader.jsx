import React from "react";
import { useFormContext, useWatch, Controller, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Video, GripVertical, Trash2, Plus, PlayCircle, FileText, Check, Loader2, Sparkles, Database, CheckCircle2, ListOrdered, Search, Pencil } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import courseService from "@/services/courseService";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import VideoProgressCircle from "./VideoProgressCircle";
import { CheckIcon } from "./CheckIcon";

export default function BackgroundVideoUploader({ label, value, onChange, onUploadStart, onUploadEnd, uploadVideoToBunny, id = "v-upload" }) {
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [processingProgress, setProcessingProgress] = React.useState(0);
  const [uploadPhase, setUploadPhase] = React.useState("idle"); // idle, uploading, processing, completed
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  // Lưu lại giá trị video gốc ban đầu khi component mới render (để không xóa nhầm video đã publish)
  const originalValueRef = React.useRef(value);

  // Effect để "kết nối" lại với tiến trình tải lên nếu có (khi quay lại tab)
  React.useEffect(() => {
    // Đăng ký callback để nhận cập nhật tiến trình mới nhất
    uploadCallbacks[id] = (state) => {
      if (typeof state === 'number') {
         setUploadProgress(state);
      } else if (state) {
         setUploadProgress(state.upload || 0);
         setProcessingProgress(state.processing || 0);
         setUploadPhase(state.phase || "idle");
      }
    };

    // Nếu đang có tiến trình chạy ngầm, lấy giá trị hiện tại ngay lập tức
    if (globalUploadProgress[id] !== undefined) {
      const state = globalUploadProgress[id];
      if (typeof state === 'number') {
         setUploadProgress(state);
      } else {
         setUploadProgress(state.upload || 0);
         setProcessingProgress(state.processing || 0);
         setUploadPhase(state.phase || "idle");
      }
    }

    return () => {
      delete uploadCallbacks[id];
    };
  }, [id]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      onUploadStart();

      // Bước 1: Tải video lên Bunny.net sử dụng TUS Protocol
      const videoId = await uploadVideoToBunny(file, file.name, (pct) => {
        setUploadProgress(pct);
        updateGlobalState(pct, 0, "uploading");
      });

      // Upload xong 100%, chuyển phase
      setUploadProgress(100);
      setUploadPhase("processing");
      updateGlobalState(100, 0, "processing");

      // Bước 2: Đợi sinh phụ đề tự động từ Bunny Stream AI
      let captionReady = false;
      let attempts = 0;
      const maxAttempts = 40; // Tối đa ~3.5 phút (40 lần * 5 giây)

      while (!captionReady && attempts < maxAttempts) {
        // Nghỉ 5 giây giữa mỗi nhịp thăm dò
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;

        // Nhích đều đặn từ 0% lên 99%
        const step = 99 / maxAttempts; 
        const progressBoost = Math.min(99, Math.round(attempts * step));
        
        setProcessingProgress(progressBoost);
        updateGlobalState(100, progressBoost, "processing");

        try {
          // Gọi API kiểm tra trạng thái VTT của videoId
          const status = await courseService.checkSubtitleStatus(videoId);
          if (status && status.ready) {
            captionReady = true;
          }
        } catch (err) {
          console.warn("Lỗi kiểm tra phụ đề, thử lại...", err);
        }
      }

      // Hoàn tất mỹ mãn
      setProcessingProgress(100);
      setUploadPhase("completed");
      updateGlobalState(100, 100, "completed");

      await new Promise(resolve => setTimeout(resolve, 800)); // Giữ trạng thái 100% cho sướng mắt

      onChange(videoId);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Lỗi tải lên");
      toast.error(`Không thể tải lên ${label}`);
    } finally {
      setIsUploading(false);
      delete globalUploadProgress[id];
      onUploadEnd();
    }
  };

  const isCompleted = value && typeof value === 'string' && !isUploading;
  const isCurrentlyUploading = isUploading || (value instanceof File);

  return (
    <div
      onClick={() => !isUploading && document.getElementById(id).click()}
      className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all cursor-pointer group/upload
        ${isCompleted ? "border-success/20 bg-green-50/30" : isCurrentlyUploading ? "border-success/20 bg-green-50/10" : "border-border bg-muted hover:bg-secondary hover:border-success/20"}`}
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
        <div className="flex flex-col items-center gap-2">
           <VideoProgressCircle 
              key={uploadPhase}
              progress={uploadPhase === "uploading" ? uploadProgress : processingProgress} 
              size={80} 
           />
           <p className={`text-[10px] font-bold text-center leading-tight animate-pulse ${uploadPhase === "uploading" ? "text-muted-foreground" : "text-success"}`}>
             {uploadPhase === "uploading" ? "ĐANG TIẾN HÀNH UPLOAD VIDEO..." : "AI ĐANG XỬ LÍ PHỤ ĐỀ..."}
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

      {error && <p className="absolute bottom-2 text-[9px] font-bold text-error">{error}</p>}
    </div>
  );
}
