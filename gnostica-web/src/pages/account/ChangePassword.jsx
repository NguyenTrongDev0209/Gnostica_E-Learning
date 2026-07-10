import React from "react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import AppPageHeader from "@/components/common/AppPageHeader";
import { KeyRound } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import useChangePassword from "@/hooks/account/useChangePassword";

import GoogleAuthAlert from "@/pages/account/components/GoogleAuthAlert";
import PasswordChangeForm from "@/pages/account/components/PasswordChangeForm";
import PasswordSecurityRules from "@/pages/account/components/PasswordSecurityRules";

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
