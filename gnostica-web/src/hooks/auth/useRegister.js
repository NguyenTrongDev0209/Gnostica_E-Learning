import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/auth/authService';
import { toast } from 'sonner';

export const useRegister = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
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

    if (!fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Email không hợp lệ';
      }
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else {
      const strength = getPasswordStrength(password);
      if (strength.score <= 1) {
        newErrors.password = 'Mật khẩu quá yếu (cần bao gồm chữ hoa, số hoặc ký tự đặc biệt)';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      await authService.register(fullName, email, password);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.');
      navigate(`/confirm-code?email=${email}`);
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return {
    fullName, setFullName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    agreeTerms, setAgreeTerms,
    loading, errors, setErrors,
    strength,
    handleSubmit
  };
};
