import React, { useState } from "react";
import { AppButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import { Globe, ShieldCheck, CreditCard, Lock, Shield, Server, Activity } from "lucide-react";
import { toast } from "sonner";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Đã lưu các thay đổi thành công!");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SettingsHeader onSave={handleSave} isSaving={isSaving} />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-secondary border border-border p-1 mb-6">
          <TabsTrigger value="general" className="gap-2 data-active:bg-white data-active:shadow-sm">
            <Globe className="w-4 h-4" />
            Cài đặt chung
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2 data-active:bg-white data-active:shadow-sm">
            <CreditCard className="w-4 h-4" />
            Thanh toán
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-active:bg-white data-active:shadow-sm">
            <Shield className="w-4 h-4" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="animate-in fade-in duration-300">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="payment" className="animate-in fade-in duration-300">
          <PaymentConfigSettings />
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
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Cài Đặt Hệ Thống</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cấu hình và tùy chỉnh các thông số vận hành của nền tảng Gnostica.
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

function GeneralSettings() {
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
              <Input id="siteName" placeholder="Gnostica E-Learning" defaultValue="Gnostica E-Learning" className="border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline" className="text-xs font-bold uppercase text-muted-foreground">Slogan</Label>
              <Input id="tagline" placeholder="Tri thức không giới hạn" defaultValue="Tri thức không giới hạn" className="border-border" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Logo Website</Label>
            <div className="flex items-center gap-4 p-4 border-2 border-dashed border-border rounded-xl bg-muted hover:bg-muted transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm">
                <ImageIcon className="w-6 h-6 text-slate-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Tải lên logo mới</span>
                <span className="text-xs text-muted-foreground">PNG, JPG hoặc SVG (Max 2MB)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerText" className="text-xs font-bold uppercase text-muted-foreground">Văn bản chân trang (Footer)</Label>
            <Textarea id="footerText" placeholder="Nhập nội dung hiển thị ở cuối trang..." className="min-h-[100px] border-border focus:bg-white" />
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
                <Input id="email" defaultValue="contact@gnostica.com" className="pl-9 border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" defaultValue="0987 654 321" className="pl-9 border-border" />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-xs font-bold uppercase text-muted-foreground">Địa chỉ văn phòng</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea id="address" defaultValue="Số 1 Trịnh Văn Bô, Nam Từ Liêm, Hà Nội" className="pl-9 min-h-[80px] border-border" />
              </div>
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
              <Input id="clientId" type="password" placeholder="Nhập Client ID..." defaultValue="**********************" className="pl-9 border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-xs font-bold uppercase text-muted-foreground">API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="apiKey" type="password" placeholder="Nhập API Key..." defaultValue="**********************" className="pl-9 border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="checksumKey" className="text-xs font-bold uppercase text-muted-foreground">Checksum Key</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="checksumKey" type="password" placeholder="Nhập Checksum Key..." defaultValue="**********************" className="pl-9 border-border" />
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
            <Input id="currencyPrefix" defaultValue="đ" className="w-[100px] border-border" />
          </div>
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
            <Input id="currentPass" type="password" placeholder="••••••••" className="border-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPass" className="text-xs font-bold uppercase text-muted-foreground">Mật khẩu mới</Label>
              <Input id="newPass" type="password" placeholder="••••••••" className="border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPass" className="text-xs font-bold uppercase text-muted-foreground">Xác nhận mật khẩu mới</Label>
              <Input id="confirmPass" type="password" placeholder="••••••••" className="border-border" />
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