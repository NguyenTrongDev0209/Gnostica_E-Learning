import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Facebook } from 'lucide-react';
import { SimpleButton } from '@/components/common/AppButton';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1500);
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200', text: 'text-slate-500' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8 && (/[A-Z]/.test(pass) || /[0-9]/.test(pass))) score += 1;
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-red-500', text: 'text-red-500' };
    if (score === 2) return { score: 2, label: 'Trung bình', color: 'bg-yellow-500', text: 'text-yellow-500' };
    if (score >= 3) return { score: 3, label: 'Mạnh', color: 'bg-green-500', text: 'text-green-500' };
    return { score: 0, label: '', color: 'bg-slate-200', text: '' };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="w-full max-w-[480px]">
      <Card className="shadow-lg border-border bg-white/80 backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Tạo tài khoản mới</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Bắt đầu hành trình học tập của bạn ngay hôm nay.
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email hoặc Số điện thoại</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Nhập email hoặc số điện thoại"
                  className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự"
                  className="pl-9 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-1 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex gap-1.5 mb-1.5">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 w-full rounded-full transition-colors duration-300 ${strength.score >= level ? strength.color : 'bg-slate-200'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-[13px] font-medium">
                    <span className="text-slate-500">Độ mạnh: </span>
                    <span className={strength.text}>{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Agree Terms */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onCheckedChange={setAgreeTerms}
                className="mt-0.5 border-slate-900 mt-1"
              />
              <Label htmlFor="agreeTerms" className="text-sm text-slate-600 cursor-pointer font-normal leading-relaxed">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-primary hover:underline font-medium">Điều khoản dịch vụ</Link>
                {' '}và{' '}
                <Link to="/privacy" className="text-primary hover:underline font-medium">Chính sách bảo mật</Link>
              </Label>
            </div>

            {/* Submit */}
            <SimpleButton
              type="submit"
              className="w-full h-11 mt-1 gap-2"
              disabled={loading || !agreeTerms}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </SimpleButton>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-slate-500"></div>
            <span className="text-xs text-slate-500 font-medium px-1">Hoặc đăng ký với</span>
            <div className="flex-1 h-[1px] bg-slate-500"></div>
          </div>

          {/* Social Register */}
          <div className="flex flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 gap-2 font-medium bg-white/90 text-slate-700 hover:bg-white border-slate-200"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 gap-2 font-medium bg-white/90 text-slate-700 hover:bg-white border-slate-200"
            >
              <Facebook className="w-5 h-5 shrink-0 text-[#1877F2]" />
              Facebook
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
