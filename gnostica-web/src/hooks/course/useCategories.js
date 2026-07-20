import { useQuery } from '@tanstack/react-query';
import categoryService from '@/services/course/categoryService';

export default function useCategories() {
  const query = useQuery({
    queryKey: ['categories', 'active', 'home'],
    queryFn: async () => {
      const response = await categoryService.getAllCategories(1, 1000, '', 'active');
      const categories = response?.data?.content || response?.content || [];
      return categories.map((category) => ({
        ...category,
        coursesCount: Number(category.courses || 0)
      }));
    },
    staleTime: 5 * 60_000
  });

  return { categories: query.data || [], loading: query.isLoading, error: query.error };
}
