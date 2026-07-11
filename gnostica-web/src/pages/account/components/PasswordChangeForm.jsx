import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { AppButton } from "@/components/common/micro/AppButton";

export default function PasswordChangeForm({
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
      </CardContent>
    </Card>
  );
}
