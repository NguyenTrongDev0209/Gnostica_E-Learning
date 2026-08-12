import { AppCardDescription as CardDescription } from "@/components/common/micro/AppCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import AppTextarea from "@/components/common/micro/AppTextarea";
import { Switch } from "@/components/common/micro/AppSwitch";
// Fix imported
import { cn } from "@/lib/utils";
import { WS_URL } from "@/config/environment";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import AppTable from "@/components/common/micro/AppTable";
import { Label } from "@/components/common/micro/AppLabel";
import { AppDialog } from "@/components/common/micro/AppDialog";
import {
  Activity,
  AlertTriangle,
  Calculator,
  CreditCard,
  Eye,
  FileText,
  Globe,
  History,
  Image as ImageIcon,
  Info,
  Key,
  Landmark,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Percent,
  Save,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Upload,
  UserCheck,
  Wallet,
  X,
  Pen,
} from "lucide-react";
import { toast } from "sonner";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/common/micro/AppChart";
import { useAdminSettings, useCommissions } from "@/hooks/settings/useSiteSettings";
import BannerSettings from "@/pages/admin/components/BannerSettings";
import PageSettings from "@/pages/admin/components/PageSettings";
import AboutSettings from "@/pages/admin/components/AboutSettings";
import Skeleton from "@/components/common/micro/AppSkeleton";

const DEFAULT_SETTINGS = {
  "site.name": "Gnostica",
  "site.tagline": "Nền tảng học tập thông minh",
  "site.logo_url": "/Gnostica_Mark.webp",
  "site.favicon_url": "",
  "site.contact_email": "gnostica.team@gmail.com",
  "site.contact_phone": "0978 070 553",
  "site.address": "",
  "site.map_embed_url": "",
  "footer.description": "",
  "footer.copyright": "© 2026 Gnostica. Bản quyền thuộc về đội ngũ phát triển.",
  "footer.social_links": "[]",
  "footer.link_groups": "[]",
  "finance.instructor_ratio": "90",
  "finance.platform_ratio": "10",
  "about.content": "",
  "about.hero_banner_url": "",
  "about.solutions_banner_url": "",
  "about.vision_banner_url": "",
};

const SETTINGS_TABS = new Set([
  "general",
  "site-pages",
  "pages",
  "payment",
  "finance",
  "security",
]);

export default function AdminSettings() {
  const { data, isLoading, updateMutation, uploadMutation } = useAdminSettings();
  const [overrides, setOverrides] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab") || "general";
  const isLegacySitePageTab = requestedTab === "home" || requestedTab === "about";
  const activeTab = isLegacySitePageTab
    ? "site-pages"
    : SETTINGS_TABS.has(requestedTab) ? requestedTab : "general";
  const activeSitePage = requestedTab === "about" || searchParams.get("page") === "about"
    ? "about"
    : "home";
  const values = { ...DEFAULT_SETTINGS, ...data, ...overrides };

  const updateValue = (key, value) => {
    setOverrides((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (Object.keys(overrides).length === 0) {
      toast.info("Chưa có thay đổi để lưu.");
      return;
    }

    try {
      await updateMutation.mutateAsync(overrides);
      setOverrides({});
      toast.success("Đã lưu các thay đổi thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu cấu hình hệ thống");
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một tệp ảnh");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh logo không được vượt quá 2MB");
      return;
    }
    try {
      const url = await uploadMutation.mutateAsync(file);
      updateValue("site.logo_url", url);
      toast.success("Đã tải logo lên. Nhấn Lưu thay đổi để áp dụng.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải logo lên");
    }
  };

  const handleAboutImageUpload = async (file, key) => {
    if (!file?.type.startsWith("image/")) return toast.error("Vui lòng chọn một tệp ảnh");
    if (file.size > 5 * 1024 * 1024) return toast.error("Ảnh không được vượt quá 5MB");
    try {
      const url = await uploadMutation.mutateAsync(file);
      updateValue(key, url);
      toast.success("Đã tải ảnh lên. Nhấn Lưu thay đổi để áp dụng.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải ảnh lên");
    }
  };

  const handleTestimonialAvatarUpload = async (file) => {
    if (!file?.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một tệp ảnh");
      return undefined;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB");
      return undefined;
    }
    try {
      const url = await uploadMutation.mutateAsync(file);
      toast.success("Đã tải ảnh đại diện lên. Nhấn Lưu thay đổi để áp dụng.");
      return url;
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải ảnh lên");
      return undefined;
    }
  };

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SettingsHeader
        onSave={handleSave}
        isSaving={updateMutation.isPending}
        showSaveButton={activeTab !== "finance"}
      />

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="general" className="animate-in fade-in duration-300">
          <GeneralSettings
            values={values}
            onChange={updateValue}
            onLogoUpload={handleLogoUpload}
            isUploadingLogo={uploadMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="pages" className="animate-in fade-in duration-300">
          <PageSettings />
        </TabsContent>

        <TabsContent value="site-pages" className="animate-in fade-in duration-300">
          <SitePageSettings
            activePage={activeSitePage}
            onPageChange={(page) => {
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                next.set("tab", "site-pages");
                next.set("page", page);
                return next;
              });
            }}
            values={values}
            onChange={updateValue}
            onImageUpload={handleAboutImageUpload}
            onTestimonialAvatarUpload={handleTestimonialAvatarUpload}
            isUploading={uploadMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="payment" className="animate-in fade-in duration-300">
          <PaymentConfigSettings />
        </TabsContent>

        <TabsContent value="finance" className="animate-in fade-in duration-300">
          <FinanceSettings />
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in duration-300">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SitePageSettings({
  activePage,
  onPageChange,
  values,
  onChange,
  onImageUpload,
  onTestimonialAvatarUpload,
  isUploading,
}) {
  return (
    <Tabs value={activePage} onValueChange={onPageChange} className="space-y-6">
      <TabsList className="grid h-11 w-full grid-cols-2 bg-secondary p-1 sm:w-80">
        <TabsTrigger value="home" className="font-semibold">
          Trang chủ
        </TabsTrigger>
        <TabsTrigger value="about" className="font-semibold">
          Giới thiệu
        </TabsTrigger>
      </TabsList>

      <TabsContent value="home" className="mt-0 animate-in fade-in duration-300">
        <BannerSettings />
      </TabsContent>
      <TabsContent value="about" className="mt-0 animate-in fade-in duration-300">
        <AboutSettings
          values={values}
          onChange={onChange}
          onImageUpload={onImageUpload}
          onTestimonialAvatarUpload={onTestimonialAvatarUpload}
          isUploading={isUploading}
        />
      </TabsContent>
    </Tabs>
  );
}


