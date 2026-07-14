import { useState, useEffect } from "react";
import { MOCK_WISHLIST } from "@/mocks/accountMocks";
import { toast } from "sonner";

export default function useWishlist() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCourses(MOCK_WISHLIST);
      setLoading(false);
    }, 600);
  }, []);

  const handleToggleWishlist = (courseId) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast.success("�� x�a kh?i danh s�ch y�u th�ch");
  };

  return {
    courses,
    loading,
    handleToggleWishlist
  };
}
