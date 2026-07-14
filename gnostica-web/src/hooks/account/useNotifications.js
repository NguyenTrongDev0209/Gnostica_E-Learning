import { useState, useEffect } from "react";
import { MOCK_NOTIFICATIONS } from "@/mocks/accountMocks";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAllAsRead,
    markAsRead,
    fetchNotifications
  };
}
