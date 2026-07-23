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
                        
                        // Trích xuất trạng thái cá nhân hóa từ trường metadata của DB
                        let onboardingCompleted = false;
                        let selectedCategories = [];
                        let level = null;

                        if (user.metadata) {
                            try {
                                const meta = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
                                if (meta.onboardingCompleted) onboardingCompleted = true;
                                if (meta.interests && Array.isArray(meta.interests)) selectedCategories = meta.interests;
                                if (meta.level) level = meta.level;
                            } catch (e) {
                                console.error("Lỗi parse metadata user:", e);
                            }
                        }

                        const normalizedUser = {
                            id: user.id,
                            fullName: user.fullName,
                            email: user.email,
                            role: roleName,
                            token: tokenFromParams || user.token,
                            avatar: user.avatar,
                            provider: user.provider || 'GOOGLE',
                            onboardingCompleted: onboardingCompleted,
                            selectedCategories: selectedCategories,
                            level: level
                        };

                        // Dọn dẹp cờ phiên làm việc cũ để đảm bảo tự động bật Bảng cá nhân hóa cho người dùng Google mới
                        sessionStorage.removeItem(`personalization_skipped_${user.email}`);
                        sessionStorage.removeItem('personalization_skipped');

                        localStorage.setItem('user', JSON.stringify(normalizedUser));
                        setUser(normalizedUser);

                        toast.success('Đăng nhập bằng Google thành công!');

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
