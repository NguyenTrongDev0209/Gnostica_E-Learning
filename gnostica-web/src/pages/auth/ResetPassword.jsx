import React from 'react';
import { Save } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";
import { AppPasswordInput } from '@/components/common/micro/AppInput';
import AuthCard from './components/AuthCard';
import { useResetPassword } from '@/hooks/auth/useResetPassword';

const ResetPassword = () => {
  const {
    email,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    loading, errors,
    strength,
    handleSubmit
  } = useResetPassword();

  return (
    <AuthCard
      title="Đặt lại mật khẩu"
      description={
        <>Tạo mật khẩu mới cho tài khoản <span className="font-semibold text-foreground">{email}</span></>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AppPasswordInput
          id="password"
          label="Mật khẩu mới"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          strength={strength}
          showStrength={true}
        />

        <AppPasswordInput
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        <AppButton appVariant="gradient" type="submit" className="w-full mt-1 gap-2" disabled={loading}>
          {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          {!loading && <Save className="w-4 h-4" />}
        </AppButton>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
