import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { SimpleButton } from '@/components/common/AppButton';
import authService from '@/services/authService';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const OTP_LENGTH = 6;

const ConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type'); // 'reset' or null (registration)
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3 * 60); // 3 minutes in seconds
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (index, value) => {
    // Only allow single digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on Backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    // Focus the input after the last pasted digit
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResend = async () => {
    try {
        await authService.resendOTP(email);
        toast.success('Mã xác thực mới đã được gửi!');
        setTimeLeft(3 * 60);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
    } catch (error) {
        toast.error(error.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;

    setLoading(true);
    try {
        if (type === 'reset') {
            // For reset password, we just pass the code forward or verify locally
            // We'll let ResetPassword page handle the actual reset call which also verifies the code
            toast.success("Mã xác thực chính xác!");
            navigate(`/reset-password?email=${email}&code=${code}`);
        } else {
            await authService.verify(email, code);
            toast.success("Xác thực tài khoản thành công! Bạn có thể đăng nhập.");
            navigate('/login');
        }
    } catch (error) {
        toast.error(error.toString());
    } finally {
        setLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <div className="w-full max-w-[480px]">
      <Card className="shadow-lg border-border bg-white/80 backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Nhập mã xác nhận</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
              Chúng tôi đã gửi mã gồm {OTP_LENGTH} chữ số đến email hoặc số điện thoại của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
            {/* OTP Inputs */}
            <div className="flex gap-2.5 sm:gap-3 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`
                    w-12 h-14 sm:w-14 sm:h-16
                    text-center text-xl sm:text-2xl font-bold
                    rounded-xl border-2 outline-none
                    transition-all duration-200
                    bg-muted text-foreground
                    ${digit
                      ? 'border-primary shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.1)]'
                      : 'border-border hover:border-border'
                    }
                    focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.15)]
                  `}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Mã hết hạn sau{' '}
                <span className={`font-bold ${timeLeft <= 60 ? 'text-error' : 'text-warning'}`}>
                  {formatTime(timeLeft)}
                </span>
              </p>
            </div>

            {/* Resend */}
            <div className="text-center text-sm text-muted-foreground">
              Không nhận được mã?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={timeLeft > 0}
                className={`font-semibold transition-colors ${
                  timeLeft > 0
                    ? 'text-muted-foreground cursor-not-allowed'
                    : 'text-primary hover:underline cursor-pointer'
                }`}
              >
                Gửi lại mã
              </button>
            </div>

            {/* Submit */}
            <SimpleButton
              type="submit"
              className="w-full h-11 gap-2"
              disabled={loading || !isComplete}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <ShieldCheck className="w-4 h-4" />}
              {loading ? 'Đang xác nhận...' : 'Xác nhận'}
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

export default ConfirmPage;
