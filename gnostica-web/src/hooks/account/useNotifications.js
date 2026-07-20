import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.user?.token);

  const fetchNotifications = async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Map to UI model
        const mapped = (data || []).map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          content: n.message,
          time: n.createdAt ? new Date(n.createdAt).toLocaleString("vi-VN") : "Gần đây",
          createdAt: n.createdAt,
          isRead: n.isRead,
          type: n.type || "system"
        }));
        setNotifications(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const markAllAsRead = async () => {
    if (!token) { setLoading(false); return; }
    try {
      await fetch("http://localhost:8080/api/notifications/read-all", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const markAsRead = async (id) => {
    if (!token) { setLoading(false); return; }
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
    }
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
