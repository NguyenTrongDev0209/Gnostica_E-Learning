import { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import courseService from "@/services/courseService";
import { toast } from "sonner";

/**
 * Hook để quản lý danh sách khóa học, lọc và phân trang.
 * @param {Object} options - { initialPageSize }
 * @returns {Object} 
 */
export default function useCourses({ initialPageSize = 9 } = {}) {
  const [searchParams] = useSearchParams();
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: initialPageSize,
    totalPages: 0,
    totalElements: 0
  });
  
  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId") || null,
    categorySlug: categorySlug || null,
    level: "all"
  });

  // Đồng bộ filters khi URL thay đổi (cả path params và search params)
  useEffect(() => {
    const cid = searchParams.get("categoryId");
    if (cid !== filters.categoryId || categorySlug !== filters.categorySlug) {
      setFilters(prev => ({ 
        ...prev, 
        categoryId: cid,
        categorySlug: categorySlug || null 
      }));
      setPagination(prev => ({ ...prev, page: 0 }));
    }
  }, [searchParams, categorySlug]);

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (key, value) => {
    if (key === "categoryId" || key === "categorySlug") {
        // Nếu là category, ta điều hướng URL thay vì chỉ set state
        if (!value) {
            navigate("/courses");
        } else if (typeof value === "string" && isNaN(value)) {
            // Nếu value là slug (string không phải số)
            navigate(`/courses/category/${value}`);
        } else {
            // Fallback cho ID nếu cần
            setFilters(prev => ({ ...prev, categoryId: value, categorySlug: null }));
        }
    } else {
        setFilters(prev => ({ ...prev, [key]: value }));
    }
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseService.getPublicCourses({
        categoryId: filters.categoryId,
        categorySlug: filters.categorySlug,
        level: filters.level,
        page: pagination.page,
        size: pagination.size
      });
      
      setCourses(res.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: res.totalPages,
        totalElements: res.totalElements
      }));
    } catch (err) {
      console.error("Lỗi lấy danh sách khóa học:", err);
      toast.error("Không thể tải danh sách khóa học. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filters, pagination.page, pagination.size]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    courses,
    loading,
    filters,
    pagination,
    handleFilterChange,
    handlePageChange,
    refreshCourses: fetchCourses
  };
}
