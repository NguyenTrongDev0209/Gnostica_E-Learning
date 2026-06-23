import { useQuery } from "@tanstack/react-query";
import categoryService from "@/services/categoryService";

/**
 * Hook để lấy danh sách danh mục cha từ API (sử dụng React Query)
 * @returns {Object} { categories, loading, error }
 */
export default function useCategories() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["categories", "active"],
    queryFn: async () => {
      const res = await categoryService.getAllCategories(1, 100, "", "active");
      return res?.content || res?.data?.content || [];
    },
    staleTime: 1000 * 60 * 5, // Cache dữ liệu trong 5 phút
  });

  return { categories: data || [], loading: isLoading, error };
}
