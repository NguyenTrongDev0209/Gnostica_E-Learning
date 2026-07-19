import { AppCardDescription as CardDescription } from "@/components/common/micro/AppCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import AppTextarea from "@/components/common/micro/AppTextarea";
import { Switch } from "@/components/common/micro/AppSwitch";
// Fix imported
import React, { useEffect, useRef, useState } from "react";
import { AppButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import { Label } from "@/components/common/micro/AppLabel";
import {
  Activity,
  BookOpenText,
  CreditCard,
  FileText,
  Globe,
  Image as ImageIcon,
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
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import SockJS from "sockjs-client";
import { Stomp } from "stompjs/lib/stomp.js";
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
import { useAdminSettings } from "@/hooks/settings/useSiteSettings";
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

export default function AdminSettings() {
  const { data, isLoading, updateMutation, uploadMutation } = useAdminSettings();
  const [overrides, setOverrides] = useState({});
  const values = { ...DEFAULT_SETTINGS, ...data, ...overrides };

  const updateValue = (key, value) => {
    setOverrides((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(values);
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

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SettingsHeader onSave={handleSave} isSaving={updateMutation.isPending} />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            Cài đặt chung
          </TabsTrigger>
          <TabsTrigger value="home" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Trang chủ
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-2">
            <FileText className="w-4 h-4" />
            Nội dung
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2">
            <BookOpenText className="w-4 h-4" />
            Giới thiệu
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Thanh toán
          </TabsTrigger>
          <TabsTrigger value="finance" className="gap-2">
            <Percent className="w-4 h-4" />
            Tài chính
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="animate-in fade-in duration-300">
          <GeneralSettings
            values={values}
            onChange={updateValue}
            onLogoUpload={handleLogoUpload}
            isUploadingLogo={uploadMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="home" className="animate-in fade-in duration-300">
          <BannerSettings />
        </TabsContent>

        <TabsContent value="pages" className="animate-in fade-in duration-300">
          <PageSettings />
        </TabsContent>

        <TabsContent value="about" className="animate-in fade-in duration-300">
          <AboutSettings values={values} onChange={updateValue} onImageUpload={handleAboutImageUpload} isUploading={uploadMutation.isPending} />
        </TabsContent>

        <TabsContent value="payment" className="animate-in fade-in duration-300">
          <PaymentConfigSettings />
        </TabsContent>

        <TabsContent value="finance" className="animate-in fade-in duration-300">
          <FinanceSettings values={values} onChange={updateValue} />
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in duration-300">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}


function SettingsHeader({ onSave, isSaving }) {
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
      <AppButton appVariant="gradient" 
        className="font-bold flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm"
        onClick={onSave}
        disabled={isSaving}
      >
        <Save className="w-4 h-4" />
        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
      </AppButton>
    </div>
  );
}

function GeneralSettings({ values, onChange, onLogoUpload, isUploadingLogo }) {
  return (
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
          
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Logo Website</Label>
            <label htmlFor="siteLogo" className="flex items-center gap-4 p-4 border-2 border-dashed border-border rounded-xl bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm">
                {isUploadingLogo ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : values["site.logo_url"] ? <img src={values["site.logo_url"]} alt="Logo preview" className="h-full w-full object-contain p-1" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Tải lên logo mới</span>
                <span className="text-xs text-muted-foreground">PNG, JPG hoặc SVG (Max 2MB)</span>
              </div>
              <input id="siteLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" disabled={isUploadingLogo} onChange={(event) => onLogoUpload(event.target.files?.[0])} />
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerText" className="text-xs font-bold uppercase text-muted-foreground">Văn bản chân trang (Footer)</Label>
            <AppTextarea id="footerText" placeholder="Nhập nội dung hiển thị ở cuối trang..." value={values["footer.description"]} onChange={(event) => onChange("footer.description", event.target.value)} className="min-h-[100px] border-border focus:bg-white" />
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
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <AppInput id="email" type="email" value={values["site.contact_email"]} onChange={(event) => onChange("site.contact_email", event.target.value)} className="pl-9 border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <AppInput id="phone" value={values["site.contact_phone"]} onChange={(event) => onChange("site.contact_phone", event.target.value)} className="pl-9 border-border" />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-xs font-bold uppercase text-muted-foreground">Địa chỉ văn phòng</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <AppTextarea id="address" value={values["site.address"]} onChange={(event) => onChange("site.address", event.target.value)} className="pl-9 min-h-[80px] border-border" />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="mapEmbedUrl" className="text-xs font-bold uppercase text-muted-foreground">URL bản đồ nhúng</Label>
              <AppInput id="mapEmbedUrl" type="url" placeholder="https://www.google.com/maps/embed?..." value={values["site.map_embed_url"]} onChange={(event) => onChange("site.map_embed_url", event.target.value)} className="border-border" />
            </div>
          </div>
        </AppCardContent>
      </AppCard>
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

function FinanceSettings({ values, onChange }) {
  const platformRatio = Number(values["finance.platform_ratio"] || 0);
  const instructorRatio = Number(values["finance.instructor_ratio"] || 0);

  const updatePlatformRatio = (rawValue) => {
    const value = Math.min(100, Math.max(0, Number(rawValue) || 0));
    onChange("finance.platform_ratio", String(value));
    onChange("finance.instructor_ratio", String(100 - value));
  };

  return (
    <div className="space-y-6">
      <AppCard appVariant="default" className="border-border shadow-sm">
        <AppCardHeader>
          <AppCardTitle className="flex items-center gap-2 text-lg font-bold">
            <Percent className="size-5 text-warning" />
            Tỷ lệ phân chia doanh thu mặc định
          </AppCardTitle>
          <CardDescription>Tỷ lệ này được áp dụng cho giao dịch mới khi giảng viên không có mức hoa hồng riêng.</CardDescription>
        </AppCardHeader>
        <AppCardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platformRatio" className="text-xs font-bold uppercase text-muted-foreground">Hoa hồng nền tảng (%)</Label>
              <AppInput id="platformRatio" type="number" min="0" max="100" step="0.01" value={values["finance.platform_ratio"]} onChange={(event) => updatePlatformRatio(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructorRatio" className="text-xs font-bold uppercase text-muted-foreground">Doanh thu giảng viên (%)</Label>
              <AppInput id="instructorRatio" type="number" value={values["finance.instructor_ratio"]} readOnly className="cursor-not-allowed opacity-75" />
            </div>
          </div>

          <div className="grid gap-4 rounded-xl border border-border bg-muted/50 p-5 md:grid-cols-3">
            <div><p className="text-xs font-bold uppercase text-muted-foreground">Ví dụ doanh thu</p><p className="mt-1 text-xl font-black text-foreground">1.000.000đ</p></div>
            <div><p className="text-xs font-bold uppercase text-muted-foreground">Nền tảng nhận ({platformRatio}%)</p><p className="mt-1 text-xl font-black text-warning">{Math.round(1_000_000 * platformRatio / 100).toLocaleString("vi-VN")}đ</p></div>
            <div><p className="text-xs font-bold uppercase text-muted-foreground">Giảng viên nhận ({instructorRatio}%)</p><p className="mt-1 text-xl font-black text-success">{Math.round(1_000_000 * instructorRatio / 100).toLocaleString("vi-VN")}đ</p></div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">Thay đổi chỉ ảnh hưởng giao dịch phát sinh sau khi lưu. Các giao dịch đã thanh toán giữ nguyên snapshot tỷ lệ và số tiền phân chia.</p>
        </AppCardContent>
      </AppCard>
    </div>
  );
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
    cpu: { label: "CPU Usage (%)", color: "hsl(221, 83%, 53%)" },
    ram: { label: "RAM Usage (%)", color: "hsl(38, 92%, 50%)" },
};

const ccuConfig = {
    active: { label: "Concurrent Users (CCU)", color: "hsl(271, 81%, 56%)" },
};

function InfrastructureMonitor() {
    const [history, setHistory] = useState([]);
    const [liveMetrics, setLiveMetrics] = useState({ cpu: 0, ram: 0, ccu: 0 });
    const [status, setStatus] = useState("Connecting...");
    const stompClientRef = useRef(null);

    useEffect(() => {
        const socket = new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws");
        const stompClient = Stomp.over(socket);
        stompClient.debug = null; // Disable logging to console

        stompClient.connect({}, () => {
            setStatus("OK");
            stompClient.subscribe("/topic/metrics", (message) => {
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
        }, (error) => {
            console.warn("WebSocket Connection Error (will retry):", error);
            setStatus("Retrying...");
        });

        stompClientRef.current = stompClient;

        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                try {
                    stompClientRef.current.disconnect();
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
                                        <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Area type="monotone" dataKey="ram" stroke="hsl(38, 92%, 50%)" strokeWidth={2} fill="url(#ramGradient)" isAnimationActive={false} />
                                <Area type="monotone" dataKey="cpu" stroke="hsl(221, 83%, 53%)" strokeWidth={2} fill="url(#cpuGradient)" isAnimationActive={false} />
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
                                { label: "RAM Usage Hiện Tại", value: liveMetrics.ram, color: "bg-amber-500" },
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
                                    <div className={`h-full bg-indigo-500 rounded-full transition-all duration-500`} style={{ width: `${(liveMetrics.ccu / 5000) * 100}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 bg-muted rounded-xl border border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${status === "OK" ? "bg-success/10 text-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-error/10 text-error"}`} />
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
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="active" stroke="hsl(271, 81%, 56%)" strokeWidth={3} dot={false} isAnimationActive={false} />
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
