import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import notificationService from '@/services/user/notificationService';
import authService from '@/services/auth/authService';

const NotificationBell = ({ isDark = false }) => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user?.email]); // Re-fetch khi user đổi

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getNotifications(),
      ]);
      setUnreadCount(countRes.data);
      setNotifications(listRes.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications(); // Refresh khi mở
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await notificationService.markAsRead(notif.id);
      fetchNotifications();
    }
    setIsOpen(false);
    navigate('/account/notifications');
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className={`p-2 rounded-full transition-colors relative flex items-center justify-center ${isDark ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Bell className="w-12 h-12 text-gray-200 mb-3" />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 5).map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {notif.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {timeAgo(notif.createdAt)}
                          </span>
                          {!notif.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="text-gray-400 hover:text-blue-600"
                              title="Đánh dấu đã đọc"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
              <Link 
                to="/account/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                Xem tất cả thông báo
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
