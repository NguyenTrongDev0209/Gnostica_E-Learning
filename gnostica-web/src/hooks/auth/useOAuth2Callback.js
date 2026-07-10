import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import authService from '@/services/auth/authService';
import useAuthStore from '@/store/useAuthStore';

export const useOAuth2Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');
    const tokenFromParams = searchParams.get('token');

    const setUser = useAuthStore(state => state.setUser);

    useEffect(() => {
        if (email) {
            const fetchUserInfo = async () => {
                try {
                    const response = await authService.getOAuth2User(email);

                    if (response.data.status === 200 || response.data.status === 'success') {
                        const user = response.data.data;
                        const roleName = (user.role?.name || user.role || 'USER').toUpperCase();
                        const normalizedUser = {
                            id: user.id || user.id,
                            fullName: user.fullName,
                            email: user.email,
                            role: roleName,
                            token: tokenFromParams || user.token,
                            avatar: user.avatar,
                            provider: user.provider,
                            onboardingCompleted: user.onboardingCompleted
                        };

                        localStorage.setItem('user', JSON.stringify(normalizedUser));
                        setUser(normalizedUser);

                        toast.success('Đăng nhập thành công!');

                        setTimeout(() => {
                            if (roleName === 'ADMIN') {
                                navigate('/admin');
                            } else if (roleName === 'INSTRUCTOR' || roleName === 'TEACHER') {
                                navigate('/instructor');
                            } else {
                                navigate('/');
                            }
                        }, 500);
                    } else {
                        throw new Error(response.data.message || 'Lấy thông tin thất bại');
                    }
                } catch (error) {
                    toast.error(error.response?.data?.message || error.message || 'Đăng nhập thất bại!');
                    setTimeout(() => navigate('/login'), 2000);
                }
            };

            fetchUserInfo();
        } else {
            navigate('/login');
        }
    }, [email, tokenFromParams, navigate, setUser]);
};
