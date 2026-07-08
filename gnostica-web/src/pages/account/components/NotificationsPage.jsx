import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import notificationService from '@/services/user/notificationService';
import { PageHeader } from '../common/AppSection';
import { SimpleButton } from '../common/AppButton';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data);
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ENROLLMENT':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      default:
        return <Bell className="w-6 h-6 text-blue-500" />;
    }
  };

  // Tính thời gian (time ago)
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
    return <div className="p-8 text-center">Đang tải thông báo...</div>;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Thông báo" subtitle={`Bạn có ${unreadCount} thông báo chưa đọc`} />
        {unreadCount > 0 && (
          <SimpleButton onClick={handleMarkAllAsRead} variant="outline" size="sm" className="bg-white text-primary border-primary">
            Đánh dấu tất cả đã đọc
          </SimpleButton>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Bell className="w-16 h-16 text-muted mb-4" />
            <p className="text-lg font-medium">Bạn chưa có thông báo nào.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-6 flex items-start gap-4 transition-colors ${!notif.isRead ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
              >
                <div className={`p-2 rounded-full ${!notif.isRead ? 'bg-white shadow-sm' : 'bg-muted'}`}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`text-base font-semibold ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {notif.content}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="mt-3 text-sm text-primary font-semibold hover:underline"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
