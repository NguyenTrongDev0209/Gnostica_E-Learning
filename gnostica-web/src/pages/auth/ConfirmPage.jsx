import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { SimpleButton } from '@/components/common/AppButton';
import AuthCard from './components/AuthCard';
import { useConfirm } from '@/hooks/auth/useConfirm';

const ConfirmPage = () => {
  const {
    otpLength,
    otp,
    loading,
    timeLeft,
    inputRefs,
    isComplete,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleResend,
    handleSubmit
  } = useConfirm();

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <AuthCard
      title="Nhập mã xác nhận"
      description={`Chúng tôi đã gửi mã gồm ${otpLength} chữ số đến email hoặc số điện thoại của bạn.`}
    >
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
          className="w-full mt-1 gap-2"
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
    </AuthCard>
  );
};

export default ConfirmPage;
