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
import courseService from "@/services/course/courseService";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackgroundVideoUploader from "./BackgroundVideoUploader";

export default function MediaTab({ uploadVideoToBunny, setActiveUploads }) {
  const { setValue, watch, formState: { errors } } = useFormContext();
  const thumbnail = watch("thumbnail");
  const promoVideo = watch("promoVideo");

  return (
    <div className="space-y-8 w-full">
      <div>
        <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 mb-4">
          Hình Ảnh & Media
        </h3>
        <p className="text-xs text-muted-foreground">
          Giới thiệu khóa học một cách trực quan để thu hút học viên.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 text-center">
            Ảnh đại diện khóa học (Thumbnail) <span className="text-error">*</span>
          </label>
          <input
            type="file"
            id="thumbnail-upload"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) setValue("thumbnail", file, { shouldValidate: true });
            }}
          />
          <div
            onClick={() => document.getElementById("thumbnail-upload").click()}
            className={`aspect-video rounded-xl bg-muted border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all cursor-pointer group ${thumbnail ? "border-success/20 bg-green-50" : "border-border hover:bg-secondary hover:border-success/20"}`}
          >
            {thumbnail && (thumbnail instanceof File || typeof thumbnail === "string") ? (
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <img
                  src={typeof thumbnail === "string" ? thumbnail : URL.createObjectURL(thumbnail)}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <p className="text-white text-xs font-bold px-3 py-1.5 bg-success/10 text-success rounded-full">Đổi ảnh</p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`w-12 h-12 rounded-full bg-white flex items-center justify-center text-muted-foreground group-hover:text-success shadow-sm border border-border mb-2 ${thumbnail ? "text-success" : ""}`}
                >
                  {thumbnail ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </div>
                <p className="text-[11px] font-bold text-muted-foreground">
                  {thumbnail ? "Đã chọn ảnh" : "Nhấn để tải lên (1280x720)"}
                </p>
                {thumbnail && (
                  <p className="text-[9px] text-muted-foreground mt-1 truncate max-w-[200px]">
                    {thumbnail.name || (typeof thumbnail === 'string' ? "Đã có ảnh" : "")}
                  </p>
                )}
              </>
            )}
          </div>
          {errors.thumbnail && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1 text-center">{errors.thumbnail.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 text-center">
            Video giới thiệu (Promo Video) (Nếu có)
          </label>
          <Controller
            name="promoVideo"
            render={({ field }) => (
              <BackgroundVideoUploader
                label="video giới thiệu"
                value={field.value}
                onChange={field.onChange}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadEnd={() => setActiveUploads(prev => prev - 1)}
                uploadVideoToBunny={uploadVideoToBunny}
                id="promo-video-uploader"
              />
            )}
          />
          {errors.promoVideo && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1 text-center">{errors.promoVideo.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

