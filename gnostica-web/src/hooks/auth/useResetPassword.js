import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '@/services/auth/authService';
import { toast } from 'sonner';

export const useResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const code = searchParams.get('code');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-muted', text: 'text-muted-foreground' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8 && (/[A-Z]/.test(pass) || /[0-9]/.test(pass))) score += 1;
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-error/10 text-error', text: 'text-error' };
    if (score === 2) return { score: 2, label: 'Trung bình', color: 'bg-warning/10 text-warning', text: 'text-warning' };
    if (score >= 3) return { score: 3, label: 'Mạnh', color: 'bg-success/10 text-success', text: 'text-success' };
    return { score: 0, label: '', color: 'bg-muted', text: '' };
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

  return {
    email,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    loading, errors,
    strength,
    handleSubmit
  };
};