function SettingsHeader({ onSave, isSaving, showSaveButton = true }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Cài Đặt Hệ Thống
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cấu hình các tham số và tùy chọn hệ thống của Gnostica.
        </p>
      </div>
      {showSaveButton && (
        <AppButton appVariant="gradient" 
          className="font-bold flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </AppButton>
      )}
    </div>
  );
}

function GeneralSettings({ values, onChange, onLogoUpload, isUploadingLogo }) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        <AppCard appVariant="default" className="border-border shadow-sm">
          <AppCardHeader>
            <AppCardTitle className="text-lg font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Thông tin thương hiệu
            </AppCardTitle>
            <CardDescription>Cấu hình tên website và các thông tin cơ bản xuất hiện trên nền tảng.</CardDescription>
          </AppCardHeader>
          <AppCardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-xs font-bold uppercase text-muted-foreground">Tên Website</Label>
                  <AppInput id="siteName" placeholder="Gnostica E-Learning" value={values["site.name"]} onChange={(event) => onChange("site.name", event.target.value)} className="border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline" className="text-xs font-bold uppercase text-muted-foreground">Slogan</Label>
                  <AppInput id="tagline" placeholder="Tri thức không giới hạn" value={values["site.tagline"]} onChange={(event) => onChange("site.tagline", event.target.value)} className="border-border" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Logo Website</Label>
                  <label htmlFor="siteLogo" className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted p-4 text-center transition-colors hover:bg-muted/80">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-white shadow-sm">
                      {isUploadingLogo ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : values["site.logo_url"] ? <img src={values["site.logo_url"]} alt="Logo preview" className="h-full w-full object-contain p-2" /> : <ImageIcon className="w-7 h-7 text-muted-foreground/40" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">Tải logo</span>
                      <span className="text-xs text-muted-foreground">PNG, JPG, SVG</span>
                    </div>
                    <input id="siteLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" disabled={isUploadingLogo} onChange={(event) => onLogoUpload(event.target.files?.[0])} />
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerText" className="text-xs font-bold uppercase text-muted-foreground">Văn bản chân trang (Footer)</Label>
                  <AppTextarea id="footerText" placeholder="Nhập nội dung hiển thị ở cuối trang..." value={values["footer.description"]} onChange={(event) => onChange("footer.description", event.target.value)} className="min-h-[160px] border-border focus:bg-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="copyright" className="text-xs font-bold uppercase text-muted-foreground">Thông tin bản quyền</Label>
                <AppInput id="copyright" value={values["footer.copyright"]} onChange={(event) => onChange("footer.copyright", event.target.value)} className="border-border" />
              </div>
          </AppCardContent>
        </AppCard>

        <AppCard appVariant="default" className="border-border shadow-sm">
          <AppCardHeader>
            <AppCardTitle className="text-lg font-bold flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Thông tin liên hệ
            </AppCardTitle>
            <CardDescription>Các thông tin này sẽ hiển thị công khai để khách hàng liên hệ.</CardDescription>
          </AppCardHeader>
          <AppCardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">Email liên hệ</Label>
                <AppInput id="email" type="email" value={values["site.contact_email"]} onChange={(event) => onChange("site.contact_email", event.target.value)} className="border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground">Số điện thoại</Label>
                <AppInput id="phone" value={values["site.contact_phone"]} onChange={(event) => onChange("site.contact_phone", event.target.value)} className="border-border" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-xs font-bold uppercase text-muted-foreground">Địa chỉ văn phòng</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <AppTextarea id="address" value={values["site.address"]} onChange={(event) => onChange("site.address", event.target.value)} className="pl-9 min-h-[80px] border-border" />
                </div>
              </div>
              <MapLocationPickerField values={values} onChange={onChange} />
            </div>
          </AppCardContent>
        </AppCard>
      </div>

      <BrandPreview values={values} />
    </div>
  );
}

