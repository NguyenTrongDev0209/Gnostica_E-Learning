import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "sonner";

export default function useWishlist() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.user?.token);

  const fetchWishlist = async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/favourites", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Map data to match UI
        const mappedCourses = (data.data || []).map(c => ({
          id: c.id, // Ensure this matches course ID
          courseTitle: c.title,
          slug: c.slug,
          courseThumbnail: c.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80",
          instructorName: c.instructorName,
          category: "Lập trình", // Add if available
          level: c.level,
          price: c.price,
          salePrice: c.salePrice,
          rating: c.rating || 0,
          totalRatings: c.totalRatings || 0,
          totalStudents: c.totalStudents || 0,
          totalLessons: c.totalLessons || 0,
          totalDuration: c.totalDuration || "0"
        }));
        setCourses(mappedCourses);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const handleToggleWishlist = async (courseId) => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`http://localhost:8080/api/favourites/toggle/${courseId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        // Optimistic update for UI
        setCourses(prev => prev.filter(c => c.id !== courseId));
        toast.success("Đã xóa khỏi danh sách yêu thích");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  return {
    courses,
    loading,
    handleToggleWishlist
  };
}
