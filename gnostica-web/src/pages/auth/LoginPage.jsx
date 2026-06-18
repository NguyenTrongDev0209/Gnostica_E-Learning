import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Facebook } from 'lucide-react';
import { SimpleButton } from '@/components/common/AppButton';
import authService from '@/services/authService';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'NOT_LINKED') {
        toast.error('Tài khoản chưa được liên kết');
      } else {
        toast.error(decodeURIComponent(errorParam));
      }
      // Xóa params trên URL cho sạch
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  const validateForm = () => {
    let newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
      if (!emailRegex.test(email) && !phoneRegex.test(email)) {
        newErrors.email = 'Email  không hợp lệ';
      }
    }
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      toast.success('Đăng nhập thành công!');

      // Điều hướng dựa trên vai trò
      const user = response.data;
      const roleName = (typeof user.role === 'object' ? user.role.name : user.role)?.toUpperCase() || 'USER';

      console.log("LOGIN SUCCESS: User confirmed as role:", roleName);
      console.log("Redirecting to:", roleName === 'ADMIN' ? '/admin' : (roleName === 'INSTRUCTOR' || roleName === 'TEACHER' ? '/instructor' : '/'));

      if (roleName === 'ADMIN') {
        navigate('/admin');
      } else if (roleName === 'INSTRUCTOR' || roleName === 'TEACHER') {
        navigate('/instructor');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px]">
      <Card className="shadow-lg border-border bg-white/80 backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Chào mừng trở lại!</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Đăng nhập để tiếp tục hành trình học tập của bạn.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email hoặc Số điện thoại</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="you@example.com hoặc số điện thoại"
                  className={`pl-9 h-11 bg-muted border-border focus:bg-white transition-colors ${errors.email ? 'border-error/20 focus:ring-red-500' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                />
              </div>
              {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Mật khẩu</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`pl-9 pr-10 h-11 bg-muted border-border focus:bg-white transition-colors ${errors.password ? 'border-error/20 focus:ring-red-500' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
            </div>

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
            <SimpleButton
              type="submit"
              className="w-full h-11 mt-1 gap-2"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </SimpleButton>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-muted"></div>
            <span className="text-xs text-muted-foreground font-medium px-1">Hoặc đăng nhập với</span>
            <div className="flex-1 h-[1px] bg-muted"></div>
          </div>

          {/* Social Login */}
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 gap-2 font-medium bg-white/90 text-foreground hover:bg-white border-border"
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

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Đăng ký miễn phí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