function createMapEmbedUrl(query) {
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmedQuery)}&output=embed`;
}

const DEFAULT_MAP_CENTER = { lat: 10.8231, lng: 106.6297 };
const TILE_SIZE = 256;

function parseCoordinates(value) {
  const match = String(value || "").match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -85 || lat > 85 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function coordinatesToText(coords) {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
}

function latLngToPoint({ lat, lng }, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const sinLat = Math.sin((Math.max(-85.0511, Math.min(85.0511, lat)) * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

function pointToLatLng(point, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const lng = (point.x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * point.y) / scale;
  const lat = (Math.atan(Math.sinh(n)) * 180) / Math.PI;
  return {
    lat: Math.max(-85.0511, Math.min(85.0511, lat)),
    lng: ((((lng + 180) % 360) + 360) % 360) - 180,
  };
}

function InteractiveMapPicker({ center, zoom, onCenterChange, onZoomChange }) {
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const [size, setSize] = useState({ width: 720, height: 360 });

  useEffect(() => {
    if (!mapRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  const setZoom = (nextZoom) => {
    onZoomChange(Math.max(3, Math.min(18, nextZoom)));
  };

  const tiles = React.useMemo(() => {
    const centerPoint = latLngToPoint(center, zoom);
    const startX = Math.floor((centerPoint.x - size.width / 2) / TILE_SIZE);
    const endX = Math.floor((centerPoint.x + size.width / 2) / TILE_SIZE);
    const startY = Math.floor((centerPoint.y - size.height / 2) / TILE_SIZE);
    const endY = Math.floor((centerPoint.y + size.height / 2) / TILE_SIZE);
    const maxTile = 2 ** zoom;
    const nextTiles = [];

    for (let x = startX; x <= endX; x += 1) {
      for (let y = startY; y <= endY; y += 1) {
        if (y < 0 || y >= maxTile) continue;
        const wrappedX = ((x % maxTile) + maxTile) % maxTile;
        nextTiles.push({
          key: `${x}-${y}`,
          src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
          left: x * TILE_SIZE - (centerPoint.x - size.width / 2),
          top: y * TILE_SIZE - (centerPoint.y - size.height / 2),
        });
      }
    }

    return nextTiles;
  }, [center, size.height, size.width, zoom]);

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      center,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    const startPoint = latLngToPoint(dragRef.current.center, zoom);
    onCenterChange(pointToLatLng({ x: startPoint.x - deltaX, y: startPoint.y - deltaY }, zoom));
  };

  const stopDrag = (event) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={mapRef}
      className="relative h-[360px] overflow-hidden rounded-xl border border-border bg-muted"
      onWheel={(event) => {
        event.preventDefault();
        setZoom(zoom + (event.deltaY < 0 ? 1 : -1));
      }}
    >
      <div
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute h-64 w-64 select-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <div className="flex flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-white">
            <MapPin className="h-5 w-5 fill-primary-foreground" />
          </div>
          <div className="h-3 w-1 rounded-b-full bg-primary" />
        </div>
      </div>

      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <button type="button" className="h-9 w-9 text-lg font-bold text-foreground hover:bg-muted" onClick={() => setZoom(zoom + 1)}>+</button>
        <button type="button" className="h-9 w-9 border-t border-border text-lg font-bold text-foreground hover:bg-muted" onClick={() => setZoom(zoom - 1)}>-</button>
      </div>

      <div className="absolute bottom-3 left-3 rounded-md bg-white/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
        {coordinatesToText(center)} · Zoom {zoom}
      </div>
    </div>
  );
}

function MapLocationPickerField({ values, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftLocation, setDraftLocation] = useState(values["site.address"] || "");
  const [selectedCenter, setSelectedCenter] = useState(parseCoordinates(values["site.address"]) || DEFAULT_MAP_CENTER);
  const [zoom, setZoom] = useState(12);
  const mapEmbedUrl = values["site.map_embed_url"];

  const confirmLocation = () => {
    const locationText = coordinatesToText(selectedCenter);
    const nextMapUrl = createMapEmbedUrl(locationText);
    if (!nextMapUrl) {
      toast.error("Vui lòng chọn vị trí trên bản đồ.");
      return;
    }
    onChange("site.address", draftLocation?.trim() || locationText);
    onChange("site.map_embed_url", nextMapUrl);
    setIsOpen(false);
    toast.success("Đã chọn vị trí bản đồ. Nhấn Lưu thay đổi để áp dụng.");
  };

  return (
    <div className="space-y-3 md:col-span-2">
      <div>
        <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Vị trí bản đồ
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Chọn vị trí để hiển thị bản đồ công khai trên trang liên hệ.
        </p>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/50 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">{mapEmbedUrl ? "Đã chọn vị trí bản đồ" : "Chưa chọn vị trí bản đồ"}</p>
            <p className="truncate text-xs text-muted-foreground">{values["site.address"] || "Chọn vị trí để tự tạo bản đồ nhúng."}</p>
          </div>
        </div>
        <AppButton appVariant="ghostMuted" variant="ghost" className="shrink-0 gap-2 border border-border bg-white text-sm font-bold text-foreground hover:bg-primary/10 hover:text-primary" onClick={() => {
          setDraftLocation(values["site.address"] || "");
          setSelectedCenter(parseCoordinates(values["site.address"]) || selectedCenter || DEFAULT_MAP_CENTER);
          setIsOpen(true);
        }}>
          <MapPin className="h-4 w-4 text-primary" />
          Chọn trên bản đồ
        </AppButton>
      </div>

      <AppDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Chọn vị trí bản đồ"
        description="Kéo bản đồ để đưa vị trí cần chọn vào đúng ghim ở giữa, dùng nút + / - hoặc cuộn chuột để phóng to thu nhỏ."
        appVariant="outline"
        className="sm:max-w-3xl"
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AppButton appVariant="ghostMuted" variant="ghost" className="border border-border" onClick={() => setIsOpen(false)}>
              Hủy
            </AppButton>
            <AppButton appVariant="gradient" className="font-bold" onClick={confirmLocation}>
              Đồng ý chọn vị trí
            </AppButton>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapLocationQuery" className="text-xs font-bold uppercase text-muted-foreground">Tên địa chỉ hiển thị hoặc tọa độ</Label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <AppInput
                id="mapLocationQuery"
                value={draftLocation}
                onChange={(event) => setDraftLocation(event.target.value)}
                placeholder="Ví dụ: Trường Cao đẳng FPT Polytechnic hoặc 10.841, 106.809"
                className="pl-9 border-border"
              />
              </div>
              <AppButton
                appVariant="ghostMuted"
                variant="ghost"
                className="border border-border bg-white font-bold"
                onClick={() => {
                  const parsed = parseCoordinates(draftLocation);
                  if (!parsed) {
                    toast.error("Chưa nhận diện được tọa độ. Dùng định dạng: 10.841000, 106.809000");
                    return;
                  }
                  setSelectedCenter(parsed);
                  setZoom(16);
                }}
              >
                Dùng tọa độ
              </AppButton>
            </div>
          </div>

          <InteractiveMapPicker center={selectedCenter} zoom={zoom} onCenterChange={setSelectedCenter} onZoomChange={setZoom} />
        </div>
      </AppDialog>
    </div>
  );
}

function BrandPreview({ values }) {
  const siteName = values["site.name"] || "Gnostica";
  const tagline = values["site.tagline"] || "Nền tảng học tập thông minh";
  const logoUrl = values["site.logo_url"];
  const footerDescription = values["footer.description"] || "Mô tả chân trang sẽ hiển thị tại đây.";
  const copyright = values["footer.copyright"] || "© 2026 Gnostica.";
  const email = values["site.contact_email"] || "gnostica.team@gmail.com";
  const phone = values["site.contact_phone"] || "0978 070 553";
  const address = values["site.address"] || "Địa chỉ văn phòng sẽ hiển thị tại đây.";
  const hasMap = Boolean(values["site.map_embed_url"]);

  return (
    <div className="flex h-full flex-col space-y-2">
      <Label className="text-xs font-bold uppercase text-muted-foreground">Xem trước</Label>
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-white">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo preview" className="h-full w-full object-contain p-2" />
              ) : (
                <Globe className="h-7 w-7 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-foreground">{siteName}</p>
              <p className="truncate text-xs text-muted-foreground">{tagline}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">Header</span>
        </div>

        <div className="flex flex-1 flex-col gap-3 bg-muted/30 p-4">
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Đầu trang</p>
            <h3 className="mt-2 line-clamp-2 text-lg font-black leading-tight text-foreground">{siteName}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tagline}</p>
          </div>

          <div className="rounded-lg border border-border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Khối liên hệ</p>
                <p className="mt-1 text-sm font-bold text-foreground">Liên hệ Gnostica</p>
              </div>
              <span className="shrink-0 rounded-md border border-border bg-muted/60 px-3 py-2 text-[10px] font-bold uppercase text-muted-foreground">Bên phải</span>
            </div>
            <div className="mt-3 grid gap-2">
              <div className="flex min-w-0 items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate text-xs font-semibold text-foreground">{email}</span>
              </div>
              <div className="flex min-w-0 items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate text-xs font-semibold text-foreground">{phone}</span>
              </div>
              <div className="flex min-w-0 items-start gap-2 rounded-md bg-muted/50 px-3 py-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="line-clamp-2 text-xs font-semibold text-foreground">{address}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Bản đồ</p>
              <p className="mt-1 truncate text-xs font-semibold text-foreground">{hasMap ? "Đã cấu hình" : "Chưa cấu hình"}</p>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Footer</p>
              <p className="mt-1 truncate text-xs font-semibold text-foreground">Cuối trang</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-border bg-foreground px-4 py-4 text-white">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Footer logo preview" className="h-11 w-11 rounded bg-white object-contain p-1.5" />
            ) : (
              <Globe className="h-6 w-6 text-primary" />
            )}
            <span className="truncate text-sm font-bold">{siteName}</span>
          </div>
          <p className="line-clamp-3 text-xs leading-relaxed text-white/80">{footerDescription}</p>
          <p className="truncate border-t border-white/10 pt-2 text-[11px] text-white/60">{copyright}</p>
        </div>
      </div>
    </div>
  );
}

function PaymentConfigSettings() {
  return (
    <div className="space-y-6">
      <AppCard appVariant="default" className="border-border shadow-sm">
        <AppCardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <AppCardTitle className="text-lg font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              Cổng thanh toán PayOS
            </AppCardTitle>
            <CardDescription>Cấu hình các API keys để tích hợp thanh toán tự động.</CardDescription>
          </div>
          <AppBadge className="bg-success/10 text-success text-success border-success/20">Đang hoạt động</AppBadge>
        </AppCardHeader>
        <AppCardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId" className="text-xs font-bold uppercase text-muted-foreground">Client ID</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <AppInput id="clientId" type="password" placeholder="Nhập Client ID..." defaultValue="**********************" className="pl-9 border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-xs font-bold uppercase text-muted-foreground">API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <AppInput id="apiKey" type="password" placeholder="Nhập API Key..." defaultValue="**********************" className="pl-9 border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="checksumKey" className="text-xs font-bold uppercase text-muted-foreground">Checksum Key</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <AppInput id="checksumKey" type="password" placeholder="Nhập Checksum Key..." defaultValue="**********************" className="pl-9 border-border" />
            </div>
          </div>
        </AppCardContent>
      </AppCard>

      <AppCard appVariant="default" className="border-border shadow-sm">
        <AppCardHeader>
          <AppCardTitle className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Cấu hình giao dịch
          </AppCardTitle>
          <CardDescription>Tùy chỉnh các tham số liên quan đến quy trình thanh toán.</CardDescription>
        </AppCardHeader>
        <AppCardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-foreground">Chế độ bảo trì thanh toán</Label>
              <p className="text-xs text-muted-foreground italic">Tạm thời ngắt kết nối cổng thanh toán để bảo trì.</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-foreground">Tự động đồng bộ VietQR</Label>
              <p className="text-xs text-muted-foreground italic">Tự động cập nhật danh sách ngân hàng từ VietQR định kỳ.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currencyPrefix" className="text-xs font-bold uppercase text-muted-foreground">Đơn vị tiền tệ hiển thị</Label>
            <AppInput id="currencyPrefix" defaultValue="đ" className="w-[100px] border-border" />
          </div>
        </AppCardContent>
      </AppCard>
    </div>
  );
}

function FinanceSettings() {
  const { activeQuery, createMutation } = useCommissions();
  const [noticeFile, setNoticeFile] = useState(null);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [applyAfterDays, setApplyAfterDays] = useState("7");
  const fileInputRef = useRef(null);
  
  const [platformRatio, setPlatformRatio] = useState(10);
  const [instructorRatio, setInstructorRatio] = useState(90);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (activeQuery.data) {
      setPlatformRatio(activeQuery.data.platformRatio || 0);
      setInstructorRatio(activeQuery.data.instructorRatio || 0);
    }
  }, [activeQuery.data]);

  const sampleRevenue = 1_000_000;
  const platformAmount = Math.round(sampleRevenue * platformRatio / 100);
  const instructorAmount = Math.round(sampleRevenue * instructorRatio / 100);
  const applyStartDate = getApplyStartDate(Number(applyAfterDays));

  const updatePlatformRatio = (rawValue) => {
    const value = Math.min(100, Math.max(0, Number(rawValue) || 0));
    setPlatformRatio(value);
    setInstructorRatio(100 - value);
  };

  const handleApply = async () => {
    setFormError("");
    if (!noticeFile) {
      setFormError("file");
      toast.error("Vui lòng đính kèm file quyết định!");
      return;
    }
    
    try {
      await createMutation.mutateAsync({
        platformRatio,
        instructorRatio,
        applyAfterDays: Number(applyAfterDays),
        file: noticeFile,
      });
      toast.success("Đã tạo lịch sử áp dụng tỷ lệ mới");
      setNoticeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo tỷ lệ";
      toast.error(msg);
      if (msg.includes("Đã tồn tại một Quyết định")) {
        setFormError("date");
      }
    }
  };

  const isApplying = createMutation.isPending;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)]">
      <AppCard appVariant="default" className="overflow-hidden border-border shadow-sm">
        <AppCardContent className="space-y-5 p-5 md:p-6">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="app-section-title flex items-center gap-2">
                <Percent className="size-5 text-warning" />
                Tỷ lệ doanh thu
              </h2>
              <AppBadge variant="info" soft className="w-fit shrink-0 gap-1 rounded-md px-2.5 py-1 text-xs">
                <Info className="size-3.5" />
                Tổng tỷ lệ luôn bằng 100%
              </AppBadge>
            </div>
            <p className="app-body-text max-w-none text-muted-foreground">
              Áp dụng cho giao dịch mới khi giảng viên không có mức hoa hồng riêng.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-foreground">Hoa hồng nền tảng</p>
                <AppBadge variant="secondary" soft className="px-2 font-bold">{platformRatio}%</AppBadge>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground uppercase">Nền tảng {platformRatio}%</span>
                  <span className="text-muted-foreground uppercase">Giảng viên {instructorRatio}%</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-border">
                  <div className="absolute left-0 top-0 h-full bg-success transition-all duration-500 ease-out" style={{ width: `${platformRatio}%` }} />
                  <div className="absolute right-0 top-0 h-full bg-warning transition-all duration-500 ease-out" style={{ width: `${instructorRatio}%` }} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Hoa hồng nền tảng (%)</Label>
                  <AppInput 
                    type="number" 
                    min="0" 
                    max="100" 
                    icon={Wallet} 
                    rightElement={<span className="text-sm font-bold text-muted-foreground">%</span>}
                    value={platformRatio}
                    onChange={(e) => updatePlatformRatio(e.target.value)}
                    className="bg-white border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Doanh thu giảng viên (%)</Label>
                  <AppInput 
                    type="number"
                    icon={TrendingUp}
                    rightElement={<span className="text-sm font-bold text-muted-foreground">%</span>}
                    value={instructorRatio}
                    readOnly
                    className="bg-muted text-muted-foreground border-transparent opacity-80"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4 mt-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">File thông báo</Label>
                <div className="flex gap-2">
                  <AppButton
                    type="button"
                    appVariant="ghostMuted"
                    appSize="sm"
                    variant="ghost"
                    className="w-fit border border-border bg-muted text-sm font-bold text-foreground hover:bg-primary/10 hover:text-primary"
                    onClick={() => {
                      setFormError("");
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="size-4" />
                    Thông báo
                  </AppButton>
                  <div className="group relative min-w-0">
                    <button
                      type="button"
                      className={cn(
                        "w-full min-w-0 truncate rounded-lg border bg-muted py-2 pl-3 pr-9 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                        formError === "file" 
                          ? "border-error text-error shadow-[0_0_0_1px_rgba(239,68,68,0.2)]" 
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                      )}
                      onClick={() => setIsNoticeDialogOpen(true)}
                      disabled={!noticeFile}
                    >
                      {noticeFile?.name || "Chưa chọn file"}
                    </button>
                    {noticeFile && (
                      <button
                        type="button"
                        aria-label="Xóa file thông báo"
                        className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-error-soft hover:text-error group-hover:opacity-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          setNoticeFile(null);
                          setIsNoticeDialogOpen(false);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="sr-only"
                    onChange={(event) => {
                      setFormError("");
                      setNoticeFile(event.target.files?.[0] || null);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-end">
              <div className="space-y-2">
                <Label className={cn("text-xs font-bold uppercase", formError === "date" ? "text-error" : "text-muted-foreground")}>Ngày áp dụng</Label>
                <AppSelect
                  value={applyAfterDays}
                  onValueChange={(val) => {
                    setApplyAfterDays(val);
                    if (formError === "date") setFormError("");
                  }}
                  error={formError === "date"}
                  options={[
                    { label: "Sau 7 ngày", value: "7" },
                    { label: "Sau 15 ngày", value: "15" },
                    { label: "Sau 30 ngày", value: "30" },
                  ]}
                  className={cn("bg-card", formError === "date" ? "border-error ring-1 ring-error/20" : "")}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Thời gian bắt đầu</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDateTime(applyStartDate)}
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">Ví dụ doanh thu</p>
                  <p className="app-section-title mt-1">{formatCurrency(sampleRevenue)}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-info-soft text-info">
                  <Calculator className="size-5" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <FinanceMetric
                  label={`Nền tảng nhận (${formatPercent(platformRatio)})`}
                  value={formatCurrency(platformAmount)}
                  variant="success"
                />
                <FinanceMetric
                  label={`Giảng viên nhận (${formatPercent(instructorRatio)})`}
                  value={formatCurrency(instructorAmount)}
                  variant="warning"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-warning/30 bg-warning-soft/60 p-4 text-warning-foreground sm:flex-row sm:items-start">
            <AlertTriangle className="size-5 shrink-0 text-warning" />
            <p className="text-sm leading-relaxed">
              Thay đổi chỉ ảnh hưởng giao dịch phát sinh sau khi lưu. Các giao dịch đã thanh toán giữ nguyên snapshot tỷ lệ và số tiền phân chia.
            </p>
          </div>

          <div className="flex justify-end">
            <AppButton
              type="button"
              appVariant="gradient"
              className="font-bold"
              onClick={handleApply}
              disabled={isApplying}
            >
              <Save className="size-4" />
              {isApplying ? "Đang áp dụng..." : "Áp dụng"}
            </AppButton>
          </div>
        </AppCardContent>
      </AppCard>

      <NoticeFileDialog
        file={noticeFile}
        open={isNoticeDialogOpen}
        onOpenChange={setIsNoticeDialogOpen}
      />

      <FinanceHistoryPanel sampleRevenue={sampleRevenue} />
    </div>
  );
}

function safeFormatDateTime(dateValue) {
  if (!dateValue) return "--:-- --/--/----";
  try {
    let d = dateValue;
    if (Array.isArray(dateValue)) {
      d = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], dateValue[3] || 0, dateValue[4] || 0, dateValue[5] || 0);
    } else if (typeof dateValue === "string") {
      d = new Date(dateValue);
    }
    if (!(d instanceof Date) || isNaN(d)) return "--:-- --/--/----";
    return formatDateTime(d);
  } catch {
    return "--:-- --/--/----";
  }
}

function FinanceHistoryPanel({ sampleRevenue }) {
  const { listQuery, notifyMutation } = useCommissions();
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [selectedEditDecision, setSelectedEditDecision] = useState(null);
  const [selectedHistoryRowKeys, setSelectedHistoryRowKeys] = useState([]);

  const historyRows = (listQuery.data || []).map((c, index) => ({
    id: c.id || index,
    index: index + 1,
    commissionRatio: c.platformRatio,
    platformRatio: c.platformRatio,
    instructorRatio: c.instructorRatio,
    startAt: safeFormatDateTime(c.validFrom),
    endAt: safeFormatDateTime(c.validUntil),
    status: c.status === 1 ? "active" : c.status === 2 ? "inactive" : "draft",
    statusLabel: c.status === 1 ? "Áp dụng" : c.status === 2 ? "Hết hạn" : "Sắp tới",
    decisionNo: `QD-HH-${String(c.id).padStart(4, "0")}`,
      decisionTitle: "Thông báo thay đổi tỷ lệ doanh thu",
      noticeFileUrl: c.noticeFileUrl,
      notified: c.notified,
      editable: c.editable,
      startDate: safeFormatDateTime(c.validFrom),
      endDate: safeFormatDateTime(c.validUntil),
    }));

  const columns = [
    {
      key: "index",
      header: "STT",
      sortable: false,
      align: "center",
      headerAlign: "center",
      width: 52,
      render: (row) => <span className="text-sm font-bold text-foreground">{row.index}</span>,
    },
    {
      key: "commissionRatio",
      header: "Tỷ lệ doanh thu",
      sortable: false,
      align: "center",
      headerAlign: "center",
      width: 160,
      render: (row) => (
        <span className="block whitespace-nowrap text-center text-xs font-semibold text-foreground">
          {formatPercent(row.commissionRatio)}
        </span>
      ),
    },
    {
      key: "startAt",
      header: "Ngày bắt đầu",
      sortable: false,
      align: "center",
      headerAlign: "center",
      width: 160,
      render: (row) => <DateTimeCell value={row.startAt} />,
    },
    {
      key: "endAt",
      header: "Ngày kết thúc",
      sortable: false,
      align: "center",
      headerAlign: "center",
      width: 160,
      render: (row) => <DateTimeCell value={row.endAt} />,
    },
    {
      key: "status",
      header: "Trạng thái",
      sortable: false,
      align: "center",
      headerAlign: "center",
      width: 120,
      render: (row) => (
        <AppBadge variant={row.status === "active" ? "success" : row.status === "inactive" ? "error" : "warning"} soft className="rounded-md">
          {row.statusLabel}
        </AppBadge>
      ),
    },
    {
      key: "decision",
      header: "Quyết định",
      sortable: false,
      align: "center",
      headerAlign: "center",
      width: 140,
      render: (row) => {
        if (!row.notified) {
          return (
            <AppButton
              type="button"
              appVariant="primary"
              appSize="sm"
              className="px-3 text-xs font-bold text-white shadow-sm"
              onClick={() => {
                const promise = notifyMutation.mutateAsync(row.id);
                toast.promise(promise, {
                  loading: "Đang gửi email thông báo...",
                  success: "Đã gửi email thông báo thành công",
                  error: "Gửi thông báo thất bại",
                });
              }}
              disabled={notifyMutation.isPending}
            >
              <Mail className="mr-1.5 size-4" />
              Thông báo
            </AppButton>
          );
        }

        return (
          <AppButton
            type="button"
            appVariant="ghostMuted"
            appSize="sm"
            variant="ghost"
            className="border border-border bg-card px-3 text-xs"
            onClick={() => {
              if (row.noticeFileUrl) {
                window.open(row.noticeFileUrl, "_blank");
              } else {
                toast.error("Không có file thông báo đính kèm");
              }
            }}
          >
            <FileText className="mr-1.5 size-4 text-muted-foreground" />
            Xem file
          </AppButton>
        );
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      sortable: false,
      align: "center",
      headerAlign: "center",
      width: 140,
      render: (row) => {
        if (row.editable) {
          return (
            <AppButton
              type="button"
              appVariant="ghost"
              appSize="icon"
              variant="outline"
              title="Chỉnh sửa"
              className="border border-border bg-white text-primary hover:bg-primary/10"
              onClick={() => setSelectedEditDecision(row)}
            >
              <Pen className="size-4" />
            </AppButton>
          );
        }
        return (
          <AppButton
            type="button"
            appVariant="ghostMuted"
            appSize="icon"
            variant="ghost"
            title="Chi tiết"
            className="border border-border bg-card text-muted-foreground"
            onClick={() => setSelectedDecision(row)}
          >
            <Eye className="size-4" />
          </AppButton>
        );
      },
    },
  ];

  return (
    <>
      <div className="h-fit space-y-4">
        <div className="space-y-1.5">
          <h2 className="app-section-title flex items-center gap-2">
            <History className="size-5 text-primary" />
            Lịch sử tỷ lệ
          </h2>
          <p className="app-body-text text-muted-foreground">
            Theo dõi các phiên bản tỷ lệ hoa hồng đã và đang áp dụng.
          </p>
        </div>

        <AppTable
          columns={columns}
          data={historyRows}
          rowKey={(row) => row.id}
          selection={{ selectedRowKeys: selectedHistoryRowKeys, onSelectionChange: setSelectedHistoryRowKeys }}
          hideWrapperStyle
          className="rounded-lg border border-border bg-card shadow-sm"
          emptyState="Chưa có dữ liệu lịch sử."
        />
      </div>

      <CommissionDecisionDialog
        decision={selectedDecision}
        sampleRevenue={sampleRevenue}
        onOpenChange={(open) => {
          if (!open) setSelectedDecision(null);
        }}
      />
      <EditCommissionDialog
        decision={selectedEditDecision}
        open={!!selectedEditDecision}
        onOpenChange={(open) => {
          if (!open) setSelectedEditDecision(null);
        }}
      />
    </>
  );
}

function NoticeFileDialog({ file, open, onOpenChange }) {
  const previewUrl = React.useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="File thông báo"
      description={file?.name || "Chưa chọn file"}
      appVariant="default"
      className="max-w-2xl"
    >
      <div className="rounded-lg border border-border bg-white p-6 shadow-inner">
        <div className="space-y-5">
          <div className="space-y-1 text-center">
            <p className="text-sm font-bold uppercase text-foreground">Gnostica E-Learning</p>
            <p className="text-xs text-muted-foreground">Tài liệu thông báo thay đổi tỷ lệ doanh thu</p>
          </div>

          {file ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">Tên file</p>
                <p className="mt-1 break-words text-sm font-black text-foreground">{file.name}</p>
                <p className="mt-3 text-xs font-bold uppercase text-muted-foreground">Dung lượng</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formatFileSize(file.size)}</p>
              </div>
              <div className="max-h-[46vh] overflow-hidden rounded-lg border border-border bg-muted/30">
                <object
                  data={previewUrl}
                  type={file.type || "application/octet-stream"}
                  className="h-[46vh] w-full bg-white"
                >
                  <div className="flex h-[260px] flex-col items-center justify-center gap-3 p-6 text-center">
                    <FileText className="size-8 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">
                      Trình duyệt chưa hỗ trợ xem trực tiếp nội dung file này.
                    </p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      Mở file trong tab mới
                    </a>
                  </div>
                </object>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Chưa có file thông báo nào được chọn.
            </p>
          )}
        </div>
      </div>
    </AppDialog>
  );
}

function EditCommissionDialog({ decision, open, onOpenChange }) {
  const { updateMutation } = useCommissions();
  const [platformRatio, setPlatformRatio] = useState(10);
  const [applyAfterDays, setApplyAfterDays] = useState("7");
  const [noticeFile, setNoticeFile] = useState(null);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (decision && open) {
      setPlatformRatio(decision.platformRatio);
      setNoticeFile(null); // File is required to be re-uploaded or we just send null to keep old file? The backend accepts file=null to keep the old noticeFileUrl.
      setApplyAfterDays("7");
      setFormError("");
    }
  }, [decision, open]);

  const instructorRatio = 100 - platformRatio;
  
  const updatePlatformRatio = (val) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setPlatformRatio(num);
  };
  
  const handleUpdate = () => {
    if (!decision) return;
    setFormError("");
    const formData = new FormData();
    formData.append(
      "data",
      new Blob(
        [JSON.stringify({ platformRatio, instructorRatio, applyAfterDays: Number(applyAfterDays) })],
        { type: "application/json" }
      )
    );
    if (noticeFile) formData.append("file", noticeFile);

    const promise = updateMutation.mutateAsync({ id: decision.id, formData })
      .then(() => {
        onOpenChange(false);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || "";
        if (msg.includes("Đã tồn tại một Quyết định")) {
           setFormError("date");
        }
        throw err;
      });
    
    toast.promise(promise, {
      loading: "Đang cập nhật...",
      success: "Cập nhật tỷ lệ hoa hồng thành công",
      error: (err) => err?.response?.data?.message || err?.message || "Cập nhật thất bại",
    });
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Chỉnh sửa tỷ lệ hoa hồng"
      description="Thay đổi thông tin tỷ lệ hoa hồng chưa áp dụng."
      appVariant="default"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <RatioField
            id="editPlatformRatio"
            label="Hoa hồng nền tảng"
            value={String(platformRatio)}
            icon={Wallet}
            onChange={(event) => updatePlatformRatio(event.target.value)}
          />
          <RatioField
            id="editInstructorRatio"
            label="Doanh thu giảng viên"
            value={String(instructorRatio)}
            icon={TrendingUp}
            readOnly
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground">File thông báo mới (Tùy chọn)</Label>
          <div className="flex items-center gap-3">
            <AppButton
              type="button"
              appVariant="ghostMuted"
              appSize="sm"
              variant="ghost"
              className="w-fit border border-border bg-muted text-sm font-bold text-foreground hover:bg-primary/10 hover:text-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              Tải file
            </AppButton>
            <span className="text-sm text-muted-foreground">
              {noticeFile ? noticeFile.name : (decision?.noticeFileUrl ? "Đã có file đính kèm" : "Chưa chọn file")}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(event) => setNoticeFile(event.target.files?.[0] || null)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className={cn("text-xs font-bold uppercase", formError === "date" ? "text-error" : "text-muted-foreground")}>Ngày áp dụng</Label>
          <AppSelect
            value={applyAfterDays}
            onValueChange={(val) => {
              setApplyAfterDays(val);
              if (formError === "date") setFormError("");
            }}
            error={formError === "date"}
            options={[
              { label: "Sau 7 ngày", value: "7" },
              { label: "Sau 15 ngày", value: "15" },
              { label: "Sau 30 ngày", value: "30" },
            ]}
            className={cn("bg-card", formError === "date" ? "border-error ring-1 ring-error/20" : "")}
          />
          <p className="text-xs text-muted-foreground mt-1">
            * Thời gian áp dụng sẽ được tính lại từ ngày hôm nay cộng thêm số ngày đã chọn.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <AppButton type="button" appVariant="ghostMuted" onClick={() => onOpenChange(false)}>
            Hủy
          </AppButton>
          <AppButton type="button" appVariant="primary" onClick={handleUpdate} disabled={updateMutation.isPending}>
            Lưu thay đổi
          </AppButton>
        </div>
      </div>
    </AppDialog>
  );
}

function DateTimeCell({ value, muted = false }) {
  return (
    <span className={`block whitespace-nowrap text-center text-xs font-semibold ${muted ? "text-muted-foreground" : "text-foreground"}`}>
      {value}
    </span>
  );
}

function CommissionDecisionDialog({ decision, onOpenChange }) {
  return (
    <AppDialog
      open={Boolean(decision)}
      onOpenChange={onOpenChange}
      title="Thông báo thay đổi tỷ lệ doanh thu"
      description={decision?.decisionNo}
      appVariant="default"
      className="max-w-3xl"
    >
      {decision && (
        <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-white p-6 shadow-inner">
          <div className="mx-auto max-w-2xl space-y-6 text-foreground">
            <div className="space-y-1 text-center">
              <p className="text-sm font-bold uppercase">Gnostica E-Learning</p>
              <p className="text-xs text-muted-foreground">Ban quản trị hệ thống</p>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-sm font-bold uppercase">Quyết định</p>
              <h3 className="text-xl font-black">{decision.decisionTitle}</h3>
              <p className="text-sm text-muted-foreground">Số: {decision.decisionNo}</p>
            </div>

            <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:grid-cols-2">
              <DecisionInfo label="Tỷ lệ hoa hồng nền tảng" value={formatPercent(decision.platformRatio)} />
              <DecisionInfo label="Tỷ lệ doanh thu giảng viên" value={formatPercent(decision.instructorRatio)} />
              <DecisionInfo label="Ngày bắt đầu" value={decision.startDate} />
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Quyết định này được dùng để đối chiếu tỷ lệ phân chia doanh thu mặc định. Các giao dịch đã thanh toán trước khi thay đổi vẫn giữ snapshot tỷ lệ tại thời điểm phát sinh.
            </p>

            <div className="flex justify-end pt-4 text-sm font-semibold text-muted-foreground">
              Đại diện hệ thống Gnostica
            </div>
          </div>
        </div>
      )}
    </AppDialog>
  );
}

function DecisionInfo({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-black text-foreground">{value}</p>
    </div>
  );
}

function RatioField({ id, label, value, icon: Icon, onChange, readOnly = false }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-bold uppercase text-muted-foreground">
        {label} (%)
      </Label>
      <AppInput
        id={id}
        type="number"
        min="0"
        max="100"
        step="0.01"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        icon={Icon}
        rightElement={<span className="text-xs font-bold text-muted-foreground">%</span>}
        className={readOnly ? "cursor-not-allowed bg-secondary text-muted-foreground" : "bg-muted"}
      />
    </div>
  );
}

function RevenueSplitBar({ platformRatio, instructorRatio }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
        <span>Nền tảng {formatPercent(platformRatio)}</span>
        <span>Giảng viên {formatPercent(instructorRatio)}</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-secondary ring-1 ring-border">
        <div
          className="h-full bg-warning transition-all duration-300"
          style={{ width: `${platformRatio}%` }}
        />
        <div
          className="h-full bg-success transition-all duration-300"
          style={{ width: `${instructorRatio}%` }}
        />
      </div>
    </div>
  );
}

function FinanceMetric({ label, value, variant }) {
  const colorClass = variant === "success" ? "text-success" : "text-warning";

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className={`app-section-title mt-2 ${colorClass}`}>
        {value}
      </p>
    </div>
  );
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}%`;
}

