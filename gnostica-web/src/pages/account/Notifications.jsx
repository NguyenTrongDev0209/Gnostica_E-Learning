import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Bell, MessageSquare, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";

// Mock Data
const NOTIFICATIONS_DATA = [
  {
    id: 1,
    type: "course",
    title: "Bài giảng mới đã được thêm vào khóa học",
    message: "Khóa học 'Lập trình Web Frontend Bootcamp 2026' vừa cập nhật thêm Module 5: React Hooks.",
    time: "2 giờ trước",
    isRead: false,
    icon: BookOpen,
    color: "text-info bg-blue-50",
  },
  {
    id: 2,
    type: "system",
    title: "Đơn hàng của bạn đã được xác nhận",
    message: "Bạn đã đăng ký thành công khóa học 'Mastering React 18 & Next.js 14'. Bạn có thể bắt đầu học ngay bây giờ.",
    time: "Hôm qua, 14:30",
    isRead: false,
    icon: CheckCircle2,
    color: "text-emerald-500 bg-emerald-50",
  },
  {
    id: 3,
    type: "forum",
    title: "Có người đã trả lời bình luận của bạn",
    message: "Giảng viên Phạm Hồng Việt đã trả lời thắc mắc của bạn trong bài 'Kiến trúc Next.js App Router'.",
    time: "20/03/2026",
    isRead: true,
    icon: MessageSquare,
    color: "text-warning bg-orange-50",
  },
  {
    id: 4,
    type: "alert",
    title: "Bảo trì hệ thống định kỳ",
    message: "Hệ thống sẽ tạm ngừng hoạt động từ 2:00 sáng đến 4:00 sáng Chủ nhật tuần này để nâng cấp server.",
    time: "15/03/2026",
    isRead: true,
    icon: AlertCircle,
    color: "text-error bg-red-50",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
              const Icon = notification.icon;
              return (
                <div 
                  key={notification.id} 
                  className={`p-5 flex gap-4 transition-colors hover:bg-muted cursor-pointer ${notification.isRead ? 'opacity-70' : 'bg-primary/5'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notification.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-1.5">
                      <h3 className={`text-base line-clamp-1 ${notification.isRead ? 'font-semibold text-foreground' : 'font-extrabold text-primary'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap pt-1">
                        {notification.time}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${notification.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {notification.message}
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
