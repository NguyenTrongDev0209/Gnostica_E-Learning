import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, KeyRound, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";

export default function ChangePassword() {
  const user = useAuthStore(state => state.user);
  const isGoogleUser = user?.provider === "GOOGLE";

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Mật khẩu đã được thay đổi an toàn!");
    }, 1200);
  };

  // Password Strength Indicators
  const pwdLength = formData.newPassword.length;
  const hasUpperCase = /[A-Z]/.test(formData.newPassword);
  const hasNumber = /[0-9]/.test(formData.newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(formData.newPassword);
  
  const strengthScore = [pwdLength >= 8, hasUpperCase, hasNumber, hasSpecial].filter(Boolean).length;
  
  const getStrengthWord = () => {
    if (pwdLength === 0) return { word: "", color: "bg-muted" };
    if (strengthScore <= 1) return { word: "Yếu", color: "bg-error/10 text-error" };
    if (strengthScore === 2) return { word: "Trung bình", color: "bg-warning/10 text-warning" };
    if (strengthScore >= 3) return { word: "Mạnh", color: "bg-emerald-500" };
    return { word: "", color: "bg-muted" };
  };

  const strengthInfo = getStrengthWord();

  return (
    <div>
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
            <BreadcrumbPage className="text-sm font-semibold">Bảo mật</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
          <KeyRound className="w-7 h-7 text-primary" />
          Đổi mật khẩu
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isGoogleUser 
            ? "Tài khoản của bạn được liên kết với Google. Bạn không thể đổi mật khẩu trực tiếp tại đây."
            : "Bảo vệ tài khoản của bạn bằng cách sử dụng mật khẩu mạnh, bao gồm chữ hoa, số và ký tự đặc biệt."
          }
        </p>
      </div>

      {isGoogleUser ? (
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-info/10 text-info flex items-center justify-center mx-auto text-info">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-foreground">Tính năng này không khả dụng</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Vì bạn đăng nhập bằng tài khoản **Google**, việc quản lý mật khẩu sẽ được thực hiện thông qua cài đặt bảo mật của Google.
              </p>
              <div className="pt-6">
                <a 
                  href="https://myaccount.google.com/signinoptions/password" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-border text-foreground font-bold text-sm shadow-sm hover:bg-muted transition-colors gap-2"
                >
                  <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-4 h-4" alt="Google" />
                  Quản lý mật khẩu Google
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Card className="border-border shadow-sm overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Current Password */}
                <div className="space-y-2 relative">
                  <Label htmlFor="currentPassword" className="text-sm font-bold text-foreground">
                    Mật khẩu hiện tại
                  </Label>
                  <div className="relative">
                    <Input 
                      id="currentPassword" 
                      type={showPassword.current ? "text" : "password"} 
                      value={formData.currentPassword} 
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu cũ của bạn"
                      className="h-12 border-border focus-visible:ring-primary focus-visible:bg-white bg-muted font-medium pr-10" 
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-secondary my-8"></div>

                {/* New Password */}
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-end mb-1">
                    <Label htmlFor="newPassword" className="text-sm font-bold text-foreground">Mật khẩu mới</Label>
                    {pwdLength > 0 && (
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm text-white ${strengthInfo.color}`}>
                        {strengthInfo.word}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input 
                      id="newPassword" 
                      type={showPassword.new ? "text" : "password"} 
                      value={formData.newPassword} 
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu mới"
                      className="h-12 border-border focus-visible:ring-primary focus-visible:bg-white bg-muted font-medium pr-10" 
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Visual Strength Bars */}
                  {pwdLength > 0 && (
                    <div className="flex gap-1 mt-2">
                      <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 1 ? strengthInfo.color : "bg-secondary"}`}></div>
                      <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 2 ? strengthInfo.color : "bg-secondary"}`}></div>
                      <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 3 ? strengthInfo.color : "bg-secondary"}`}></div>
                      <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 4 ? strengthInfo.color : "bg-secondary"}`}></div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2 relative">
                  <Label htmlFor="confirmPassword" className="text-sm font-bold text-foreground">
                    Xác nhận mật khẩu mới
                  </Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showPassword.confirm ? "text" : "password"} 
                      value={formData.confirmPassword} 
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu mới"
                      className="h-12 border-border focus-visible:ring-primary focus-visible:bg-white bg-muted font-medium pr-10" 
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-xs font-bold text-error mt-1">Mật khẩu không khớp</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="h-12 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl transition-all w-full md:w-auto px-8"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Cập nhật mật khẩu"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Security Rules Sidebar */}
        <div className="lg:col-span-5">
          <Card className="border-none shadow-sm bg-muted/80">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-foreground">Tiêu chuẩn mật khẩu an toàn</h3>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${pwdLength >= 8 ? 'bg-emerald-100 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm ${pwdLength >= 8 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                    Tối thiểu 8 ký tự
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasUpperCase ? 'bg-emerald-100 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm ${hasUpperCase ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                    Ít nhất 1 chữ in hoa (A-Z)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasNumber ? 'bg-emerald-100 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm ${hasNumber ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                    Ít nhất 1 chữ số (0-9)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasSpecial ? 'bg-emerald-100 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm ${hasSpecial ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                    Ít nhất 1 ký tự đặc biệt (!@#%&*)
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    )}
  </div>
);
}
