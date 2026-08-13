import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageContainer from "@/components/common/core/PageContainer";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import AppAvatar from "@/components/common/micro/AppAvatar";
import AppAlert from "@/components/common/micro/AppAlert";
import { toast } from "sonner";
import giftService from "@/services/course/giftService";
import { Gift, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function GiftResponsePage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [gift, setGift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Status enum matches backend: 0: PENDING, 1: ACCEPTED, 2: REJECTED, 3: EXPIRED
    const STATUS = {
        PENDING: 0,
        ACCEPTED: 1,
        REJECTED: 2,
        EXPIRED: 3
    };

    useEffect(() => {
        const fetchGift = async () => {
            try {
                const response = await giftService.getGiftByToken(token);
                setGift(response.data || response);
            } catch (err) {
                setError(err.response?.data?.message || "Không tìm thấy thông tin quà tặng hoặc link đã bị lỗi.");
            } finally {
                setLoading(false);
            }
        };
        fetchGift();
    }, [token]);

    const requireAuth = () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            toast.error("Vui lòng đăng nhập để nhận quà.");
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
            return false;
        }
        return true;
    };

    const handleAccept = async () => {
        if (!requireAuth()) return;
        
        setActionLoading(true);
        try {
            const data = await giftService.acceptGift(token);
            if (data.alreadyOwned) {
                toast.warning(data.message || "Bạn đã sở hữu khóa học này. Quà tặng đã được tự động hoàn lại cho người gửi.");
                setGift({ ...gift, status: STATUS.REJECTED });
            } else {
                toast.success(data.message || "Đã nhận quà tặng thành công!");
                setGift({ ...gift, status: STATUS.ACCEPTED });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Lỗi khi nhận quà";
            if (errorMsg.includes("không dành cho bạn")) {
                toast.error("Quà tặng này được gửi cho một tài khoản email khác.");
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!requireAuth()) return;
        
        setActionLoading(true);
        try {
            await giftService.rejectGift(token);
            toast.success("Đã từ chối quà tặng thành công. Tiền sẽ được hoàn lại cho người gửi.");
            setGift({ ...gift, status: STATUS.REJECTED });
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi từ chối quà");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <PageContainer.Content className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </PageContainer.Content>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <PageContainer.Content className="max-w-2xl mx-auto pt-10">
                    <AppAlert appVariant="error" title="Lỗi" description={error} />
                    <div className="mt-4 flex justify-center">
                        <AppButton onClick={() => navigate('/')}>Về trang chủ</AppButton>
                    </div>
                </PageContainer.Content>
            </PageContainer>
        );
    }

    if (!gift) return null;

    const isPending = gift.status === STATUS.PENDING;

    return (
        <PageContainer>
            <PageContainer.Content className="max-w-2xl mx-auto pt-10">
                <Card className="shadow-lg border-primary/20">
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                        <Gift className="w-16 h-16 text-primary opacity-20 absolute -right-4 -bottom-4 transform rotate-12" />
                        <h2 className="text-2xl font-bold text-primary flex items-center gap-2 relative z-10">
                            <Gift className="w-6 h-6" /> Món quà từ {gift.senderName}
                        </h2>
                    </div>
                    
                    <CardContent className="pt-8 px-6 sm:px-10">
                        {!isPending && (
                            <div className="mb-6">
                                {gift.status === STATUS.ACCEPTED && (
                                    <AppAlert appVariant="success" title="Đã nhận">
                                        Bạn đã nhận khóa học này. Hãy vào mục <a href="/account/my-courses" className="font-bold underline">Khóa học của tôi</a> để bắt đầu học nhé!
                                    </AppAlert>
                                )}
                                {gift.status === STATUS.REJECTED && (
                                    <AppAlert appVariant="warning" title="Đã từ chối">
                                        Bạn đã từ chối nhận món quà này. Số tiền đã được hoàn lại cho người gửi.
                                    </AppAlert>
                                )}
                                {gift.status === STATUS.EXPIRED && (
                                    <AppAlert appVariant="error" title="Hết hạn">
                                        Món quà này đã hết hạn do không được phản hồi trong 7 ngày.
                                    </AppAlert>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
                            <div className="w-full sm:w-1/3 aspect-video sm:aspect-square overflow-hidden rounded-xl border">
                                <img src={gift.courseThumbnail} alt={gift.courseTitle} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="font-bold text-xl leading-tight text-foreground">{gift.courseTitle}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Trị giá: <span className="font-bold text-primary">{gift.coursePrice?.toLocaleString('vi-VN')} đ</span></p>
                                    {gift.giftCode && (
                                        <p className="text-xs text-muted-foreground mt-1">Mã quà: <span className="font-mono font-bold text-foreground">TG-{gift.giftCode}</span></p>
                                    )}
                                </div>

                                {gift.message && (
                                    <div className="bg-muted p-4 rounded-xl border-l-4 border-primary">
                                        <p className="italic text-sm text-foreground/80">"{gift.message}"</p>
                                    </div>
                                )}
                                
                                {isPending && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Hết hạn vào: {new Date(gift.expiredAt).toLocaleDateString('vi-VN')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    
                    {isPending && (
                        <CardFooter className="flex flex-col sm:flex-row gap-3 px-6 sm:px-10 pb-8 justify-end border-t pt-6 bg-muted/30">
                            <AppButton 
                                variant="outline" 
                                className="w-full sm:w-auto" 
                                onClick={handleReject}
                                disabled={actionLoading}
                            >
                                Từ chối
                            </AppButton>
                            <AppButton 
                                appVariant="gradient" 
                                className="w-full sm:w-auto font-bold" 
                                onClick={handleAccept}
                                loading={actionLoading}
                            >
                                Chấp nhận quà
                            </AppButton>
                        </CardFooter>
                    )}
                </Card>
            </PageContainer.Content>
        </PageContainer>
    );
}
