import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '@/lib/axiosClient';

const OAuth2Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');
    const tokenFromParams = searchParams.get('token'); // Lấy token từ URL

    useEffect(() => {
        console.log("OAuth2 Callback received email:", email);
        console.log("OAuth2 Callback received token:", tokenFromParams ? "Yes" : "No");

        if (email) {
            const fetchUserInfo = async () => {
                try {
                    const data = await axiosClient.get(`/auth/user?email=${encodeURIComponent(email)}`);
                    console.log("Fetch user response:", response.data);
                    
                    if (response.data.status === 200 || response.data.status === 'success') {
                        const user = response.data.data;
                        // Chuẩn hóa dữ liệu user để đồng nhất với LoginResponse (chỉ lưu các thông tin cần thiết)
                        const roleName = (user.role?.name || user.role || 'USER').toUpperCase();
                        const normalizedUser = { 
                            fullName: user.fullName,
                            email: user.email,
                            role: roleName, 
                            token: tokenFromParams || user.token,
                            avatar: user.avatar,
                            provider: user.provider
                        };
                        
                        localStorage.setItem('user', JSON.stringify(normalizedUser));
                        console.log("OAuth2Callback: User normalized and saved to localStorage");
                        
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
                    console.error("Fetch user error:", error);
                    toast.error(error.response?.data?.message || error.message || 'Đăng nhập thất bại!');
                    setTimeout(() => navigate('/login'), 2000);
                }
            };

            fetchUserInfo();
        } else {
            console.log("No email found in URL, redirecting to login");
            navigate('/login');
        }
    }, [email, tokenFromParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold">Đang xác thực...</h2>
                <p className="text-muted-foreground transition-all">Vui lòng đợi trong giây lát.</p>
            </div>
        </div>
    );
};

export default OAuth2Callback;
