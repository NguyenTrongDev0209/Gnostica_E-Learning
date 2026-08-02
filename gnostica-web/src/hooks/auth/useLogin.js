import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '@/services/auth/authService';
import useAuthStore from '@/store/useAuthStore';
import { toast } from 'sonner';

export const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore(state => state.setUser);
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getSafeRedirectPath = (candidate) => {
    if (!candidate) return null;
    const path = typeof candidate === 'string'
      ? candidate
      : `${candidate.pathname || ''}${candidate.search || ''}${candidate.hash || ''}`;
    return path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/login')
      ? path
      : null;
  };

  const redirectPath = getSafeRedirectPath(location.state?.from) || getSafeRedirectPath(searchParams.get('redirect'));

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'NOT_LINKED') {
        toast.error('Tài khoản chưa được liên kết');
      } else {
        toast.error(decodeURIComponent(errorParam));
      }
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  const validateForm = () => {
    let newErrors = {};
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
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      toast.success('Đăng nhập thành công!');
      
      const user = response.data;
      const roleName = (typeof user.role === 'object' ? user.role.name : user.role)?.toUpperCase() || 'USER';

      setUser(user);

      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (roleName === 'ADMIN') {
        navigate('/admin');
      } else if (roleName === 'INSTRUCTOR' || roleName === 'TEACHER') {
        navigate('/instructor');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    remember, setRemember,
    loading, errors, setErrors,
    handleSubmit,
    redirectPath
  };
};
