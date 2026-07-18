import React from 'react';
import { Save } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";
import { AppPasswordInput } from '@/components/common/micro/AppInput';
import { Card, CardContent } from "@/components/common/micro/AppCard";
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
    <div className="w-full max-w-[540px]">
      <Card className="shadow-lg border-border bg-white/80 backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Đặt lại mật khẩu</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
              Tạo mật khẩu mới cho tài khoản <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
