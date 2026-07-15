import React, { useState, useEffect } from "react";
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
  ExternalLink,
  Loader2
} from "lucide-react";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import AppTextarea from "@/components/common/micro/AppTextarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";
import instructorService from "@/services/instructor/instructorService";
import accountService from "@/services/user/accountService";
import axiosClient from "@/lib/axiosClient";
import ImageCropModal from "@/components/modals/ImageCropModal";

export default function InstructorSettings() {
  const { user, setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState("profile");
  const [banksList, setBanksList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form profile states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    title: "",
    website: "",
    linkedin: "",
    avatar: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: ""
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Avatar cropping state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  // Load instructor profile & basic info
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      instructorService.getInstructorProfile(user.id)
        .then(profile => {
          setFormData({
            fullName: profile.name || user.fullName || "",
            email: profile.email || user.email || "",
            phone: profile.phone || user.phone || "",
            bio: profile.bio || "",
            title: profile.title || "",
            website: profile.website || "",
            linkedin: profile.linkedin || "",
            avatar: profile.avatar || user.avatar || "",
            bankName: profile.bankName || "",
            bankAccountNumber: profile.bankAccountNumber || "",
            bankAccountName: profile.bankAccountName || ""
          });
        })
        .catch(err => {
          console.error("Lỗi khi tải thông tin giảng viên:", err);
          setFormData(prev => ({
            ...prev,
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            avatar: user.avatar || ""
          }));
        })
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  // Load popular banks for payout settings
  useEffect(() => {
    axiosClient.get("/banks")
      .then(res => {
        if (Array.isArray(res.data)) {
          setBanksList(res.data);
        }
      })
      .catch(err => console.error("Lỗi khi tải danh sách ngân hàng:", err));
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh!');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setTempImage(reader.result);
      setCropModalOpen(true);
    });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile) => {
    try {
      setIsUploading(true);
      const res = await accountService.updateAvatar(user.email, croppedFile);
      if (res.status === 200) {
        setFormData(prev => ({ ...prev, avatar: res.data.avatarUrl }));

        // Sync local auth user state and store
        const updatedUser = { ...user, avatar: res.data.avatarUrl };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success('Cập nhật ảnh đại diện thành công!');
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      await accountService.updateProfile(formData.email, {
        fullName: formData.fullName,
        phone: formData.phone,
        bio: formData.bio,
        title: formData.title,
        website: formData.website,
        linkedin: formData.linkedin,
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountName: formData.bankAccountName
      });

      // Sync user store
      const updatedUser = { ...user, fullName: formData.fullName, phone: formData.phone };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Đã cập nhật thông tin cài đặt thành công!");
    } catch (error) {
      toast.error(error.message || "Cập nhật thông tin thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);
    // Simulate/Placeholder for password change endpoint
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Thay đổi mật khẩu thành công!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cropping Modal */}
      <ImageCropModal
        open={cropModalOpen}
        setOpen={setCropModalOpen}
        image={tempImage}
        onCropComplete={handleCropComplete}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Cài Đặt Tài Khoản</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý thông tin hồ sơ giảng viên, cấu hình thanh toán và bảo mật tài khoản.
          </p>
        </div>
        <AppButton appVariant="gradient" className="bg-success/10 text-success hover:bg-success/20 font-bold">
          <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
        </AppButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: "profile", label: "Thông tin cá nhân", icon: User },
            { id: "payment", label: "Thông tin thanh toán", icon: CreditCard },
            { id: "security", label: "Bảo mật & Mật khẩu", icon: ShieldCheck },
            { id: "public", label: "Hồ sơ công khai", icon: Globe },
          ].map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                    ? "bg-success/15 text-success shadow-none border-l-4 border-success pl-3"
                    : "text-muted-foreground hover:bg-secondary"
                  }`}
              >
                <nav.icon className="w-4 h-4 shrink-0" />
                {nav.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-border space-y-3">
              <Loader2 className="w-8 h-8 text-success animate-spin" />
              <span className="text-sm font-medium text-muted-foreground animate-pulse">Đang tải thông tin hồ sơ...</span>
            </div>
          )}

          {!isLoading && activeTab === "profile" && (
            <AppCard className="border-border shadow-sm">
              <AppCardHeader className="border-b border-border">
                <AppCardTitle className="text-lg font-bold">Thông Tin Cá Nhân</AppCardTitle>
                <AppCardDescription>Cập nhật ảnh đại diện và các thông tin cơ bản hiển thị trên hệ thống giảng dạy.</AppCardDescription>
              </AppCardHeader>
              <AppCardContent className="p-6 space-y-6">
                {/* Avatar upload */}
                <div className="flex items-center gap-6 pb-6 border-b border-border">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border shadow-sm bg-success/5 flex items-center justify-center text-success text-2xl font-bold relative">
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        formData.fullName?.charAt(0) || "I"
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success text-white flex items-center justify-center border-4 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
                    >
                      <Camera className="w-4 h-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isUploading}
                    />
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success/10 text-success text-white flex items-center justify-center border-4 border-white shadow-lg hover:bg-success/10 text-success transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-base">Sonny Sangha</h4>
                  <p className="text-sm text-muted-foreground mb-2">Giảng viên xuất sắc • Tham gia từ 2024</p>
                  <div className="flex gap-2">
                    <AppButton appVariant="ghostMuted" variant="ghost" size="sm" className="text-xs h-8 border border-border">Thay đổi ảnh</AppButton>
                    <AppButton appVariant="ghostMuted" variant="ghost" size="sm" className="text-xs h-8 text-error hover:bg-red-50 hover:text-error">Xóa ảnh</AppButton>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Họ và tên</label>
                    <AppInput
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="h-11 border-border focus:border-success/20 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Email (Không thể sửa)</label>
                    <AppInput
                      id="email"
                      value={formData.email}
                      disabled
                      className="h-11 border-border bg-slate-100/50 text-muted-foreground cursor-not-allowed select-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Chức danh / Tiêu đề</label>
                    <AppInput
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ví dụ: Giảng viên Lập trình Web"
                      className="h-11 border-border focus:border-success/20 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Số điện thoại</label>
                    <AppInput
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="h-11 border-border focus:border-success/20 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Giới thiệu ngắn (Bio)</label>
                    <AppTextarea
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Mô tả kỹ năng, kinh nghiệm giảng dạy và phong cách học của bạn..."
                      className="border-border focus:border-success/20 bg-slate-50 focus:bg-white resize-none p-3"
                    />
                  </div>
                </div>
              </AppCardContent>
            </AppCard>
          )}

          {!isLoading && activeTab === "payment" && (
            <AppCard className="border-border shadow-sm">
              <AppCardHeader className="border-b border-border">
                <AppCardTitle className="text-lg font-bold">Thông Tin Thanh Toán</AppCardTitle>
                <AppCardDescription>Cài đặt tài khoản ngân hàng nhận doanh thu và rút tiền định kỳ.</AppCardDescription>
              </AppCardHeader>
              <AppCardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Ngân hàng</label>
                    <select
                      id="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-border bg-slate-50 focus:bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-success"
                    >
                      <option value="">-- Chọn ngân hàng thụ hưởng --</option>
                      {banksList.map((bank) => (
                        <option key={bank.id} value={bank.shortName || bank.name}>
                          {bank.shortName ? `[${bank.shortName}] ` : ""}{bank.name}
                        </option>
                      ))}
                      {/* Fallbacks if banksList is empty */}
                      {banksList.length === 0 && (
                        <>
                          <option value="Vietcombank">Vietcombank - Ngân hàng Ngoại thương Việt Nam</option>
                          <option value="Techcombank">Techcombank - Ngân hàng Kỹ thương Việt Nam</option>
                          <option value="BIDV">BIDV - Ngân hàng Đầu tư và Phát triển Việt Nam</option>
                          <option value="MBBank">MB BANK - Ngân hàng Quân Đội</option>
                          <option value="Vietinbank">Vietinbank - Ngân hàng Công thương Việt Nam</option>
                          <option value="Agribank">Agribank - Ngân hàng Nông nghiệp & PTNT Việt Nam</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Số tài khoản</label>
                    <AppInput
                      id="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      placeholder="Nhập số tài khoản ngân hàng"
                      className="h-11 border-border bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Tên chủ tài khoản (Viết hoa không dấu)</label>
                    <AppInput
                      id="bankAccountName"
                      value={formData.bankAccountName}
                      onChange={handleChange}
                      placeholder="Ví dụ: NGUYEN VAN A"
                      className="h-11 border-border bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </AppCardContent>
            </AppCard>
          )}

          {!isLoading && activeTab === "security" && (
            <AppCard className="border-border shadow-sm">
              <AppCardHeader className="border-b border-border">
                <AppCardTitle className="text-lg font-bold">Mật khẩu & Bảo mật</AppCardTitle>
                <AppCardDescription>Cập nhật mật khẩu định kỳ để nâng cao tính an toàn cho tài khoản giảng viên.</AppCardDescription>
              </AppCardHeader>
              <AppCardContent className="p-6">
                <form onSubmit={handleSubmitPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Mật khẩu hiện tại</label>
                    <AppInput
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="h-11 border-border bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Mật khẩu mới</label>
                      <AppInput
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="h-11 border-border bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Xác nhận mật khẩu mới</label>
                      <AppInput
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="h-11 border-border bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <SimpleButton
                      type="submit"
                      disabled={isLoading}
                      className="bg-primary text-white hover:bg-primary/95 font-bold px-6 shadow-sm gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      Cập nhật mật khẩu
                    </SimpleButton>
                  </div>
                </form>
              </AppCardContent>
            </AppCard>
          )}

          {!isLoading && activeTab === "public" && (
            <AppCard className="border-border shadow-sm">
              <AppCardHeader className="border-b border-border">
                <AppCardTitle className="text-lg font-bold">Hồ Sơ Công Khai</AppCardTitle>
                <AppCardDescription>Các liên kết hiển thị trên trang thông tin công khai của giảng viên.</AppCardDescription>
              </AppCardHeader>
              <AppCardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Website cá nhân</label>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-secondary text-muted-foreground"><Globe className="w-5 h-5 shrink-0" /></div>
                    <AppInput
                      id="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="h-11 border-border bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Hồ sơ LinkedIn</label>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600"><ExternalLink className="w-5 h-5 shrink-0" /></div>
                    <AppInput
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      className="h-11 border-border bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </AppCardContent>
            </AppCard>
          )}
        </div>
      </div>
    </div>
  );
}
