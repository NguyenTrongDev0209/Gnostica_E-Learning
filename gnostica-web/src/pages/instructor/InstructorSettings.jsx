import React from "react";
import {
  User,
  CreditCard,
  Bell,
  ShieldCheck,
  Globe,
  Camera,
  Save,
  Mail,
  Lock,
  Smartphone,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GhostButton, SimpleButton } from "@/components/common/micro/AppButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function InstructorSettings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Cài Đặt Tài Khoản</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý thông tin cá nhân, cài đặt thanh toán và bảo mật tài khoản.
          </p>
        </div>
        <SimpleButton className="bg-success/10 text-success hover:bg-success/20 font-bold">
          <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
        </SimpleButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { label: "Thông tin cá nhân", icon: User, active: true },
            { label: "Thông tin thanh toán", icon: CreditCard, active: false },
            { label: "Thông báo", icon: Bell, active: false },
            { label: "Bảo mật & Mật khẩu", icon: ShieldCheck, active: false },
            { label: "Hồ sơ công khai", icon: Globe, active: false },
          ].map((nav, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${nav.active
                  ? "bg-success/10 text-success text-white shadow-md shadow-green-900/20"
                  : "text-muted-foreground hover:bg-secondary"
                }`}
            >
              <nav.icon className="w-4 h-4" />
              {nav.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Section */}
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-bold">Thông Tin Cá Nhân</CardTitle>
              <CardDescription>Cập nhật ảnh đại diện và các thông tin cơ bản của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border shadow-sm transition-transform group-hover:scale-105">
                    <img src="https://i.pravatar.cc/300?u=instructor" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success/10 text-success text-white flex items-center justify-center border-4 border-white shadow-lg hover:bg-success/10 text-success transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-base">Sonny Sangha</h4>
                  <p className="text-sm text-muted-foreground mb-2">Giảng viên xuất sắc • Tham gia từ 2024</p>
                  <div className="flex gap-2">
                    <GhostButton size="sm" className="text-xs h-8 border border-border">Thay đổi ảnh</GhostButton>
                    <GhostButton size="sm" className="text-xs h-8 text-error hover:bg-red-50 hover:text-error">Xóa ảnh</GhostButton>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Họ và tên</label>
                  <Input defaultValue="Sonny Sangha" className="h-11 border-border focus:border-success/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Email</label>
                  <Input defaultValue="sonny@gnostica.edu.vn" className="h-11 border-border focus:border-success/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Chức danh / Tiêu đề</label>
                  <Input defaultValue="Fullstack Developer & Instructor" className="h-11 border-border focus:border-success/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Số điện thoại</label>
                  <Input defaultValue="+84 987 654 321" className="h-11 border-border focus:border-success/20" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Giới thiệu ngắn (Bio)</label>
                  <Textarea
                    rows={4}
                    defaultValue="Xin chào, tôi là Sonny. Tôi có hơn 10 năm kinh nghiệm trong lĩnh vực lập trình và đã đào tạo hơn 100,000 học viên trên toàn cầu."
                    className="border-border focus:border-success/20 resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Presence */}
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-bold">Mạng Xã Hội</CardTitle>
              <CardDescription>Các liên kết hiển thị trên hồ sơ công khai của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-secondary text-muted-foreground"><Globe className="w-5 h-5" /></div>
                <Input placeholder="Website cá nhân" className="h-11 border-border" />
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 text-info"><ExternalLink className="w-5 h-5" /></div>
                <Input placeholder="LinkedIn Profile" className="h-11 border-border" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
