import React from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, User } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput, { AppPasswordInput } from '@/components/common/micro/AppInput';
import AppDivider from '@/components/common/micro/AppDivider';
import AuthSocialLogin from './components/AuthSocialLogin';
import AuthCard from './components/AuthCard';
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
    <AuthCard
      title="Tạo tài khoản mới"
      description="Bắt đầu hành trình học tập của bạn ngay hôm nay."
    >
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

      <AppDivider text="Hoặc" />

      <AuthSocialLogin />

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </AuthCard>
  );
};

export default RegisterPage;
