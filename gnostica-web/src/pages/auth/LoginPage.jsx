import React from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput, { AppPasswordInput } from '@/components/common/micro/AppInput';
import AppDivider from '@/components/common/micro/AppDivider';
import AuthSocialLogin from './components/AuthSocialLogin';
import AuthCard from './components/AuthCard';
import { useLogin } from '@/hooks/auth/useLogin';

const LoginPage = () => {
  const {
    email, setEmail,
    password, setPassword,
    remember, setRemember,
    loading, errors, setErrors,
    handleSubmit
  } = useLogin();

  return (
    <AuthCard
      title="Chào mừng trở lại!"
      description="Đăng nhập để tiếp tục hành trình học tập của bạn."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AppInput
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: '' });
          }}
          error={errors.password}
          forgotPasswordLink={true}
        />

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={setRemember}
            className="border-border"
          />
          <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer font-normal">
            Ghi nhớ đăng nhập
          </Label>
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
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </AppButton>
      </form>

      <AppDivider text="Hoặc đăng nhập với" />

      <AuthSocialLogin />

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-primary font-semibold hover:underline">
          Đăng ký miễn phí
        </Link>
      </p>
    </AuthCard>
  );
};

export default LoginPage;
