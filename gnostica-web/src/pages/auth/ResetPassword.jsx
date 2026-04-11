import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import { SimpleButton } from '@/components/common/AppButton';
import authService from '@/services/authService';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const code = searchParams.get('code');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    let newErrors = {};
    
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else {
        const strength = getPasswordStrength(password);
        if (strength.score <= 1) {
            newErrors.password = 'Mật khẩu quá yếu (cần chữ hoa, số hoặc ký tự đặc biệt)';
        }
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.resetPassword(email, code, password);
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="w-full max-w-[480px]">
      <Card className="shadow-lg border-border bg-white/80 backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Đặt lại mật khẩu</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Tạo mật khẩu mới cho tài khoản <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`pl-9 pr-10 h-11 ${errors.password ? 'border-red-500' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Strength Indicator */}
              {password && (
                <div className="mt-1">
                  <div className="flex gap-1.5 mb-1">
                    {[1, 2, 3].map((l) => (
                      <div key={l} className={`h-1.5 w-full rounded-full ${strength.score >= l ? strength.color : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.text}`}>Độ mạnh: {strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`pl-9 h-11 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <SimpleButton type="submit" className="w-full h-11 gap-2" disabled={loading}>
              {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              {!loading && <Save className="w-4 h-4" />}
            </SimpleButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
