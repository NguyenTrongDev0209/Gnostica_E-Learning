import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/auth/authService';
import { toast } from 'sonner';

export const useForgotPassword = () => {
  const navigate = useNavigate();
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

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

  return {
    contact, setContact,
    loading,
    sent,
    error, setError,
    handleSubmit
  };
};
