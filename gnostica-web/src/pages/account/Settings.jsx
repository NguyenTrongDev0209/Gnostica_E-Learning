import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppButton } from "@/components/common/micro/AppButton";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import { UserCog, Camera, Save, Loader2 } from "lucide-react";
import useSettingsForm from "@/hooks/account/useSettingsForm";
import ImageCropModal from "@/components/modals/ImageCropModal";
import PersonalizationModal from "@/components/common/composite/PersonalizationModal";
import useAuthStore from "@/store/useAuthStore";

export default function Settings() {
  const user = useAuthStore(state => state.user);
  
  const {
    formData,
    isLoading,
    isUploading,
    personalizationOpen,
    setPersonalizationOpen,
    cropModalOpen,
    setCropModalOpen,
    tempImage,
    handleChange,
    handleAvatarChange,
    handleCropComplete,
    handleSubmit
  } = useSettingsForm(user);

  return (
    <div>
      {/* Cropping Modal */}
      <ImageCropModal
        open={cropModalOpen}
        setOpen={setCropModalOpen}
        image={tempImage}
        onCropComplete={handleCropComplete}
      />

      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Thông tin cá nhân" }]} />

      <AppPageHeader
        icon={UserCog}
        title="Hồ sơ cá nhân"
        description="Quản lý thông tin cá nhân và cách bạn hiển thị trên Gnostica."
      />

      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-border">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold relative">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    formData.fullName?.charAt(0) || "U"
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-md hover:scale-110 hover:bg-primary/90 transition-all border-2 border-white ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-foreground text-lg mb-1">Ảnh đại diện</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Sử dụng ảnh vuông, kích thước khuyên dùng 500x500px. Hệ thống sẽ tự động căn chỉnh và tối ưu chất lượng.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-bold text-foreground">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="h-12 border-border focus-visible:ring-primary focus-visible:bg-white bg-muted font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    className="h-12 border-border bg-secondary text-muted-foreground font-medium cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground font-semibold">* Email không thể thay đổi</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-bold text-foreground">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-12 border-border focus-visible:ring-primary focus-visible:bg-white bg-muted font-medium"
                  />
                </div>
              </div>

              <div className="space-y-4 py-4 border-y border-border my-6 mt-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-primary/5 p-5 rounded-xl border border-primary/10">
                  <div className="space-y-1">
                    <Label className="text-sm font-bold text-primary">Sở thích học tập & Trình độ</Label>
                    <p className="text-sm text-muted-foreground mr-4">
                      Tùy chỉnh lĩnh vực quan tâm và trình độ hiện tại để hệ thống đề xuất khóa học phù hợp nhất.
                    </p>
                  </div>
                  <AppButton appVariant="ghostMuted" variant="ghost"
                    type="button"
                    onClick={() => setPersonalizationOpen(true)}
                    className="shrink-0 border border-primary/20 text-primary hover:bg-primary hover:text-white"
                  >
                    Thay đổi
                  </AppButton>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-bold text-foreground">Giới thiệu ngắn (Bio)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Giới thiệu đôi nét về bản thân và mục tiêu học tập của bạn..."
                  className="min-h-[120px] resize-y border-border focus-visible:ring-primary focus-visible:bg-white bg-muted font-medium p-4 leading-relaxed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <AppButton appVariant="gradient"
                type="submit"
                disabled={isLoading}
                className="h-12 px-8 font-bold gap-2 shadow-lg shadow-primary/20 hover:shadow-xl transition-all w-full sm:w-auto"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Lưu thay đổi
                  </>
                )}
              </AppButton>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Personalization Modal triggered from settings */}
      <PersonalizationModal forceOpen={personalizationOpen} onClose={() => setPersonalizationOpen(false)} />
    </div>
  );
}
