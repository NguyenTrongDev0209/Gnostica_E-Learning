import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from '@/components/common/micro/AppInput';
import { Card, CardContent } from "@/components/common/micro/AppCard";
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';

const ForgotPassword = () => {
  const {
    contact, setContact,
    loading,
    sent,
    error, setError,
    handleSubmit
  } = useForgotPassword();

  return (
    <div className="w-full max-w-[480px]">
      <Card className="shadow-lg border-border bg-white/80 backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Quên mật khẩu?</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
              Nhập email hoặc số điện thoại của bạn, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
            </p>
          </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AppInput
          id="contact"
          type="text"
          label="Email hoặc Số điện thoại"
          placeholder="you@example.com hoặc 0912 345 678"
          value={contact}
          onChange={(e) => {
            setContact(e.target.value);
            if (error) setError('');
          }}
          icon={Mail}
          error={error}
        />

        {/* Success message */}
        {sent && (
          <div className="bg-green-50 border border-success/20 rounded-lg p-3 text-sm text-success animate-in fade-in duration-300">
            Mã xác nhận đã được gửi! Đang chuyển hướng...
          </div>
        )}

        {/* Submit */}
        <AppButton appVariant="gradient"
          type="submit"
          className="w-full mt-1 gap-2"
          disabled={loading || sent}
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : <Send className="w-4 h-4" />}
          {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
        </AppButton>
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
