import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, Tags } from "lucide-react";
import { toast } from "sonner";

import {
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogRoot,
  AppDialogTitle,
} from "@/components/common/micro/AppDialog";
import { AppButton } from "@/components/common/micro/AppButton";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppInput from "@/components/common/micro/AppInput";
import AppTextarea from "@/components/common/micro/AppTextarea";
import forumCategoryService from "@/services/forum/forumCategoryService";

const AVATAR_OUTPUT = { width: 512, height: 512 };
const BANNER_OUTPUT = { width: 1600, height: 600 };

const toSlug = (value) => value
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[đĐ]/g, "d")
  .trim()
  .replace(/[^\w\s-]/g, "")
  .replace(/[\s_-]+/g, "-")
  .replace(/^-+|-+$/g, "");

const clamp = (value) => Math.min(100, Math.max(0, value));

const cropImage = async (file, output, position) => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.max(output.width / bitmap.width, output.height / bitmap.height);
  const sourceWidth = output.width / scale;
  const sourceHeight = output.height / scale;
  const sourceX = (bitmap.width - sourceWidth) * (position.x / 100);
  const sourceY = (bitmap.height - sourceHeight) * (position.y / 100);
  const canvas = document.createElement("canvas");
  canvas.width = output.width;
  canvas.height = output.height;
  canvas.getContext("2d").drawImage(
    bitmap,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    output.width,
    output.height
  );
  bitmap.close();

  const mimeType = ["image/png", "image/webp", "image/jpeg"].includes(file.type) ? file.type : "image/jpeg";
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(result => result ? resolve(result) : reject(new Error("Không thể cắt ảnh")), mimeType, 0.92);
  });
  return new File([blob], file.name, { type: mimeType, lastModified: Date.now() });
};

const getImageDimensions = async (file) => {
  const bitmap = await createImageBitmap(file);
  const dimensions = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return dimensions;
};

