import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Bell, MessageSquare, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import notificationService from "../../services/notificationService";
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
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

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  };

  const markAsRead = async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.isRead) return;
    
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ENROLLMENT': return CheckCircle2;
      case 'SYSTEM': return AlertCircle;
      default: return Bell;
    }
  };
  
  const getNotificationColor = (type) => {
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
    return <div className="p-8 text-center text-muted-foreground">Đang tải thông báo...</div>;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" /> Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/account" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Tài khoản
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-semibold">Thông báo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
            <div className="relative">
              <Bell className="w-7 h-7 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-error/10 text-error ring-2 ring-white"></span>
              )}
            </div>
            Thông báo của bạn
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bạn có {unreadCount} thông báo chưa đọc.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-bold text-primary hover:underline"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Notifications List */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-0 divide-y divide-slate-100">
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
        </CardContent>
      </Card>
    </div>
  );
}
