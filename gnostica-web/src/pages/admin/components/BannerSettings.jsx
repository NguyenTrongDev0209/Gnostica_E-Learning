import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import AppSelect from "@/components/common/micro/AppSelect";
import { Label } from "@/components/common/micro/AppLabel";
import { Switch } from "@/components/ui/switch";
import { useAdminBanners } from "@/hooks/settings/useSiteSettings";
import Skeleton from "@/components/common/micro/AppSkeleton";

const POSITIONS = [
  { value: "HOME_HERO", label: "Hero banner" },
  { value: "HOME_SUB", label: "Banner phụ" },
];

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
  const [form, setForm] = useState({ title: "", linkUrl: "", position: "HOME_HERO" });

  const createBanner = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      toast.error("Banner phải là ảnh và không vượt quá 2MB");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tên banner");
      return;
    }
    try {
      const imageUrl = await uploadMutation.mutateAsync(file);
      const samePosition = banners.filter((banner) => banner.position === form.position);
      await createMutation.mutateAsync({
        title: form.title.trim(),
        imageUrl,
        altText: form.title.trim(),
        linkUrl: form.linkUrl.trim(),
        targetType: form.linkUrl.trim()
          ? (/^https?:\/\//i.test(form.linkUrl.trim()) ? "EXTERNAL" : "INTERNAL")
          : "NONE",
        position: form.position,
        sortOrder: samePosition.length,
        status: 1,
      });
      setForm((current) => ({ ...current, title: "", linkUrl: "" }));
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

  const removeBanner = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Đã xóa banner");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa banner");
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
    <div className="space-y-6">
      <AppCard className="border-border shadow-sm">
        <AppCardHeader><AppCardTitle>Thêm banner trang chủ</AppCardTitle></AppCardHeader>
        <AppCardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bannerTitle">Tên banner</Label>
            <AppInput id="bannerTitle" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ví dụ: Khuyến mãi tháng 7" />
          </div>
          <div className="space-y-2">
            <Label>Vị trí</Label>
            <AppSelect options={POSITIONS} value={form.position} onValueChange={(position) => setForm({ ...form, position })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bannerLink">Liên kết khi nhấn (không bắt buộc)</Label>
            <AppInput id="bannerLink" value={form.linkUrl} onChange={(event) => setForm({ ...form, linkUrl: event.target.value })} placeholder="/courses hoặc https://..." />
          </div>
          <label className="md:col-span-2 flex h-24 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/50 text-sm font-semibold hover:border-primary/50 hover:text-primary">
            {uploadMutation.isPending || createMutation.isPending ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            Chọn ảnh và thêm banner
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" disabled={uploadMutation.isPending || createMutation.isPending} onChange={(event) => createBanner(event.target.files?.[0])} />
          </label>
        </AppCardContent>
      </AppCard>

      {isLoading ? <div className="space-y-4 rounded-xl border border-border bg-card p-5"><Skeleton className="h-6 w-48" />{Array.from({ length: 3 }).map((_, index) => <div key={index} className="flex gap-4"><Skeleton className="h-20 w-40" /><div className="flex-1 space-y-3"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-4 w-2/3" /></div><Skeleton className="h-10 w-36" /></div>)}</div> : POSITIONS.map((position) => {
        const items = banners.filter((banner) => banner.position === position.value);
        return (
          <AppCard key={position.value} className="border-border shadow-sm">
            <AppCardHeader><AppCardTitle>{position.label} ({items.length})</AppCardTitle></AppCardHeader>
            <AppCardContent className="space-y-3">
              {items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Chưa có banner ở vị trí này.</p>}
              {items.map((banner, index) => (
                <div key={banner.id} className="flex flex-col gap-4 rounded-xl border border-border p-3 md:flex-row md:items-center">
                  <img src={banner.imageUrl} alt={banner.altText || banner.title} className="h-20 w-full rounded-lg bg-muted object-contain md:w-40" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{banner.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{banner.linkUrl || "Không có liên kết"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AppButton appVariant="ghostMuted" appSize="sm" aria-label="Đưa banner lên" disabled={index === 0 || updateMutation.isPending} onClick={() => moveBanner(banner, -1)}><ArrowUp className="size-4" /></AppButton>
                    <AppButton appVariant="ghostMuted" appSize="sm" aria-label="Đưa banner xuống" disabled={index === items.length - 1 || updateMutation.isPending} onClick={() => moveBanner(banner, 1)}><ArrowDown className="size-4" /></AppButton>
                    <Switch checked={banner.status === 1} onCheckedChange={(checked) => toggleBanner(banner, checked)} />
                    <AppButton appVariant="ghostMuted" appSize="sm" className="text-error" aria-label="Xóa banner" disabled={deleteMutation.isPending} onClick={() => removeBanner(banner.id)}><Trash2 className="size-4" /></AppButton>
                  </div>
                </div>
              ))}
            </AppCardContent>
          </AppCard>
        );
      })}
    </div>
  );
}
