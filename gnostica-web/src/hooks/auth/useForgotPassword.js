import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/auth/authService';
import { toast } from 'sonner';

export const useForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Mã xác thực đã được gửi vào email của bạn.');
      setTimeout(() => navigate(`/confirm-code?email=${email}&type=reset`), 1500);
    } catch (err) {
      toast.error(err.toString());
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    loading,
    sent,
    error, setError,
    handleSubmit
  };
};
