import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { SimpleButton } from '@/components/common/AppButton';
import authService from '@/services/authService';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!contact.trim()) {
      setError('Vui lòng nhập email hoặc số điện thoại');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
    if (!emailRegex.test(contact) && !phoneRegex.test(contact)) {
      setError('Email hoặc số điện thoại không hợp lệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      await authService.forgotPassword(contact);
      setSent(true);
      toast.success('Mã xác thực đã được gửi vào email của bạn.');
      setTimeout(() => navigate(`/confirm-code?email=${contact}&type=reset`), 1500);
    } catch (err) {
      toast.error(err.toString());
      setError(err.toString());
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
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Quên mật khẩu?</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
              Nhập email hoặc số điện thoại của bạn, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email or Phone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact" className="text-sm font-medium text-slate-700">
                Email hoặc Số điện thoại
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contact"
                  type="text"
                  placeholder="you@example.com hoặc 0912 345 678"
                  className={`pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (error) setError('');
                  }}
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            {/* Success message */}
            {sent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 animate-in fade-in duration-300">
                Mã xác nhận đã được gửi! Đang chuyển hướng...
              </div>
            )}

            {/* Submit */}
            <SimpleButton
              type="submit"
              className="w-full h-11 gap-2"
              disabled={loading || sent}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : <Send className="w-4 h-4" />}
              {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            </SimpleButton>
          </form>

          {/* Back to login */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-primary font-semibold hover:underline inline-flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
