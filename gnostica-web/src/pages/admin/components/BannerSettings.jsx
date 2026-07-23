import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import { Label } from "@/components/common/micro/AppLabel";
import { Switch } from "@/components/ui/switch";
import { useAdminBanners } from "@/hooks/settings/useSiteSettings";
import Skeleton from "@/components/common/micro/AppSkeleton";
import AppAlertDialog from "@/components/common/micro/AppAlertDialog";

const POSITIONS = [
  { value: "HOME_HERO", label: "Hero banner" },
  { value: "HOME_SUB", label: "Banner phụ" },
];

const HERO_ASPECT_RATIO = 1240 / 285;
const HERO_ASPECT_TOLERANCE = 0.015;

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không thể đọc kích thước ảnh"));
    };
    image.src = url;
  });
}

async function validateBannerImage(file, position) {
  if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return "Banner phải là ảnh và không vượt quá 10MB";
  if (position !== "HOME_HERO") return null;

  try {
    const { width, height } = await getImageDimensions(file);
    if (!width || !height || Math.abs((width / height) - HERO_ASPECT_RATIO) / HERO_ASPECT_RATIO > HERO_ASPECT_TOLERANCE) return "Ảnh Hero banner cần có tỷ lệ 4,35:1, ví dụ 1240×285 hoặc 2480×570";
  } catch {
    return "Không thể đọc kích thước ảnh Hero banner";
  }

  return null;
}

const toPayload = (banner, overrides = {}) => ({
  title: banner.title,
  imageUrl: banner.imageUrl,
  altText: banner.altText || banner.title,
  linkUrl: banner.linkUrl || "",
  targetType: banner.targetType || "NONE",
  position: banner.position,
  sortOrder: banner.sortOrder ?? 0,
  status: banner.status ?? 1,
  ...overrides,
});

