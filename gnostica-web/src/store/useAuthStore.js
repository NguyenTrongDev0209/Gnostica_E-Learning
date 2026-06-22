import { create } from 'zustand';
import authService from '@/services/authService';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null, // Khởi tạo ban đầu từ localStorage
  
  // Hành động đăng nhập/cập nhật user
  setUser: (userData) => {
    // Nếu userData chứa token, bạn có thể gọi localStorage.setItem ở đây
    // Nhưng hiện tại authService đang làm việc đó, ta chỉ cần sync lại state
    set({ user: userData });
  },

  // Hành động đăng xuất
  logout: async () => {
    try {
        await authService.logout();
    } catch (error) {
        console.error("Logout failed", error);
    } finally {
        set({ user: null });
        window.location.href = '/login'; // Chuyển hướng về login an toàn ngoài React Router scope
    }
  }
}));

export default useAuthStore;
