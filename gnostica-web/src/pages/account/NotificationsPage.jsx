import React, { useState } from "react";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { Bell, AlertCircle, CheckCircle2, Gift } from "lucide-react";
import AppSkeleton from "@/components/common/micro/AppSkeleton";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import useNotifications from "@/hooks/account/useNotifications";
import { AppButton } from "@/components/common/micro/AppButton";
import giftService from "@/services/course/giftService";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";

export default function Notifications() {
  const { notifications, loading, unreadCount, markAllAsRead, markAsRead, fetchNotifications } = useNotifications();
  const [processing, setProcessing] = useState(false);
  const user = useAuthStore(state => state.user);

  const handleGiftResponse = async (token, action, e) => {
    e.stopPropagation(); // prevent clicking on notification body
    if (processing) return;
    setProcessing(true);
    try {
      if (action === 'accept') {
        const data = await giftService.acceptGift(token, user?.email);
        if (data.alreadyOwned) {
            toast.warning(data.message || "Bạn đã sở hữu khóa học này. Quà tặng đã được tự động hoàn lại cho người gửi.");
        } else {
            toast.success(data.message || "Đã chấp nhận quà tặng thành công!");
        }
      } else {
        await giftService.rejectGift(token, user?.email);
        toast.success("Đã từ chối quà tặng.");
      }
      // Refresh notifications to reflect the updated type and message
      fetchNotifications();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setProcessing(false);
    }
  };

  const getNotificationIcon = (type) => {
    if (type?.startsWith('GIFT')) return Gift;
    switch (type) {
      case 'ENROLLMENT': return CheckCircle2;
      case 'SYSTEM': return AlertCircle;
      default: return Bell;
    }
  };
  
  const getNotificationColor = (type) => {
    if (type === 'GIFT_PENDING') return "text-orange-500 bg-orange-50";
    if (type === 'GIFT_ACCEPTED') return "text-emerald-500 bg-emerald-50";
    if (type === 'GIFT_REJECTED') return "text-red-500 bg-red-50";
    switch (type) {
      case 'ENROLLMENT': return "text-emerald-500 bg-emerald-50";
      case 'SYSTEM': return "text-info bg-blue-50";
      default: return "text-primary bg-primary/10";
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Vừa xong";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div>
        <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Thông báo" }]} />
        <div className="flex flex-col gap-4 mb-8">
          <AppSkeleton className="h-8 w-1/3" />
          <AppSkeleton className="h-4 w-1/4" />
        </div>
        <AppCard appVariant="default" className="border-border shadow-sm overflow-hidden">
          <AppCardContent className="p-0 divide-y divide-slate-100">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-5 flex gap-4">
                <AppSkeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <AppSkeleton className="h-5 w-3/4" />
                  <AppSkeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </AppCardContent>
        </AppCard>
      </div>
    );
  }

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Thông báo" }]} />

      <AppPageHeader
        icon={Bell}
        title="Thông báo của bạn"
        description={`Bạn có ${unreadCount} thông báo chưa đọc.`}
        actions={
          unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-sm font-bold text-primary hover:underline"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )
        }
      />

      {/* Notifications List */}
      <AppCard appVariant="default" className="border-border shadow-sm overflow-hidden">
        <AppCardContent className="p-0 divide-y divide-slate-100">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const color = getNotificationColor(notification.type);
              return (
                <div 
                  key={notification.id} 
                  className={`p-5 flex gap-4 transition-colors hover:bg-muted cursor-pointer ${notification.isRead ? 'opacity-70' : 'bg-primary/5'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-1.5">
                      <h3 className={`text-base line-clamp-1 ${notification.isRead ? 'font-semibold text-foreground' : 'font-extrabold text-primary'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap pt-1">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${notification.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {notification.content}
                    </p>
                    {notification.type === 'GIFT_PENDING' && (
                      <div className="flex gap-3 mt-4">
                        <AppButton 
                          appVariant="primary" 
                          size="sm" 
                          onClick={(e) => handleGiftResponse(notification.referenceId, 'accept', e)}
                          disabled={processing}
                        >
                          Chấp nhận
                        </AppButton>
                        <AppButton 
                          appVariant="outline" 
                          size="sm" 
                          onClick={(e) => handleGiftResponse(notification.referenceId, 'reject', e)}
                          disabled={processing}
                        >
                          Từ chối
                        </AppButton>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-slate-300 mx-auto mb-4">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Không có thông báo nào</h3>
              <p className="text-sm text-muted-foreground">Khi có hoạt động mới, thông báo sẽ hiển thị ở đây.</p>
            </div>
          )}
        </AppCardContent>
      </AppCard>
    </div>
  );
}