function getApplyStartDate(daysToAdd) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString("vi-VN")} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} MB`;
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <AppCard appVariant="default" className="border-border shadow-sm">
        <AppCardHeader>
          <AppCardTitle className="text-lg font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Đổi mật khẩu quản trị
          </AppCardTitle>
          <CardDescription>Đảm bảo sử dụng mật khẩu mạnh để bảo vệ quyền truy cập hệ thống.</CardDescription>
        </AppCardHeader>
        <AppCardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPass" className="text-xs font-bold uppercase text-muted-foreground">Mật khẩu hiện tại</Label>
            <AppInput id="currentPass" type="password" placeholder="••••••••" className="border-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPass" className="text-xs font-bold uppercase text-muted-foreground">Mật khẩu mới</Label>
              <AppInput id="newPass" type="password" placeholder="••••••••" className="border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPass" className="text-xs font-bold uppercase text-muted-foreground">Xác nhận mật khẩu mới</Label>
              <AppInput id="confirmPass" type="password" placeholder="••••••••" className="border-border" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <AppButton appVariant="ghostMuted" variant="ghost" className="text-xs font-bold border border-border">Cập nhật mật khẩu</AppButton>
          </div>
        </AppCardContent>
      </AppCard>

      <AppCard appVariant="default" className="border-border shadow-sm">
        <AppCardHeader>
          <AppCardTitle className="text-lg font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Bảo mật nâng cao
          </AppCardTitle>
          <CardDescription>Các lớp bảo vệ bổ sung cho tài khoản Admin.</CardDescription>
        </AppCardHeader>
        <AppCardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-foreground">Xác thực 2 yếu tố (2FA)</Label>
                <p className="text-xs text-muted-foreground italic">Yêu cầu mã từ ứng dụng xác thực khi đăng nhập.</p>
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-foreground">Thông báo đăng nhập lạ</Label>
                <p className="text-xs text-muted-foreground italic">Gửi email khi có thiết bị mới truy cập vào tài khoản Admin.</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </AppCardContent>
      </AppCard>
    </div>
  );
}

const resourceConfig = {
    cpu: { label: "CPU Usage (%)", color: "var(--info)" },
    ram: { label: "RAM Usage (%)", color: "var(--warning)" },
};

const ccuConfig = {
    active: { label: "Concurrent Users (CCU)", color: "var(--primary)" },
};

function InfrastructureMonitor() {
    const [history, setHistory] = useState([]);
    const [liveMetrics, setLiveMetrics] = useState({ cpu: 0, ram: 0, ccu: 0 });
    const [status, setStatus] = useState("Connecting...");
    const stompClientRef = useRef(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        let token = null;
        if (userStr) {
            try { token = JSON.parse(userStr)?.token; } catch (e) {}
        }
        if (!token) {
            token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        }
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const client = new Client({
            webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"),
            connectHeaders: headers,
            reconnectDelay: 5000,
            onConnect: () => {
                setStatus("OK");
                client.subscribe("/topic/metrics", (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        setLiveMetrics({
                            cpu: data.cpu,
                            ram: data.ram,
                            ccu: data.ccu
                        });
                        setHistory((prev) => {
                            const newHistory = [...prev, {
                                time: data.time || new Date().toLocaleTimeString(),
                                cpu: data.cpu,
                                ram: data.ram,
                                active: data.ccu
                            }];
                            if (newHistory.length > 20) return newHistory.slice(1);
                            return newHistory;
                        });
                    } catch (e) {
                        console.error("Error parsing metrics data", e);
                    }
                });
            },
            onStompError: (frame) => {
                console.warn("WebSocket STOMP error:", frame);
                setStatus("Retrying...");
            },
            onWebSocketClose: () => {
                setStatus("Connecting...");
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                try {
                    stompClientRef.current.deactivate();
                } catch (e) {
                    console.warn("Error during WebSocket disconnect", e);
                }
            }
        };
    }, []);

    return (
        <div className="space-y-4 pt-10">
            <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-muted rounded-full"></span>
                    Giám Sát Cơ Sở Hạ Tầng (Live)
                </h2>
                <p className="text-sm text-muted-foreground mt-1 pl-3.5">Quản lý sức khỏe máy chủ và lượng truy cập thực tế qua WebSocket</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-2">
                <AppCard appVariant="default" className="lg:col-span-2 border-border shadow-sm flex flex-col">
                    <AppCardHeader className="pb-2 border-b border-border flex flex-row items-center justify-between">
                        <div>
                            <AppCardTitle className="text-lg font-bold text-foreground">Tài Nguyên Máy Chủ</AppCardTitle>
                            <CardDescription>Tiêu thụ CPU và RAM (Cập nhật thời gian thực)</CardDescription>
                        </div>
                        <Server className="w-5 h-5 text-muted-foreground" />
                    </AppCardHeader>
                    <AppCardContent className="pt-4 flex-1">
                        <ChartContainer config={resourceConfig} className="h-[240px] w-full">
                            <AreaChart data={history} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--info)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="var(--info)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="var(--warning)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Area type="monotone" dataKey="ram" stroke="var(--warning)" strokeWidth={2} fill="url(#ramGradient)" isAnimationActive={false} />
                                <Area type="monotone" dataKey="cpu" stroke="var(--info)" strokeWidth={2} fill="url(#cpuGradient)" isAnimationActive={false} />
                            </AreaChart>
                        </ChartContainer>
                    </AppCardContent>
                </AppCard>

                <AppCard appVariant="default" className="lg:col-span-1 border-border shadow-sm flex flex-col">
                    <AppCardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
                        <AppCardTitle className="text-lg font-bold text-foreground">Chi Tiết Hạ Tầng</AppCardTitle>
                        <Activity className="w-5 h-5 text-muted-foreground" />
                    </AppCardHeader>
                    <AppCardContent className="pt-6 flex-1 flex flex-col gap-6">
                        <div className="space-y-5">
                            {[
                                { label: "CPU Usage Hiện Tại", value: liveMetrics.cpu, color: "bg-info/10 text-info" },
                                { label: "RAM Usage Hiện Tại", value: liveMetrics.ram, color: "bg-warning" },
                            ].map((item) => (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-muted-foreground">{item.label}</span>
                                        <span className="font-bold text-foreground">{item.value}%</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.value}%` }} />
                                    </div>
                                </div>
                            ))}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">CCU (Online)</span>
                                    <span className="font-bold text-foreground">{liveMetrics.ccu}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className={`h-full bg-primary rounded-full transition-all duration-500`} style={{ width: `${(liveMetrics.ccu / 5000) * 100}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 bg-muted rounded-xl border border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${status === "OK" ? "bg-success animate-pulse shadow-sm" : "bg-error"}`} />
                                <div>
                                    <p className="text-sm font-bold text-foreground">System Status: {status}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">WebSocket Live Stream</p>
                                </div>
                            </div>
                        </div>
                    </AppCardContent>
                </AppCard>
            </div>

            <AppCard appVariant="default" className="border-border shadow-sm flex flex-col">
                <AppCardHeader className="pb-2 border-b border-border">
                    <AppCardTitle className="text-lg font-bold text-foreground">CCU (Concurrent Users) - Realtime</AppCardTitle>
                </AppCardHeader>
                <AppCardContent className="pt-4 flex-1">
                    <ChartContainer config={ccuConfig} className="h-[240px] w-full">
                        <LineChart data={history} margin={{ left: 8, right: 8, top: 4, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="active" stroke="var(--primary)" strokeWidth={3} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ChartContainer>
                </AppCardContent>
            </AppCard>
        </div>
    );
}

function SettingsPageSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96" /></div>
        <Skeleton className="h-11 w-36" />
      </div>
      <div className="flex gap-3">{Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className="h-11 w-28" />)}</div>
      <div className="space-y-5 rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-80" />
        <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="space-y-4 rounded-xl border border-border bg-card p-5"><Skeleton className="h-6 w-48" /><Skeleton className="h-11 w-full" /><Skeleton className="h-20 w-full" /></div>
    </div>
  );
}
