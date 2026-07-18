import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '@/services/auth/authService';
import { toast } from 'sonner';

export const useConfirm = (otpLength = 6) => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type'); // 'reset' or null (registration)
  
  const [otp, setOtp] = useState(Array(otpLength).fill(''));
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

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpLength);
    if (!pasted) return;
    
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    
    const focusIndex = Math.min(pasted.length, otpLength - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResend = async () => {
    try {
        await authService.resendOTP(email);
        toast.success('Mã xác thực mới đã được gửi!');
        setTimeLeft(3 * 60);
        setOtp(Array(otpLength).fill(''));
        inputRefs.current[0]?.focus();
    } catch (error) {
        toast.error(error.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < otpLength) return;

    setLoading(true);
    try {
        if (type === 'reset') {
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

  return {
    otpLength,
    otp, setOtp,
    loading,
    timeLeft,
    inputRefs,
    isComplete,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleResend,
    handleSubmit
  };
};