export default function BannerSettings() {
  const { data: banners = [], isLoading, createMutation, updateMutation, deleteMutation, uploadMutation } = useAdminBanners();
  const [form, setForm] = useState({ title: "", linkUrl: "" });
  const [addingPosition, setAddingPosition] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const createBanner = async (file, position) => {
    if (!file) return;
    const validationMessage = await validateBannerImage(file, position);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tên banner");
      return;
    }
    try {
      const imageUrl = await uploadMutation.mutateAsync(file);
      const samePosition = banners.filter((banner) => banner.position === position);
      await createMutation.mutateAsync({
        title: form.title.trim(),
        imageUrl,
        altText: form.title.trim(),
        linkUrl: form.linkUrl.trim(),
        targetType: form.linkUrl.trim()
          ? (/^https?:\/\//i.test(form.linkUrl.trim()) ? "EXTERNAL" : "INTERNAL")
          : "NONE",
        position,
        sortOrder: samePosition.length,
        status: 1,
      });
      setForm({ title: "", linkUrl: "" });
      setAddingPosition(null);
      toast.success("Đã thêm banner");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể thêm banner");
    }
  };

  const toggleBanner = async (banner, checked) => {
    try {
      await updateMutation.mutateAsync({ id: banner.id, ...toPayload(banner, { status: checked ? 1 : 0 }) });
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật banner");
    }
  };

  const removeBanner = async () => {
    if (!bannerToDelete) return;
    try {
      await deleteMutation.mutateAsync(bannerToDelete.id);
      setBannerToDelete(null);
      toast.success("Đã xóa banner");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa banner");
    }
  };

  const saveBannerLink = async (banner) => {
    const linkUrl = editingBanner?.linkUrl.trim() || "";
    try {
      await updateMutation.mutateAsync({ id: banner.id, ...toPayload(banner, { linkUrl, targetType: linkUrl ? (/^https?:\/\//i.test(linkUrl) ? "EXTERNAL" : "INTERNAL") : "NONE" }) });
      setEditingBanner(null);
      toast.success("Đã cập nhật banner");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật banner");
    }
  };

  const updateBannerImage = async (banner, file) => {
    if (!file) return;
    const validationMessage = await validateBannerImage(file, banner.position);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    try {
      const imageUrl = await uploadMutation.mutateAsync(file);
      await updateMutation.mutateAsync({ id: banner.id, ...toPayload(banner, { imageUrl }) });
      toast.success("Đã cập nhật ảnh banner");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật ảnh banner");
    }
  };

  const moveBanner = async (banner, direction) => {
    const group = banners.filter((item) => item.position === banner.position);
    const index = group.findIndex((item) => item.id === banner.id);
    const other = group[index + direction];
    if (!other) return;
    try {
      await Promise.all([
        updateMutation.mutateAsync({ id: banner.id, ...toPayload(banner, { sortOrder: other.sortOrder }) }),
        updateMutation.mutateAsync({ id: other.id, ...toPayload(other, { sortOrder: banner.sortOrder }) }),
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể đổi thứ tự banner");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {isLoading ? <div className="lg:col-span-2 space-y-4 rounded-xl border border-border bg-card p-5"><Skeleton className="h-6 w-48" />{Array.from({ length: 3 }).map((_, index) => <div key={index} className="flex gap-4"><Skeleton className="h-20 w-40" /><div className="flex-1 space-y-3"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-4 w-2/3" /></div><Skeleton className="h-10 w-36" /></div>)}</div> : POSITIONS.map((position) => {
        const items = banners.filter((banner) => banner.position === position.value);
        return (
          <AppCard key={position.value} className="border-border shadow-sm">
            <AppCardHeader><AppCardTitle>{position.label} ({items.length})</AppCardTitle></AppCardHeader>
            <AppCardContent className="space-y-3">
              {items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Chưa có banner ở vị trí này.</p>}
              {items.map((banner, index) => (
                <div key={banner.id} className="rounded-xl border border-border p-3">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-muted md:w-40"><img src={banner.imageUrl} alt={banner.altText || banner.title} className="h-full w-full object-contain" />{editingBanner?.id === banner.id && <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-foreground/40 text-primary-foreground"><Pencil className="size-5" /><span className="sr-only">Thay ảnh banner</span><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" disabled={uploadMutation.isPending || updateMutation.isPending} onChange={(event) => updateBannerImage(banner, event.target.files?.[0])} /></label>}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{banner.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{banner.linkUrl || "Không có liên kết"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AppButton appVariant="ghostMuted" appSize="sm" aria-label="Đưa banner lên" disabled={index === 0 || updateMutation.isPending} onClick={() => moveBanner(banner, -1)}><ArrowUp className="size-4" /></AppButton>
                    <AppButton appVariant="ghostMuted" appSize="sm" aria-label="Đưa banner xuống" disabled={index === items.length - 1 || updateMutation.isPending} onClick={() => moveBanner(banner, 1)}><ArrowDown className="size-4" /></AppButton>
                    <Switch checked={banner.status === 1} onCheckedChange={(checked) => toggleBanner(banner, checked)} />
                    <AppButton appVariant="ghostMuted" appSize="sm" aria-label="Sửa banner" disabled={updateMutation.isPending} onClick={() => setEditingBanner(editingBanner?.id === banner.id ? null : { id: banner.id, linkUrl: banner.linkUrl || "" })}><Pencil className="size-4" /></AppButton>
                    <AppButton appVariant="ghostMuted" appSize="sm" className="text-error" aria-label="Xóa banner" disabled={deleteMutation.isPending} onClick={() => setBannerToDelete(banner)}><Trash2 className="size-4" /></AppButton>
                  </div>
                  </div>
                  {editingBanner?.id === banner.id && <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-end"><div className="flex-1 space-y-2"><Label htmlFor={`banner-link-${banner.id}`}>URL khi nhấn</Label><AppInput id={`banner-link-${banner.id}`} type="url" value={editingBanner.linkUrl} onChange={(event) => setEditingBanner((current) => ({ ...current, linkUrl: event.target.value }))} placeholder="/courses hoặc https://..." /></div><div className="flex gap-2"><AppButton type="button" appVariant="ghostMuted" disabled={updateMutation.isPending} onClick={() => setEditingBanner(null)}>Hủy</AppButton><AppButton type="button" disabled={updateMutation.isPending} onClick={() => saveBannerLink(banner)}>{updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Lưu"}</AppButton></div></div>}
                </div>
              ))}
              {addingPosition === position.value ? <BannerAddRow form={form} position={position} isPending={uploadMutation.isPending || createMutation.isPending} onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))} onCancel={() => { setAddingPosition(null); setForm({ title: "", linkUrl: "" }); }} onCreate={(file) => createBanner(file, position.value)} /> : <AppButton type="button" appVariant="ghostMuted" onClick={() => setAddingPosition(position.value)}><Plus className="mr-2 size-4" />Thêm banner</AppButton>}
            </AppCardContent>
          </AppCard>
        );
      })}
      <AppAlertDialog open={Boolean(bannerToDelete)} onOpenChange={(open) => !open && setBannerToDelete(null)} variant="destructive" title="Xóa banner?" description={`Bạn có chắc muốn xóa “${bannerToDelete?.title || "banner này"}”? Hành động này không thể hoàn tác.`} confirmText="Xóa banner" cancelText="Hủy" onConfirm={removeBanner} />
    </div>
  );
}

function BannerAddRow({ form, position, isPending, onChange, onCancel, onCreate }) {
  const isHeroBanner = position.value === "HOME_HERO";
  return <div className="grid gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-3"><div className="grid gap-3 md:grid-cols-2"><div className="space-y-2"><Label htmlFor={`banner-title-${position.value}`}>Tên banner</Label><AppInput id={`banner-title-${position.value}`} value={form.title} onChange={(event) => onChange("title", event.target.value)} placeholder="Ví dụ: Khuyến mãi tháng 7" /></div><div className="space-y-2"><Label htmlFor={`banner-link-${position.value}`}>Liên kết (không bắt buộc)</Label><AppInput id={`banner-link-${position.value}`} value={form.linkUrl} onChange={(event) => onChange("linkUrl", event.target.value)} placeholder="/courses hoặc https://..." /></div></div>{isHeroBanner && <p className="text-xs text-muted-foreground">Hero banner: tỷ lệ ảnh 4,35:1, ví dụ 1240×285 hoặc 2480×570.</p>}<div className="flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-card px-3 py-2 text-sm font-medium hover:border-primary/50 hover:text-primary">{isPending ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}Chọn ảnh và thêm<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" disabled={isPending} onChange={(event) => onCreate(event.target.files?.[0])} /></label><AppButton type="button" appVariant="ghostMuted" onClick={onCancel} disabled={isPending}>Hủy</AppButton></div></div>;
}
