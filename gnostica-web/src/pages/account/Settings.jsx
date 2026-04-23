import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, UserCog, Camera, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import authService from "@/services/authService";
import accountService from "@/services/accountService";
import ImageCropModal from "@/components/modals/ImageCropModal";

export default function Settings() {
  const user = authService.getCurrentUser();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: "Học viên đam mê công nghệ và lập trình. Luôn thích khám phá các kiến thức mới về Frontend Development.",
    avatar: user?.avatar || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn tệp hình ảnh!');
        return;
    }
    
    // Read file for cropping
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        setTempImage(reader.result);
        setCropModalOpen(true);
    });
    reader.readAsDataURL(file);
    
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile) => {
    try {
        setIsUploading(true);
        const res = await accountService.updateAvatar(user.email, croppedFile);
        if (res.status === 200) {
            setFormData(prev => ({ ...prev, avatar: res.data.avatarUrl }));
            toast.success('Cập nhật ảnh đại diện thành công!');
            window.dispatchEvent(new Event('storage')); 
        }
    } catch (error) {
        toast.error(error);
    } finally {
        setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call for other profile info
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Đã cập nhật thông tin cá nhân thành công!");
    }, 1000);
  };

  return (
    <div>
      {/* Cropping Modal */}
      <ImageCropModal 
        open={cropModalOpen}
        setOpen={setCropModalOpen}
        image={tempImage}
        onCropComplete={handleCropComplete}
      />

      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" /> Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/account" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Tài khoản
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-semibold">Thông tin cá nhân</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
          <UserCog className="w-7 h-7 text-primary" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý thông tin cá nhân và cách bạn hiển thị trên Gnostica.
        </p>
      </div>

      <Card className="border-slate-100 shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100">
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
                <h3 className="font-bold text-slate-900 text-lg mb-1">Ảnh đại diện</h3>
                <p className="text-sm text-slate-500 max-w-xs">
                  Sử dụng ảnh vuông, kích thước khuyên dùng 500x500px. Hệ thống sẽ tự động căn chỉnh và tối ưu chất lượng.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-bold text-slate-700">Họ và tên</Label>
                <Input 
                  id="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange}
                  className="h-12 border-slate-200 focus-visible:ring-primary focus-visible:bg-white bg-slate-50 font-medium" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    disabled
                    className="h-12 border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed" 
                  />
                  <p className="text-[11px] text-slate-400 font-semibold">* Email không thể thay đổi</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-bold text-slate-700">Số điện thoại</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    className="h-12 border-slate-200 focus-visible:ring-primary focus-visible:bg-white bg-slate-50 font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-bold text-slate-700">Giới thiệu ngắn (Bio)</Label>
                <Textarea 
                  id="bio" 
                  value={formData.bio} 
                  onChange={handleChange}
                  placeholder="Giới thiệu đôi nét về bản thân và mục tiêu học tập của bạn..."
                  className="min-h-[120px] resize-y border-slate-200 focus-visible:ring-primary focus-visible:bg-white bg-slate-50 font-medium p-4 leading-relaxed" 
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-12 px-8 font-bold bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20 hover:shadow-xl transition-all w-full sm:w-auto"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