const DraggablePreviewImage = ({ src, alt, position, onPositionChange, className = "" }) => {
  const dragState = useRef(null);

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = { x: event.clientX, y: event.clientY, position };
  };

  const handlePointerMove = (event) => {
    if (!dragState.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    onPositionChange({
      x: clamp(dragState.current.position.x - ((event.clientX - dragState.current.x) / bounds.width) * 100),
      y: clamp(dragState.current.position.y - ((event.clientY - dragState.current.y) / bounds.height) * 100),
    });
  };

  const stopDragging = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
  };

  return (
    <img
      src={src}
      alt={alt}
      draggable="false"
      title="Kéo để chọn vùng hiển thị"
      className={`touch-none cursor-grab select-none object-cover active:cursor-grabbing ${className}`}
      style={{ objectPosition: `${position.x}% ${position.y}%` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    />
  );
};

const TopicImageField = ({ label, preview, type, dimensions, output, position, onPositionChange, onSelect }) => {
  const dragState = useRef(null);
  const aspectRatio = `${output.width} / ${output.height}`;

  const handlePointerDown = (event) => {
    if (!preview) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = { x: event.clientX, y: event.clientY, position };
  };

  const handlePointerMove = (event) => {
    if (!dragState.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    onPositionChange({
      x: clamp(dragState.current.position.x - ((event.clientX - dragState.current.x) / bounds.width) * 100),
      y: clamp(dragState.current.position.y - ((event.clientY - dragState.current.y) / bounds.height) * 100),
    });
  };

  const stopDragging = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
  };

  return (
    <div className="min-w-0">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {preview ? (
        <div
          className="group relative touch-none cursor-grab overflow-hidden rounded-[var(--radius)] border border-primary/35 bg-primary/5 active:cursor-grabbing"
          style={{ aspectRatio }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <img
            src={preview}
            alt={`Vùng cắt ${label.toLowerCase()}`}
            draggable="false"
            className="pointer-events-none h-full w-full select-none object-cover"
            style={{ objectPosition: `${position.x}% ${position.y}%` }}
          />
          <span className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md bg-black/60 px-2 py-1 text-center text-[10px] font-medium text-white">
            Kéo ảnh để chọn vùng
          </span>
          <label
            className="absolute right-2 top-2 z-20 cursor-pointer rounded-md bg-background/90 px-2 py-1 text-[10px] font-semibold text-primary shadow-sm"
            onPointerDown={event => event.stopPropagation()}
            onPointerMove={event => event.stopPropagation()}
            onPointerUp={event => event.stopPropagation()}
            onClick={event => event.stopPropagation()}
          >
            Thay ảnh
            <input type="file" accept="image/*" className="sr-only" onChange={event => onSelect(event.target.files?.[0])} />
          </label>
        </div>
      ) : (
        <label
          className="flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] border border-dashed border-primary/35 bg-primary/5 text-center transition-colors hover:bg-primary/10"
          style={{ aspectRatio }}
        >
          <ImagePlus className="mb-2 h-6 w-6 text-primary" />
          <span className="px-2 text-xs font-medium text-primary">
            {type === "avatar" ? "Chọn ảnh vuông" : "Chọn ảnh banner"}
          </span>
          <input type="file" accept="image/*" className="sr-only" onChange={event => onSelect(event.target.files?.[0])} />
        </label>
      )}
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        {dimensions ? `${dimensions.width} × ${dimensions.height} px` : "Chưa chọn ảnh"}
        <span className="block">Đầu ra: {output.width} × {output.height} px</span>
      </p>
    </div>
  );
};

export default function ForumTopicCreateDialog({ open, onOpenChange, categories = [], onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [avatarDimensions, setAvatarDimensions] = useState(null);
  const [bannerDimensions, setBannerDimensions] = useState(null);
  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 50 });
  const [bannerPosition, setBannerPosition] = useState({ x: 50, y: 50 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  useEffect(() => () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
  }, [bannerPreview]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setAvatar(null);
    setBanner(null);
    setAvatarPreview("");
    setBannerPreview("");
    setAvatarDimensions(null);
    setBannerDimensions(null);
    setAvatarPosition({ x: 50, y: 50 });
    setBannerPosition({ x: 50, y: 50 });
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && !isSubmitting) resetForm();
    onOpenChange(nextOpen);
  };

  const selectImage = async (file, setFile, setPreview, setDimensions, setPosition) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng định dạng ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5 MB");
      return;
    }
    try {
      const dimensions = await getImageDimensions(file);
      setFile(file);
      setDimensions(dimensions);
      setPosition({ x: 50, y: 50 });
      setPreview(URL.createObjectURL(file));
    } catch {
      toast.error("Không thể đọc kích thước ảnh");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const topicName = name.trim();
    if (!topicName) {
      toast.error("Vui lòng nhập tên chủ đề");
      return;
    }
    if (categories.some(category => category.name.toLowerCase() === topicName.toLowerCase())) {
      toast.error("Chủ đề đã tồn tại");
      return;
    }

    setIsSubmitting(true);
    try {
      const [croppedAvatar, croppedBanner] = await Promise.all([
        avatar ? cropImage(avatar, AVATAR_OUTPUT, avatarPosition) : Promise.resolve(null),
        banner ? cropImage(banner, BANNER_OUTPUT, bannerPosition) : Promise.resolve(null),
      ]);
      const [avatarUrl, bannerUrl] = await Promise.all([
        croppedAvatar ? forumCategoryService.uploadImage(croppedAvatar) : Promise.resolve(null),
        croppedBanner ? forumCategoryService.uploadImage(croppedBanner) : Promise.resolve(null),
      ]);
      await forumCategoryService.createCategory({
        name: topicName,
        slug: toSlug(topicName),
        description: description.trim() || null,
        avatarUrl,
        bannerUrl,
        status: true,
      });
      await onCreated?.();
      resetForm();
      onOpenChange(false);
      toast.success("Đã tạo chủ đề thành công");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tạo chủ đề");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppDialogRoot open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl"
      >
        <form onSubmit={handleSubmit}>
          <AppDialogHeader>
            <AppDialogTitle>Tạo chủ đề mới</AppDialogTitle>
          </AppDialogHeader>

          <div className="grid gap-6 py-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
            <div className="min-w-0 space-y-5">
              <AppInput
                id="forum-topic-name"
                label="Tên chủ đề"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="Nhập tên chủ đề..."
                maxLength={255}
                autoFocus
              />
              <AppTextarea
                id="forum-topic-description"
                label="Mô tả"
                labelRight={<span className="text-xs text-muted-foreground">{description.length}/255</span>}
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="Mô tả ngắn về nội dung của chủ đề..."
                maxLength={255}
                rows={4}
                className="min-h-28 resize-none"
              />
              <div className="grid grid-cols-[3fr_8fr] items-start gap-4">
                <TopicImageField
                  label="Avatar chủ đề"
                  type="avatar"
                  preview={avatarPreview}
                  dimensions={avatarDimensions}
                  output={AVATAR_OUTPUT}
                  position={avatarPosition}
                  onPositionChange={setAvatarPosition}
                  onSelect={file => selectImage(file, setAvatar, setAvatarPreview, setAvatarDimensions, setAvatarPosition)}
                />
                <TopicImageField
                  label="Banner chủ đề"
                  type="banner"
                  preview={bannerPreview}
                  dimensions={bannerDimensions}
                  output={BANNER_OUTPUT}
                  position={bannerPosition}
                  onPositionChange={setBannerPosition}
                  onSelect={file => selectImage(file, setBanner, setBannerPreview, setBannerDimensions, setBannerPosition)}
                />
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG hoặc WebP · Tối đa 5 MB mỗi ảnh.</p>
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-sm font-medium text-foreground">Xem trước</p>
              <AppCard appVariant="default" className="min-w-0 gap-0 overflow-hidden rounded-[var(--radius)] border-border p-0 shadow-sm">
                <div
                  className="min-h-0 w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5"
                  style={{ aspectRatio: `${BANNER_OUTPUT.width} / ${BANNER_OUTPUT.height}` }}
                >
                  {bannerPreview && (
                    <DraggablePreviewImage
                      src={bannerPreview}
                      alt="Banner chủ đề"
                      position={bannerPosition}
                      onPositionChange={setBannerPosition}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <AppCardContent className="min-w-0 px-5 pb-5">
                  <div className="-mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[var(--radius)] border-4 border-card bg-primary/10">
                    {avatarPreview ? (
                      <DraggablePreviewImage
                        src={avatarPreview}
                        alt="Avatar chủ đề"
                        position={avatarPosition}
                        onPositionChange={setAvatarPosition}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Tags className="h-7 w-7 text-primary" />
                    )}
                  </div>
                  <h4 className="mt-3 break-words text-lg font-bold text-foreground [overflow-wrap:anywhere]">
                    {name.trim() || "Tên chủ đề"}
                  </h4>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                    {description.trim() || "Mô tả ngắn của chủ đề sẽ hiển thị tại đây."}
                  </p>
                </AppCardContent>
              </AppCard>
              {(avatarPreview || bannerPreview) && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Kéo avatar hoặc banner trong khung để chọn vùng hiển thị.
                </p>
              )}
            </div>
          </div>

          <AppDialogFooter>
            <AppButton type="button" appVariant="ghostMuted" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </AppButton>
            <AppButton type="submit" appVariant="gradient" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo chủ đề"}
            </AppButton>
          </AppDialogFooter>
        </form>
      </AppDialogContent>
    </AppDialogRoot>
  );
}
