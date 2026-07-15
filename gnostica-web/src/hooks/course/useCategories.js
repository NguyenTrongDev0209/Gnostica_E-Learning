import { useQuery } from "@tanstack/react-query";
import { MOCK_CATEGORIES } from '@/mocks/homeMocks';

/**
 * Hook để lấy danh sách danh mục cha từ API (sử dụng React Query)
 * @returns {Object} { categories, loading, error }
 */
export default function useCategories() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["categories", "active"],
    queryFn: async () => {
      // Return mock data for now
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_CATEGORIES), 500);
      });
    },
    staleTime: 1000 * 60 * 5, // Cache dữ liệu trong 5 phút
  });

  return { categories: data || [], loading: isLoading, error };
}
