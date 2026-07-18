import React from "react";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import { KeyRound, AlertCircle, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import useChangePassword from "@/hooks/account/useChangePassword";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppInput from "@/components/common/micro/AppInput";
import { AppButton } from "@/components/common/micro/AppButton";
import { Label } from "@/components/common/micro/AppLabel";

export default function ChangePassword() {
  const user = useAuthStore(state => state.user);
  const isGoogleUser = user?.provider === "GOOGLE";

  const {
    formData,
    showPassword,
    isLoading,
    togglePasswordVisibility,
    handleChange,
    handleSubmit,
    pwdLength,
    hasUpperCase,
    hasNumber,
    hasSpecial,
    strengthScore,
    strengthInfo
  } = useChangePassword();

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Bảo mật" }]} />

      <AppPageHeader
        icon={KeyRound}
        title="Đổi mật khẩu"
        description={isGoogleUser 
          ? "Tài khoản của bạn được liên kết với Google. Bạn không thể đổi mật khẩu trực tiếp tại đây."
          : "Bảo vệ tài khoản của bạn bằng cách sử dụng mật khẩu mạnh, bao gồm chữ hoa, số và ký tự đặc biệt."}
      />

      {isGoogleUser ? (
        <GoogleAuthAlert />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <PasswordChangeForm 
              formData={formData}
              showPassword={showPassword}
              isLoading={isLoading}
              togglePasswordVisibility={togglePasswordVisibility}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              pwdLength={pwdLength}
              strengthScore={strengthScore}
              strengthInfo={strengthInfo}
            />
          </div>

          <div className="lg:col-span-5">
            <PasswordSecurityRules 
              pwdLength={pwdLength}
              hasUpperCase={hasUpperCase}
              hasNumber={hasNumber}
              hasSpecial={hasSpecial}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleAuthAlert() {
  return (
    <AppCard appVariant="default" className="border-none shadow-sm bg-blue-50/50">
      <AppCardContent className="p-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center mx-auto text-info">
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
      </AppCardContent>
    </AppCard>
  );
}

function PasswordChangeForm({
  formData,
  showPassword,
  isLoading,
  togglePasswordVisibility,
  handleChange,
  handleSubmit,
  pwdLength,
  strengthScore,
  strengthInfo
}) {
  return (
    <AppCard appVariant="default" className="shadow-sm overflow-hidden">
      <AppCardContent className="p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Current Password */}
          <div className="space-y-2 relative">
            <Label htmlFor="currentPassword" className="text-sm font-bold text-foreground">
              Mật khẩu hiện tại
            </Label>
            <div className="relative">
              <AppInput 
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
              <AppInput 
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
              <AppInput 
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
            <AppButton appVariant="gradient" 
              type="submit" 
              disabled={isLoading}
              className="h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all w-full md:w-auto px-8"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Cập nhật mật khẩu"
              )}
            </AppButton>
          </div>
        </form>
      </AppCardContent>
    </AppCard>
  );
}

function PasswordSecurityRules({ pwdLength, hasUpperCase, hasNumber, hasSpecial }) {
  return (
    <AppCard appVariant="default" className="border-none shadow-sm bg-muted/80">
      <AppCardContent className="p-6">
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
      </AppCardContent>
    </AppCard>
  );
}
