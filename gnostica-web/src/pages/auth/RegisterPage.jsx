import React from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, User } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput, { AppPasswordInput } from '@/components/common/micro/AppInput';
import AppSeparator from '@/components/common/micro/AppSeparator';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRegister } from '@/hooks/auth/useRegister';

const RegisterPage = () => {
  const {
    fullName, setFullName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    agreeTerms, setAgreeTerms,
    loading, errors, setErrors,
    strength,
    handleSubmit
  } = useRegister();

  return (
    <div className="w-full max-w-[480px]">
      <Card className="shadow-lg border-border bg-white/80 backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Tạo tài khoản mới</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
              Bắt đầu hành trình học tập của bạn ngay hôm nay.
            </p>
          </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AppInput
          id="fullName"
          type="text"
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors({ ...errors, fullName: '' });
          }}
          icon={User}
          error={errors.fullName}
        />

        <AppInput
          id="email"
          type="email"
          label="Email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          icon={Mail}
          error={errors.email}
        />

        <AppPasswordInput
          id="password"
          label="Mật khẩu"
          placeholder="Tối thiểu 8 ký tự"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: '' });
          }}
          error={errors.password}
          strength={strength}
          showStrength={true}
        />

        <AppPasswordInput
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
          }}
          error={errors.confirmPassword}
        />

        {/* Agree Terms */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <Checkbox
              id="agreeTerms"
              checked={agreeTerms}
              onCheckedChange={(val) => {
                setAgreeTerms(val);
                if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: '' });
              }}
              className={`mt-1 border-border ${errors.agreeTerms ? 'border-error/20' : ''}`}
            />
            <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground cursor-pointer font-normal leading-relaxed">
              Tôi đồng ý với{' '}
              <Link to="/terms" className="text-primary hover:underline font-medium">Điều khoản dịch vụ</Link>
              {' '}và{' '}
              <Link to="/privacy" className="text-primary hover:underline font-medium">Chính sách bảo mật</Link>
            </Label>
          </div>
          {errors.agreeTerms && <p className="text-error text-xs ml-6">{errors.agreeTerms}</p>}
        </div>

        {/* Submit */}
        <AppButton appVariant="gradient"
          type="submit"
          className="w-full mt-1 gap-2"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : <ArrowRight className="w-4 h-4" />}
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </AppButton>
      </form>

      <AppSeparator text="Hoặc" />

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          className="btn-md w-full gap-2 font-medium bg-white/90 text-foreground hover:bg-white border-border"
          onClick={() => window.location.href = import.meta.env.VITE_OAUTH2_URL}
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Tiếp tục với Google</span>
        </Button>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
