import { useState, useEffect, useCallback } from "react";
import wishlistService from "@/services/course/wishlistService";
import { toast } from "sonner";

export default function useWishlist() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const res = await wishlistService.getMyWishlist();
      if (res.success) {
        const formattedCourses = res.data.map(course => ({
          id: course.id,
          category: course.category?.name || "Chưa phân loại",
          rating: 5.0,
          title: course.title,
          classes: course.classes || 0,
          students: course.students || 0,
          price: course.salePrice?.toLocaleString("vi-VN") || "0",
          originalPrice: course.price?.toLocaleString("vi-VN") || "0",
          discountPercentage: course.discount || 0,
          image: course.thumbnail,
          slug: course.slug,
          instructor: {
            name: course.account?.fullName || "Ẩn danh",
            avatar: course.account?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
          }
        }));
        setCourses(formattedCourses);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleToggleWishlist = async (courseId) => {
    try {
      const res = await wishlistService.toggleWishlist(courseId);
      if (res.success) {
        toast.success(res.data.message);
        setCourses(prev => prev.filter(c => c.id !== courseId));
      }
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  return {
    courses,
    loading,
    handleToggleWishlist
  };
}
